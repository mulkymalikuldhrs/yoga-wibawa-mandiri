import MessageCircle from 'lucide-react/dist/esm/icons/message-circle';
import { X } from 'lucide-react';
import { useState } from 'react';

const WHATSAPP_NUMBER = '6285322624048';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

const WhatsAppButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const quickMessages = [
    {
      label: 'Pesan Produk',
      message: 'Halo PT. Yoga Wibawa Mandiri, saya ingin memesan produk Semen Padang. Mohon informasinya.',
    },
    {
      label: 'Konsultasi',
      message: 'Halo PT. Yoga Wibawa Mandiri, saya ingin konsultasi mengenai produk semen untuk proyek saya.',
    },
    {
      label: 'Info Harga',
      message: 'Halo PT. Yoga Wibawa Mandiri, mohon informasi harga terbaru untuk produk Semen Padang.',
    },
    {
      label: 'Dukungan',
      message: 'Halo PT. Yoga Wibawa Mandiri, saya butuh bantuan mengenai pengiriman/pemesanan.',
    },
  ];

  const handleChat = (message?: string) => {
    const text = message || 'Halo PT. Yoga Wibawa Mandiri, ada yang bisa saya bantu?';
    window.open(`${WHATSAPP_URL}?text=${encodeURIComponent(text)}`, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Quick Options */}
      {isOpen && (
        <div className="animate-fade-in mb-2">
          <div className="bg-white rounded-2xl shadow-2xl border border-green-100 p-3 w-64">
            <p className="text-sm font-semibold text-gray-700 mb-2 px-2">Pilih opsi:</p>
            <div className="space-y-1">
              {quickMessages.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleChat(item.message)}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-green-50 text-sm text-gray-600 hover:text-green-700 transition-colors font-medium"
                >
                  {item.label}
                </button>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-2 pt-2">
              <button
                onClick={() => handleChat()}
                className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-green-50 text-sm text-green-600 font-semibold transition-colors"
              >
                Chat Langsung
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          isOpen
            ? 'bg-gray-700 rotate-90'
            : 'bg-green-500 hover:bg-green-600 animate-bounce-slow'
        }`}
        aria-label="WhatsApp"
      >
        {isOpen ? (
          <X className="text-white" size={28} />
        ) : (
          <MessageCircle className="text-white" size={28} />
        )}
      </button>
    </div>
  );
};

export default WhatsAppButton;
