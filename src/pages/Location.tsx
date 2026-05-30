
import Layout from '@/components/Layout';
import { MapPin, Phone, Clock, Navigation, MessageCircle } from 'lucide-react';

const Location = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-ywm-red to-red-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/hero-factory.png')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl font-bold mb-6 animate-fade-in">Lokasi Kami</h1>
          <p className="text-xl max-w-3xl mx-auto animate-fade-in text-red-50">
            Temukan Lokasi Strategis PT. Yoga Wibawa Mandiri di Krueng Geukueh, Aceh Utara
          </p>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-ywm-dark mb-4">
              Pabrik <span className="text-ywm-red">Pengantongan</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Berlokasi strategis di Jl. Pelabuhan Umum, Kr. Geukuh, Aceh Utara untuk kemudahan akses distribusi
            </p>
          </div>

          {/* Google Maps Embed */}
          <div className="glass-card overflow-hidden mb-12 p-2">
            <div className="rounded-xl overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3975.0!2d97.1315!3d5.1775!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3036a80b9c1e5c5d%3A0x0!2sKrueng+Geukueh%2C+Aceh+Utara!5e0!3m2!1sid!2sid!4v1700000000000!5m2!1sid!2sid"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Lokasi PT. Yoga Wibawa Mandiri - Krueng Geukueh, Aceh Utara"
              ></iframe>
            </div>
          </div>

          {/* Location Details */}
          <div className="grid md:grid-cols-2 gap-12">
            <div className="animate-fade-in">
              <h3 className="text-2xl font-bold text-ywm-dark mb-6">Packing Plant (Pabrik)</h3>
              <div className="space-y-4">
                <div className="glass-card p-5 flex items-start space-x-4">
                  <MapPin className="text-ywm-red mt-1 shrink-0" size={24} />
                  <div>
                    <h4 className="font-semibold text-ywm-dark">Alamat Lengkap</h4>
                    <p className="text-gray-600">
                      Jl. Pelabuhan Umum, Kr. Geukuh<br />
                      Kec. Kuta Makmur, Aceh Utara<br />
                      Aceh 24352, Indonesia
                    </p>
                  </div>
                </div>

                <div className="glass-card p-5 flex items-start space-x-4">
                  <Navigation className="text-ywm-red mt-1 shrink-0" size={24} />
                  <div>
                    <h4 className="font-semibold text-ywm-dark">Koordinat</h4>
                    <p className="text-gray-600">
                      5.1775° N, 97.1315° E<br />
                      Krueng Geukueh, Aceh Utara
                    </p>
                  </div>
                </div>

                <div className="glass-card p-5 flex items-start space-x-4">
                  <Clock className="text-ywm-red mt-1 shrink-0" size={24} />
                  <div>
                    <h4 className="font-semibold text-ywm-dark">Jam Operasional</h4>
                    <p className="text-gray-600">
                      Senin - Jumat: 08:00 - 17:00 WIB<br />
                      Sabtu: 08:00 - 12:00 WIB<br />
                      Minggu: Tutup
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="animate-slide-in-right">
              <h3 className="text-2xl font-bold text-ywm-dark mb-6">Kantor Pusat</h3>
              <div className="space-y-4">
                <div className="glass-card p-5 flex items-start space-x-4">
                  <MapPin className="text-ywm-red mt-1 shrink-0" size={24} />
                  <div>
                    <h4 className="font-semibold text-ywm-dark">Alamat Kantor</h4>
                    <p className="text-gray-600">
                      Jl. Paduan Tenaga No. 12<br />
                      Medan, Sumatera Utara 20112<br />
                      Indonesia
                    </p>
                  </div>
                </div>

                <div className="glass-card p-5 flex items-start space-x-4">
                  <Phone className="text-ywm-red mt-1 shrink-0" size={24} />
                  <div>
                    <h4 className="font-semibold text-ywm-dark">Kontak</h4>
                    <p className="text-gray-600">
                      Telepon: (061) 7362740<br />
                      Fax: (061) 7360994<br />
                      Email: yogawibawamandiri@gmail.com
                    </p>
                  </div>
                </div>

                <div className="glass-card p-5 flex items-start space-x-4">
                  <MessageCircle className="text-green-600 mt-1 shrink-0" size={24} />
                  <div>
                    <h4 className="font-semibold text-ywm-dark">WhatsApp</h4>
                    <p className="text-gray-600">
                      Pemesanan: +62 853-2262-4048<br />
                      Informasi: +62 853-2262-4038
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coverage Area */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-ywm-dark mb-4">
              Area <span className="text-ywm-red">Distribusi</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Jangkauan distribusi kami meliputi seluruh wilayah Aceh dan Sumatera Utara
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="animate-fade-in">
              <h3 className="text-2xl font-bold text-ywm-dark mb-6">Provinsi Aceh</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card-gray p-4">
                  <h4 className="font-semibold text-ywm-red mb-2">Aceh Utara</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Lhokseumawe</li>
                    <li>• Bireuen</li>
                    <li>• Langsa</li>
                  </ul>
                </div>
                <div className="glass-card-gray p-4">
                  <h4 className="font-semibold text-ywm-red mb-2">Aceh Tengah</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Takengon</li>
                    <li>• Banda Aceh</li>
                    <li>• Sabang</li>
                  </ul>
                </div>
                <div className="glass-card-gray p-4">
                  <h4 className="font-semibold text-ywm-red mb-2">Aceh Selatan</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Tapaktuan</li>
                    <li>• Blangkejeren</li>
                    <li>• Kutacane</li>
                  </ul>
                </div>
                <div className="glass-card-gray p-4">
                  <h4 className="font-semibold text-ywm-red mb-2">Aceh Barat</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Meulaboh</li>
                    <li>• Calang</li>
                    <li>• Singkil</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="animate-fade-in">
              <h3 className="text-2xl font-bold text-ywm-dark mb-6">Sumatera Utara</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="glass-card-gray p-4">
                  <h4 className="font-semibold text-ywm-red mb-2">Medan Raya</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Medan</li>
                    <li>• Binjai</li>
                    <li>• Deli Serdang</li>
                  </ul>
                </div>
                <div className="glass-card-gray p-4">
                  <h4 className="font-semibold text-ywm-red mb-2">Sumut Timur</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Pematang Siantar</li>
                    <li>• Tebing Tinggi</li>
                    <li>• Simalungun</li>
                  </ul>
                </div>
                <div className="glass-card-gray p-4">
                  <h4 className="font-semibold text-ywm-red mb-2">Sumut Selatan</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Padangsidimpuan</li>
                    <li>• Sibolga</li>
                    <li>• Tapanuli</li>
                  </ul>
                </div>
                <div className="glass-card-gray p-4">
                  <h4 className="font-semibold text-ywm-red mb-2">Sumut Utara</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Rantau Prapat</li>
                    <li>• Kisaran</li>
                    <li>• Labuhan Batu</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-gradient-to-r from-ywm-red to-red-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/hero-factory.png')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl font-bold mb-6">
            Ingin Mengunjungi Fasilitas Kami?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-red-50">
            Hubungi kami terlebih dahulu untuk mengatur jadwal kunjungan dan tour fasilitas
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://wa.me/6285322624048?text=Halo%2C%20saya%20ingin%20mengatur%20jadwal%20kunjungan%20ke%20pabrik%20YWM"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5A] text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-xl"
            >
              <MessageCircle size={24} />
              Hubungi via WhatsApp
            </a>
            <a 
              href="/kontak" 
              className="inline-block bg-white/15 backdrop-blur-sm hover:bg-white/25 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 border border-white/20"
            >
              Halaman Kontak
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Location;
