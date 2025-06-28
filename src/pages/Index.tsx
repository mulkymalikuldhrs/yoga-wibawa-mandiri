import Layout from '@/components/Layout';
import { Link } from 'react-router-dom';
import { ArrowRight, Factory, Truck, Award, Users, Bot, Zap } from 'lucide-react';

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-ywm-red via-red-700 to-red-900">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1487958449943-2429e8be8625?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80" 
            alt="Pabrik Semen Modern"
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="relative z-10 text-center text-white px-4 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            PT. Yoga Wibawa <span className="text-yellow-400">Mandiri</span>
          </h1>
          <p className="text-xl md:text-2xl mb-4 max-w-3xl mx-auto leading-relaxed">
            Pengantongan Semen Padang Terpercaya di Lhokseumawe
            <br />dengan Teknologi Modern dan Kualitas Terjamin
          </p>
          
          {/* AI Badge */}
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 rounded-full mb-8">
            <Bot size={20} />
            <span className="text-sm font-medium">AI-Powered Website | JS Puter AI</span>
            <Zap size={16} className="text-yellow-300" />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/layanan" 
              className="bg-ywm-red hover:bg-red-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 flex items-center justify-center"
            >
              Lihat Layanan Kami
              <ArrowRight className="ml-2" size={20} />
            </Link>
            <Link 
              to="/dashboard" 
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 flex items-center justify-center"
            >
              <Bot className="mr-2" size={20} />
              AI Dashboard
            </Link>
            <Link 
              to="/kontak" 
              className="border-2 border-white text-white hover:bg-white hover:text-ywm-red px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105"
            >
              Hubungi Kami
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="animate-fade-in">
              <div className="w-16 h-16 bg-ywm-red rounded-full flex items-center justify-center mx-auto mb-4">
                <Factory className="text-white" size={32} />
              </div>
              <h3 className="text-3xl font-bold text-ywm-dark mb-2">15+</h3>
              <p className="text-gray-600">Tahun Pengalaman</p>
            </div>
            <div className="animate-fade-in">
              <div className="w-16 h-16 bg-ywm-red rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="text-white" size={32} />
              </div>
              <h3 className="text-3xl font-bold text-ywm-dark mb-2">500K+</h3>
              <p className="text-gray-600">Ton Semen per Tahun</p>
            </div>
            <div className="animate-fade-in">
              <div className="w-16 h-16 bg-ywm-red rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-white" size={32} />
              </div>
              <h3 className="text-3xl font-bold text-ywm-dark mb-2">ISO</h3>
              <p className="text-gray-600">Sertifikat Kualitas</p>
            </div>
            <div className="animate-fade-in">
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
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="text-4xl font-bold text-ywm-dark mb-6">
                Tentang <span className="text-ywm-red">PT. Yoga Wibawa Mandiri</span>
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                Didirikan sebagai mitra strategis Semen Padang di wilayah Aceh dan Sumatera Utara, 
                PT. Yoga Wibawa Mandiri telah menjadi perusahaan pengantongan semen terpercaya 
                dengan fasilitas modern di Pelabuhan Krueng Geukueh, Lhokseumawe.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed mb-8">
                Dengan komitmen terhadap kualitas dan pelayanan prima, kami melayani kebutuhan 
                konstruksi di seluruh wilayah dengan distribusi yang efisien dan tepat waktu.
              </p>
              
              {/* Developer Credit */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg mb-6 border-l-4 border-blue-500">
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
                className="rounded-lg shadow-2xl"
              />
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
              dengan teknologi modern dan standar internasional.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow animate-fade-in">
              <div className="w-20 h-20 bg-ywm-red rounded-full flex items-center justify-center mx-auto mb-6">
                <Factory className="text-white" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-ywm-dark mb-4">Pengantongan Semen</h3>
              <p className="text-gray-600 leading-relaxed">
                Proses pengantongan otomatis dengan kapasitas besar dan kontrol kualitas ketat 
                untuk memastikan produk berkualitas tinggi.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow animate-fade-in">
              <div className="w-20 h-20 bg-ywm-red rounded-full flex items-center justify-center mx-auto mb-6">
                <Truck className="text-white" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-ywm-dark mb-4">Distribusi Luas</h3>
              <p className="text-gray-600 leading-relaxed">
                Jaringan distribusi yang mencakup seluruh Aceh dan Sumatera Utara 
                dengan armada transport yang handal dan tepat waktu.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-lg shadow-lg hover:shadow-xl transition-shadow animate-fade-in">
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
              className="inline-flex items-center bg-ywm-red text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-red-700 transition-colors"
            >
              Lihat Semua Layanan
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-ywm-red text-white">
        <div className="container mx-auto px-4 text-center">
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
              className="bg-white text-ywm-red px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors transform hover:scale-105"
            >
              Hubungi Sekarang
            </Link>
            <Link 
              to="/lokasi" 
              className="border-2 border-white text-white hover:bg-white hover:text-ywm-red px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105"
            >
              Lihat Lokasi
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;