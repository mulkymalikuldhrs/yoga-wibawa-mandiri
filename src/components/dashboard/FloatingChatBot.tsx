// ============================================================
// FloatingChatBot — AI Chatbot with floating button
// Smart AI that can answer questions AND input data
// No more Puter.js — uses our own backend
// ============================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { chatWithAiStream, checkAIHealth, smartParse, parseDataInputAction, buildDashboardContext } from '@/lib/ywm-ai';
import type { AiMessage } from '@/types/dashboard';
import { KV_PREFIXES } from '@/types/dashboard';
import { saveData, generateId } from '@/lib/supabase-data';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  MessageCircle,
  X,
  Send,
  Bot,
  User,
  Loader2,
  Sparkles,
  Database,
  ChevronDown,
  Mic,
  MicOff,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Zap,
  Wrench,
  Package,
  Shield,
  TrendingUp,
  Users,
  Power,
  PowerOff,
  RefreshCw,
} from 'lucide-react';

// ── Data Input Confirmation Component ──
function DataInputCard({
  module,
  action,
  data,
  onConfirm,
  onCancel,
}: {
  module: string;
  action?: string;
  data: Record<string, unknown>;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const moduleLabels: Record<string, string> = {
    'spare-parts': 'Spare Parts',
    production: 'Produksi',
    maintenance: 'Maintenance',
    'team-activity': 'Tim & Aktivitas',
    safety: 'Safety / HSE',
    finance: 'Keuangan',
    hr: 'HR & Payroll',
  };

  return (
    <div className="mt-2 rounded-xl border border-amber-200/50 bg-amber-50/80 p-3">
      <div className="flex items-center gap-2 mb-2">
        <AlertCircle size={16} className="text-amber-600" />
        <span className="text-amber-700 font-semibold text-sm">Konfirmasi Input Data</span>
      </div>
      <p className="text-xs text-amber-700 mb-2">
        AI ingin melakukan: <strong>{action || 'create'}</strong> pada modul <strong>{moduleLabels[module] || module}</strong> dengan data:
      </p>
      <div className="space-y-1 text-xs text-slate-600 mb-3">
        {Object.entries(data).slice(0, 8).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="text-slate-500">{key}:</span>
            <span className="text-slate-700 font-medium">{String(value ?? '-')}</span>
          </div>
        ))}
        {Object.keys(data).length > 8 && (
          <div className="text-slate-400 text-center">...dan {Object.keys(data).length - 8} field lainnya</div>
        )}
      </div>
      <div className="flex gap-2">
        <button
          onClick={onConfirm}
          className="flex-1 py-1.5 rounded-lg bg-emerald-100/80 text-emerald-600 text-xs font-medium hover:bg-emerald-500/30 transition-all"
        >
          <CheckCircle2 size={12} className="inline mr-1" />
          Konfirmasi
        </button>
        <button
          onClick={onCancel}
          className="flex-1 py-1.5 rounded-lg bg-red-50/80 text-red-500 text-xs font-medium hover:bg-red-100/80 transition-all"
        >
          <XCircle size={12} className="inline mr-1" />
          Batal
        </button>
      </div>
    </div>
  );
}

// ── Quick Actions ──
const QUICK_ACTIONS = [
  {
    label: 'Ringkasan Hari Ini',
    icon: <Zap size={14} />,
    prompt: 'Beri ringkasan operasional hari ini untuk PT. Yoga Wibawa Mandiri. Apa saja yang perlu diperhatikan?',
    color: 'text-amber-600',
  },
  {
    label: 'Cek Stok Rendah',
    icon: <Package size={14} />,
    prompt: 'Suku cadang mana yang stoknya mendekati batas minimum? Tampilkan daftar lengkap.',
    color: 'text-orange-600',
  },
  {
    label: 'Jadwal Perawatan',
    icon: <Wrench size={14} />,
    prompt: 'Apa jadwal perawatan mesin minggu ini? Ada WO yang overdue?',
    color: 'text-blue-600',
  },
  {
    label: 'Status Produksi',
    icon: <TrendingUp size={14} />,
    prompt: 'Bagaimana status produksi hari ini? Bandingkan target vs aktual per shift.',
    color: 'text-green-600',
  },
  {
    label: 'Keselamatan Kerja',
    icon: <Shield size={14} />,
    prompt: 'Apakah ada insiden keselamatan yang perlu ditindaklanjuti? Tampilkan status HSE.',
    color: 'text-red-500',
  },
  {
    label: 'Input Data',
    icon: <Database size={14} />,
    prompt: 'Saya ingin input data. Apa saja modul yang tersedia dan format yang diperlukan?',
    color: 'text-purple-600',
  },
];

