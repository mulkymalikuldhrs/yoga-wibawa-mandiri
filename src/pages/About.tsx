
import Layout from '@/components/Layout';
import { Target, Eye, Users, Award, Phone } from 'lucide-react';

const About = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-ywm-red to-red-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/hero-factory.png')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl font-bold mb-6 animate-fade-in">Tentang Kami</h1>
          <p className="text-xl max-w-3xl mx-auto animate-fade-in text-red-50">
            PT. Yoga Wibawa Mandiri — Mitra Resmi Pengantongan Semen Padang di Aceh Utara
          </p>
        </div>
      </section>

      {/* Company History */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white relative">
        <div className="absolute inset-0 bg-[url('/images/hero-factory.png')] bg-cover bg-center opacity-[0.03]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="text-4xl font-bold text-ywm-dark mb-6">
                Sejarah <span className="text-ywm-red">Perusahaan</span>
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                PT. Yoga Wibawa Mandiri didirikan sebagai perusahaan yang bergerak di bidang 
                pengantongan Semen Padang PCC dengan lokasi strategis di Jl. Pelabuhan Umum, Kr. Geukuh,
                Aceh Utara, Aceh.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                Dilengkapi dengan 2 unit silo penyimpanan berkapasitas 500 ton masing-masing dan 
                2 unit mesin pengantongan untuk kemasan Zak 40kg, kami melayani kebutuhan konstruksi 
                dengan standar kualitas Semen Padang yang terjaga.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed">
                Berlokasi strategis di kawasan pelabuhan, kami mampu mengoptimalkan rantai distribusi 
                dan memberikan pelayanan yang efisien kepada seluruh mitra bisnis di wilayah 
                Aceh dan Sumatera Utara.
              </p>
            </div>
            <div className="animate-slide-in-right">
              <div className="relative">
                <img 
                  src="/images/hero-factory.png" 
                  alt="Fasilitas Pengantongan Semen YWM"
                  className="rounded-2xl shadow-2xl"
                  loading="lazy"
                />
                <div className="absolute -bottom-6 -right-6 glass-card-dark text-white p-5 max-w-xs">
                  <p className="font-bold text-lg">Fasilitas Modern</p>
                  <p className="text-red-100 text-sm">2 Silo × 500 Ton | 2 Mesin Pengantong | Zak 40kg & Curah</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-white">
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
            <div className="glass-card text-center p-10 animate-fade-in hover:shadow-xl transition-shadow">
              <div className="w-20 h-20 bg-ywm-red rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Eye className="text-white" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-ywm-dark mb-6">Visi</h3>
              <p className="text-gray-700 text-lg leading-relaxed">
                Menjadi perusahaan pengantongan semen terdepan dan terpercaya di wilayah 
                Aceh dan Sumatera Utara yang memberikan kontribusi nyata bagi pembangunan 
                infrastruktur Indonesia.
              </p>
            </div>

            <div className="glass-card text-center p-10 animate-fade-in hover:shadow-xl transition-shadow">
              <div className="w-20 h-20 bg-ywm-red rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Target className="text-white" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-ywm-dark mb-6">Misi</h3>
              <ul className="text-gray-700 text-lg leading-relaxed text-left space-y-3">
                <li>• Menyediakan Semen Padang PCC berkualitas tinggi sesuai standar SNI</li>
                <li>• Mengoptimalkan teknologi modern dalam proses pengantongan Zak 40kg dan Curah</li>
                <li>• Membangun jaringan distribusi yang luas dan efisien di seluruh Aceh & Sumut</li>
                <li>• Memberikan pelayanan prima kepada seluruh mitra bisnis</li>
                <li>• Berkontribusi dalam pembangunan ekonomi daerah</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Organizational Structure */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
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
            <div className="glass-card text-center p-8 animate-fade-in hover:shadow-xl transition-shadow">
              <div className="w-24 h-24 bg-gradient-to-br from-ywm-red to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="text-white" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-ywm-dark mb-2">Direktur Utama</h3>
              <p className="text-ywm-red font-medium mb-3">Leadership & Strategy</p>
              <p className="text-gray-600">
                Memimpin visi strategis perusahaan dan mengawasi operasional keseluruhan
              </p>
            </div>

            <div className="glass-card text-center p-8 animate-fade-in hover:shadow-xl transition-shadow">
              <div className="w-24 h-24 bg-gradient-to-br from-ywm-red to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Award className="text-white" size={40} />
              </div>
              <h3 className="text-xl font-semibold text-ywm-dark mb-2">Manajer Operasional</h3>
              <p className="text-ywm-red font-medium mb-3">Production & Quality</p>
              <p className="text-gray-600">
                Mengelola proses pengantongan Zak 40kg & Curah serta menjamin kualitas produk
              </p>
            </div>

            <div className="glass-card text-center p-8 animate-fade-in hover:shadow-xl transition-shadow">
              <div className="w-24 h-24 bg-gradient-to-br from-ywm-red to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Phone className="text-white" size={40} />
              </div>
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
      <section className="py-20 bg-gradient-to-r from-ywm-red to-red-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/hero-factory.png')] bg-cover bg-center opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Nilai-Nilai Perusahaan</h2>
            <p className="text-xl max-w-2xl mx-auto text-red-50">
              Prinsip-prinsip yang menjadi landasan dalam setiap kegiatan bisnis kami
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            <div className="glass-card-dark text-center p-8 animate-fade-in hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Award className="text-ywm-red" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Kualitas</h3>
              <p className="text-red-100">
                Komitmen terhadap standar kualitas tertinggi dalam setiap produk Semen Padang PCC
              </p>
            </div>

            <div className="glass-card-dark text-center p-8 animate-fade-in hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="text-ywm-red" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Integritas</h3>
              <p className="text-red-100">
                Menjalankan bisnis dengan transparansi dan kejujuran di setiap transaksi
              </p>
            </div>

            <div className="glass-card-dark text-center p-8 animate-fade-in hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Target className="text-ywm-red" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Inovasi</h3>
              <p className="text-red-100">
                Mengadopsi teknologi terbaru untuk meningkatkan efisiensi pengantongan
              </p>
            </div>

            <div className="glass-card-dark text-center p-8 animate-fade-in hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Eye className="text-ywm-red" size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-3">Kepercayaan</h3>
              <p className="text-red-100">
                Membangun hubungan jangka panjang berdasarkan kepercayaan mitra bisnis
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
