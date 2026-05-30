// ============================================================
// AiAssistantPanel — AI chat panel (frosted glass, right side)
// Updated: Uses backend API instead of Puter.js
// ============================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { AiMessage } from '@/types/dashboard';
import { KV_PREFIXES } from '@/types/dashboard';
import { chatWithAiStream, checkAIHealth, parseDataInputAction, buildDashboardContext } from '@/lib/ywm-ai';
import { saveData, generateId } from '@/lib/supabase-data';
import {
  Send,
  Mic,
  MicOff,
  MessageSquare,
  Sparkles,
  Zap,
  FileSearch,
  ChevronDown,
  Bot,
  User,
  Loader2,
  PanelRightClose,
  Database,
  CheckCircle2,
  XCircle,
  AlertCircle,
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

interface AiAssistantPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

const QUICK_ACTIONS = [
  { label: 'Ringkasan Hari Ini', icon: <Zap size={14} />, prompt: 'Beri ringkasan operasional hari ini untuk PT. Yoga Wibawa Mandiri. Apa saja yang perlu diperhatikan?' },
  { label: 'Cek Stok Rendah', icon: <Sparkles size={14} />, prompt: 'Suku cadang mana yang stoknya mendekati batas minimum? Tampilkan daftar lengkap.' },
  { label: 'Jadwal Perawatan', icon: <FileSearch size={14} />, prompt: 'Apa jadwal perawatan mesin minggu ini? Ada WO yang overdue?' },
];

export default function AiAssistantPanel({ isOpen, onToggle }: AiAssistantPanelProps) {
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Halo! 👋 Saya asisten AI YWM Dashboard. Saya bisa membantu Anda dengan operasional harian — dari cek stok suku cadang, jadwal perawatan, hingga input data produksi. Ada yang bisa saya bantu?',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [aiReady, setAiReady] = useState(false);
  const [aiWarning, setAiWarning] = useState(false); // Warning state: health check failed but allow interaction
  const [isRecording, setIsRecording] = useState(false);
  const [pendingDataInput, setPendingDataInput] = useState<{
    module: string;
    action?: string;
    data: Record<string, unknown>;
  } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Check AI backend health
  // When health check fails, show warning but still allow interaction
  useEffect(() => {
    let mounted = true;
    async function check() {
      try {
        const health = await checkAIHealth();
        if (mounted) {
          setAiReady(health.ai === 'ready');
          setAiWarning(health.ai !== 'ready');
        }
      } catch {
        if (mounted) {
          // Health check failed — show warning but don't fully disable
          setAiReady(false);
          setAiWarning(true);
        }
      }
    }
    check();
    const interval = setInterval(check, 30000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  // ── Retry AI connection manually ──
  const retryAIConnection = useCallback(async () => {
    try {
      const health = await checkAIHealth();
      setAiReady(health.ai === 'ready');
      setAiWarning(health.ai !== 'ready');
    } catch {
      setAiReady(false);
      setAiWarning(true);
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isStreaming) return;
    // Allow sending even if health check failed (aiWarning mode)

    const userMessage: AiMessage = {
      id: Date.now().toString(36),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);

    const assistantId = Date.now().toString(36) + '_stream';
    const assistantMessage: AiMessage = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const chatMessages = [...messages, userMessage].filter(m => m.id !== 'welcome');

      // Add dashboard data context as a system message
      const dashboardContext = await buildDashboardContext();
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
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: m.content || '⚠️ Gagal mendapat respons dari AI.' }
            : m
        )
      );
      setIsStreaming(false);
    }
  }, [input, isStreaming, aiReady, messages]);

  const handleQuickAction = useCallback(
    (prompt: string) => {
      setInput(prompt);
      setTimeout(async () => {
        const userMessage: AiMessage = {
          id: Date.now().toString(36),
          role: 'user',
          content: prompt,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, userMessage]);
        setIsStreaming(true);

        const assistantId = Date.now().toString(36) + '_stream';
        const assistantMessage: AiMessage = {
          id: assistantId,
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        const chatMessages = [...messages, userMessage].filter(m => m.id !== 'welcome');

        // Add dashboard data context
        const dashboardContext = await buildDashboardContext();
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
                m.id === assistantId ? { ...m, content: m.content + chunk } : m
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
          () => setIsStreaming(false)
        ).catch(() => setIsStreaming(false));
      }, 100);
    },
    [messages]
  );

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      return;
    }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => setIsRecording(true);
    recognition.onresult = (event: any) => {
      setInput(event.results[0][0].transcript);
      setIsRecording(false);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognition.start();
  }, [isRecording]);

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

  // ── Format message content (remove ACTION blocks from display) ──
  const formatContent = (content: string) => {
    let cleaned = content.replace(/```ACTION:INPUT_DATA[\s\S]*?```/g, '');
    return cleaned;
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  return (
    <>
      {/* Toggle Button (when closed) */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed right-4 top-4 z-30 bg-cyan-100/80 backdrop-blur-xl border border-cyan-200/50 rounded-xl p-2.5 text-cyan-600 hover:bg-cyan-100 transition-all shadow-[0_0_15px_rgba(6,182,212,0.12)]"
          title="Buka Panel AI"
        >
          <MessageSquare size={20} />
        </button>
      )}

      {/* Panel */}
      <div
        className={cn(
          'h-screen sticky top-0 backdrop-blur-xl bg-white/50 border-l border-white/60 transition-all duration-300 flex flex-col z-20',
          isOpen ? 'w-[380px]' : 'w-0 overflow-hidden'
        )}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/60 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-100/80 flex items-center justify-center">
              <Bot size={18} className="text-cyan-600" />
            </div>
            <div>
              <h2 className="text-slate-800 font-semibold text-sm">Asisten AI</h2>
              <div className="flex items-center gap-1.5">
                <div className={cn('w-1.5 h-1.5 rounded-full', aiReady ? 'bg-emerald-400' : 'bg-yellow-400 animate-pulse')} />
                <span className="text-slate-400 text-xs">
                  {aiReady ? 'Online — Siap membantu' : aiWarning ? 'Koneksi tidak stabil' : 'Menunggu server AI...'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-white/600 transition-all"
            title="Tutup Panel"
          >
            <PanelRightClose size={16} />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="px-4 py-3 border-b border-white/60 flex-shrink-0">
          <p className="text-slate-400 text-xs mb-2">Aksi Cepat</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => handleQuickAction(action.prompt)}
                disabled={isStreaming}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/50 border border-white/60 text-slate-500 hover:text-slate-800 hover:bg-white/60 transition-all text-xs disabled:opacity-50"
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                'flex gap-2',
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
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
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-cyan-50/80 border border-cyan-200/50 text-slate-800'
                    : 'bg-white/50 border border-white/60 text-slate-600'
                )}
              >
                <p className="whitespace-pre-wrap">{formatContent(msg.content)}</p>
                {msg.content === '' && isStreaming && (
                  <div className="flex items-center gap-1 text-slate-400">
                    <Loader2 size={12} className="animate-spin" />
                    <span className="text-xs">Mengetik...</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Data input confirmation card */}
          {pendingDataInput && (
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-100/80 flex items-center justify-center flex-shrink-0">
                <Database size={14} className="text-amber-600" />
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
                <RefreshCw size={12} />
                Coba Koneksi Ulang
              </button>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-3 border-t border-white/60 flex-shrink-0">
          <div className="flex items-end gap-2 bg-white/50 border border-white/60 rounded-xl p-2 
            focus-within:border-cyan-200/50 transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isStreaming ? 'AI sedang menjawab...' : aiWarning && !aiReady ? 'Koneksi tidak stabil — coba kirim pesan...' : 'Ketik pesan...'}
              disabled={isStreaming}
              rows={1}
              className="flex-1 bg-transparent text-slate-800 text-sm placeholder:text-slate-400 resize-none outline-none max-h-24 min-h-[32px]"
            />
            <button
              onClick={toggleRecording}
              className={cn(
                'p-2 rounded-lg transition-all',
                isRecording
                  ? 'bg-red-500/20 text-red-500'
                  : 'text-slate-400 hover:text-slate-500 hover:bg-white/50'
              )}
              title={isRecording ? 'Berhenti merekam' : 'Input suara'}
            >
              {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              className="p-2 rounded-lg bg-cyan-100/80 text-cyan-600 hover:bg-cyan-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              title="Kirim"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
