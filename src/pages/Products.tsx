import { useState } from 'react';
import Layout from '@/components/Layout';
import { Truck, ShieldCheck, Clock, Award, Headphones, ChevronDown, ChevronUp, MessageCircle, CheckCircle, Phone } from 'lucide-react';

const Products = () => {
  const [bulkQuantity, setBulkQuantity] = useState<string>('');
  const [bulkError, setBulkError] = useState<string>('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleBulkQuantityChange = (value: string) => {
    setBulkError('');
    if (value === '') {
      setBulkQuantity('');
      return;
    }
    const num = parseFloat(value);
    if (isNaN(num) || num < 0) {
      setBulkError('Jumlah harus berupa angka positif');
      return;
    }
    if (num > 30) {
      setBulkError('Maksimal pemesanan 30 ton per pengiriman');
      setBulkQuantity(value);
      return;
    }
    setBulkQuantity(value);
  };

  const handleBulkOrder = () => {
    const num = parseFloat(bulkQuantity);
    if (!bulkQuantity || isNaN(num) || num <= 0) {
      setBulkError('Silakan masukkan jumlah ton yang valid');
      return;
    }
    if (num > 30) {
      setBulkError('Maksimal pemesanan 30 ton per pengiriman');
      return;
    }
    const message = `Halo, saya ingin memesan Semen Padang Curah ${num} ton`;
    window.open(`https://wa.me/6285322624048?text=${encodeURIComponent(message)}`, '_blank');
  };

  const zakOrderUrl = (quantity: number, totalTon: number) => {
    const message = `Halo, saya ingin memesan Semen Padang PCC Zak 40kg - ${quantity} zak (${totalTon} ton)`;
    return `https://wa.me/6285322624048?text=${encodeURIComponent(message)}`;
  };

  const faqs = [
    {
      question: 'Berapa minimum order untuk Semen Padang PCC Zak?',
      answer: 'Minimum order untuk Semen Padang PCC Zak 40kg adalah 250 zak (setara 10 ton). Kami menyediakan dua pilihan pemesanan: 250 zak (10 ton) dan 750 zak (30 ton).'
    },
    {
      question: 'Berapa maksimum order untuk Semen Padang Curah?',
      answer: 'Maksimum order untuk Semen Padang Curah adalah 30 ton per pengiriman. Pengiriman curah menggunakan truk tangki dengan kapasitas maksimum 30 ton.'
    },
    {
      question: 'Bagaimana cara pemesanan?',
      answer: 'Pemesanan dapat dilakukan melalui WhatsApp dengan mengklik tombol "Pesan via WhatsApp" pada produk yang diinginkan. Tim marketing kami akan segera merespons dan memproses pesanan Anda.'
    },
    {
      question: 'Apakah tersedia pengiriman ke luar Aceh?',
      answer: 'Ya, kami melayani pengiriman ke seluruh wilayah Aceh dan Sumatera Utara. Untuk area lain, silakan hubungi kami untuk informasi lebih lanjut mengenai ketersediaan pengiriman.'
    },
    {
      question: 'Bagaimana sistem pembayaran?',
      answer: 'Untuk informasi harga dan sistem pembayaran, silakan hubungi tim marketing kami melalui WhatsApp. Kami menawarkan berbagai opsi pembayaran yang fleksibel sesuai kebutuhan mitra bisnis.'
    },
    {
      question: 'Berapa lama waktu pengiriman?',
      answer: 'Waktu pengiriman bervariasi tergantung lokasi dan ketersediaan stok. Umumnya, pengiriman dalam wilayah Aceh membutuhkan 1-3 hari kerja. Tim kami akan memberikan estimasi waktu pengiriman saat konfirmasi pesanan.'
    }
  ];

  const trustBadges = [
    {
      icon: <ShieldCheck className="text-white" size={28} />,
      title: 'Produk Original',
      description: 'Semen Padang 100% original dari pabrik dengan jaminan kualitas'
    },
    {
      icon: <Clock className="text-white" size={28} />,
      title: 'Pengiriman Cepat',
      description: 'Distribusi cepat ke seluruh Aceh dan Sumatera Utara'
    },
    {
      icon: <Award className="text-white" size={28} />,
      title: 'Mitra Resmi',
      description: 'Distributor resmi Semen Padang dengan lisensi terverifikasi'
    },
    {
      icon: <Headphones className="text-white" size={28} />,
      title: 'Layanan 24/7',
      description: 'Tim customer service siap melayani kapan saja via WhatsApp'
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-ywm-red to-red-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/hero-factory.png')] bg-cover bg-center opacity-15"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl font-bold mb-6 animate-fade-in">Produk Kami</h1>
          <p className="text-xl max-w-3xl mx-auto animate-fade-in text-red-50">
            Semen Padang PCC Berkualitas Tinggi — Tersedia dalam Kemasan Zak 40kg & Curah untuk Kebutuhan Proyek Anda
          </p>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-ywm-dark mb-4">
              Pilih <span className="text-ywm-red">Produk</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Semen Padang PCC dengan standar SNI, tersedia dalam dua bentuk pengemasan untuk memenuhi berbagai kebutuhan proyek konstruksi
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 max-w-6xl mx-auto">
            {/* Product Card: Semen Padang PCC Zak 40kg */}
            <div className="glass-card overflow-hidden hover:shadow-2xl transition-all duration-500 animate-fade-in group">
              {/* Product Image Header */}
              <div className="relative bg-gradient-to-br from-ywm-red to-red-600 h-72 overflow-hidden">
                <img
                  src="/images/cement-zak-40kg.png"
                  alt="Semen Padang PCC Zak 40kg"
                  className="w-full h-full object-cover object-center mix-blend-luminosity opacity-60 group-hover:opacity-40 transition-opacity duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ywm-red/90 via-ywm-red/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-sm font-semibold px-3 py-1 rounded-full mb-3 border border-white/20">
                        Zak 40kg
                      </span>
                      <h3 className="text-3xl font-bold text-white">Semen Padang PCC</h3>
                      <p className="text-red-100 text-lg font-medium mt-1">Kemasan Zak 40kg</p>
                    </div>
                    <img
                      src="/images/cement-zak-40kg.png"
                      alt="Semen Padang Zak"
                      className="w-28 h-28 object-contain drop-shadow-2xl rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-8">
                {/* Product Specs */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                    <span className="text-gray-500 text-sm font-medium uppercase tracking-wide">Kemasan</span>
                    <span className="text-ywm-dark font-semibold">Zak / Karung 40kg</span>
                  </div>
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                    <span className="text-gray-500 text-sm font-medium uppercase tracking-wide">Tipe</span>
                    <span className="text-ywm-dark font-semibold">Portland Composite Cement</span>
                  </div>
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                    <span className="text-gray-500 text-sm font-medium uppercase tracking-wide">Standar</span>
                    <span className="text-ywm-dark font-semibold">SNI 15-2049</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm font-medium uppercase tracking-wide">Berat per Zak</span>
                    <span className="text-ywm-dark font-semibold">40 kg</span>
                  </div>
                </div>

                {/* Order Options */}
                <div className="mb-6">
                  <h4 className="font-semibold text-ywm-dark mb-4">Pilihan Pemesanan:</h4>
                  
                  <div className="glass-card-gray p-5 mb-4 hover:border-ywm-red/30 transition-all duration-300 cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-ywm-dark text-lg">250 Zak</span>
                      <span className="bg-ywm-red/10 text-ywm-red font-bold text-sm px-3 py-1 rounded-full">10 Ton</span>
                    </div>
                    <p className="text-gray-500 text-sm">250 zak × 40kg = 10.000 kg = 10 ton</p>
                    <div className="mt-2 flex items-center gap-2 text-green-600 text-xs">
                      <CheckCircle size={14} />
                      <span>Minimum order</span>
                    </div>
                  </div>

                  <div className="glass-card-gray p-5 hover:border-ywm-red/30 transition-all duration-300 cursor-pointer">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-ywm-dark text-lg">750 Zak</span>
                      <span className="bg-ywm-red/10 text-ywm-red font-bold text-sm px-3 py-1 rounded-full">30 Ton</span>
                    </div>
                    <p className="text-gray-500 text-sm">750 zak × 40kg = 30.000 kg = 30 ton</p>
                    <div className="mt-2 flex items-center gap-2 text-amber-600 text-xs">
                      <CheckCircle size={14} />
                      <span>Best value — harga spesial</span>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 mb-6 border border-amber-200">
                  <p className="text-amber-800 font-semibold text-center">
                    💬 Hubungi kami untuk harga terbaru
                  </p>
                </div>

                {/* Order Buttons */}
                <div className="space-y-3">
                  <a
                    href={zakOrderUrl(250, 10)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5A] text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
                  >
                    <MessageCircle size={20} />
                    Pesan 250 Zak via WhatsApp
                  </a>
                  <a
                    href={zakOrderUrl(750, 30)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5A] text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
                  >
                    <MessageCircle size={20} />
                    Pesan 750 Zak via WhatsApp
                  </a>
                  <a
                    href="https://wa.me/6285322624038?text=Halo%2C%20saya%20ingin%20konsultasi%20tentang%20produk%20Semen%20Padang%20Zak%2040kg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-ywm-red hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    <Phone size={18} />
                    Konsultasi Produk
                  </a>
                </div>
              </div>
            </div>

            {/* Product Card: Semen Padang Curah */}
            <div className="glass-card overflow-hidden hover:shadow-2xl transition-all duration-500 animate-fade-in group">
              {/* Product Image Header */}
              <div className="relative bg-gradient-to-br from-gray-700 to-gray-900 h-72 overflow-hidden">
                <img
                  src="/images/bulk-truck.png"
                  alt="Semen Padang Curah Bulk Truck"
                  className="w-full h-full object-cover object-center mix-blend-luminosity opacity-50 group-hover:opacity-35 transition-opacity duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-sm font-semibold px-3 py-1 rounded-full mb-3 border border-white/20">
                        Curah / Bulk
                      </span>
                      <h3 className="text-3xl font-bold text-white">Semen Padang PCC</h3>
                      <p className="text-gray-300 text-lg font-medium mt-1">Curah (Bulk)</p>
                    </div>
                    <img
                      src="/images/bulk-truck.png"
                      alt="Bulk Truck"
                      className="w-28 h-20 object-contain drop-shadow-2xl rounded-lg"
                    />
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-8">
                {/* Product Specs */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                    <span className="text-gray-500 text-sm font-medium uppercase tracking-wide">Kemasan</span>
                    <span className="text-ywm-dark font-semibold">Curah / Bulk</span>
                  </div>
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                    <span className="text-gray-500 text-sm font-medium uppercase tracking-wide">Tipe</span>
                    <span className="text-ywm-dark font-semibold">Portland Composite Cement</span>
                  </div>
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                    <span className="text-gray-500 text-sm font-medium uppercase tracking-wide">Standar</span>
                    <span className="text-ywm-dark font-semibold">SNI 15-2049</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 text-sm font-medium uppercase tracking-wide">Pengiriman</span>
                    <span className="text-ywm-dark font-semibold">Truk Tangki</span>
                  </div>
                </div>

                {/* Quantity Input */}
                <div className="mb-6">
                  <h4 className="font-semibold text-ywm-dark mb-4">Pilih Jumlah Pesanan:</h4>
                  
                  <div className="glass-card-gray p-5">
                    <label htmlFor="bulk-quantity" className="block text-ywm-dark font-semibold mb-3">
                      Jumlah (Ton)
                    </label>
                    <div className="relative">
                      <input
                        id="bulk-quantity"
                        type="number"
                        min="0.1"
                        max="30"
                        step="0.1"
                        value={bulkQuantity}
                        onChange={(e) => handleBulkQuantityChange(e.target.value)}
                        placeholder="Masukkan jumlah ton..."
                        className={`w-full px-4 py-3.5 border-2 rounded-xl text-ywm-dark font-medium text-lg focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all bg-white/80 backdrop-blur-sm ${
                          bulkError ? 'border-red-400 bg-red-50/80' : 'border-gray-200 focus:border-gray-400'
                        }`}
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
                        Ton
                      </span>
                    </div>
                    {bulkError && (
                      <p className="text-red-500 text-sm mt-2 font-medium flex items-center gap-1">
                        <span>⚠️</span> {bulkError}
                      </p>
                    )}
                    <p className="text-gray-500 text-sm mt-3">
                      Maks. 30 ton per pengiriman
                    </p>
                  </div>

                  {/* Delivery Info */}
                  <div className="mt-4 bg-blue-50/80 backdrop-blur-sm rounded-xl p-4 border border-blue-200">
                    <div className="flex items-start gap-3">
                      <Truck className="text-blue-600 mt-0.5 shrink-0" size={20} />
                      <p className="text-blue-800 text-sm font-medium">
                        Pengiriman curah menggunakan truk tangki langsung dari silo ke lokasi proyek Anda
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-xl p-4 mb-6 border border-amber-200">
                  <p className="text-amber-800 font-semibold text-center">
                    💬 Hubungi kami untuk harga terbaru
                  </p>
                </div>

                {/* Order Button */}
                <div className="space-y-3">
                  <button
                    onClick={handleBulkOrder}
                    className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5A] text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg"
                  >
                    <MessageCircle size={20} />
                    {bulkQuantity && !bulkError && parseFloat(bulkQuantity) > 0 && parseFloat(bulkQuantity) <= 30
                      ? `Pesan ${bulkQuantity} Ton via WhatsApp`
                      : 'Pesan via WhatsApp'
                    }
                  </button>
                  <a
                    href="https://wa.me/6285322624038?text=Halo%2C%20saya%20ingin%20konsultasi%20tentang%20produk%20Semen%20Padang%20Curah"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    <Phone size={18} />
                    Konsultasi Produk
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges Section */}
      <section className="py-20 bg-gradient-to-b from-gray-100 to-gray-50 relative">
        <div className="absolute inset-0 bg-[url('/images/hero-factory.png')] bg-cover bg-center opacity-5"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-ywm-dark mb-4">
              Mengapa Memilih <span className="text-ywm-red">Kami?</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Kepercayaan pelanggan adalah prioritas utama kami dalam setiap transaksi
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {trustBadges.map((badge, index) => (
              <div
                key={index}
                className="glass-card text-center p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in"
              >
                <div className="w-16 h-16 bg-ywm-red rounded-2xl flex items-center justify-center mx-auto mb-5">
                  {badge.icon}
                </div>
                <h3 className="text-xl font-bold text-ywm-dark mb-3">{badge.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-ywm-dark mb-4">
              Pertanyaan <span className="text-ywm-red">Umum</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Jawaban untuk pertanyaan yang sering diajukan tentang pemesanan semen
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="glass-card overflow-hidden hover:shadow-md transition-shadow"
              >
                <button
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-semibold text-ywm-dark pr-4">{faq.question}</span>
                  {openFaq === index ? (
                    <ChevronUp className="text-ywm-red shrink-0" size={20} />
                  ) : (
                    <ChevronDown className="text-gray-400 shrink-0" size={20} />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-6 animate-fade-in">
                    <div className="border-t border-gray-100 pt-4">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-ywm-red to-red-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/bulk-truck.png')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold mb-6">
            Siap Memesan Semen Padang?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-red-50">
            Hubungi tim marketing kami sekarang untuk mendapatkan harga terbaik dan layanan pengiriman yang cepat.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/6285322624048?text=Halo%2C%20saya%20ingin%20bertanya%20tentang%20produk%20Semen%20Padang"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5A] text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <MessageCircle size={24} />
              Pesan via WhatsApp
            </a>
            <a
              href="https://wa.me/6285322624038?text=Halo%2C%20saya%20ingin%20konsultasi%20tentang%20kebutuhan%20semen"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 border border-white/20"
            >
              <Phone size={24} />
              Konsultasi Gratis
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Products;
