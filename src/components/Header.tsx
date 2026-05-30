
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MessageCircle } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { name: 'Beranda', path: '/' },
    { name: 'Tentang Kami', path: '/tentang' },
    { name: 'Layanan', path: '/layanan' },
    { name: 'Produk', path: '/produk' },
    { name: 'Galeri', path: '/galeri'},
    { name: 'Lokasi', path: '/lokasi' },
    { name: 'Kontak', path: '/kontak' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-3">
          {/* Logo PT. YWM */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/lovable-uploads/ywm-logo.png" 
              alt="PT. Yoga Wibawa Mandiri Logo"
              className="w-14 h-14 rounded-full shadow-md object-contain group-hover:shadow-lg transition-shadow bg-white p-0.5"
            />
            <div>
              <h1 className="text-ywm-dark font-bold text-lg tracking-tight leading-tight">PT. Yoga Wibawa Mandiri</h1>
              <p className="text-gray-500 text-xs">Pengantongan Semen Padang | Aceh Utara</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`font-medium transition-all duration-300 hover:text-ywm-red text-sm ${
                  isActive(item.path) ? 'text-ywm-red border-b-2 border-ywm-red pb-0.5' : 'text-ywm-dark'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <a
              href="https://wa.me/6285322624048?text=Halo%2C%20saya%20ingin%20bertanya%20tentang%20produk%20Semen%20Padang"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#1EBE5A] text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg"
            >
              <MessageCircle size={16} />
              WhatsApp
            </a>
          </nav>

          {/* Logo Semen Padang */}
          <div className="hidden lg:flex items-center gap-3">
            <img 
              src="/lovable-uploads/35616003-ad4f-4d69-940c-91a3a5a41f07.png" 
              alt="Semen Padang Logo"
              className="w-12 h-12 rounded-xl shadow-md object-contain bg-white p-0.5"
            />
            <div>
              <p className="text-ywm-dark font-bold text-sm">Semen Padang</p>
              <p className="text-gray-500 text-xs">Mitra Resmi</p>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden pb-4 animate-fade-in">
            <div className="glass-card p-4 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block py-3 px-4 rounded-lg font-medium transition-all duration-300 hover:bg-ywm-red hover:text-white ${
                    isActive(item.path) ? 'bg-ywm-red text-white' : 'text-ywm-dark hover:pl-6'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {/* Mobile WhatsApp Button */}
              <a
                href="https://wa.me/6285322624048?text=Halo%2C%20saya%20ingin%20bertanya%20tentang%20produk%20Semen%20Padang"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1EBE5A] text-white font-semibold py-3 px-4 rounded-lg transition-all mt-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <MessageCircle size={18} />
                Pesan via WhatsApp
              </a>
              {/* Mobile Logo Semen Padang */}
              <div className="flex items-center justify-center pt-4 border-t border-gray-200">
                <img 
                  src="/lovable-uploads/35616003-ad4f-4d69-940c-91a3a5a41f07.png" 
                  alt="Semen Padang Logo"
                  className="w-10 h-10 rounded-lg mr-3 object-contain bg-white p-0.5"
                />
                <div>
                  <p className="text-ywm-dark font-semibold text-sm">Semen Padang</p>
                  <p className="text-gray-500 text-xs">Mitra Resmi</p>
                </div>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;
