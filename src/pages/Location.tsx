
import Layout from '@/components/Layout';
import { MapPin, Phone, Clock, Navigation } from 'lucide-react';

const Location = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-ywm-red to-red-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 animate-fade-in">Lokasi Kami</h1>
          <p className="text-xl max-w-3xl mx-auto animate-fade-in">
            Temukan Lokasi Strategis PT. Yoga Wibawa Mandiri
          </p>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-ywm-dark mb-4">
              Pabrik <span className="text-ywm-red">Pengantongan</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Berlokasi strategis di Pelabuhan Krueng Geukueh, Lhokseumawe untuk kemudahan akses distribusi
            </p>
          </div>

          {/* Google Maps Embed */}
          <div className="rounded-lg overflow-hidden shadow-2xl mb-12">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d127414.36341234567!2d97.1234567!3d5.1234567!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2sPelabuhan%20Krueng%20Geukueh!5e0!3m2!1sen!2sid!4v1234567890123"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Lokasi PT. Yoga Wibawa Mandiri"
            ></iframe>
          </div>

          {/* Location Details */}
          <div className="grid md:grid-cols-2 gap-12">
            <div className="animate-fade-in">
              <h3 className="text-2xl font-bold text-ywm-dark mb-6">Lokasi Pabrik</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <MapPin className="text-ywm-red mt-1" size={24} />
                  <div>
                    <h4 className="font-semibold text-ywm-dark">Alamat Lengkap</h4>
                    <p className="text-gray-600">
                      Pelabuhan Krueng Geukueh<br />
                      Lhokseumawe, Aceh 24352<br />
                      Indonesia
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Navigation className="text-ywm-red mt-1" size={24} />
                  <div>
                    <h4 className="font-semibold text-ywm-dark">Akses Transportasi</h4>
                    <p className="text-gray-600">
                      • 15 menit dari Bandara Malikussaleh<br />
                      • 20 menit dari pusat kota Lhokseumawe<br />
                      • Akses langsung ke pelabuhan
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Clock className="text-ywm-red mt-1" size={24} />
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
                <div className="flex items-start space-x-4">
                  <MapPin className="text-ywm-red mt-1" size={24} />
                  <div>
                    <h4 className="font-semibold text-ywm-dark">Alamat Kantor</h4>
                    <p className="text-gray-600">
                      Jl. Gatot Subroto No. 123<br />
                      Medan, Sumatera Utara 20112<br />
                      Indonesia
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Phone className="text-ywm-red mt-1" size={24} />
                  <div>
                    <h4 className="font-semibold text-ywm-dark">Kontak</h4>
                    <p className="text-gray-600">
                      Telepon: +62 61 456789<br />
                      Fax: +62 61 456790<br />
                      Email: info@ywm.co.id
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Clock className="text-ywm-red mt-1" size={24} />
                  <div>
                    <h4 className="font-semibold text-ywm-dark">Jam Kerja</h4>
                    <p className="text-gray-600">
                      Senin - Jumat: 08:00 - 17:00 WIB<br />
                      Sabtu: 08:00 - 12:00 WIB<br />
                      Minggu: Tutup
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coverage Area */}
      <section className="py-20 bg-gray-50">
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
                <div className="bg-white p-4 rounded-lg shadow">
                  <h4 className="font-semibold text-ywm-red mb-2">Aceh Utara</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Lhokseumawe</li>
                    <li>• Bireuen</li>
                    <li>• Langsa</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <h4 className="font-semibold text-ywm-red mb-2">Aceh Tengah</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Takengon</li>
                    <li>• Banda Aceh</li>
                    <li>• Sabang</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <h4 className="font-semibold text-ywm-red mb-2">Aceh Selatan</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Tapaktuan</li>
                    <li>• Blangkejeren</li>
                    <li>• Kutacane</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
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
                <div className="bg-white p-4 rounded-lg shadow">
                  <h4 className="font-semibold text-ywm-red mb-2">Medan Raya</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Medan</li>
                    <li>• Binjai</li>
                    <li>• Deli Serdang</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <h4 className="font-semibold text-ywm-red mb-2">Sumut Timur</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Pematang Siantar</li>
                    <li>• Tebing Tinggi</li>
                    <li>• Simalungun</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <h4 className="font-semibold text-ywm-red mb-2">Sumut Selatan</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Padangsidimpuan</li>
                    <li>• Sibolga</li>
                    <li>• Tapanuli</li>
                  </ul>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
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
          <h2 className="text-4xl font-bold mb-6">
            Ingin Mengunjungi Fasilitas Kami?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Hubungi kami terlebih dahulu untuk mengatur jadwal kunjungan dan tour fasilitas
          </p>
          <a 
            href="/kontak" 
            className="inline-block bg-white text-ywm-red px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors transform hover:scale-105"
          >
            Hubungi Kami
          </a>
        </div>
      </section>
    </Layout>
  );
};

export default Location;
