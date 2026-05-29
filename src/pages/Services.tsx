
import Layout from '@/components/Layout';
import { Factory, Truck, Settings, Shield, Clock, MapPin } from 'lucide-react';

const Services = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-ywm-red to-red-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 animate-fade-in">Layanan Kami</h1>
          <p className="text-xl max-w-3xl mx-auto animate-fade-in">
            Solusi Lengkap Pengantongan dan Distribusi Semen Berkualitas Tinggi
          </p>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Pengantongan Semen */}
            <div className="text-center animate-fade-in">
              <div className="w-24 h-24 bg-ywm-red rounded-full flex items-center justify-center mx-auto mb-6">
                <Factory className="text-white" size={48} />
              </div>
              <h3 className="text-2xl font-bold text-ywm-dark mb-4">Pengantongan Semen</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                Proses pengantongan otomatis dengan teknologi modern untuk menghasilkan 
                kemasan semen berkualitas tinggi sesuai standar Semen Padang.
              </p>
              <ul className="text-left text-gray-600 space-y-2">
                <li>• Kapasitas produksi hingga 500 ton per hari</li>
                <li>• Sistem penimbangan otomatis</li>
                <li>• Kontrol kualitas ketat</li>
                <li>• Kemasan 40kg dan 50kg</li>
              </ul>
            </div>

            {/* Distribusi */}
            <div className="text-center animate-fade-in">
              <div className="w-24 h-24 bg-ywm-red rounded-full flex items-center justify-center mx-auto mb-6">
                <Truck className="text-white" size={48} />
              </div>
              <h3 className="text-2xl font-bold text-ywm-dark mb-4">Distribusi Luas</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                Jaringan distribusi yang mencakup seluruh Aceh dan Sumatera Utara 
                dengan armada transport yang handal dan sistem logistik yang efisien.
              </p>
              <ul className="text-left text-gray-600 space-y-2">
                <li>• Cakupan seluruh Aceh & Sumut</li>
                <li>• Armada truck yang terawat</li>
                <li>• Sistem tracking pengiriman</li>
                <li>• Pengiriman tepat waktu</li>
              </ul>
            </div>

            {/* Layanan Teknis */}
            <div className="text-center animate-fade-in">
              <div className="w-24 h-24 bg-ywm-red rounded-full flex items-center justify-center mx-auto mb-6">
                <Settings className="text-white" size={48} />
              </div>
              <h3 className="text-2xl font-bold text-ywm-dark mb-4">Layanan Teknis</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                Dukungan teknis dan konsultasi untuk penggunaan semen yang optimal 
                dalam berbagai jenis proyek konstruksi.
              </p>
              <ul className="text-left text-gray-600 space-y-2">
                <li>• Konsultasi teknis aplikasi</li>
                <li>• Quality assurance</li>
                <li>• Training penggunaan</li>
                <li>• Support after sales</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Facilities & Capacity */}
      <section className="py-20 bg-gray-50">
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
              <h3 className="text-2xl font-bold text-ywm-dark mb-6">Spesifikasi Mesin & Kapasitas</h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-ywm-red rounded-lg flex items-center justify-center">
                    <Factory className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-ywm-dark">Mesin Pengantongan Otomatis</h4>
                    <p className="text-gray-600">Kapasitas 500 ton per hari dengan sistem penimbangan digital presisi tinggi</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-ywm-red rounded-lg flex items-center justify-center">
                    <Shield className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-ywm-dark">Sistem Kontrol Kualitas</h4>
                    <p className="text-gray-600">Laboratorium in-house dengan pengujian setiap batch produksi</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-ywm-red rounded-lg flex items-center justify-center">
                    <MapPin className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-ywm-dark">Lokasi Strategis</h4>
                    <p className="text-gray-600">Berlokasi di Pelabuhan Krueng Geukueh untuk akses distribusi optimal</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-ywm-red rounded-lg flex items-center justify-center">
                    <Clock className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-ywm-dark">Operasional 24/7</h4>
                    <p className="text-gray-600">Produksi berkelanjutan untuk memenuhi permintaan pasar yang tinggi</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="animate-slide-in-right">
              <img 
                src="https://images.unsplash.com/photo-1433086966358-54859d0ed716?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Fasilitas Modern"
                className="rounded-lg shadow-2xl"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quality Standards */}
      <section className="py-20 bg-white">
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
            <div className="text-center p-6 rounded-lg shadow-lg animate-fade-in">
              <div className="w-16 h-16 bg-ywm-red rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-white" size={32} />
              </div>
              <h3 className="font-semibold text-ywm-dark mb-2">ISO 9001:2015</h3>
              <p className="text-gray-600 text-sm">Sistem Manajemen Kualitas</p>
            </div>

            <div className="text-center p-6 rounded-lg shadow-lg animate-fade-in">
              <div className="w-16 h-16 bg-ywm-red rounded-full flex items-center justify-center mx-auto mb-4">
                <Factory className="text-white" size={32} />
              </div>
              <h3 className="font-semibold text-ywm-dark mb-2">SNI 15-2049</h3>
              <p className="text-gray-600 text-sm">Standar Nasional Indonesia Semen</p>
            </div>

            <div className="text-center p-6 rounded-lg shadow-lg animate-fade-in">
              <div className="w-16 h-16 bg-ywm-red rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="text-white" size={32} />
              </div>
              <h3 className="font-semibold text-ywm-dark mb-2">Quality Control</h3>
              <p className="text-gray-600 text-sm">Pengujian Setiap Batch</p>
            </div>

            <div className="text-center p-6 rounded-lg shadow-lg animate-fade-in">
              <div className="w-16 h-16 bg-ywm-red rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-white" size={32} />
              </div>
              <h3 className="font-semibold text-ywm-dark mb-2">Real-time</h3>
              <p className="text-gray-600 text-sm">Monitoring Kontinyu</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-ywm-red text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Butuh Konsultasi Layanan?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Tim ahli kami siap membantu Anda memilih solusi terbaik untuk kebutuhan proyek Anda.
          </p>
          <a 
            href="/kontak" 
            className="inline-block bg-white text-ywm-red px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors transform hover:scale-105"
          >
            Hubungi Tim Kami
          </a>
        </div>
      </section>
    </Layout>
  );
};

export default Services;
