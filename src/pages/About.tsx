
import Layout from '@/components/Layout';
import { Target, Eye, Users, Award } from 'lucide-react';

const About = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-ywm-red to-red-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 animate-fade-in">Tentang Kami</h1>
          <p className="text-xl max-w-3xl mx-auto animate-fade-in">
            PT. Yoga Wibawa Mandiri - Mitra Terpercaya dalam Industri Semen Indonesia
          </p>
        </div>
      </section>

      {/* Company History */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="text-4xl font-bold text-ywm-dark mb-6">
                Sejarah <span className="text-ywm-red">Perusahaan</span>
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                PT. Yoga Wibawa Mandiri didirikan sebagai perusahaan yang bergerak di bidang 
                pengantongan Semen Padang dengan lokasi strategis di Pelabuhan Krueng Geukueh, 
                Lhokseumawe, Aceh.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                Dengan visi menjadi perusahaan pengantongan semen terdepan di wilayah Aceh 
                dan Sumatera Utara, kami telah melayani kebutuhan konstruksi dengan komitmen 
                tinggi terhadap kualitas dan kepuasan pelanggan.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                Berlokasi strategis di pelabuhan, kami mampu mengoptimalkan rantai distribusi 
                dan memberikan pelayanan yang efisien kepada seluruh mitra bisnis.
              </p>
            </div>
            <div className="animate-slide-in-right">
              <img 
                src="https://images.unsplash.com/photo-1501854140801-50d01698950b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Sejarah Perusahaan"
                className="rounded-lg shadow-2xl"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-ywm-dark mb-4">
              Visi & <span className="text-ywm-red">Misi</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Komitmen kami dalam membangun Indonesia melalui kualitas produk dan layanan terbaik
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="text-center animate-fade-in">
              <div className="w-20 h-20 bg-ywm-red rounded-full flex items-center justify-center mx-auto mb-6">
                <Eye className="text-white" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-ywm-dark mb-6">Visi</h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                Menjadi perusahaan pengantongan semen terdepan dan terpercaya di wilayah 
                Aceh dan Sumatera Utara yang memberikan kontribusi nyata bagi pembangunan 
                infrastruktur Indonesia.
              </p>
            </div>

            <div className="text-center animate-fade-in">
              <div className="w-20 h-20 bg-ywm-red rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="text-white" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-ywm-dark mb-6">Misi</h3>
              <ul className="text-gray-700 text-lg leading-relaxed text-left space-y-3">
                <li>• Menyediakan produk semen berkualitas tinggi dengan standar internasional</li>
                <li>• Mengoptimalkan teknologi modern dalam proses pengantongan</li>
                <li>• Membangun jaringan distribusi yang luas dan efisien</li>
                <li>• Memberikan pelayanan prima kepada seluruh mitra bisnis</li>
                <li>• Berkontribusi dalam pembangunan ekonomi daerah</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Organizational Structure */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-ywm-dark mb-4">
              Struktur <span className="text-ywm-red">Organisasi</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Tim profesional yang berpengalaman dalam industri semen dan konstruksi
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-lg shadow-lg animate-fade-in">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-ywm-dark mb-2">Direktur Utama</h3>
              <p className="text-ywm-red font-medium mb-3">Leadership & Strategy</p>
              <p className="text-gray-600">
                Memimpin visi strategis perusahaan dan mengawasi operasional keseluruhan
              </p>
            </div>

            <div className="text-center p-8 rounded-lg shadow-lg animate-fade-in">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-ywm-dark mb-2">Manajer Operasional</h3>
              <p className="text-ywm-red font-medium mb-3">Production & Quality</p>
              <p className="text-gray-600">
                Mengelola proses pengantongan dan menjamin kualitas produk
              </p>
            </div>

            <div className="text-center p-8 rounded-lg shadow-lg animate-fade-in">
              <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-ywm-dark mb-2">Manajer Pemasaran</h3>
              <p className="text-ywm-red font-medium mb-3">Sales & Distribution</p>
              <p className="text-gray-600">
                Mengembangkan jaringan distribusi dan hubungan dengan pelanggan
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-ywm-red text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Nilai-Nilai Perusahaan</h2>
            <p className="text-xl max-w-2xl mx-auto">
              Prinsip-prinsip yang menjadi landasan dalam setiap kegiatan bisnis kami
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="text-ywm-red" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Kualitas</h3>
              <p className="text-gray-100">
                Komitmen terhadap standar kualitas tertinggi dalam setiap produk
              </p>
            </div>

            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="text-ywm-red" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Integritas</h3>
              <p className="text-gray-100">
                Menjalankan bisnis dengan transparansi dan kejujuran
              </p>
            </div>

            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="text-ywm-red" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Inovasi</h3>
              <p className="text-gray-100">
                Mengadopsi teknologi terbaru untuk meningkatkan efisiensi
              </p>
            </div>

            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="text-ywm-red" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Kepercayaan</h3>
              <p className="text-gray-100">
                Membangun hubungan jangka panjang berdasarkan kepercayaan
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
