
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { name: 'Beranda', path: '/' },
    { name: 'Tentang Kami', path: '/tentang' },
    { name: 'Layanan', path: '/layanan' },
    { name: 'Galeri', path: '/galeri' },
    { name: 'Lokasi', path: '/lokasi' },
    { name: 'Kontak', path: '/kontak' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo PT. YWM */}
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/5f8e0e82-2031-4a9f-b848-f05d23c37cf2.png" 
              alt="PT. Yoga Wibawa Mandiri Logo"
              className="w-16 h-16 rounded-xl shadow-lg"
            />
            <div className="ml-4">
              <h1 className="text-ywm-dark font-bold text-xl">PT. Yoga Wibawa Mandiri</h1>
              <p className="text-gray-600 text-sm">Pengantongan Semen Padang Lhokseumawe</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`font-medium transition-all duration-300 hover:text-ywm-red transform hover:scale-105 ${
                  isActive(item.path) ? 'text-ywm-red border-b-2 border-ywm-red pb-1' : 'text-ywm-dark'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Logo Semen Padang */}
          <div className="hidden lg:flex items-center">
            <img 
              src="/lovable-uploads/35616003-ad4f-4d69-940c-91a3a5a41f07.png" 
              alt="Semen Padang Logo"
              className="w-16 h-16 rounded-xl shadow-lg mr-4"
            />
            <div>
              <p className="text-ywm-dark font-bold text-lg">Semen Padang</p>
              <p className="text-gray-600 text-sm">Mitra Resmi</p>
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
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
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
              {/* Mobile Logo Semen Padang */}
              <div className="flex items-center justify-center pt-4 border-t border-gray-200">
                <img 
                  src="/lovable-uploads/35616003-ad4f-4d69-940c-91a3a5a41f07.png" 
                  alt="Semen Padang Logo"
                  className="w-12 h-12 rounded-lg mr-3"
                />
                <div>
                  <p className="text-ywm-dark font-semibold text-sm">Semen Padang</p>
                  <p className="text-gray-600 text-xs">Mitra Resmi</p>
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
