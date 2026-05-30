// ============================================================
// FloatingChatBot — AI Chatbot with floating button
// White/Red theme matching YWM website
// ============================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { chatWithAiStream, checkAIHealth, smartParse, parseDataInputAction } from '@/lib/ywm-ai';
import type { AiMessage } from '@/types/dashboard';
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
  Zap,
  Wrench,
  Package,
  Shield,
  Users,
} from 'lucide-react';

// ── Quick Actions ──
const QUICK_ACTIONS = [
  {
    label: 'Ringkasan Hari Ini',
    icon: <Zap size={14} />,
    prompt: 'Beri ringkasan operasional hari ini untuk PT. Yoga Wibawa Mandiri. Apa saja yang perlu diperhatikan?',
  },
  {
    label: 'Cek Stok Rendah',
    icon: <Package size={14} />,
    prompt: 'Suku cadang mana yang stoknya mendekati batas minimum? Tampilkan daftar lengkap.',
  },
  {
    label: 'Jadwal Perawatan',
    icon: <Wrench size={14} />,
    prompt: 'Apa jadwal perawatan mesin minggu ini? Ada WO yang overdue?',
  },
  {
    label: 'Keselamatan Kerja',
    icon: <Shield size={14} />,
    prompt: 'Apakah ada insiden keselamatan yang perlu ditindaklanjuti? Tampilkan status HSE.',
  },
  {
    label: 'Input Data',
    icon: <Database size={14} />,
    prompt: 'Saya ingin input data. Apa saja modul yang tersedia dan format yang diperlukan?',
  },
];

