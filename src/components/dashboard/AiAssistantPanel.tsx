// ============================================================
// AiAssistantPanel — AI chat panel (white frosted glass, right side)
// Updated: Uses backend API instead of Puter.js
// ============================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { AiMessage } from '@/types/dashboard';
import { chatWithAiStream, checkAIHealth, parseDataInputAction } from '@/lib/ywm-ai';
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
} from 'lucide-react';

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
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Check AI backend health
  useEffect(() => {
    let mounted = true;
    async function check() {
      try {
        const health = await checkAIHealth();
        if (mounted) setAiReady(health.ai === 'ready');
      } catch {
        if (mounted) setAiReady(false);
      }
    }
    check();
    const interval = setInterval(check, 15000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

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
      setTimeout(() => {
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

        chatWithAiStream(
          chatMessages,
          (chunk) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: m.content + chunk } : m
              )
            );
          },
          () => setIsStreaming(false),
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
          className="fixed right-4 top-4 z-30 bg-white/95 backdrop-blur-xl border border-gray-200 rounded-xl p-2.5 text-red-600 hover:bg-red-50 hover:border-red-200 transition-all shadow-sm"
          title="Buka Panel AI"
        >
          <MessageSquare size={20} />
        </button>
      )}

      {/* Panel */}
      <div
        className={cn(
          'h-screen sticky top-0 backdrop-blur-xl bg-white/95 border-l border-gray-200 transition-all duration-300 flex flex-col z-20 shadow-sm',
          isOpen ? 'w-[380px]' : 'w-0 overflow-hidden'
        )}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <Bot size={18} className="text-red-600" />
            </div>
            <div>
              <h2 className="text-[#212121] font-semibold text-sm">Asisten AI</h2>
              <div className="flex items-center gap-1.5">
                <div className={cn('w-1.5 h-1.5 rounded-full', aiReady ? 'bg-emerald-500' : 'bg-yellow-500 animate-pulse')} />
                <span className="text-gray-400 text-xs">
                  {aiReady ? 'Online' : 'Menunggu server AI...'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-all"
            title="Tutup Panel"
          >
            <PanelRightClose size={16} />
          </button>
        </div>

        {/* Quick Actions */}
        <div className="px-4 py-3 border-b border-gray-50 flex-shrink-0">
          <p className="text-gray-400 text-xs mb-2">Aksi Cepat</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => handleQuickAction(action.prompt)}
                disabled={isStreaming || !aiReady}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-gray-600 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-all text-xs disabled:opacity-50"
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar-light">
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
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-50 border border-gray-100 text-gray-700'
                )}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.content === '' && isStreaming && (
                  <div className="flex items-center gap-1 text-gray-400">
                    <Loader2 size={12} className="animate-spin" />
                    <span className="text-xs">Mengetik...</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-3 border-t border-gray-100 flex-shrink-0">
          <div className="flex items-end gap-2 bg-white border border-gray-200 rounded-xl p-2 
            focus-within:border-red-300 focus-within:shadow-sm focus-within:shadow-red-50 transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={aiReady ? 'Ketik pesan...' : 'Menunggu server AI...'}
              disabled={!aiReady || isStreaming}
              rows={1}
              className="flex-1 bg-transparent text-[#212121] text-sm placeholder:text-gray-300 resize-none outline-none max-h-24 min-h-[32px]"
            />
            <button
              onClick={toggleRecording}
              className={cn(
                'p-2 rounded-lg transition-all',
                isRecording
                  ? 'bg-red-50 text-red-600'
                  : 'text-gray-300 hover:text-gray-500 hover:bg-gray-50'
              )}
              title={isRecording ? 'Berhenti merekam' : 'Input suara'}
            >
              {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming || !aiReady}
              className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
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
