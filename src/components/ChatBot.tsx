import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Cpu, Zap, Settings, Headphones, Monitor, Smartphone, Wifi, Database, Phone } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface BotIcon {
  id: string;
  name: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  style: string;
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Halo! Saya adalah Customer Service Bot PT. Yoga Wibawa Mandiri. Ada yang bisa saya bantu hari ini? Untuk komunikasi langsung, Anda dapat menghubungi kami di +62 823-0443-3145.',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Array of different bot icons
  const botIcons: BotIcon[] = [
    {
      id: '1',
      name: 'Customer Service',
      icon: Bot,
      color: 'text-blue-600',
      style: 'Classic Bot'
    },
    {
      id: '2',
      name: 'Customer Service',
      icon: Cpu,
      color: 'text-purple-600',
      style: 'AI Processor'
    },
    {
      id: '3',
      name: 'Customer Service',
      icon: Zap,
      color: 'text-yellow-600',
      style: 'Quick Assistant'
    },
    {
      id: '4',
      name: 'Customer Service',
      icon: Settings,
      color: 'text-gray-600',
      style: 'Tech Support'
    },
    {
      id: '5',
      name: 'Customer Service',
      icon: Headphones,
      color: 'text-green-600',
      style: 'Support Agent'
    },
    {
      id: '6',
      name: 'Customer Service',
      icon: Monitor,
      color: 'text-indigo-600',
      style: 'Digital Helper'
    },
    {
      id: '7',
      name: 'Customer Service',
      icon: Smartphone,
      color: 'text-pink-600',
      style: 'Mobile Assistant'
    },
    {
      id: '8',
      name: 'Customer Service',
      icon: Wifi,
      color: 'text-cyan-600',
      style: 'Connected Bot'
    },
    {
      id: '9',
      name: 'Customer Service',
      icon: Database,
      color: 'text-orange-600',
      style: 'Data Assistant'
    }
  ];

  // State for current bot icon
  const [currentBot, setCurrentBot] = useState<BotIcon>(botIcons[0]);

  // Function to get random bot icon
  const getRandomBot = () => {
    const randomIndex = Math.floor(Math.random() * botIcons.length);
    return botIcons[randomIndex];
  };

  // Change bot icon every 30 seconds when chat is open
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setCurrentBot(getRandomBot());
    }, 30000); // Change every 30 seconds

    return () => clearInterval(interval);
  }, [isOpen]);

  // Change bot icon when chat opens
  useEffect(() => {
    if (isOpen) {
      setCurrentBot(getRandomBot());
    }
  }, [isOpen]);

  // Change bot icon on each bot response
  const changeBotOnResponse = () => {
    // 60% chance to change bot icon on response
    if (Math.random() < 0.6) {
      setCurrentBot(getRandomBot());
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Knowledge base untuk chatbot dengan nomor telepon pengantongan
  const getResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Greeting responses
    if (message.includes('halo') || message.includes('hai') || message.includes('hello')) {
      return 'Halo! Saya Customer Service Bot PT. Yoga Wibawa Mandiri. Saya siap membantu Anda dengan informasi tentang produk semen dan layanan kami 24/7.\n\n📞 Untuk komunikasi langsung dengan tim pengantongan kami, silakan hubungi: +62 823-0443-3145';
    }
    
    // Contact/communication requests
    if (message.includes('hubungi') || message.includes('kontak') || message.includes('telepon') || message.includes('bicara') || message.includes('komunikasi') || message.includes('call')) {
      return '📞 Untuk memulai komunikasi langsung dengan tim kami, silakan hubungi:\n\n🏭 **Tim Pengantongan**: +62 823-0443-3145\n📧 **Email**: info@ywm.co.id\n\nTim kami siap melayani Anda untuk konsultasi, pemesanan, dan informasi detail tentang produk semen kami.';
    }
    
    // Product information
    if (message.includes('semen') || message.includes('produk')) {
      return 'Kami menyediakan semen berkualitas tinggi dari Semen Padang dengan kapasitas produksi hingga 500 ton per hari. Tersedia dalam kemasan 40kg dan 50kg dengan standar SNI 15-2049.\n\n📞 Untuk informasi detail dan pemesanan, hubungi: +62 823-0443-3145';
    }
    
    // Location information
    if (message.includes('lokasi') || message.includes('alamat') || message.includes('dimana')) {
      return 'Pabrik kami berlokasi di Pelabuhan Krueng Geukueh, Lhokseumawe, Aceh. Kantor pusat di Medan, Sumatera Utara. Lokasi strategis untuk distribusi ke seluruh Aceh dan Sumut.\n\n📞 Untuk kunjungan atau informasi lokasi detail: +62 823-0443-3145';
    }
    
    // Pricing information
    if (message.includes('harga') || message.includes('tarif') || message.includes('biaya') || message.includes('pesan') || message.includes('order')) {
      return 'Untuk informasi harga terbaru, penawaran khusus, dan pemesanan:\n\n📞 **Hubungi langsung**: +62 823-0443-3145\n📧 **Email**: sales@ywm.co.id\n\nHarga dapat bervariasi tergantung volume dan lokasi pengiriman. Tim kami akan memberikan penawaran terbaik untuk kebutuhan Anda.';
    }
    
    // Distribution information
    if (message.includes('distribusi') || message.includes('pengiriman') || message.includes('kirim')) {
      return 'Kami melayani distribusi ke seluruh Aceh dan Sumatera Utara dengan armada truck yang handal. Pengiriman tepat waktu dengan sistem tracking. Area distribusi meliputi 50+ kota.\n\n📞 Untuk jadwal pengiriman: +62 823-0443-3145';
    }
    
    // Quality information
    if (message.includes('kualitas') || message.includes('standar') || message.includes('sertifikat')) {
      return 'Produk kami memiliki sertifikat ISO 9001:2015 dan memenuhi standar SNI 15-2049. Setiap batch produksi melalui quality control ketat di laboratorium in-house kami.\n\n📞 Untuk informasi teknis detail: +62 823-0443-3145';
    }
    
    // Capacity information
    if (message.includes('kapasitas') || message.includes('produksi')) {
      return 'Kapasitas produksi kami mencapai 500 ton per hari dengan mesin pengantongan otomatis. Operasional 24/7 untuk memenuhi permintaan pasar yang tinggi.\n\n📞 Untuk diskusi kapasitas dan jadwal produksi: +62 823-0443-3145';
    }
    
    // Partnership information
    if (message.includes('kemitraan') || message.includes('mitra') || message.includes('kerja sama')) {
      return 'Kami terbuka untuk kemitraan bisnis! Silakan hubungi tim business development kami untuk membahas peluang kerja sama yang saling menguntungkan.\n\n📞 **Hubungi**: +62 823-0443-3145\n📧 **Email**: partnership@ywm.co.id';
    }
    
    // Bot information
    if (message.includes('siapa') || message.includes('nama') || message.includes('bot')) {
      return 'Saya adalah Customer Service Bot PT. Yoga Wibawa Mandiri. Saya adalah asisten virtual yang siap membantu Anda 24/7 dengan informasi tentang produk dan layanan kami.\n\n📞 Untuk berbicara dengan tim manusia: +62 823-0443-3145';
    }
    
    // Help or assistance requests
    if (message.includes('bantuan') || message.includes('help') || message.includes('tolong') || message.includes('butuh')) {
      return 'Saya siap membantu Anda! Untuk bantuan lebih lanjut dan komunikasi langsung dengan tim ahli kami:\n\n📞 **Hubungi sekarang**: +62 823-0443-3145\n📧 **Email**: info@ywm.co.id\n\nTim kami tersedia untuk konsultasi, pemesanan, dan semua kebutuhan Anda terkait produk semen.';
    }
    
    // Default response
    return 'Terima kasih atas pertanyaan Anda. Sebagai Customer Service Bot, saya siap membantu lebih lanjut.\n\n📞 **Untuk komunikasi langsung dan bantuan detail, silakan hubungi**: +62 823-0443-3145\n📧 **Email**: info@ywm.co.id\n\nTim pengantongan kami siap melayani Anda dengan profesional dan responsif.';
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
      // Change bot icon before responding (60% chance)
      changeBotOnResponse();
      
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

  // Function to handle phone number click
  const handlePhoneClick = () => {
    window.open('tel:+6282304433145', '_self');
  };

  const CurrentBotIcon = currentBot.icon;

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
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center transition-all duration-500">
                <CurrentBotIcon 
                  size={24} 
                  className={`${currentBot.color} transition-all duration-500`}
                />
              </div>
              <div>
                <h3 className="font-semibold transition-all duration-500">Customer Service</h3>
                <p className="text-sm text-gray-200 transition-all duration-500">Bot Assistant • Online 24/7</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Quick Call Button */}
              <button
                onClick={handlePhoneClick}
                className="bg-green-500 hover:bg-green-600 p-2 rounded-full transition-colors"
                title="Hubungi +62 823-0443-3145"
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

          {/* Quick Action Bar */}
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
            <button
              onClick={handlePhoneClick}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg text-sm font-medium flex items-center justify-center space-x-2 transition-colors"
            >
              <Phone size={16} />
              <span>Hubungi: +62 823-0443-3145</span>
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
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-1 border border-gray-300 transition-all duration-500">
                        <CurrentBotIcon 
                          size={14} 
                          className={`${currentBot.color} transition-all duration-500`}
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
                    <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center flex-shrink-0 border border-gray-300 transition-all duration-500">
                      <CurrentBotIcon 
                        size={14} 
                        className={`${currentBot.color} transition-all duration-500`}
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
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500">
                Powered by PT. Yoga Wibawa Mandiri
              </p>
              <button
                onClick={handlePhoneClick}
                className="text-xs text-green-600 hover:text-green-800 font-medium flex items-center space-x-1"
              >
                <Phone size={12} />
                <span>+62 823-0443-3145</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;