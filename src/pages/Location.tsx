
import Layout from '@/components/Layout';
import { MapPin, Phone, Clock, Navigation, MessageCircle } from 'lucide-react';

const Location = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-ywm-red to-red-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-10 max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold mb-6 animate-fade-in">Lokasi Kami</h1>
            <p className="text-xl max-w-3xl mx-auto animate-fade-in">
              Temukan Lokasi Strategis PT. Yoga Wibawa Mandiri
            </p>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20">
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
          <div className="glass-frosted rounded-2xl overflow-hidden shadow-2xl mb-12 p-2">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3967.2!2d97.1354!3d5.1871!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3046d5c2b7e5e5e1%3A0x7e5e5e5e5e5e5e5e!2sPelabuhan%20Krueng%20Geukueh!5e0!3m2!1sid!2sid!4v1700000000000"
              width="100%"
              height="400"
              style={{ border: 0, borderRadius: '1rem' }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Lokasi PT. Yoga Wibawa Mandiri"
            ></iframe>
          </div>

          {/* Location Details */}
          <div className="grid md:grid-cols-2 gap-12">
            <div className="animate-fade-in">
              <h3 className="text-2xl font-bold text-ywm-dark mb-6">Packing Plant (Pabrik)</h3>
              <div className="space-y-4">
                <div className="glass-frosted flex items-start space-x-4 p-4 rounded-xl">
                  <MapPin className="text-ywm-red mt-1 flex-shrink-0" size={24} />
                  <div>
                    <h4 className="font-semibold text-ywm-dark">Alamat Lengkap</h4>
                    <p className="text-gray-600">
                      Jl. Pelabuhan Umum, Kr. Geukuh<br />
                      Kec. Kuta Makmur, Aceh Utara<br />
                      Aceh 24352, Indonesia
                    </p>
                  </div>
                </div>

                <div className="glass-frosted flex items-start space-x-4 p-4 rounded-xl">
                  <Navigation className="text-ywm-red mt-1 flex-shrink-0" size={24} />
                  <div>
                    <h4 className="font-semibold text-ywm-dark">Koordinat</h4>
                    <p className="text-gray-600">
                      5.1775° N, 97.1315° E<br />
                      Krueng Geukueh, Aceh Utara
                    </p>
                  </div>
                </div>

                <div className="glass-frosted flex items-start space-x-4 p-4 rounded-xl">
                  <Clock className="text-ywm-red mt-1 flex-shrink-0" size={24} />
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
                <div className="glass-frosted flex items-start space-x-4 p-4 rounded-xl">
                  <MapPin className="text-ywm-red mt-1 flex-shrink-0" size={24} />
                  <div>
                    <h4 className="font-semibold text-ywm-dark">Alamat Kantor</h4>
                    <p className="text-gray-600">
                      Jl. Paduan Tenaga No. 12<br />
                      Medan, Sumatera Utara 20112<br />
                      Indonesia
                    </p>
                  </div>
                </div>

                <div className="glass-frosted flex items-start space-x-4 p-4 rounded-xl">
                  <Phone className="text-ywm-red mt-1 flex-shrink-0" size={24} />
                  <div>
                    <h4 className="font-semibold text-ywm-dark">Kontak</h4>
                    <p className="text-gray-600">
                      Telepon: <a href="tel:+6285322624048" className="hover:underline text-ywm-red">+6285322624048</a><br />
                      WhatsApp: <a href="https://wa.me/6285322624048" target="_blank" rel="noopener noreferrer" className="hover:underline text-ywm-red">wa.me/6285322624048</a><br />
                      Email: <a href="mailto:info@ywm.co.id" className="hover:underline text-ywm-red">info@ywm.co.id</a>
                    </p>
                  </div>
                </div>

                <div className="glass-frosted flex items-start space-x-4 p-4 rounded-xl">
                  <Clock className="text-ywm-red mt-1 flex-shrink-0" size={24} />
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
      <section className="py-20">
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
                <div className="glass-frosted p-4 rounded-xl">
                  <h4 className="font-semibold text-ywm-red mb-2">Aceh Utara</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Lhokseumawe</li>
                    <li>• Bireuen</li>
                    <li>• Langsa</li>
                  </ul>
                </div>
                <div className="glass-frosted p-4 rounded-xl">
                  <h4 className="font-semibold text-ywm-red mb-2">Aceh Tengah</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Takengon</li>
                    <li>• Banda Aceh</li>
                    <li>• Sabang</li>
                  </ul>
                </div>
                <div className="glass-frosted p-4 rounded-xl">
                  <h4 className="font-semibold text-ywm-red mb-2">Aceh Selatan</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Tapaktuan</li>
                    <li>• Blangkejeren</li>
                    <li>• Kutacane</li>
                  </ul>
                </div>
                <div className="glass-frosted p-4 rounded-xl">
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
                <div className="glass-frosted p-4 rounded-xl">
                  <h4 className="font-semibold text-ywm-red mb-2">Medan Raya</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Medan</li>
                    <li>• Binjai</li>
                    <li>• Deli Serdang</li>
                  </ul>
                </div>
                <div className="glass-frosted p-4 rounded-xl">
                  <h4 className="font-semibold text-ywm-red mb-2">Sumut Timur</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Pematang Siantar</li>
                    <li>• Tebing Tinggi</li>
                    <li>• Simalungun</li>
                  </ul>
                </div>
                <div className="glass-frosted p-4 rounded-xl">
                  <h4 className="font-semibold text-ywm-red mb-2">Sumut Selatan</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Padangsidimpuan</li>
                    <li>• Sibolga</li>
                    <li>• Tapanuli</li>
                  </ul>
                </div>
                <div className="glass-frosted p-4 rounded-xl">
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
      <section className="py-20 bg-ywm-red text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-12 max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">
              Ingin Mengunjungi Fasilitas Kami?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Hubungi kami terlebih dahulu untuk mengatur jadwal kunjungan dan tour fasilitas
            </p>
            <a 
              href="/kontak" 
              className="inline-block bg-white/90 backdrop-blur-md text-ywm-red px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white transition-colors transform hover:scale-105"
            >
              Hubungi Kami
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Location;
