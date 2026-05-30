import { useState } from 'react';
import Layout from '@/components/Layout';
import { 
  Package, Truck, Shield, Weight, Factory, Minus, Plus, 
  MessageCircle, ShoppingBag, CheckCircle, Info, Headphones 
} from 'lucide-react';

const WHATSAPP_NUMBER = '6285322624048';
const WHATSAPP_BASE_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

const Products = () => {
  const [zakQuantity, setZakQuantity] = useState<'250' | '750'>('250');
  const [bulkTonnage, setBulkTonnage] = useState<number>(10);

  const handleZakOrder = () => {
    const zakCount = zakQuantity === '250' ? 250 : 750;
    const totalKg = zakCount * 40;
    const totalTon = totalKg / 1000;
    const message = `Halo PT. Yoga Wibawa Mandiri,

Saya ingin memesan:

📦 Produk: Semen Padang PCC Zak 40kg
📊 Jumlah: ${zakCount} zak
⚖️ Total: ${totalKg.toLocaleString('id-ID')} kg (${totalTon} ton)

Mohon informasi harga dan ketersediaan stok.
Terima kasih.`;
    window.open(`${WHATSAPP_BASE_URL}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleBulkOrder = () => {
    const message = `Halo PT. Yoga Wibawa Mandiri,

Saya ingin memesan:

🚛 Produk: Semen Padang Bulk/Curah
⚖️ Jumlah: ${bulkTonnage} ton

Mohon informasi harga dan jadwal pengiriman.
Terima kasih.`;
    window.open(`${WHATSAPP_BASE_URL}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleConsultation = () => {
    const message = `Halo PT. Yoga Wibawa Mandiri,

Saya ingin berkonsultasi mengenai produk Semen Padang untuk kebutuhan proyek saya.

Mohon informasinya. Terima kasih.`;
    window.open(`${WHATSAPP_BASE_URL}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-ywm-red via-red-700 to-red-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-30"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <ShoppingBag size={16} />
              <span className="text-sm font-medium">Katalog Produk Resmi</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              Produk <span className="text-yellow-400">Semen Padang</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto opacity-90">
              Produk berkualitas tinggi dengan standar internasional — 
              tersedia dalam kemasan zak dan curah untuk kebutuhan proyek Anda
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => document.getElementById('product-zak')?.scrollIntoView({ behavior: 'smooth' })}
                className="bg-white text-ywm-red px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105"
              >
                Lihat Produk
              </button>
              <button
                onClick={handleConsultation}
                className="border-2 border-white text-white hover:bg-white hover:text-ywm-red px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <Headphones size={20} />
                Konsultasi Gratis
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Product Catalog */}
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-red-50 text-ywm-red px-4 py-2 rounded-full mb-4">
              <Package size={16} />
              <span className="text-sm font-semibold">Mitra Resmi Semen Padang</span>
            </div>
            <h2 className="text-4xl font-bold text-ywm-dark mb-4">
              Pilih Produk <span className="text-ywm-red">Kebutuhan Anda</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Pilih produk dan jumlah yang Anda butuhkan, lalu pesan langsung melalui WhatsApp
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 max-w-5xl mx-auto">
            {/* Product 1: PCC Zak 40kg */}
            <div id="product-zak" className="group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-red-100">
              {/* Product Image */}
              <div className="relative bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 p-8 flex items-center justify-center h-72 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(198,40,40,0.03),transparent_70%)]"></div>
                <div className="text-center relative z-10">
                  <div className="w-36 h-36 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4 border-2 border-gray-100 group-hover:border-red-200 transition-colors">
                    <Package className="text-ywm-red" size={72} />
                  </div>
                  <img 
                    src="/logo-semen-padang-black.png" 
                    alt="Semen Padang Logo" 
                    className="h-10 mx-auto object-contain opacity-70"
                    loading="lazy"
                  />
                </div>
                {/* Badge */}
                <div className="absolute top-4 right-4 bg-ywm-red text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                  BEST SELLER
                </div>
              </div>

              {/* Product Details */}
              <div className="p-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">Ready Stock</span>
                  <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">SNI Certified</span>
                </div>
                <h3 className="text-2xl font-bold text-ywm-dark mb-1">Semen Padang PCC</h3>
                <p className="text-gray-500 mb-5">Zak 40kg — Portland Composite Cement</p>

                <div className="space-y-3 mb-6 bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Shield className="text-ywm-red flex-shrink-0" size={16} />
                    <span>SNI 15-2049 & ISO 9001:2015</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Weight className="text-ywm-red flex-shrink-0" size={16} />
                    <span>Berat per zak: <strong>40 kg</strong></span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Factory className="text-ywm-red flex-shrink-0" size={16} />
                    <span>Dikantongi oleh PT. Yoga Wibawa Mandiri</span>
                  </div>
                </div>

                {/* Price Info */}
                <div className="bg-ywm-red/5 border border-ywm-red/10 rounded-2xl p-4 mb-6 text-center">
                  <p className="text-sm text-gray-500 mb-1">Harga</p>
                  <p className="text-2xl font-bold text-ywm-red">Hubungi Kami</p>
                  <p className="text-xs text-gray-400 mt-1">Dapatkan penawaran terbaik untuk proyek Anda</p>
                </div>

                {/* Quantity Options */}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-ywm-dark mb-3">Pilih Jumlah Pesanan:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setZakQuantity('250')}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        zakQuantity === '250'
                          ? 'border-ywm-red bg-red-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          zakQuantity === '250' ? 'border-ywm-red' : 'border-gray-300'
                        }`}>
                          {zakQuantity === '250' && <div className="w-3 h-3 rounded-full bg-ywm-red" />}
                        </div>
                        <span className="font-bold text-ywm-dark">250 zak</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 ml-7">
                        40kg × 250 = 10.000 kg (10 ton)
                      </p>
                    </button>

                    <button
                      onClick={() => setZakQuantity('750')}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        zakQuantity === '750'
                          ? 'border-ywm-red bg-red-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          zakQuantity === '750' ? 'border-ywm-red' : 'border-gray-300'
                        }`}>
                          {zakQuantity === '750' && <div className="w-3 h-3 rounded-full bg-ywm-red" />}
                        </div>
                        <span className="font-bold text-ywm-dark">750 zak</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 ml-7">
                        40kg × 750 = 30.000 kg (30 ton)
                      </p>
                    </button>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-gray-50 rounded-xl p-4 mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Produk</span>
                    <span className="text-sm font-medium text-ywm-dark">Semen Padang PCC Zak 40kg</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Jumlah</span>
                    <span className="text-sm font-medium text-ywm-dark">{zakQuantity === '250' ? '250' : '750'} zak</span>
                  </div>
                  <div className="border-t border-gray-200 my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Berat</span>
                    <span className="text-base font-bold text-ywm-red">
                      {zakQuantity === '250' ? '10.000 kg (10 ton)' : '30.000 kg (30 ton)'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleZakOrder}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <MessageCircle size={22} />
                    Pesan via WhatsApp
                  </button>
                  <button
                    onClick={handleConsultation}
                    className="w-full bg-white border-2 border-ywm-red text-ywm-red hover:bg-red-50 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <Headphones size={18} />
                    Konsultasi dengan Tim Kami
                  </button>
                </div>
              </div>
            </div>

            {/* Product 2: Bulk/Curah */}
            <div className="group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-amber-100">
              {/* Product Image */}
              <div className="relative bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 p-8 flex items-center justify-center h-72 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(251,146,60,0.05),transparent_70%)]"></div>
                <div className="text-center relative z-10">
                  <div className="w-36 h-36 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4 border-2 border-amber-100 group-hover:border-amber-300 transition-colors">
                    <Truck className="text-amber-600" size={72} />
                  </div>
                  <p className="text-amber-700 text-sm font-medium">Pengiriman Bulk / Curah</p>
                </div>
                {/* Badge */}
                <div className="absolute top-4 right-4 bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                  BULK
                </div>
              </div>

              {/* Product Details */}
              <div className="p-8">
                <div className="flex items-center gap-2 mb-3">
                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">Ready Stock</span>
                  <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">Truk Tangki</span>
                </div>
                <h3 className="text-2xl font-bold text-ywm-dark mb-1">Semen Padang Bulk/Curah</h3>
                <p className="text-gray-500 mb-5">Pengiriman langsung dengan truk tangki ke lokasi proyek</p>

                <div className="space-y-3 mb-6 bg-amber-50 rounded-2xl p-4">
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Shield className="text-amber-600 flex-shrink-0" size={16} />
                    <span>SNI 15-2049 & ISO 9001:2015</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Truck className="text-amber-600 flex-shrink-0" size={16} />
                    <span>Pengiriman langsung ke lokasi proyek</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <Factory className="text-amber-600 flex-shrink-0" size={16} />
                    <span>Dari pabrik pengantongan Krueng Geukueh</span>
                  </div>
                </div>

                {/* Price Info */}
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 text-center">
                  <p className="text-sm text-gray-500 mb-1">Harga</p>
                  <p className="text-2xl font-bold text-amber-600">Hubungi Kami</p>
                  <p className="text-xs text-gray-400 mt-1">Harga kompetitif untuk pembelian dalam jumlah besar</p>
                </div>

                {/* Tonnage Input */}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-ywm-dark mb-3">Masukkan Jumlah (ton):</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setBulkTonnage(prev => Math.max(1, prev - 1))}
                      className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:border-amber-400 hover:bg-amber-50 transition-colors"
                    >
                      <Minus size={18} />
                    </button>
                    <div className="flex-1 relative">
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={bulkTonnage}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setBulkTonnage(Math.min(30, Math.max(1, val)));
                        }}
                        className="w-full text-center text-2xl font-bold text-ywm-dark py-2 px-4 border-2 border-amber-300 rounded-xl focus:border-amber-500 focus:outline-none bg-amber-50"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-600 font-semibold text-sm">
                        ton
                      </span>
                    </div>
                    <button
                      onClick={() => setBulkTonnage(prev => Math.min(30, prev + 1))}
                      className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:border-amber-400 hover:bg-amber-50 transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={bulkTonnage}
                    onChange={(e) => setBulkTonnage(parseInt(e.target.value))}
                    className="w-full mt-3 accent-amber-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>1 ton</span>
                    <span>Maks. 30 ton</span>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-amber-50 rounded-xl p-4 mb-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Produk</span>
                    <span className="text-sm font-medium text-ywm-dark">Semen Padang Bulk/Curah</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Jumlah</span>
                    <span className="text-sm font-medium text-ywm-dark">{bulkTonnage} ton</span>
                  </div>
                  <div className="border-t border-amber-200 my-2" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Berat</span>
                    <span className="text-base font-bold text-amber-600">
                      {(bulkTonnage * 1000).toLocaleString('id-ID')} kg ({bulkTonnage} ton)
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={handleBulkOrder}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-all shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <MessageCircle size={22} />
                    Pesan via WhatsApp
                  </button>
                  <button
                    onClick={handleConsultation}
                    className="w-full bg-white border-2 border-amber-500 text-amber-600 hover:bg-amber-50 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <Headphones size={18} />
                    Konsultasi dengan Tim Kami
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-ywm-dark mb-4">
              Mengapa <span className="text-ywm-red">Memilih Kami?</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Keunggulan bermitra dengan PT. Yoga Wibawa Mandiri
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center p-8 rounded-2xl bg-gray-50 hover:bg-red-50 transition-colors border border-gray-100 hover:border-red-100">
              <div className="w-16 h-16 bg-ywm-red rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="text-white" size={32} />
              </div>
              <h3 className="text-lg font-bold text-ywm-dark mb-2">Produk Original</h3>
              <p className="text-gray-600 text-sm">Semen Padang asli dengan jaminan kualitas dan standar SNI</p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gray-50 hover:bg-amber-50 transition-colors border border-gray-100 hover:border-amber-100">
              <div className="w-16 h-16 bg-ywm-red rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="text-white" size={32} />
              </div>
              <h3 className="text-lg font-bold text-ywm-dark mb-2">Distribusi Cepat</h3>
              <p className="text-gray-600 text-sm">Pengiriman tepat waktu ke seluruh Aceh dan Sumatera Utara</p>
            </div>

            <div className="text-center p-8 rounded-2xl bg-gray-50 hover:bg-green-50 transition-colors border border-gray-100 hover:border-green-100">
              <div className="w-16 h-16 bg-ywm-red rounded-full flex items-center justify-center mx-auto mb-4">
                <Headphones className="text-white" size={32} />
              </div>
              <h3 className="text-lg font-bold text-ywm-dark mb-2">Layanan 24/7</h3>
              <p className="text-gray-600 text-sm">Tim customer service siap membantu Anda kapan pun</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-ywm-red to-red-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Siap Memesan?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Hubungi tim kami sekarang untuk konsultasi dan penawaran harga terbaik
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleConsultation}
              className="bg-white text-ywm-red px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <MessageCircle size={20} />
              Konsultasi via WhatsApp
            </button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Products;
