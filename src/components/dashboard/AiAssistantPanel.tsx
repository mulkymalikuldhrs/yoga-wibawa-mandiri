// ============================================================
// AiAssistantPanel — AI chat panel (frosted glass, right side)
// ============================================================

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { AiMessage } from '@/types/dashboard';
import { chatWithAiStream, AI_MODELS, type AiModelId } from '@/lib/puter-ai';
import { isPuterLoaded } from '@/lib/puter';
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
} from 'lucide-react';

interface AiAssistantPanelProps {
  isOpen: boolean;
  onToggle: () => void;
}

const QUICK_ACTIONS = [
  { label: 'Ringkasan Hari Ini', icon: <Zap size={14} />, prompt: 'Beri ringkasan operasional hari ini untuk PT. Yoga Wibawa Mandiri' },
  { label: 'Cek Stok Rendah', icon: <Sparkles size={14} />, prompt: 'Suku cadang mana yang stoknya mendekati batas minimum?' },
  { label: 'Jadwal Perawatan', icon: <FileSearch size={14} />, prompt: 'Apa jadwal perawatan mesin minggu ini?' },
];

export default function AiAssistantPanel({ isOpen, onToggle }: AiAssistantPanelProps) {
  const [messages, setMessages] = useState<AiMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Halo! 👋 Saya asisten AI YWM Dashboard. Saya bisa membantu Anda dengan operasional harian — dari cek stok suku cadang, jadwal perawatan, hingga analisis produksi. Ada yang bisa saya bantu?',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AiModelId>('gpt-4o-mini');
  const [showModelSelect, setShowModelSelect] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [puterReady, setPuterReady] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setPuterReady(isPuterLoaded());
    const interval = setInterval(() => {
      if (isPuterLoaded()) {
        setPuterReady(true);
        clearInterval(interval);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isStreaming) return;

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
      await chatWithAiStream(
        [...messages, userMessage],
        selectedModel,
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
  }, [input, isStreaming, messages, selectedModel]);

  const handleQuickAction = useCallback(
    (prompt: string) => {
      setInput(prompt);
      setTimeout(() => {
        const syntheticEvent = { preventDefault: () => {} };
        void syntheticEvent;
        setInput('');
        // Directly send
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

        chatWithAiStream(
          [...messages, userMessage],
          selectedModel,
          (chunk) => {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantId ? { ...m, content: m.content + chunk } : m
              )
            );
          },
          () => setIsStreaming(false)
        ).catch(() => setIsStreaming(false));
      }, 100);
    },
    [messages, selectedModel]
  );

  const toggleRecording = useCallback(() => {
    // Simple toggle for UI — actual transcription would use Web Speech API
    setIsRecording((prev) => !prev);
  }, []);

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
          className="fixed right-4 top-4 z-30 bg-cyan-500/20 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-2.5 text-cyan-400 hover:bg-cyan-500/30 transition-all shadow-[0_0_20px_rgba(0,212,255,0.15)]"
          title="Buka Panel AI"
        >
          <MessageSquare size={20} />
        </button>
      )}

      {/* Panel */}
      <div
        className={cn(
          'h-screen sticky top-0 backdrop-blur-xl bg-white/5 border-l border-white/10 transition-all duration-300 flex flex-col z-20',
          isOpen ? 'w-[380px]' : 'w-0 overflow-hidden'
        )}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Bot size={18} className="text-cyan-400" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-sm">Asisten AI</h2>
              <div className="flex items-center gap-1.5">
                <div className={cn('w-1.5 h-1.5 rounded-full', puterReady ? 'bg-emerald-400' : 'bg-yellow-400')} />
                <span className="text-white/40 text-xs">
                  {puterReady ? 'Online' : 'Menunggu Puter...'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Model Selector */}
            <div className="relative">
              <button
                onClick={() => setShowModelSelect(!showModelSelect)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all text-xs"
              >
                {AI_MODELS.find((m) => m.id === selectedModel)?.label || 'Model'}
                <ChevronDown size={12} />
              </button>
              {showModelSelect && (
                <div className="absolute right-0 top-full mt-1 bg-[#1a1a3e]/95 backdrop-blur-xl border border-white/10 rounded-xl p-1 min-w-[180px] z-50">
                  {AI_MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model.id);
                        setShowModelSelect(false);
                      }}
                      className={cn(
                        'w-full text-left px-3 py-2 rounded-lg text-xs transition-all',
                        selectedModel === model.id
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      )}
                    >
                      {model.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all"
              title="Tutup Panel"
            >
              <PanelRightClose size={16} />
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-4 py-3 border-b border-white/5 flex-shrink-0">
          <p className="text-white/30 text-xs mb-2">Aksi Cepat</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.label}
                onClick={() => handleQuickAction(action.prompt)}
                disabled={isStreaming}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all text-xs disabled:opacity-50"
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
                    ? 'bg-cyan-500/20'
                    : 'bg-purple-500/20'
                )}
              >
                {msg.role === 'user' ? (
                  <User size={14} className="text-cyan-400" />
                ) : (
                  <Bot size={14} className="text-purple-400" />
                )}
              </div>
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-cyan-500/15 border border-cyan-500/20 text-white'
                    : 'bg-white/5 border border-white/10 text-white/80'
                )}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.content === '' && isStreaming && (
                  <div className="flex items-center gap-1 text-white/40">
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
        <div className="p-3 border-t border-white/10 flex-shrink-0">
          <div className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-xl p-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={puterReady ? 'Ketik pesan...' : 'Menunggu koneksi Puter...'}
              disabled={!puterReady || isStreaming}
              rows={1}
              className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 resize-none outline-none max-h-24 min-h-[32px]"
            />
            <button
              onClick={toggleRecording}
              className={cn(
                'p-2 rounded-lg transition-all',
                isRecording
                  ? 'bg-red-500/20 text-red-400'
                  : 'text-white/30 hover:text-white/60 hover:bg-white/5'
              )}
              title={isRecording ? 'Berhenti merekam' : 'Input suara'}
            >
              {isRecording ? <MicOff size={16} /> : <Mic size={16} />}
            </button>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming || !puterReady}
              className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
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