export default function FloatingChatBot() {
  // ── On/Off toggle state (persisted in localStorage) ──
  const [chatEnabled, setChatEnabled] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('ywm_chatbot_enabled');
      return stored === null ? true : stored === 'true';
    } catch {
      return true;
    }
  });

  const toggleChatEnabled = useCallback(() => {
    setChatEnabled((prev) => {
      const next = !prev;
      try { localStorage.setItem('ywm_chatbot_enabled', String(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  // ── State ──
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Halo! 👋 Saya asisten AI YWM Dashboard. Saya bisa membantu Anda dengan:\n\n• **Tanya tentang operasional** — produksi, stok, maintenance, dll.\n• **Input data** — cukup ketik dalam bahasa natural, saya akan parse dan simpan\n• **Analisis & rekomendasi** — saya bisa menganalisis data dan memberi saran\n• **Cek status** — stok rendah, WO overdue, anomali produksi\n\nSilakan tanya apa saja! 🚀',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [aiReady, setAiReady] = useState(false);
  const [checkingAI, setCheckingAI] = useState(true);
  const [aiWarning, setAiWarning] = useState(false); // Warning state: health check failed but allow interaction
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [pendingDataInput, setPendingDataInput] = useState<{
    module: string;
    action?: string;
    data: Record<string, unknown>;
  } | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const isMobile = useIsMobile();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // ── Check AI backend health ──
  // When health check fails, show a warning but still allow interaction
  // (the chat endpoint might work even if health doesn't)
  useEffect(() => {
    let mounted = true;

    async function check() {
      try {
        const health = await checkAIHealth();
        if (mounted) {
          setAiReady(health.ai === 'ready');
          setAiWarning(health.ai !== 'ready');
          setCheckingAI(false);
        }
      } catch {
        if (mounted) {
          // Health check failed — show warning but don't fully disable
          setAiReady(false);
          setAiWarning(true);
          setCheckingAI(false);
        }
      }
    }

    check();
    const interval = setInterval(check, 30000); // Check every 30s
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // ── Retry AI connection manually ──
  const retryAIConnection = useCallback(async () => {
    setCheckingAI(true);
    try {
      const health = await checkAIHealth();
      setAiReady(health.ai === 'ready');
      setAiWarning(health.ai !== 'ready');
    } catch {
      setAiReady(false);
      setAiWarning(true);
    }
    setCheckingAI(false);
  }, []);

  // ── Auto-scroll ──
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // ── Focus input when opened ──
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // ── Send message ──
  const handleSend = useCallback(async () => {
    if (!input.trim() || isStreaming || !chatEnabled) return;
    // Allow sending even if health check failed (aiWarning mode)
    // Only block if explicitly disabled

    const userMessage: AiMessage = {
      id: Date.now().toString(36),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);
    setShowQuickActions(false);

    const assistantId = Date.now().toString(36) + '_stream';
    const assistantMessage: AiMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      // Use all previous messages for context
      const chatMessages = [...messages, userMessage].filter(
        (m) => m.id !== 'welcome'
      );

      // Add dashboard data context as a system message
      const dashboardContext = buildDashboardContext();
      const contextMessage: AiMessage = {
        id: 'dashboard_context',
        role: 'system',
        content: `Berikut data dashboard YWM terkini yang bisa Anda gunakan untuk menjawab pertanyaan user:${dashboardContext}`,
        timestamp: new Date().toISOString(),
      };

      await chatWithAiStream(
        [contextMessage, ...chatMessages],
        (chunk) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: m.content + chunk }
                : m
            )
          );
        },
        () => {
          setIsStreaming(false);
        },
        (error) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: m.content || `⚠️ ${error}` }
                : m
            )
          );
          setIsStreaming(false);
        }
      );

      // After streaming, check if the response contains a data input action
      setMessages((prev) => {
        const lastMsg = prev.find((m) => m.id === assistantId);
        if (lastMsg?.content) {
          const action = parseDataInputAction(lastMsg.content);
          if (action.isDataInput && action.module && action.data) {
            setPendingDataInput({
              module: action.module,
              action: action.action,
              data: action.data,
            });
          }
        }
        return prev;
      });
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: m.content || '⚠️ Gagal mendapat respons dari AI. Pastikan server AI berjalan.' }
            : m
        )
      );
      setIsStreaming(false);
    }
  }, [input, isStreaming, aiReady, aiWarning, chatEnabled, messages]);

  // ── Quick action ──
  const handleQuickAction = useCallback(
    (prompt: string) => {
      setInput(prompt);
      setTimeout(() => {
        // Directly send
        const userMessage: AiMessage = {
          id: Date.now().toString(36),
          role: 'user',
          content: prompt,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setIsStreaming(true);
        setShowQuickActions(false);

        const assistantId = Date.now().toString(36) + '_stream';
        const assistantMessage: AiMessage = {
          id: assistantId,
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        const chatMessages = [...messages, userMessage].filter(
          (m) => m.id !== 'welcome'
        );

        // Add dashboard data context
        const dashboardContext = buildDashboardContext();
        const contextMessage: AiMessage = {
          id: 'dashboard_context',
          role: 'system',
          content: `Berikut data dashboard YWM terkini yang bisa Anda gunakan untuk menjawab pertanyaan user:${dashboardContext}`,
          timestamp: new Date().toISOString(),
        };

        chatWithAiStream(
          [contextMessage, ...chatMessages],
          (chunk) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: m.content + chunk }
                  : m
              )
            );
          },
          () => {
            setIsStreaming(false);
            // After streaming, check for data input action
            setMessages((prev) => {
              const lastMsg = prev.find((m) => m.id === assistantId);
              if (lastMsg?.content) {
                const action = parseDataInputAction(lastMsg.content);
                if (action.isDataInput && action.module && action.data) {
                  setPendingDataInput({
                    module: action.module,
                    action: action.action,
                    data: action.data,
                  });
                }
              }
              return prev;
            });
          },
          (error) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: m.content || `⚠️ ${error}` }
                  : m
              )
            );
            setIsStreaming(false);
          }
        ).catch(() => setIsStreaming(false));
      }, 100);
    },
    [messages]
  );

  // ── Handle data input confirmation ──
  const handleConfirmDataInput = useCallback(() => {
    if (!pendingDataInput) return;

    // Use KV_PREFIXES from dashboard types — single source of truth
    const modulePrefixMap: Record<string, string> = {
      'spare-parts': KV_PREFIXES.sparePart,
      'production': KV_PREFIXES.production,
      'maintenance': KV_PREFIXES.maintenance,
      'team-activity': KV_PREFIXES.teamActivity,
      'safety': KV_PREFIXES.safety,
      'finance': KV_PREFIXES.finance,
      'hr': KV_PREFIXES.employee,
    };
    const prefix = modulePrefixMap[pendingDataInput.module] || `ywm_${pendingDataInput.module}_`;

    // Save using Supabase-aware saveData (dual-write)
    const record = {
      ...pendingDataInput.data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveData(prefix, record);

    const confirmMsg: AiMessage = {
      id: Date.now().toString(36),
      role: 'assistant',
      content: `✅ **Data berhasil disimpan ke modul ${pendingDataInput.module}!**\n\nData telah tersimpan dan bisa dilihat di halaman modul yang bersangkutan.`,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, confirmMsg]);
    setPendingDataInput(null);
  }, [pendingDataInput]);

  const handleCancelDataInput = useCallback(() => {
    setPendingDataInput(null);
    const cancelMsg: AiMessage = {
      id: Date.now().toString(36),
      role: 'assistant',
      content: '❌ Input data dibatalkan. Ketikkan data yang ingin Anda masukkan kapan saja.',
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, cancelMsg]);
  }, []);

  // ── Keyboard handler ──
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // ── Voice toggle (Web Speech API) ──
  const toggleRecording = useCallback(() => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Browser Anda tidak mendukung fitur pengenalan suara.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      setInput(text);
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognition.start();
  }, [isRecording]);

  // ── Format message content (basic markdown-like rendering) ──
  const formatContent = (content: string) => {
    // Remove ACTION:INPUT_DATA blocks from display
    let cleaned = content.replace(/```ACTION:INPUT_DATA[\s\S]*?```/g, '');

    return cleaned;
  };

  return (
    <>
      {/* ═══════════════════════════════════════════ */}
      {/* FLOATING CHATBOT BUTTON                     */}
      {/* ═══════════════════════════════════════════ */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={cn(
            'fixed z-50 group',
            // Mobile: smaller button, positioned higher to avoid conflict with bottom nav
            isMobile ? 'bottom-20 right-4' : 'bottom-6 right-6'
          )}
          aria-label="Buka Chat AI"
        >
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-full bg-cyan-500/30 animate-ping" />
          {/* Main button — smaller on mobile */}
          <div className={cn(
            'relative rounded-full bg-gradient-to-br from-cyan-500 to-blue-600',
            'flex items-center justify-center shadow-lg shadow-cyan-500/15',
            'transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-cyan-500/20',
            isMobile ? 'w-12 h-12' : 'w-14 h-14'
          )}>
            <MessageCircle size={isMobile ? 20 : 24} className="text-slate-800" />
          </div>
          {/* Status dot */}
          <div className={cn(
            'absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white/80',
            checkingAI ? 'bg-yellow-400 animate-pulse' :
            aiReady ? 'bg-emerald-400' : 'bg-red-400'
          )} />
          {/* Tooltip — hidden on mobile */}
          {!isMobile && (
            <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-white/60 backdrop-blur-xl 
              border border-slate-200/50 rounded-lg text-slate-800 text-xs whitespace-nowrap
              opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              {checkingAI ? 'Menghubungkan AI...' : aiReady ? 'Chat dengan AI YWM' : 'AI Offline'}
            </div>
          )}
        </button>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* CHATBOT WINDOW                              */}
      {/* ═══════════════════════════════════════════ */}
      {isOpen && (
        <div
          className={cn(
            'fixed z-50',
            'bg-white/90 backdrop-blur-2xl border border-white/60',
            'shadow-2xl shadow-black/[0.08] flex flex-col',
            'animate-in slide-in-from-bottom-4 fade-in duration-300',
            // Mobile: full screen
            isMobile
              ? 'inset-0 rounded-none border-0'
              : 'bottom-6 right-6 w-[400px] h-[560px] rounded-2xl'
          )}
        >
          
          {/* ── Header ── */}
          <div className="px-4 py-3 border-b border-white/60 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 
                flex items-center justify-center border border-cyan-200/50">
                <Bot size={18} className="text-cyan-600" />
              </div>
              <div>
                <h3 className="text-slate-800 font-semibold text-sm">Asisten AI YWM</h3>
                <div className="flex items-center gap-1.5">
                  <div className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    !chatEnabled ? 'bg-slate-300' :
                    checkingAI ? 'bg-yellow-400 animate-pulse' :
                    aiReady ? 'bg-emerald-400' : 'bg-red-400'
                  )} />
                  <span className="text-slate-400 text-xs">
                    {!chatEnabled ? 'Dinonaktifkan' :
                    checkingAI ? 'Menghubungkan...' : aiReady ? 'Online — Siap membantu' : aiWarning ? 'Koneksi tidak stabil — Coba kirim pesan' : 'Offline — Cek server AI'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {/* On/Off Toggle */}
              <button
                onClick={toggleChatEnabled}
                className={cn(
                  'p-1.5 rounded-lg transition-all',
                  chatEnabled
                    ? 'text-emerald-500 hover:bg-emerald-50/80'
                    : 'text-slate-300 hover:bg-white/60'
                )}
                title={chatEnabled ? 'Nonaktifkan Chatbot' : 'Aktifkan Chatbot'}
              >
                {chatEnabled ? <Power size={14} /> : <PowerOff size={14} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-white/60 transition-all"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* ── Quick Actions (shown when no messages besides welcome) ── */}
          {chatEnabled && showQuickActions && messages.length <= 1 && (
            <div className="px-4 py-3 border-b border-white/60 flex-shrink-0">
              <p className="text-slate-400 text-xs mb-2">Aksi Cepat</p>
              <div className="grid grid-cols-2 gap-1.5">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action.prompt)}
                    disabled={isStreaming}
                    className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-white/50 border border-white/60 
                      text-slate-500 hover:text-slate-800 hover:bg-white/60 hover:border-white/60 
                      transition-all text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span className={action.color}>{action.icon}</span>
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Messages ── */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {!chatEnabled ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-8">
                <PowerOff size={32} className="text-slate-300 mb-3" />
                <p className="text-slate-400 text-sm font-medium">Chatbot dinonaktifkan</p>
                <p className="text-slate-300 text-xs mt-1">Klik tombol ⏻ di header untuk mengaktifkan</p>
              </div>
            ) : (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex gap-2',
                      msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    {/* Avatar */}
                    <div
                      className={cn(
                        'w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0',
                        msg.role === 'user'
                          ? 'bg-cyan-100/80'
                          : 'bg-purple-100/80'
                      )}
                    >
                      {msg.role === 'user' ? (
                        <User size={14} className="text-cyan-600" />
                      ) : (
                        <Bot size={14} className="text-purple-600" />
                      )}
                    </div>

                    {/* Message bubble */}
                    <div
                      className={cn(
                        'max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                        msg.role === 'user'
                          ? 'bg-cyan-50/80 border border-cyan-200/50 text-slate-800'
                          : 'bg-white/50 border border-white/60 text-slate-600'
                      )}
                    >
                      <p className="whitespace-pre-wrap">{formatContent(msg.content)}</p>
                      
                      {/* Streaming indicator */}
                      {msg.content === '' && isStreaming && (
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Loader2 size={12} className="animate-spin" />
                          <span className="text-xs">AI sedang berpikir...</span>
                        </div>
                      )}

                      {/* Show typing cursor while streaming */}
                      {msg.content !== '' && isStreaming && msg.id.includes('_stream') && (
                        <span className="inline-block w-1.5 h-4 bg-cyan-400/60 animate-pulse ml-0.5 align-text-bottom" />
                      )}
                    </div>
                  </div>
                ))}

                {/* Data input confirmation card */}
                {pendingDataInput && (
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-100/80 flex items-center justify-center flex-shrink-0">
                      <AlertCircle size={14} className="text-amber-600" />
                    </div>
                    <DataInputCard
                      module={pendingDataInput.module}
                      action={pendingDataInput.action}
                      data={pendingDataInput.data}
                      onConfirm={handleConfirmDataInput}
                      onCancel={handleCancelDataInput}
                    />
                  </div>
                )}

                <div ref={messagesEndRef} />

                {/* Retry connection button when AI is in warning state */}
                {aiWarning && !aiReady && !isStreaming && (
                  <div className="flex justify-center py-2">
                    <button
                      onClick={retryAIConnection}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50/80 border border-amber-200/50 text-amber-600 text-xs font-medium hover:bg-amber-100/80 transition-all"
                    >
                      <RefreshCw size={12} className={checkingAI ? 'animate-spin' : ''} />
                      Coba Koneksi Ulang
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ── Input Area ── */}
          <div className="p-3 border-t border-white/60 flex-shrink-0">
            {chatEnabled ? (
            <div className="flex items-end gap-2 bg-white/50 border border-white/60 rounded-xl p-2 
              focus-within:border-cyan-200/50 focus-within:bg-white/60 transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isStreaming
                    ? 'AI sedang menjawab...'
                    : aiWarning && !aiReady
                    ? 'Koneksi tidak stabil — coba kirim pesan...'
                    : 'Ketik pesan atau tanya AI...'
                }
                disabled={isStreaming}
                rows={1}
                className="flex-1 bg-transparent text-slate-800 text-sm placeholder:text-slate-400 
                  resize-none outline-none max-h-24 min-h-[32px]"
              />
              <button
                onClick={toggleRecording}
                className={cn(
                  'p-2 rounded-lg transition-all flex-shrink-0',
                  isRecording
                    ? 'bg-red-100/80 text-red-500 animate-pulse'
                    : 'text-slate-400 hover:text-slate-500 hover:bg-white/50'
                )}
                title={isRecording ? 'Berhenti merekam' : 'Input suara'}
              >
                {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isStreaming}
                className="p-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-600/20 
                  text-cyan-600 hover:from-cyan-200/60 hover:to-blue-200/60 
                  transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                title="Kirim"
              >
                <Send size={16} />
              </button>
            </div>
            ) : (
              <div className="text-center py-2 text-slate-300 text-xs">
                Chatbot dinonaktifkan — klik ⏻ untuk mengaktifkan
              </div>
            )}
            {/* Status bar */}
            <div className="flex items-center justify-between mt-1.5 px-1">
              <span className="text-slate-400 text-[10px]">Powered by YWM AI</span>
              <button
                onClick={() => setShowQuickActions(true)}
                className="text-slate-400 text-[10px] hover:text-slate-400 transition-colors"
              >
                Aksi Cepat
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
