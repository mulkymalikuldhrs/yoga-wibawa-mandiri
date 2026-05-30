
import Layout from '@/components/Layout';
import { Factory, Truck, Settings, Shield, Clock, MapPin, MessageCircle, Phone } from 'lucide-react';

const Services = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-ywm-red to-red-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/hero-factory.png')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl font-bold mb-6 animate-fade-in">Layanan Kami</h1>
          <p className="text-xl max-w-3xl mx-auto animate-fade-in text-red-50">
            Solusi Lengkap Pengantongan dan Distribusi Semen Padang PCC Berkualitas Tinggi
          </p>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative">
        <div className="absolute inset-0 bg-[url('/images/hero-factory.png')] bg-cover bg-center opacity-[0.03]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Pengantongan Semen */}
            <div className="glass-card text-center p-10 animate-fade-in hover:shadow-xl transition-all duration-300">
              <div className="w-24 h-24 bg-ywm-red rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Factory className="text-white" size={48} />
              </div>
              <h3 className="text-2xl font-bold text-ywm-dark mb-4">Pengantongan Semen</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                Proses pengantongan otomatis dengan teknologi modern untuk menghasilkan 
                kemasan Semen Padang PCC berkualitas tinggi sesuai standar SNI.
              </p>
              <ul className="text-left text-gray-600 space-y-2">
                <li>• 2 mesin pengantong berkapasitas tinggi</li>
                <li>• Sistem penimbangan otomatis presisi</li>
                <li>• Kontrol kualitas ketat per batch</li>
                <li>• Kemasan Zak 40kg & Curah</li>
              </ul>
            </div>

            {/* Distribusi */}
            <div className="glass-card text-center p-10 animate-fade-in hover:shadow-xl transition-all duration-300">
              <div className="w-24 h-24 bg-ywm-red rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Truck className="text-white" size={48} />
              </div>
              <h3 className="text-2xl font-bold text-ywm-dark mb-4">Distribusi Luas</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                Jaringan distribusi yang mencakup seluruh Aceh dan Sumatera Utara 
                dengan armada transport yang handal dan sistem logistik yang efisien.
              </p>
              <ul className="text-left text-gray-600 space-y-2">
                <li>• Cakupan seluruh Aceh & Sumut</li>
                <li>• Armada truk yang terawat</li>
                <li>• Pengiriman Zak 40kg & Curah</li>
                <li>• Pengiriman tepat waktu</li>
              </ul>
            </div>

            {/* Layanan Teknis */}
            <div className="glass-card text-center p-10 animate-fade-in hover:shadow-xl transition-all duration-300">
              <div className="w-24 h-24 bg-ywm-red rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Settings className="text-white" size={48} />
              </div>
              <h3 className="text-2xl font-bold text-ywm-dark mb-4">Layanan Teknis</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                Dukungan teknis dan konsultasi untuk penggunaan Semen Padang PCC yang optimal 
                dalam berbagai jenis proyek konstruksi.
              </p>
              <ul className="text-left text-gray-600 space-y-2">
                <li>• Konsultasi teknis aplikasi</li>
                <li>• Quality assurance & SNI compliance</li>
                <li>• Rekomendasi produk sesuai kebutuhan</li>
                <li>• Support after sales</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities & Capacity */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-ywm-dark mb-4">
              Fasilitas & <span className="text-ywm-red">Kapasitas</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Infrastruktur modern dan kapasitas produksi yang memadai untuk memenuhi kebutuhan pasar
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h3 className="text-2xl font-bold text-ywm-dark mb-6">Spesifikasi Fasilitas & Kapasitas</h3>
              
              <div className="space-y-6">
                <div className="glass-card p-5 flex items-start space-x-4 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-ywm-red rounded-xl flex items-center justify-center shrink-0">
                    <Factory className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-ywm-dark">2 Unit Silo Penyimpanan</h4>
                    <p className="text-gray-600">Kapasitas 500 ton per silo, total penyimpanan 1.000 ton semen curah</p>
                  </div>
                </div>

                <div className="glass-card p-5 flex items-start space-x-4 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-ywm-red rounded-xl flex items-center justify-center shrink-0">
                    <Settings className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-ywm-dark">2 Unit Mesin Pengantongan</h4>
                    <p className="text-gray-600">Sistem pengantongan otomatis dengan penimbangan digital presisi untuk kemasan Zak 40kg</p>
                  </div>
                </div>

                <div className="glass-card p-5 flex items-start space-x-4 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-ywm-red rounded-xl flex items-center justify-center shrink-0">
                    <Shield className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-ywm-dark">Sistem Kontrol Kualitas</h4>
                    <p className="text-gray-600">Laboratorium in-house dengan pengujian setiap batch produksi sesuai SNI 15-2049</p>
                  </div>
                </div>

                <div className="glass-card p-5 flex items-start space-x-4 hover:shadow-lg transition-shadow">
                  <div className="w-12 h-12 bg-ywm-red rounded-xl flex items-center justify-center shrink-0">
                    <MapPin className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-ywm-dark">Lokasi Strategis</h4>
                    <p className="text-gray-600">Jl. Pelabuhan Umum, Kr. Geukuh, Aceh Utara — akses langsung ke pelabuhan untuk distribusi optimal</p>
                  </div>
                </div>
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
                  <p className="font-bold text-lg">Kapasitas Tinggi</p>
                  <p className="text-red-100 text-sm">2 Silo × 500 Ton | 2 Mesin Pengantong | Zak 40kg</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quality Standards */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-ywm-dark mb-4">
              Standar <span className="text-ywm-red">Kualitas</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Komitmen kami terhadap kualitas tercermin dalam setiap tahap produksi
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="glass-card text-center p-6 animate-fade-in hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-ywm-red rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="text-white" size={32} />
              </div>
              <h3 className="font-semibold text-ywm-dark mb-2">ISO 9001:2015</h3>
              <p className="text-gray-600 text-sm">Sistem Manajemen Kualitas</p>
            </div>

            <div className="glass-card text-center p-6 animate-fade-in hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-ywm-red rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Factory className="text-white" size={32} />
              </div>
              <h3 className="font-semibold text-ywm-dark mb-2">SNI 15-2049</h3>
              <p className="text-gray-600 text-sm">Standar Nasional Indonesia Semen</p>
            </div>

            <div className="glass-card text-center p-6 animate-fade-in hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-ywm-red rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Settings className="text-white" size={32} />
              </div>
              <h3 className="font-semibold text-ywm-dark mb-2">Quality Control</h3>
              <p className="text-gray-600 text-sm">Pengujian Setiap Batch</p>
            </div>

            <div className="glass-card text-center p-6 animate-fade-in hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-ywm-red rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="text-white" size={32} />
              </div>
              <h3 className="font-semibold text-ywm-dark mb-2">Real-time</h3>
              <p className="text-gray-600 text-sm">Monitoring Kontinyu</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-ywm-red to-red-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/hero-factory.png')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold mb-6">
            Butuh Konsultasi Layanan?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-red-50">
            Tim ahli kami siap membantu Anda memilih solusi terbaik untuk kebutuhan proyek Anda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://wa.me/6285322624048?text=Halo%2C%20saya%20ingin%20bertanya%20tentang%20layanan%20YWM"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5A] text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-xl"
            >
              <MessageCircle size={24} />
              Pesan WhatsApp
            </a>
            <a 
              href="https://wa.me/6285322624038?text=Halo%2C%20saya%20ingin%20konsultasi%20tentang%20layanan%20pengantongan"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 border border-white/20"
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

export default Services;
