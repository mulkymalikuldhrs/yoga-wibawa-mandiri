import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Code, MessageCircle } from 'lucide-react';

const Footer = () => {
  const navigationItems = [
    { name: 'Beranda', path: '/' },
    { name: 'Tentang Kami', path: '/tentang' },
    { name: 'Layanan', path: '/layanan' },
    { name: 'Produk', path: '/produk' },
    { name: 'Galeri', path: '/galeri' },
    { name: 'Lokasi', path: '/lokasi' },
    { name: 'Kontak', path: '/kontak' },
  ];

  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-2">
            <div className="flex items-center mb-6">
              <img 
                src="/sp-black.png"
                alt="Semen Padang"
                className="w-14 h-14 rounded-xl shadow-lg mr-4 object-contain bg-white p-1"
              />
              <div>
                <h3 className="font-bold text-xl tracking-tight">PT. Yoga Wibawa Mandiri</h3>
                <p className="text-gray-400 text-sm">Pengantongan Semen Padang | Aceh Utara</p>
              </div>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Perusahaan pengantongan Semen Padang PCC terpercaya di Aceh Utara dengan 
              fasilitas modern — 2 silo berkapasitas 500 ton, 2 mesin pengantongan Zak 40kg,
              serta distribusi yang luas di seluruh Aceh dan Sumatera Utara.
            </p>
            
            {/* Partnership Badge */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="px-3 py-2 bg-slate-800 rounded-lg border border-slate-700">
                <span className="text-gray-400 text-xs font-medium">Mitra Resmi</span>
                <span className="text-white text-sm font-bold ml-2">Semen Padang</span>
              </div>
            </div>

            {/* YWM AI Dashboard Badge */}
            <Link
              to="/dashboard"
              className="flex items-center space-x-3 mb-6 p-3 bg-gradient-to-r from-cyan-600 to-purple-600 rounded-lg hover:from-cyan-700 hover:to-purple-700 transition-all"
            >
              <Code className="text-white" size={20} />
              <div>
                <p className="text-white font-semibold text-sm">AI Dashboard</p>
                <p className="text-cyan-100 text-xs">AI-Powered Operations Management</p>
              </div>
            </Link>

            {/* WhatsApp Contact */}
            <a
              href="https://wa.me/6285322624048"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg transition-colors font-medium"
            >
              <MessageCircle size={18} />
              Chat WhatsApp
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-cyan-400">Navigasi</h4>
            <ul className="space-y-3">
              {navigationItems.map((item) => (
                <li key={item.path}>
                  <Link 
                    to={item.path} 
                    className="text-gray-300 hover:text-white hover:pl-2 transition-all duration-300 block text-sm"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link 
                  to="/dashboard" 
                  className="text-cyan-400 hover:text-cyan-300 hover:pl-2 transition-all duration-300 block font-medium"
                >
                  AI Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-cyan-400">Kontak Kami</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="text-cyan-400 mt-1" size={18} />
                <div>
                  <p className="text-gray-300 text-sm font-medium">Kantor Pusat:</p>
                  <p className="text-gray-400 text-sm">Jl. Paduan Tenaga No. 12, Medan</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="text-cyan-400 mt-1" size={18} />
                <div>
                  <p className="text-gray-300 text-sm font-medium">Packing Plant:</p>
                  <p className="text-gray-400 text-sm">Jl. Pelabuhan Umum, Kr. Geukuh<br />Aceh Utara, Aceh</p>
                </div>
              </div>
              <a href="https://wa.me/6285322624048" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 hover:text-white transition-colors">
                <Phone className="text-ywm-red shrink-0" size={18} />
                <div>
                  <p className="text-gray-300 text-sm font-medium">Pemesanan:</p>
                  <p className="text-gray-400 text-sm">+62 853-2262-4048</p>
                </div>
              </a>
              <a href="https://wa.me/6285322624038" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-3 hover:text-white transition-colors">
                <Phone className="text-ywm-red shrink-0" size={18} />
                <div>
                  <p className="text-gray-300 text-sm font-medium">Informasi:</p>
                  <p className="text-gray-400 text-sm">+62 853-2262-4038</p>
                </div>
              </a>
              <div className="flex items-center space-x-3">
                <Phone className="text-cyan-400" size={18} />
                <p className="text-gray-300 text-sm">+6285322624048</p>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="text-cyan-400" size={18} />
                <p className="text-gray-300 text-sm">info@ywm.co.id</p>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="text-cyan-400" size={18} />
                <p className="text-gray-300 text-sm">Senin - Jumat: 08:00 - 17:00</p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-300 text-sm text-center md:text-left">
              &copy; {new Date().getFullYear()} PT. Yoga Wibawa Mandiri. Semua hak cipta dilindungi.
            </p>
            <div className="text-center md:text-right">
              <p className="text-gray-400 text-xs mb-1">
                Developed by <span className="text-cyan-400 font-medium">Tim Teknik | Mulky Malikul Dhaher</span>
              </p>
              <p className="text-gray-500 text-xs">
                YWM AI Dashboard | React + TypeScript
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
