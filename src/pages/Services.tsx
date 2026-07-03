import Layout from '@/components/Layout';
import { Factory, Truck, Settings, Shield, Clock, MapPin, Package, Weight, Wrench, Warehouse, Syringe, Gauge } from 'lucide-react';

const WHATSAPP_NUMBER = '6285322624048';
const WHATSAPP_BASE_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

const Services = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-ywm-red to-red-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/hero-factory.png')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl font-bold mb-6 animate-fade-in">Layanan Kami</h1>
          <p className="text-xl max-w-3xl mx-auto animate-fade-in">
            Layanan Pengantongan Semen Padang Profesional — Kualitas Terjamin, Tepat Waktu
          </p>
        </div>
      </section>

      {/* Bagging Services */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-ywm-dark mb-4">
              Layanan <span className="text-ywm-red">Pengantongan</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Kami menyediakan layanan pengantongan dan distribusi semen berkualitas tinggi 
              dengan teknologi modern dan standar internasional
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in bg-white border border-gray-100">
              <div className="w-20 h-20 bg-ywm-red rounded-full flex items-center justify-center mx-auto mb-6">
                <Factory className="text-white" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-ywm-dark mb-4">Pengantongan Semen PCC</h3>
              <p className="text-gray-600 leading-relaxed">
                Proses pengantongan Semen Padang PCC (Portland Composite Cement) otomatis 
                dengan kapasitas besar dan kontrol kualitas ketat. Kemasan zak 40kg dengan 
                standar SNI 15-2049.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in bg-white border border-gray-100">
              <div className="w-20 h-20 bg-ywm-red rounded-full flex items-center justify-center mx-auto mb-6">
                <Truck className="text-white" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-ywm-dark mb-4">Distribusi & Logistik</h3>
              <p className="text-gray-600 leading-relaxed">
                Jaringan distribusi mencakup seluruh Aceh dan Sumatera Utara dengan armada 
                transport modern yang handal, pengiriman tepat waktu, dan tracking real-time.
              </p>
            </div>
            
            <div className="text-center p-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in bg-white border border-gray-100">
              <div className="w-20 h-20 bg-ywm-red rounded-full flex items-center justify-center mx-auto mb-6">
                <Warehouse className="text-white" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-ywm-dark mb-4">Penyimpanan Bulk/Curah</h3>
              <p className="text-gray-600 leading-relaxed">
                Fasilitas silo penyimpanan semen curah berkapasitas besar dengan sistem 
                kontrol suhu dan kelembaban untuk menjaga kualitas produk.
              </p>
            </div>

            <div className="text-center p-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in bg-white border border-gray-100">
              <div className="w-20 h-20 bg-ywm-red rounded-full flex items-center justify-center mx-auto mb-6">
                <Syringe className="text-white" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-ywm-dark mb-4">Pelumasan & Perawatan</h3>
              <p className="text-gray-600 leading-relaxed">
                Program pelumasan dan perawatan berkala untuk seluruh mesin produksi, 
                termasuk bearing, pompa, gearbox, dan komponen mekanis lainnya dengan 
                jadwal terstruktur.
              </p>
            </div>

            <div className="text-center p-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in bg-white border border-gray-100">
              <div className="w-20 h-20 bg-ywm-red rounded-full flex items-center justify-center mx-auto mb-6">
                <Wrench className="text-white" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-ywm-dark mb-4">Perawatan Mesin Packer</h3>
              <p className="text-gray-600 leading-relaxed">
                Perawatan khusus untuk mesin packer rotary dan stationary, termasuk 
                kalibrasi timbangan, penggantian komponen aus, dan optimalisasi kecepatan 
                produksi.
              </p>
            </div>

            <div className="text-center p-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 animate-fade-in bg-white border border-gray-100">
              <div className="w-20 h-20 bg-ywm-red rounded-full flex items-center justify-center mx-auto mb-6">
                <Gauge className="text-white" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-ywm-dark mb-4">Kontrol Kualitas</h3>
              <p className="text-gray-600 leading-relaxed">
                Laboratorium in-house dengan pengujian setiap batch produksi. Monitoring 
                kontinyu terhadap kekuatan tekan, kehalusan, waktu ikat, dan konsistensi produk.
              </p>
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

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h3 className="text-2xl font-bold text-ywm-dark mb-6">Spesifikasi Fasilitas & Kapasitas</h3>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-ywm-red rounded-lg flex items-center justify-center flex-shrink-0">
                    <Factory className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-ywm-dark">2 Unit Silo Penyimpanan</h4>
                    <p className="text-gray-600">Kapasitas 500 ton per silo, total penyimpanan 1.000 ton semen curah</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-ywm-red rounded-lg flex items-center justify-center flex-shrink-0">
                    <Shield className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-ywm-dark">Sistem Kontrol Kualitas</h4>
                    <p className="text-gray-600">Laboratorium in-house dengan pengujian setiap batch produksi sesuai SNI 15-2049</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-ywm-red rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-ywm-dark">Lokasi Strategis</h4>
                    <p className="text-gray-600">Berlokasi di Pelabuhan Krueng Geukueh untuk akses distribusi optimal</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-ywm-red rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-ywm-dark">Operasional 24/7</h4>
                    <p className="text-gray-600">Produksi berkelanjutan untuk memenuhi permintaan pasar yang tinggi</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-ywm-red rounded-lg flex items-center justify-center flex-shrink-0">
                    <Weight className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-ywm-dark">Sistem Penimbangan Digital</h4>
                    <p className="text-gray-600">Presisi tinggi dengan kalibrasi rutin tersertifikasi</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-ywm-red rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="text-white" size={24} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-ywm-dark">Kapasitas Silo 10.000 Ton</h4>
                    <p className="text-gray-600">Penyimpanan semen curah yang memadai untuk kontinuitas produksi</p>
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
            <div className="text-center p-6 rounded-lg shadow-lg animate-fade-in border border-gray-100">
              <div className="w-16 h-16 bg-ywm-red rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-white" size={32} />
              </div>
              <h3 className="font-semibold text-ywm-dark mb-2">ISO 9001:2015</h3>
              <p className="text-gray-600 text-sm">Sistem Manajemen Kualitas</p>
            </div>

            <div className="text-center p-6 rounded-lg shadow-lg animate-fade-in border border-gray-100">
              <div className="w-16 h-16 bg-ywm-red rounded-full flex items-center justify-center mx-auto mb-4">
                <Factory className="text-white" size={32} />
              </div>
              <h3 className="font-semibold text-ywm-dark mb-2">SNI 15-2049</h3>
              <p className="text-gray-600 text-sm">Standar Nasional Indonesia Semen</p>
            </div>

            <div className="text-center p-6 rounded-lg shadow-lg animate-fade-in border border-gray-100">
              <div className="w-16 h-16 bg-ywm-red rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="text-white" size={32} />
              </div>
              <h3 className="font-semibold text-ywm-dark mb-2">Quality Control</h3>
              <p className="text-gray-600 text-sm">Pengujian Setiap Batch</p>
            </div>

            <div className="text-center p-6 rounded-lg shadow-lg animate-fade-in border border-gray-100">
              <div className="w-16 h-16 bg-ywm-red rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-white" size={32} />
              </div>
              <h3 className="font-semibold text-ywm-dark mb-2">Real-time</h3>
              <p className="text-gray-600 text-sm">Monitoring Kontinyu</p>
            </div>
          </div>
        </div>
      </section>

      {/* Product Specs Table */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-ywm-dark mb-4">
              Spesifikasi <span className="text-ywm-red">Produk</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Detail teknis produk Semen Padang yang kami distribusikan
            </p>
          </div>

          <div className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full bg-white rounded-2xl shadow-lg overflow-hidden">
              <thead>
                <tr className="bg-ywm-red text-white">
                  <th className="px-6 py-4 text-left font-semibold">Spesifikasi</th>
                  <th className="px-6 py-4 text-left font-semibold">Semen Padang PCC</th>
                  <th className="px-6 py-4 text-left font-semibold">Semen Padang Bulk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-ywm-dark">Jenis</td>
                  <td className="px-6 py-4 text-gray-600">Portland Composite Cement</td>
                  <td className="px-6 py-4 text-gray-600">Portland Composite Cement</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-ywm-dark">Kemasan</td>
                  <td className="px-6 py-4 text-gray-600">Zak 40 kg</td>
                  <td className="px-6 py-4 text-gray-600">Curah / Bulk</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-ywm-dark">Standar Mutu</td>
                  <td className="px-6 py-4 text-gray-600">SNI 15-2049</td>
                  <td className="px-6 py-4 text-gray-600">SNI 15-2049</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-ywm-dark">Kuat Tekan 28 Hari</td>
                  <td className="px-6 py-4 text-gray-600">≥ 32.5 MPa</td>
                  <td className="px-6 py-4 text-gray-600">≥ 32.5 MPa</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-ywm-dark">Berat Jenis</td>
                  <td className="px-6 py-4 text-gray-600">3.15 kg/dm³</td>
                  <td className="px-6 py-4 text-gray-600">3.15 kg/dm³</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-ywm-dark">Kehalusan</td>
                  <td className="px-6 py-4 text-gray-600">≥ 300 m²/kg</td>
                  <td className="px-6 py-4 text-gray-600">≥ 300 m²/kg</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-ywm-dark">Waktu Ikat Awal</td>
                  <td className="px-6 py-4 text-gray-600">≥ 75 menit</td>
                  <td className="px-6 py-4 text-gray-600">≥ 75 menit</td>
                </tr>
                <tr className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-ywm-dark">Pengiriman Min.</td>
                  <td className="px-6 py-4 text-gray-600">250 zak (10 ton)</td>
                  <td className="px-6 py-4 text-gray-600">1 ton</td>
                </tr>
              </tbody>
            </table>
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
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Halo PT. Yoga Wibawa Mandiri, saya ingin konsultasi mengenai layanan pengantongan semen Anda.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-white text-ywm-red px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors transform hover:scale-105"
            >
              Hubungi via WhatsApp
            </a>
            <a 
              href="/produk"
              className="inline-block border-2 border-white text-white hover:bg-white hover:text-ywm-red px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105"
            >
              Lihat Katalog Produk
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Services;
