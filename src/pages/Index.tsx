import Layout from '@/components/Layout';
import { Link } from 'react-router-dom';
import { ArrowRight, Factory, Truck, Award, Bot, Zap, Warehouse, Package, MessageCircle, Phone } from 'lucide-react';

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="/images/hero-factory.png" 
            alt="Pabrik Pengantongan Semen PT. Yoga Wibawa Mandiri"
            className="w-full h-full object-cover"
            loading="eager"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-ywm-red/80 via-red-800/70 to-gray-900/85"></div>
        
        <div className="relative z-10 text-center text-white px-4 animate-fade-in max-w-5xl mx-auto">
          <div className="glass-card-dark inline-flex items-center gap-2 px-5 py-2 mb-8">
            <Award size={18} className="text-yellow-300" />
            <span className="text-sm font-semibold">Mitra Resmi Semen Padang</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            PT. Yoga Wibawa <span className="text-yellow-400">Mandiri</span>
          </h1>
          <p className="text-xl md:text-2xl mb-4 max-w-3xl mx-auto leading-relaxed text-red-50">
            Pengantongan Semen Padang Terpercaya di Aceh Utara
          </p>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-red-100/80">
            Jl. Pelabuhan Umum, Kr. Geukuh, Aceh Utara — Distribusi ke Seluruh Aceh & Sumatera Utara
          </p>
          
          {/* AI Badge */}
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 rounded-full mb-10 shadow-lg">
            <Bot size={20} />
            <span className="text-sm font-medium">AI-Powered Website | JS Puter AI</span>
            <Zap size={16} className="text-yellow-300" />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/produk" 
              className="bg-ywm-red hover:bg-red-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 flex items-center justify-center shadow-xl border border-red-500/50"
            >
              Lihat Produk
              <ArrowRight className="ml-2" size={20} />
            </Link>
            <a 
              href="https://wa.me/6285322624048?text=Halo%2C%20saya%20ingin%20bertanya%20tentang%20produk%20Semen%20Padang"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#1EBE5A] text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 flex items-center justify-center shadow-xl"
            >
              <MessageCircle className="mr-2" size={20} />
              Pesan WhatsApp
            </a>
            <Link 
              to="/kontak" 
              className="bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 border border-white/20"
            >
              Hubungi Kami
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white relative">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="glass-card p-6 animate-fade-in hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-ywm-red rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Warehouse className="text-white" size={32} />
              </div>
              <h3 className="text-3xl font-bold text-ywm-dark mb-2">2</h3>
              <p className="text-gray-600 font-medium">Silo Penyimpanan</p>
              <p className="text-gray-400 text-sm">Kapasitas 500 ton/silo</p>
            </div>
            <div className="glass-card p-6 animate-fade-in hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-ywm-red rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Package className="text-white" size={32} />
              </div>
              <h3 className="text-3xl font-bold text-ywm-dark mb-2">2</h3>
              <p className="text-gray-600 font-medium">Mesin Pengantongan</p>
              <p className="text-gray-400 text-sm">Kemasan Zak 40kg</p>
            </div>
            <div className="glass-card p-6 animate-fade-in hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-ywm-red rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Truck className="text-white" size={32} />
              </div>
              <h3 className="text-3xl font-bold text-ywm-dark mb-2">1000+</h3>
              <p className="text-gray-600 font-medium">Ton Kapasitas</p>
              <p className="text-gray-400 text-sm">Total penyimpanan silo</p>
            </div>
            <div className="glass-card p-6 animate-fade-in hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Bot className="text-white" size={32} />
              </div>
              <h3 className="text-3xl font-bold text-ywm-dark mb-2">AI</h3>
              <p className="text-gray-600 font-medium">Customer Service</p>
              <p className="text-gray-400 text-sm">Layanan 24/7</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative">
        <div className="absolute inset-0 bg-[url('/images/hero-factory.png')] bg-cover bg-center opacity-[0.03]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="text-4xl font-bold text-ywm-dark mb-6">
                Tentang <span className="text-ywm-red">PT. Yoga Wibawa Mandiri</span>
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                Didirikan sebagai mitra strategis Semen Padang di wilayah Aceh dan Sumatera Utara, 
                PT. Yoga Wibawa Mandiri telah menjadi perusahaan pengantongan semen terpercaya 
                dengan fasilitas modern di Jl. Pelabuhan Umum, Kr. Geukuh, Aceh Utara.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                Dilengkapi dengan 2 silo penyimpanan berkapasitas 500 ton masing-masing dan 
                2 mesin pengantongan untuk kemasan Zak 40kg, kami siap memenuhi kebutuhan 
                konstruksi Anda dengan distribusi yang efisien dan tepat waktu.
              </p>
              
              {/* Developer Credit */}
              <div className="glass-card p-5 mb-6 border-l-4 border-blue-500">
                <p className="text-sm text-gray-600 mb-1">Website AI-Powered ini dikembangkan oleh:</p>
                <p className="font-semibold text-ywm-dark">Mulky Malikul Dhaher</p>
                <p className="text-sm text-blue-600">Technical Engineer - PT. Yoga Wibawa Mandiri</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/tentang" 
                  className="inline-flex items-center bg-ywm-red text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors shadow-lg"
                >
                  Selengkapnya
                  <ArrowRight className="ml-2" size={20} />
                </Link>
                <a
                  href="https://wa.me/6285322624038?text=Halo%2C%20saya%20ingin%20konsultasi%20tentang%20produk%20Semen%20Padang"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-gray-800 text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-900 transition-colors"
                >
                  <Phone className="mr-2" size={18} />
                  Konsultasi
                </a>
              </div>
            </div>
            <div className="animate-slide-in-right">
              <div className="relative">
                <img 
                  src="/images/hero-factory.png" 
                  alt="Fasilitas Pengantongan Semen YWM"
                  className="rounded-2xl shadow-2xl"
                  loading="lazy"
                />
                <div className="absolute -bottom-6 -left-6 glass-card-dark text-white p-5 max-w-xs">
                  <p className="font-bold text-lg">Fasilitas Modern</p>
                  <p className="text-red-100 text-sm">2 Silo × 500 Ton | 2 Mesin Pengantongan | Zak 40kg</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-ywm-dark mb-4">
              Layanan <span className="text-ywm-red">Unggulan</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Kami menyediakan layanan pengantongan dan distribusi semen berkualitas tinggi 
              dengan teknologi modern dan standar SNI.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="glass-card text-center p-8 hover:shadow-xl transition-all duration-300 animate-fade-in">
              <div className="w-20 h-20 bg-ywm-red rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Factory className="text-white" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-ywm-dark mb-4">Pengantongan Semen</h3>
              <p className="text-gray-600 leading-relaxed">
                Proses pengantongan otomatis dengan 2 mesin pengantong dan kontrol kualitas ketat 
                untuk menghasilkan kemasan Zak 40kg berkualitas tinggi.
              </p>
            </div>
            
            <div className="glass-card text-center p-8 hover:shadow-xl transition-all duration-300 animate-fade-in">
              <div className="w-20 h-20 bg-ywm-red rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Truck className="text-white" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-ywm-dark mb-4">Distribusi Luas</h3>
              <p className="text-gray-600 leading-relaxed">
                Jaringan distribusi yang mencakup seluruh Aceh dan Sumatera Utara 
                dengan armada transport yang handal dan pengiriman tepat waktu.
              </p>
            </div>
            
            <div className="glass-card text-center p-8 hover:shadow-xl transition-all duration-300 animate-fade-in">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Bot className="text-white" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-ywm-dark mb-4">AI Customer Service</h3>
              <p className="text-gray-600 leading-relaxed">
                Layanan pelanggan 24/7 dengan teknologi AI lokal yang memberikan respons 
                cepat dan akurat untuk semua pertanyaan Anda.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Link 
              to="/layanan" 
              className="inline-flex items-center bg-ywm-red text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-red-700 transition-colors shadow-lg"
            >
              Lihat Semua Layanan
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-ywm-red to-red-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/hero-factory.png')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold mb-6">
            Siap Bermitra dengan Kami?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-red-50">
            Hubungi tim marketing kami untuk konsultasi dan penawaran terbaik 
            sesuai kebutuhan proyek konstruksi Anda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://wa.me/6285322624048?text=Halo%2C%20saya%20ingin%20bertanya%20tentang%20harga%20Semen%20Padang"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] hover:bg-[#1EBE5A] text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-xl inline-flex items-center justify-center gap-2"
            >
              <MessageCircle size={24} />
              Pesan WhatsApp
            </a>
            <a 
              href="https://wa.me/6285322624038?text=Halo%2C%20saya%20ingin%20konsultasi%20tentang%20kebutuhan%20semen"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 border border-white/20 inline-flex items-center justify-center gap-2"
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

export default Index;
