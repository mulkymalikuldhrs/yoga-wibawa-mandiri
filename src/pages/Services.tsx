import { useState } from 'react';
import Layout from '@/components/Layout';
import { Factory, Truck, Settings, Shield, Clock, MapPin, Package, Minus, Plus, ShoppingCart, MessageCircle, Weight } from 'lucide-react';

const WHATSAPP_NUMBER = '6285322624038';
const WHATSAPP_BASE_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

const Services = () => {
  const [zakQuantity, setZakQuantity] = useState<'250' | '750'>('250');
  const [bulkTonnage, setBulkTonnage] = useState<number>(10);

  const handleZakOrder = () => {
    const zakCount = zakQuantity === '250' ? 250 : 750;
    const totalKg = zakCount * 40;
    const totalTon = totalKg / 1000;
    const message = `Halo PT. Yoga Wibawa Mandiri,\n\nSaya ingin memesan:\n\n📦 Produk: Semen Padang PCC Zak 40kg\n📊 Jumlah: ${zakCount} zak\n⚖️ Total: ${totalKg.toLocaleString('id-ID')} kg (${totalTon} ton)\n\nMohon informasi harga dan ketersediaan stok.\nTerima kasih.`;
    window.open(`${WHATSAPP_BASE_URL}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleBulkOrder = () => {
    const message = `Halo PT. Yoga Wibawa Mandiri,\n\nSaya ingin memesan:\n\n🚛 Produk: Semen Padang Bulk/Curah\n⚖️ Jumlah: ${bulkTonnage} ton\n\nMohon informasi harga dan jadwal pengiriman.\nTerima kasih.`;
    window.open(`${WHATSAPP_BASE_URL}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-ywm-red to-red-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 animate-fade-in">Katalog Produk</h1>
          <p className="text-xl max-w-3xl mx-auto animate-fade-in">
            Produk Semen Padang Berkualitas Tinggi — Pesan Langsung via WhatsApp
          </p>
        </div>
      </section>

      {/* Product Catalog */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-ywm-dark mb-4">
              Produk <span className="text-ywm-red">Kami</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Pilih produk dan jumlah yang Anda butuhkan, lalu pesan langsung melalui WhatsApp
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Variant 1: Semen Padang PCC Zak 40kg */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow animate-fade-in">
              {/* Product Image */}
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-8 flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-32 h-32 bg-white rounded-2xl shadow-md flex items-center justify-center mx-auto mb-3 border-2 border-gray-200">
                    <Package className="text-ywm-red" size={64} />
                  </div>
                  <img 
                    src="/lovable-uploads/LOGO PT SEMEN PADANG HITAM.png" 
                    alt="Semen Padang Logo" 
                    className="h-12 mx-auto object-contain"
                    loading="lazy"
                  />
                </div>
              </div>

              {/* Product Details */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-red-100 text-ywm-red text-xs font-semibold px-2.5 py-1 rounded-full">Best Seller</span>
                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">Ready Stock</span>
                </div>
                <h3 className="text-2xl font-bold text-ywm-dark mt-3 mb-1">Semen Padang PCC</h3>
                <p className="text-gray-500 text-sm mb-4">Zak 40kg — Portland Composite Cement</p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="text-ywm-red" size={16} />
                    <span>SNI 15-2049 & ISO 9001:2015</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Weight className="text-ywm-red" size={16} />
                    <span>Berat per zak: 40 kg</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Factory className="text-ywm-red" size={16} />
                    <span>Dikantongi oleh PT. Yoga Wibawa Mandiri</span>
                  </div>
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
                          : 'border-gray-200 hover:border-gray-300'
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
                          : 'border-gray-200 hover:border-gray-300'
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
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
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

                {/* WhatsApp Order Button */}
                <button
                  onClick={handleZakOrder}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-colors shadow-md hover:shadow-lg"
                >
                  <MessageCircle size={22} />
                  Pesan via WhatsApp
                </button>
              </div>
            </div>

            {/* Variant 2: Semen Padang Bulk/Curah */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow animate-fade-in">
              {/* Product Image */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-100 p-8 flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-32 h-32 bg-white rounded-2xl shadow-md flex items-center justify-center mx-auto mb-3 border-2 border-amber-200">
                    <Truck className="text-amber-600" size={64} />
                  </div>
                  <p className="text-amber-700 text-sm font-medium">Pengiriman Bulk / Curah</p>
                </div>
              </div>

              {/* Product Details */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-amber-100 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full">Bulk</span>
                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full">Ready Stock</span>
                </div>
                <h3 className="text-2xl font-bold text-ywm-dark mt-3 mb-1">Semen Padang Bulk/Curah</h3>
                <p className="text-gray-500 text-sm mb-4">Pengiriman langsung dengan truk tangki</p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="text-amber-600" size={16} />
                    <span>SNI 15-2049 & ISO 9001:2015</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Truck className="text-amber-600" size={16} />
                    <span>Pengiriman langsung ke lokasi proyek</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Factory className="text-amber-600" size={16} />
                    <span>Dari pabrik pengantongan Krueng Geukueh</span>
                  </div>
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
                <div className="bg-amber-50 rounded-xl p-4 mb-4">
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

                {/* WhatsApp Order Button */}
                <button
                  onClick={handleBulkOrder}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-colors shadow-md hover:shadow-lg"
                >
                  <MessageCircle size={22} />
                  Pesan via WhatsApp
                </button>
              </div>
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
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Halo PT. Yoga Wibawa Mandiri, saya ingin konsultasi mengenai produk semen Anda.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-ywm-red px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors transform hover:scale-105"
          >
            Hubungi via WhatsApp
          </a>
        </div>
      </section>
    </Layout>
  );
};

export default Services;
