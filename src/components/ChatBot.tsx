import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

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
      text: 'Halo! Saya adalah asisten virtual PT. Yoga Wibawa Mandiri. Ada yang bisa saya bantu hari ini?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Knowledge base untuk chatbot
  const getResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Greeting responses
    if (message.includes('halo') || message.includes('hai') || message.includes('hello')) {
      return 'Halo! Selamat datang di PT. Yoga Wibawa Mandiri. Saya siap membantu Anda dengan informasi tentang produk semen dan layanan kami.';
    }
    
    // Product information
    if (message.includes('semen') || message.includes('produk')) {
      return 'Kami menyediakan semen berkualitas tinggi dari Semen Padang dengan kapasitas produksi hingga 500 ton per hari. Tersedia dalam kemasan 40kg dan 50kg dengan standar SNI 15-2049.';
    }
    
    // Location information
    if (message.includes('lokasi') || message.includes('alamat') || message.includes('dimana')) {
      return 'Pabrik kami berlokasi di Pelabuhan Krueng Geukueh, Lhokseumawe, Aceh. Kantor pusat di Medan, Sumatera Utara. Lokasi strategis untuk distribusi ke seluruh Aceh dan Sumut.';
    }
    
    // Contact information
    if (message.includes('kontak') || message.includes('telepon') || message.includes('hubungi')) {
      return 'Anda dapat menghubungi kami di:\n📞 Pabrik: +62 651 123456\n📞 Kantor: +62 61 456789\n📧 Email: info@ywm.co.id\nJam operasional: Senin-Jumat 08:00-17:00 WIB';
    }
    
    // Pricing information
    if (message.includes('harga') || message.includes('tarif') || message.includes('biaya')) {
      return 'Untuk informasi harga terbaru dan penawaran khusus, silakan hubungi tim sales kami di +62 651 123456 atau kirim email ke sales@ywm.co.id. Harga dapat bervariasi tergantung volume dan lokasi pengiriman.';
    }
    
    // Distribution information
    if (message.includes('distribusi') || message.includes('pengiriman') || message.includes('kirim')) {
      return 'Kami melayani distribusi ke seluruh Aceh dan Sumatera Utara dengan armada truck yang handal. Pengiriman tepat waktu dengan sistem tracking. Area distribusi meliputi 50+ kota.';
    }
    
    // Quality information
    if (message.includes('kualitas') || message.includes('standar') || message.includes('sertifikat')) {
      return 'Produk kami memiliki sertifikat ISO 9001:2015 dan memenuhi standar SNI 15-2049. Setiap batch produksi melalui quality control ketat di laboratorium in-house kami.';
    }
    
    // Capacity information
    if (message.includes('kapasitas') || message.includes('produksi')) {
      return 'Kapasitas produksi kami mencapai 500 ton per hari dengan mesin pengantongan otomatis. Operasional 24/7 untuk memenuhi permintaan pasar yang tinggi.';
    }
    
    // Partnership information
    if (message.includes('kemitraan') || message.includes('mitra') || message.includes('kerja sama')) {
      return 'Kami terbuka untuk kemitraan bisnis! Silakan hubungi tim business development kami untuk membahas peluang kerja sama yang saling menguntungkan.';
    }
    
    // Default response
    return 'Terima kasih atas pertanyaan Anda. Untuk informasi lebih detail, silakan hubungi customer service kami di +62 651 123456 atau kunjungi halaman kontak di website ini.';
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: getResponse(inputMessage),
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-16 h-16 bg-ywm-red hover:bg-red-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 transform hover:scale-110 z-50 animate-bounce-slow"
          aria-label="Open Chat"
        >
          <MessageCircle size={24} />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse"></div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col z-50 animate-fade-in">
          {/* Chat Header */}
          <div className="bg-ywm-red text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden border-2 border-white">
                <img 
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" 
                  alt="Customer Service Representative"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-semibold">Andi Pratama</h3>
                <p className="text-sm text-gray-200">Customer Service</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <X size={20} />
            </button>
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
                      <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 mt-1 border border-gray-300">
                        <img 
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" 
                          alt="Customer Service"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {message.sender === 'user' && (
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <User size={14} className="text-ywm-red" />
                      </div>
                    )}
                    <div>
                      <p className="text-sm whitespace-pre-line">{message.text}</p>
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

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 p-3 rounded-lg rounded-bl-none max-w-[80%]">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full overflow-hidden flex-shrink-0 border border-gray-300">
                      <img 
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80" 
                        alt="Customer Service"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ketik pesan Anda..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ywm-red focus:border-ywm-red outline-none"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim()}
                className="bg-ywm-red text-white p-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={20} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Powered by JS Puter AI • Respons otomatis 24/7
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;