
import Layout from '@/components/Layout';
import { Link } from 'react-router-dom';

const Gallery = () => {
  const galleryImages = [
    {
      id: 1,
      src: "/images/hero-factory.png",
      title: "Fasilitas Pabrik Modern",
      description: "Pabrik pengantongan semen dengan 2 silo berkapasitas 500 ton"
    },
    {
      id: 2,
      src: "/images/bulk-truck.png",
      title: "Armada Distribusi Curah",
      description: "Truk tangki untuk pengiriman Semen Padang Curah ke seluruh wilayah"
    },
    {
      id: 3,
      src: "/images/cement-zak-40kg.png",
      title: "Semen Padang PCC Zak 40kg",
      description: "Produk unggulan kami — Semen Padang PCC dalam kemasan Zak 40kg"
    },
    {
      id: 4,
      src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "Lokasi Strategis",
      description: "Berlokasi di Jl. Pelabuhan Umum, Kr. Geukuh, Aceh Utara"
    },
    {
      id: 5,
      src: "https://images.unsplash.com/photo-1466442929976-97f336a657be?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "Proses Pengantongan",
      description: "2 mesin pengantongan otomatis dengan penimbangan digital presisi"
    },
    {
      id: 6,
      src: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      title: "Kontrol Kualitas",
      description: "Laboratorium pengujian kualitas sesuai standar SNI 15-2049"
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-ywm-red to-red-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-10 max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold mb-6 animate-fade-in">Galeri</h1>
            <p className="text-xl max-w-3xl mx-auto animate-fade-in">
              Dokumentasi Kegiatan dan Fasilitas PT. Yoga Wibawa Mandiri
            </p>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {galleryImages.map((image, index) => (
              <div key={image.id} className="group cursor-pointer animate-fade-in" style={{animationDelay: `${index * 0.1}s`}}>
                <div className="glass-frosted relative overflow-hidden rounded-2xl">
                  <img 
                    src={image.src}
                    alt={image.title}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <h3 className="font-semibold text-lg mb-1">{image.title}</h3>
                      <p className="text-sm text-gray-200">{image.description}</p>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-ywm-dark">{image.title}</h3>
                    <p className="text-gray-500 text-sm">{image.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-ywm-dark mb-4">
              Pencapaian <span className="text-ywm-red">Kami</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Fasilitas dan kapasitas yang menunjukkan komitmen kami dalam melayani industri konstruksi
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="glass-frosted rounded-2xl p-6 animate-fade-in">
              <h3 className="text-4xl font-bold text-ywm-red mb-2">500K+</h3>
              <p className="text-gray-700 font-medium">Ton Semen per Tahun</p>
            </div>
            <div className="glass-frosted rounded-2xl p-6 animate-fade-in">
              <h3 className="text-4xl font-bold text-ywm-red mb-2">15+</h3>
              <p className="text-gray-700 font-medium">Tahun Pengalaman</p>
            </div>
            <div className="glass-frosted rounded-2xl p-6 animate-fade-in">
              <h3 className="text-4xl font-bold text-ywm-red mb-2">200+</h3>
              <p className="text-gray-700 font-medium">Karyawan Profesional</p>
            </div>
            <div className="glass-frosted rounded-2xl p-6 animate-fade-in">
              <h3 className="text-4xl font-bold text-ywm-red mb-2">50+</h3>
              <p className="text-gray-700 font-medium">Kota Distribusi</p>
              <p className="text-gray-400 text-sm">Aceh & Sumatera Utara</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-ywm-red text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-12 max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">
              Ingin Melihat Fasilitas Kami Langsung?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              Kunjungi pabrik kami di Pelabuhan Krueng Geukueh, Lhokseumawe untuk melihat 
              proses produksi dan fasilitas modern yang kami miliki.
            </p>
            <Link 
              to="/lokasi" 
              className="inline-block bg-white/90 backdrop-blur-md text-ywm-red px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white transition-colors transform hover:scale-105"
            >
              Lihat Lokasi Kami
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Gallery;
