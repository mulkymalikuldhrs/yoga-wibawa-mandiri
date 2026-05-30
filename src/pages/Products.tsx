import { useState } from 'react';
import Layout from '@/components/Layout';
import {
  Truck, Package, Shield, Factory, Weight, Minus, Plus,
  MessageCircle, CheckCircle, Clock, MapPin, HeadphonesIcon,
  TruckIcon, BadgeCheck, Info
} from 'lucide-react';

const WHATSAPP_NUMBER = '6285322624048';
const WHATSAPP_BASE_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

const Products = () => {
  const [zakQuantity, setZakQuantity] = useState<'250' | '750'>('250');
  const [bulkTonnage, setBulkTonnage] = useState<number>(10);
  const [bulkInput, setBulkInput] = useState<string>('10');

  const handleZakOrder = (pilihan: '250' | '750') => {
    const pilihanText = pilihan === '250'
      ? '40kg x 250 zak = 10.000 kg (10 ton)'
      : '40kg x 750 zak = 30.000 kg (30 ton)';
    const message = `Halo PT Yoga Wibawa Mandiri, saya ingin memesan Semen Padang PCC Zak 40kg - ${pilihanText}. Mohon informasi lebih lanjut.`;
    window.open(`${WHATSAPP_BASE_URL}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleBulkOrder = () => {
    const tonnage = Math.min(30, Math.max(1, bulkTonnage));
    const message = `Halo PT Yoga Wibawa Mandiri, saya ingin memesan Semen Padang Bulk/Curah - ${tonnage} ton. Mohon informasi lebih lanjut.`;
    window.open(`${WHATSAPP_BASE_URL}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleBulkInputChange = (value: string) => {
    setBulkInput(value);
    const num = parseInt(value);
    if (!isNaN(num)) {
      setBulkTonnage(Math.min(30, Math.max(1, num)));
    }
  };

  const handleBulkInputBlur = () => {
    const num = parseInt(bulkInput);
    if (isNaN(num) || num < 1) {
      setBulkTonnage(1);
      setBulkInput('1');
    } else if (num > 30) {
      setBulkTonnage(30);
      setBulkInput('30');
    } else {
      setBulkTonnage(num);
      setBulkInput(num.toString());
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-r from-ywm-red to-red-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-10 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Package className="text-white/90" size={36} />
              <h1 className="text-5xl font-bold animate-fade-in">Produk Kami</h1>
            </div>
            <p className="text-xl max-w-3xl mx-auto animate-fade-in">
              Katalog Produk Semen Padang — Pesan Langsung via WhatsApp
            </p>
            <div className="flex items-center justify-center gap-2 mt-6">
              <img
                src="/lovable-uploads/LOGO PT SEMEN PADANG HITAM.png"
                alt="Semen Padang Logo"
                className="h-8 object-contain brightness-0 invert"
              />
              <span className="text-white/80 text-sm font-medium">Distributor Resmi Semen Padang</span>
            </div>
          </div>
        </div>
      </section>

      {/* Product Catalog */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-ywm-dark mb-4">
              Katalog <span className="text-ywm-red">Produk</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Pilih produk dan jumlah yang Anda butuhkan, lalu pesan langsung melalui WhatsApp
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Product 1: Semen Padang PCC Zak 40kg */}
            <div className="glass-frosted border border-white/60 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow animate-fade-in">
              {/* Product Image */}
              <div className="bg-gradient-to-br from-gray-100/80 to-gray-200/80 backdrop-blur-sm p-8 flex items-center justify-center h-64 relative">
                <div className="text-center">
                  <div className="w-36 h-36 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-3 border-2 border-gray-200 p-4">
                    <img
                      src="/lovable-uploads/LOGO PT SEMEN PADANG HITAM.png"
                      alt="Semen Padang PCC"
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-gray-600 text-sm font-medium">Semen Padang PCC Zak 40kg</p>
                </div>
                {/* Badge */}
                <div className="absolute top-4 left-4">
                  <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">Best Seller</span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
                    <CheckCircle size={12} />
                    Ready Stock
                  </span>
                </div>
              </div>

              {/* Product Details */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-ywm-dark mb-1">Semen Padang PCC</h3>
                <p className="text-gray-500 text-sm mb-4">Zak 40kg — Portland Composite Cement</p>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                  Semen Padang PCC (Portland Composite Cement) berkualitas tinggi yang memenuhi standar SNI 15-2049 dan ISO 9001:2015.
                  Cocok untuk berbagai kebutuhan konstruksi mulai dari bangunan rumah, gedung bertingkat, hingga infrastruktur besar.
                  Dikantongi langsung oleh PT. Yoga Wibawa Mandiri dengan mesin pengantongan otomatis dan sistem penimbangan digital presisi tinggi.
                </p>

                {/* Specifications */}
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
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="text-ywm-red" size={16} />
                    <span>Pabrik: Pelabuhan Krueng Geukueh, Lhokseumawe</span>
                  </div>
                </div>

                {/* Benefits */}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-ywm-dark mb-3">Keunggulan Produk:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Kuat tekan tinggi',
                      'Daya rekat superior',
                      'Tahan sulfat',
                      'Pengeringan merata',
                      'Mudah dikerjakan',
                      'Awet & tahan lama',
                    ].map((benefit) => (
                      <div key={benefit} className="flex items-center gap-1.5 text-xs text-gray-600">
                        <CheckCircle className="text-green-500 flex-shrink-0" size={14} />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-5" />

                {/* Quantity Options */}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-ywm-dark mb-3">Pilih Jumlah Pesanan:</p>
                  <div className="space-y-3">
                    {/* Option 1: 250 zak */}
                    <button
                      onClick={() => setZakQuantity('250')}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        zakQuantity === '250'
                          ? 'border-ywm-red bg-red-50/80 backdrop-blur-sm shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            zakQuantity === '250' ? 'border-ywm-red bg-ywm-red' : 'border-gray-300'
                          }`}>
                            {zakQuantity === '250' && <CheckCircle className="text-white" size={14} />}
                          </div>
                          <div>
                            <span className="font-bold text-ywm-dark text-lg">Pilihan 1</span>
                            <p className="text-sm text-gray-500 mt-0.5">40kg × 250 zak = <strong className="text-ywm-dark">10.000 kg (10 ton)</strong></p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="bg-red-100 text-ywm-red text-xs font-semibold px-2.5 py-1 rounded-full">10 ton</span>
                        </div>
                      </div>
                    </button>

                    {/* Option 2: 750 zak */}
                    <button
                      onClick={() => setZakQuantity('750')}
                      className={`w-full p-4 rounded-xl border-2 transition-all text-left ${
                        zakQuantity === '750'
                          ? 'border-ywm-red bg-red-50/80 backdrop-blur-sm shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                            zakQuantity === '750' ? 'border-ywm-red bg-ywm-red' : 'border-gray-300'
                          }`}>
                            {zakQuantity === '750' && <CheckCircle className="text-white" size={14} />}
                          </div>
                          <div>
                            <span className="font-bold text-ywm-dark text-lg">Pilihan 2</span>
                            <p className="text-sm text-gray-500 mt-0.5">40kg × 750 zak = <strong className="text-ywm-dark">30.000 kg (30 ton)</strong></p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="bg-red-100 text-ywm-red text-xs font-semibold px-2.5 py-1 rounded-full">30 ton</span>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/60">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Ringkasan Pesanan</p>
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
                  onClick={() => handleZakOrder(zakQuantity)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 transition-colors shadow-md hover:shadow-lg"
                >
                  <MessageCircle size={22} />
                  Pesan via WhatsApp
                </button>
              </div>
            </div>

            {/* Product 2: Semen Padang Bulk/Curah */}
            <div className="glass-frosted border border-white/60 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow animate-fade-in">
              {/* Product Image */}
              <div className="bg-gradient-to-br from-amber-50/80 to-orange-100/80 backdrop-blur-sm p-8 flex items-center justify-center h-64 relative">
                <div className="text-center">
                  <div className="w-36 h-36 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-3 border-2 border-amber-200">
                    <Truck className="text-amber-600" size={80} />
                  </div>
                  <p className="text-amber-700 text-sm font-medium">Pengiriman Bulk / Curah via Truk Tangki</p>
                </div>
                {/* Badges */}
                <div className="absolute top-4 left-4">
                  <span className="bg-amber-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md">Bulk</span>
                </div>
                <div className="absolute top-4 right-4">
                  <span className="bg-green-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
                    <CheckCircle size={12} />
                    Ready Stock
                  </span>
                </div>
              </div>

              {/* Product Details */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-ywm-dark mb-1">Semen Padang Bulk/Curah</h3>
                <p className="text-gray-500 text-sm mb-4">Pengiriman langsung dengan truk tangki</p>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                  Semen Padang Bulk/Curah untuk proyek skala besar yang membutuhkan pasokan semen dalam jumlah besar secara langsung.
                  Dikirim langsung dari pabrik pengantongan ke lokasi proyek Anda menggunakan truk tangki modern.
                  Ideal untuk proyek infrastruktur, readymix, dan konstruksi berskala besar.
                </p>

                {/* Specifications */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Shield className="text-amber-600" size={16} />
                    <span>SNI 15-2049 & ISO 9001:2015</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <TruckIcon className="text-amber-600" size={16} />
                    <span>Pengiriman langsung ke lokasi proyek</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Factory className="text-amber-600" size={16} />
                    <span>Dari pabrik pengantongan Krueng Geukueh</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Weight className="text-amber-600" size={16} />
                    <span>Minimum 1 ton — Maksimum 30 ton per pesanan</span>
                  </div>
                </div>

                {/* Benefits */}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-ywm-dark mb-3">Keunggulan Bulk/Curah:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      'Harga lebih efisien',
                      'Pengiriman langsung',
                      'Tanpa kemasan zak',
                      'Cocok untuk readymix',
                      'Efisiensi proyek besar',
                      'Minimal pemborosan',
                    ].map((benefit) => (
                      <div key={benefit} className="flex items-center gap-1.5 text-xs text-gray-600">
                        <CheckCircle className="text-amber-500 flex-shrink-0" size={14} />
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-amber-200 my-5" />

                {/* Tonnage Input */}
                <div className="mb-6">
                  <p className="text-sm font-semibold text-ywm-dark mb-3">Masukkan Jumlah (ton):</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        const newVal = Math.max(1, bulkTonnage - 1);
                        setBulkTonnage(newVal);
                        setBulkInput(newVal.toString());
                      }}
                      className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:border-amber-400 hover:bg-amber-50 transition-colors"
                    >
                      <Minus size={18} />
                    </button>
                    <div className="flex-1 relative">
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={bulkInput}
                        onChange={(e) => handleBulkInputChange(e.target.value)}
                        onBlur={handleBulkInputBlur}
                        className="w-full text-center text-2xl font-bold text-ywm-dark py-2 px-4 border-2 border-amber-300 rounded-xl focus:border-amber-500 focus:outline-none bg-amber-50/80 backdrop-blur-sm"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-amber-600 font-semibold text-sm">
                        ton
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        const newVal = Math.min(30, bulkTonnage + 1);
                        setBulkTonnage(newVal);
                        setBulkInput(newVal.toString());
                      }}
                      className="w-12 h-12 rounded-xl border-2 border-gray-200 flex items-center justify-center hover:border-amber-400 hover:bg-amber-50 transition-colors"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                  {/* Slider */}
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={bulkTonnage}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setBulkTonnage(val);
                      setBulkInput(val.toString());
                    }}
                    className="w-full mt-3 accent-amber-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>1 ton</span>
                    <span>Maks. 30 ton</span>
                  </div>
                  {/* Validation hint */}
                  {(bulkTonnage < 1 || bulkTonnage > 30) && (
                    <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                      <Info size={12} />
                      Jumlah harus antara 1–30 ton
                    </p>
                  )}
                </div>

                {/* Order Summary */}
                <div className="bg-white/50 backdrop-blur-sm rounded-xl p-4 mb-4 border border-white/60">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Ringkasan Pesanan</p>
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

      {/* Delivery Information */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-ywm-dark mb-4">
              Informasi <span className="text-ywm-red">Pengiriman</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Kami melayani pengiriman semen ke seluruh wilayah Aceh dan Sumatera Utara
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="glass-frosted text-center p-6 rounded-2xl animate-fade-in border border-white/60">
              <div className="w-16 h-16 bg-ywm-red rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="text-white" size={32} />
              </div>
              <h3 className="font-semibold text-ywm-dark mb-2 text-lg">Pengiriman Zak</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Pengiriman semen dalam zak menggunakan truk pengangkut yang siap dikirim ke lokasi proyek Anda.
                Tersedia dalam pilihan 250 zak (10 ton) dan 750 zak (30 ton).
              </p>
            </div>

            <div className="glass-frosted text-center p-6 rounded-2xl animate-fade-in border border-white/60">
              <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <TruckIcon className="text-white" size={32} />
              </div>
              <h3 className="font-semibold text-ywm-dark mb-2 text-lg">Pengiriman Bulk</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Pengiriman semen curah langsung dari pabrik menggunakan truk tangki khusus.
                Minimum 1 ton hingga maksimum 30 ton per pengiriman.
              </p>
            </div>

            <div className="glass-frosted text-center p-6 rounded-2xl animate-fade-in border border-white/60">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="text-white" size={32} />
              </div>
              <h3 className="font-semibold text-ywm-dark mb-2 text-lg">Wilayah Jangkauan</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Melayani pengiriman ke seluruh wilayah Aceh dan Sumatera Utara.
                Lokasi strategis di Pelabuhan Krueng Geukueh memudahkan distribusi.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quality Standards */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-ywm-dark mb-4">
              Standar <span className="text-ywm-red">Kualitas</span>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Setiap produk kami memenuhi standar nasional dan internasional
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <div className="glass-frosted text-center p-6 rounded-2xl animate-fade-in border border-white/60">
              <div className="w-16 h-16 bg-ywm-red rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="text-white" size={32} />
              </div>
              <h3 className="font-semibold text-ywm-dark mb-2">ISO 9001:2015</h3>
              <p className="text-gray-600 text-sm">Sistem Manajemen Kualitas Internasional</p>
            </div>

            <div className="glass-frosted text-center p-6 rounded-2xl animate-fade-in border border-white/60">
              <div className="w-16 h-16 bg-ywm-red rounded-full flex items-center justify-center mx-auto mb-4">
                <BadgeCheck className="text-white" size={32} />
              </div>
              <h3 className="font-semibold text-ywm-dark mb-2">SNI 15-2049</h3>
              <p className="text-gray-600 text-sm">Standar Nasional Indonesia Semen</p>
            </div>

            <div className="glass-frosted text-center p-6 rounded-2xl animate-fade-in border border-white/60">
              <div className="w-16 h-16 bg-ywm-red rounded-full flex items-center justify-center mx-auto mb-4">
                <Factory className="text-white" size={32} />
              </div>
              <h3 className="font-semibold text-ywm-dark mb-2">Quality Control</h3>
              <p className="text-gray-600 text-sm">Pengujian Laboratorium Setiap Batch</p>
            </div>

            <div className="glass-frosted text-center p-6 rounded-2xl animate-fade-in border border-white/60">
              <div className="w-16 h-16 bg-ywm-red rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="text-white" size={32} />
              </div>
              <h3 className="font-semibold text-ywm-dark mb-2">Produksi 24/7</h3>
              <p className="text-gray-600 text-sm">Kapasitas 500 Ton/Hari</p>
            </div>
          </div>
        </div>
      </section>

      {/* Konsultasi / CTA Section */}
      <section className="py-20 bg-gradient-to-r from-ywm-red to-red-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-12 max-w-3xl mx-auto">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <HeadphonesIcon className="text-white" size={32} />
            </div>
            <h2 className="text-4xl font-bold mb-6">
              Butuh Konsultasi Produk?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
              Tim ahli kami siap membantu Anda memilih produk dan jumlah yang tepat untuk kebutuhan proyek Anda.
              Konsultasi gratis via WhatsApp.
            </p>
            <a
              href={`${WHATSAPP_BASE_URL}?text=${encodeURIComponent('Halo PT Yoga Wibawa Mandiri, saya ingin konsultasi mengenai produk semen Anda. Mohon informasi lebih lanjut.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-white/90 backdrop-blur-md text-ywm-red px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white transition-colors transform hover:scale-105 shadow-lg"
            >
              <MessageCircle size={24} />
              Konsultasi via WhatsApp
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Products;
