// ============================================================
// ChatBot — Public website chatbot with floating button
// Uses backend AI (z-ai-web-dev-sdk) instead of keyword matching
// ============================================================

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, Phone } from 'lucide-react';
import { chatWithAiStream, checkAIHealth } from '@/lib/ywm-ai';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Halo! 👋 Saya adalah AI Assistant PT. Yoga Wibawa Mandiri. Saya bisa membantu Anda dengan:\n\n• Informasi produk semen\n• Harga dan pemesanan\n• Lokasi dan distribusi\n• Informasi perusahaan\n\nSilakan tanya apa saja!',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiReady, setAiReady] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    const botId = (Date.now() + 1).toString();

    // Add empty bot message for streaming
    setMessages(prev => [...prev, {
      id: botId,
      text: '',
      sender: 'bot',
      timestamp: new Date()
    }]);

    try {
      // Build messages for AI context (only last 10 for public chatbot)
      const aiMessages = messages.slice(-10).map(m => ({
        id: m.id,
        role: m.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: m.text,
        timestamp: m.timestamp.toISOString(),
      }));
      aiMessages.push({
        id: userMsg.id,
        role: 'user',
        content: userMsg.text,
        timestamp: userMsg.timestamp.toISOString(),
      });

      await chatWithAiStream(
        aiMessages,
        (chunk) => {
          setMessages(prev =>
            prev.map(m =>
              m.id === botId ? { ...m, text: m.text + chunk } : m
            )
          );
        },
        () => {
          setIsTyping(false);
        },
        (error) => {
          setMessages(prev =>
            prev.map(m =>
              m.id === botId ? { ...m, text: m.text || `Maaf, terjadi kesalahan: ${error}` } : m
            )
          );
          setIsTyping(false);
        }
      );
    } catch {
      // Fallback to simple keyword responses if AI fails
      const fallbackText = getFallbackResponse(userMsg.text);
      setMessages(prev =>
        prev.map(m =>
          m.id === botId ? { ...m, text: fallbackText } : m
        )
      );
      setIsTyping(false);
    }
  };

  // Simple fallback responses when AI backend is not available
  const getFallbackResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    if (message.includes('halo') || message.includes('hai') || message.includes('hello')) {
      return 'Halo! Saya AI Assistant PT. Yoga Wibawa Mandiri. Saya siap membantu Anda dengan informasi tentang produk semen dan layanan kami 24/7.\n\n📞 Untuk komunikasi langsung: +62 853-2262-4038';
    }
    if (message.includes('hubungi') || message.includes('kontak') || message.includes('telepon')) {
      return '📞 Hubungi kami:\n\n🏭 Tim Pengantongan: +62 853-2262-4038\n📧 Email: yogawibawamandiri@gmail.com';
    }
    if (message.includes('semen') || message.includes('produk')) {
      return 'Kami menyediakan semen berkualitas tinggi dari Semen Padang dengan kapasitas produksi hingga 500 ton per hari. Tersedia dalam kemasan 40kg (Zak).\n\n📞 Info detail: +62 853-2262-4038';
    }
    if (message.includes('harga') || message.includes('pesan') || message.includes('order')) {
      return 'Untuk informasi harga terbaru dan pemesanan:\n\n📞 Hubungi: +62 853-2262-4038\n📧 Email: yogawibawamandiri@gmail.com';
    }
    if (message.includes('lokasi') || message.includes('alamat')) {
      return 'Pabrik kami berlokasi di Pelabuhan Krueng Geukueh, Lhokseumawe, Aceh.\n\n📞 Untuk kunjungan: +62 853-2262-4038';
    }
    
    return 'Terima kasih atas pertanyaan Anda.\n\n📞 Untuk bantuan langsung: +62 853-2262-4038\n📧 Email: yogawibawamandiri@gmail.com\n\nTim kami siap melayani Anda!';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePhoneClick = () => {
    window.open('tel:+6285322624038', '_self');
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 group"
          aria-label="Open Chat"
        >
          <div className="absolute inset-0 rounded-full bg-red-600/30 animate-ping" />
          <div className="relative w-14 h-14 bg-ywm-red hover:bg-red-700 text-white rounded-full 
            shadow-lg flex items-center justify-center transition-all duration-300 
            group-hover:scale-110">
            <MessageCircle size={24} />
          </div>
          <div className={cn(
            'absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white',
            aiReady ? 'bg-green-500' : 'bg-yellow-400 animate-pulse'
          )} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl 
          border border-gray-200 flex flex-col z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          {/* Chat Header */}
          <div className="bg-ywm-red text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-semibold">AI Assistant YWM</h3>
                <p className="text-sm text-gray-200">
                  {aiReady ? 'Online — Siap membantu' : 'Menghubungkan...'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePhoneClick}
                className="bg-green-500 hover:bg-green-600 p-2 rounded-full transition-colors"
                title="Hubungi +62 853-2262-4038"
              >
                <Phone size={16} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-ywm-red text-white rounded-br-none'
                      : 'bg-gray-100 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.sender === 'bot' && (
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-1 border border-gray-300">
                        <Bot size={14} className="text-red-600" />
                      </div>
                    )}
                    <div>
                      {message.text ? (
                        <p className="text-sm whitespace-pre-line">{message.text}</p>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Loader2 size={14} className="animate-spin text-gray-400" />
                          <span className="text-xs text-gray-400">AI sedang berpikir...</span>
                        </div>
                      )}
                      <p className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-gray-200' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString('id-ID', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ketik pesan Anda..."
                disabled={isTyping}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none disabled:opacity-50"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-ywm-red text-white p-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                Powered by YWM AI
              </p>
              <button
                onClick={handlePhoneClick}
                className="text-xs text-green-600 hover:text-green-800 font-medium flex items-center space-x-1"
              >
                <Phone size={12} />
                <span>+62 853-2262-4038</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Helper for cn (since we may not have it in the public website context)
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default ChatBot;