// ── Data Input Confirmation Component ──
function DataInputCard({
  module,
  data,
  onConfirm,
  onCancel,
}: {
  module: string;
  data: Record<string, unknown>;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const moduleLabels: Record<string, string> = {
    'spare-parts': 'Spare Parts',
    maintenance: 'Maintenance',
    'team-activity': 'Tim & Aktivitas',
    safety: 'Safety / HSE',
  };

  return (
    <div className="mt-2 rounded-xl border border-red-200 bg-red-50/50 p-3">
      <div className="flex items-center gap-2 mb-2">
        <Database size={16} className="text-red-600" />
        <span className="text-red-600 font-semibold text-sm">Input Data: {moduleLabels[module] || module}</span>
      </div>
      <div className="space-y-1 text-xs text-gray-600">
        {Object.entries(data).map(([key, value]) => (
          <div key={key} className="flex justify-between">
            <span className="text-gray-400">{key}:</span>
            <span className="text-gray-800 font-medium">{String(value ?? '-')}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={onConfirm}
          className="flex-1 py-1.5 rounded-lg bg-red-600 text-white text-xs font-medium hover:bg-red-700 transition-all"
        >
          <CheckCircle2 size={12} className="inline mr-1" />
          Simpan
        </button>
        <button
          onClick={onCancel}
          className="flex-1 py-1.5 rounded-lg bg-gray-100 text-gray-500 text-xs font-medium hover:bg-gray-200 transition-all"
        >
          Batal
        </button>
      </div>
    </div>
  );
}

export default function FloatingChatBot() {
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
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [pendingDataInput, setPendingDataInput] = useState<{
    module: string;
    data: Record<string, unknown>;
  } | null>(null);
  const [isRecording, setIsRecording] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // ── Check AI backend health ──
  useEffect(() => {
    let mounted = true;

    async function check() {
      try {
        const health = await checkAIHealth();
        if (mounted) {
          setAiReady(health.ai === 'ready');
          setCheckingAI(false);
        }
      } catch {
        if (mounted) {
          setAiReady(false);
          setCheckingAI(false);
        }
      }
    }

    check();
    const interval = setInterval(check, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
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
    if (!input.trim() || isStreaming || !aiReady) return;

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
      const chatMessages = [...messages, userMessage].filter(
        (m) => m.id !== 'welcome'
      );

      await chatWithAiStream(
        chatMessages,
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
  }, [input, isStreaming, aiReady, messages]);

  // ── Quick action ──
  const handleQuickAction = useCallback(
    (prompt: string) => {
      setInput(prompt);
      setTimeout(() => {
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

        chatWithAiStream(
          chatMessages,
          (chunk) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId
                  ? { ...m, content: m.content + chunk }
                  : m
              )
            );
          },
          () => setIsStreaming(false),
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

    const storageKey = `ywm_data_${pendingDataInput.module}`;
    const existingData = JSON.parse(localStorage.getItem(storageKey) || '[]');
    existingData.push({
      ...pendingDataInput.data,
      id: Date.now().toString(36),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    localStorage.setItem(storageKey, JSON.stringify(existingData));

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
          className="fixed bottom-6 right-6 z-50 group"
          aria-label="Buka Chat AI"
        >
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping" />
          {/* Main button */}
          <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-red-600 to-red-700 
            flex items-center justify-center shadow-lg shadow-red-500/25
            transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl group-hover:shadow-red-500/40">
            <MessageCircle size={24} className="text-white" />
          </div>
          {/* Status dot */}
          <div className={cn(
            'absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white',
            checkingAI ? 'bg-yellow-400 animate-pulse' :
            aiReady ? 'bg-emerald-400' : 'bg-red-400'
          )} />
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-white border border-gray-200 
            rounded-lg text-[#212121] text-xs whitespace-nowrap shadow-sm
            opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {checkingAI ? 'Menghubungkan AI...' : aiReady ? 'Chat dengan AI YWM' : 'AI Offline'}
          </div>
        </button>
      )}

      {/* ═══════════════════════════════════════════ */}
      {/* CHATBOT WINDOW                              */}
      {/* ═══════════════════════════════════════════ */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[400px] h-[560px] 
          bg-white/95 backdrop-blur-xl border border-gray-200 
          rounded-2xl shadow-2xl shadow-black/10 flex flex-col
          animate-in slide-in-from-bottom-4 fade-in duration-300">
          
          {/* ── Header ── */}
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-red-50 
                flex items-center justify-center border border-red-100">
                <Bot size={18} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-[#212121] font-semibold text-sm">Asisten AI YWM</h3>
                <div className="flex items-center gap-1.5">
                  <div className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    checkingAI ? 'bg-yellow-400 animate-pulse' :
                    aiReady ? 'bg-emerald-400' : 'bg-red-400'
                  )} />
                  <span className="text-gray-400 text-xs">
                    {checkingAI ? 'Menghubungkan...' : aiReady ? 'Online — Siap membantu' : 'Offline — Cek server AI'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
            >
              <X size={16} />
            </button>
          </div>

          {/* ── Quick Actions ── */}
          {showQuickActions && messages.length <= 1 && (
            <div className="px-4 py-3 border-b border-gray-50 flex-shrink-0">
              <p className="text-gray-400 text-xs mb-2">Aksi Cepat</p>
              <div className="grid grid-cols-2 gap-1.5">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action.prompt)}
                    disabled={isStreaming || !aiReady}
                    className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg bg-gray-50 border border-gray-100 
                      text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200
                      transition-all text-xs disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <span className="text-red-500">{action.icon}</span>
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Messages ── */}
          <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar-light">
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
                      ? 'bg-red-50'
                      : 'bg-purple-50'
                  )}
                >
                  {msg.role === 'user' ? (
                    <User size={14} className="text-red-600" />
                  ) : (
                    <Bot size={14} className="text-purple-600" />
                  )}
                </div>

                {/* Message bubble */}
                <div
                  className={cn(
                    'max-w-[82%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                    msg.role === 'user'
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-50 border border-gray-100 text-gray-700'
                  )}
                >
                  <p className="whitespace-pre-wrap">{formatContent(msg.content)}</p>
                  
                  {/* Streaming indicator */}
                  {msg.content === '' && isStreaming && (
                    <div className="flex items-center gap-1.5 text-gray-400">
                      <Loader2 size={12} className="animate-spin" />
                      <span className="text-xs">AI sedang berpikir...</span>
                    </div>
                  )}

                  {/* Show typing cursor while streaming */}
                  {msg.content !== '' && isStreaming && msg.id.includes('_stream') && (
                    <span className="inline-block w-1.5 h-4 bg-red-600/60 animate-pulse ml-0.5 align-text-bottom" />
                  )}
                </div>
              </div>
            ))}

            {/* Data input confirmation card */}
            {pendingDataInput && (
              <div className="flex gap-2">
                <div className="w-7 h-7 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                  <Database size={14} className="text-red-600" />
                </div>
                <DataInputCard
                  module={pendingDataInput.module}
                  data={pendingDataInput.data}
                  onConfirm={handleConfirmDataInput}
                  onCancel={handleCancelDataInput}
                />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Input Area ── */}
          <div className="p-3 border-t border-gray-100 flex-shrink-0">
            <div className="flex items-end gap-2 bg-white border border-gray-200 rounded-xl p-2 
              focus-within:border-red-300 focus-within:shadow-sm focus-within:shadow-red-50 transition-all">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  !aiReady
                    ? 'AI belum terhubung...'
                    : isStreaming
                    ? 'AI sedang menjawab...'
                    : 'Ketik pesan atau tanya AI...'
                }
                disabled={!aiReady || isStreaming}
                rows={1}
                className="flex-1 bg-transparent text-[#212121] text-sm placeholder:text-gray-300 
                  resize-none outline-none max-h-24 min-h-[32px]"
              />
              <button
                onClick={toggleRecording}
                className={cn(
                  'p-2 rounded-lg transition-all flex-shrink-0',
                  isRecording
                    ? 'bg-red-50 text-red-600 animate-pulse'
                    : 'text-gray-300 hover:text-gray-500 hover:bg-gray-50'
                )}
                title={isRecording ? 'Berhenti merekam' : 'Input suara'}
              >
                {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
              <button
                onClick={handleSend}
                disabled={!input.trim() || isStreaming || !aiReady}
                className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 
                  transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
                title="Kirim"
              >
                <Send size={16} />
              </button>
            </div>
            {/* Status bar */}
            <div className="flex items-center justify-between mt-1.5 px-1">
              <span className="text-gray-300 text-[10px]">Powered by YWM AI</span>
              <button
                onClick={() => setShowQuickActions(true)}
                className="text-gray-300 text-[10px] hover:text-gray-500 transition-colors"
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
