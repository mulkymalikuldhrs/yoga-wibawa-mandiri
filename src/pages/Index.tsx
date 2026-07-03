import Layout from '@/components/Layout';
import { Link } from 'react-router-dom';
import { ArrowRight, Factory, Truck, Award, Bot, Zap } from 'lucide-react';

const Index = () => {
  // Smooth scroll to section by ID
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section id="beranda" className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-ywm-red via-red-700 to-red-900">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="absolute inset-0">
          <img 
            src="/images/hero-factory.png" 
            alt="Pabrik Pengantongan Semen PT. Yoga Wibawa Mandiri"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-ywm-red/80 via-red-800/70 to-gray-900/85"></div>
        
        {/* Glassmorphic overlay orbs on hero */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-red-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-amber-300/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 text-center text-white px-4 animate-fade-in">
          {/* Glassmorphic hero card */}
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 md:p-12 max-w-4xl mx-auto shadow-2xl">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              PT. Yoga Wibawa <span className="text-yellow-400">Mandiri</span>
            </h1>
            <p className="text-xl md:text-2xl mb-4 max-w-3xl mx-auto leading-relaxed">
              Pengantongan Semen Padang Terpercaya di Lhokseumawe
              <br />dengan Teknologi Modern dan Kualitas Terjamin
            </p>
            
            {/* AI Badge */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600/80 to-purple-600/80 backdrop-blur-md px-4 py-2 rounded-full mb-8 border border-white/20">
              <Bot size={20} />
              <span className="text-sm font-medium">AI-Powered Website</span>
              <Zap size={16} className="text-yellow-300" />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => scrollToSection('layanan')}
                className="bg-ywm-red/90 backdrop-blur-md hover:bg-red-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 flex items-center justify-center border border-red-400/30"
              >
                Lihat Layanan Kami
                <ArrowRight className="ml-2" size={20} />
              </button>
              <Link 
                to="/dashboard" 
                className="bg-gradient-to-r from-blue-600/80 to-purple-600/80 backdrop-blur-md hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 flex items-center justify-center border border-white/20"
              >
                <Bot className="mr-2" size={20} />
                AI Dashboard
              </Link>
              <button 
                onClick={() => scrollToSection('kontak')}
                className="border-2 border-white/50 backdrop-blur-md text-white hover:bg-white/20 px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105"
              >
                Hubungi Kami
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="glass-frosted rounded-2xl p-6 animate-fade-in">
              <div className="w-16 h-16 bg-ywm-red rounded-full flex items-center justify-center mx-auto mb-4">
                <Factory className="text-white" size={32} />
              </div>
              <h3 className="text-3xl font-bold text-ywm-dark mb-2">2</h3>
              <p className="text-gray-600 font-medium">Silo Penyimpanan</p>
              <p className="text-gray-400 text-sm">Kapasitas 500 ton/silo</p>
            </div>
            <div className="glass-frosted rounded-2xl p-6 animate-fade-in">
              <div className="w-16 h-16 bg-ywm-red rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="text-white" size={32} />
              </div>
              <h3 className="text-3xl font-bold text-ywm-dark mb-2">1000+</h3>
              <p className="text-gray-600 font-medium">Ton Kapasitas</p>
              <p className="text-gray-400 text-sm">Total penyimpanan silo</p>
            </div>
            <div className="glass-frosted rounded-2xl p-6 animate-fade-in">
              <div className="w-16 h-16 bg-ywm-red rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-white" size={32} />
              </div>
              <h3 className="text-3xl font-bold text-ywm-dark mb-2">ISO 9001:2015</h3>
              <p className="text-gray-600">Sertifikat Kualitas</p>
            </div>
            <div className="glass-frosted rounded-2xl p-6 animate-fade-in">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="text-white" size={32} />
              </div>
              <h3 className="text-3xl font-bold text-ywm-dark mb-2">AI</h3>
              <p className="text-gray-600">Customer Service</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section id="tentang" className="py-20">
        <div className="container mx-auto px-4">
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
              
              {/* Developer Credit — glassmorphic */}
              <div className="glass-frosted p-5 rounded-xl mb-6 border-l-4 border-blue-500">
                <p className="text-sm text-gray-600 mb-1">Website AI-Powered ini dikembangkan oleh:</p>
                <p className="font-semibold text-ywm-dark">Mulky Malikul Dhaher</p>
                <p className="text-sm text-blue-600">Technical Engineer - PT. Yoga Wibawa Mandiri</p>
              </div>
              
              <Link 
                to="/tentang" 
                className="inline-flex items-center bg-ywm-red text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Selengkapnya
                <ArrowRight className="ml-2" size={20} />
              </Link>
            </div>
            <div className="animate-slide-in-right">
              <img 
                src="https://images.unsplash.com/photo-1466442929976-97f336a657be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Fasilitas Modern"
                className="rounded-xl shadow-2xl"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section id="layanan" className="py-20">
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
            <div className="glass-frosted text-center p-8 rounded-2xl hover:shadow-xl transition-shadow animate-fade-in">
              <div className="w-20 h-20 bg-ywm-red rounded-full flex items-center justify-center mx-auto mb-6">
                <Factory className="text-white" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-ywm-dark mb-4">Pengantongan Semen</h3>
              <p className="text-gray-600 leading-relaxed">
                Proses pengantongan otomatis dengan 2 mesin pengantong dan kontrol kualitas ketat 
                untuk menghasilkan kemasan Zak 40kg berkualitas tinggi.
              </p>
            </div>
            
            <div className="glass-frosted text-center p-8 rounded-2xl hover:shadow-xl transition-shadow animate-fade-in">
              <div className="w-20 h-20 bg-ywm-red rounded-full flex items-center justify-center mx-auto mb-6">
                <Truck className="text-white" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-ywm-dark mb-4">Distribusi Luas</h3>
              <p className="text-gray-600 leading-relaxed">
                Jaringan distribusi yang mencakup seluruh Aceh dan Sumatera Utara 
                dengan armada transport yang handal dan pengiriman tepat waktu.
              </p>
            </div>
            
            <div className="glass-frosted text-center p-8 rounded-2xl hover:shadow-xl transition-shadow animate-fade-in">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
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
      <section id="kontak" className="py-20 bg-ywm-red text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-12 max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">
              Siap Bermitra dengan Kami?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Hubungi tim kami untuk konsultasi dan penawaran terbaik 
              sesuai kebutuhan proyek konstruksi Anda.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/kontak" 
                className="bg-white/90 backdrop-blur-md text-ywm-red px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white transition-colors transform hover:scale-105"
              >
                Hubungi Sekarang
              </Link>
              <Link 
                to="/lokasi" 
                className="border-2 border-white/60 backdrop-blur-md text-white hover:bg-white/20 px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105"
              >
                Lihat Lokasi
              </Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
