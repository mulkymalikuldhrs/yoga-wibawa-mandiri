
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Code, ShoppingBag } from 'lucide-react';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigationItems = [
    { name: 'Beranda', path: '/' },
    { name: 'Tentang Kami', path: '/tentang' },
    { name: 'Layanan', path: '/layanan' },
    { name: 'Produk', path: '/produk' },
    { name: 'Galeri', path: '/galeri' },
    { name: 'Lokasi', path: '/lokasi' },
    { name: 'Kontak', path: '/kontak' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white/70 backdrop-blur-xl border-b border-white/50 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo PT. YWM — Primary */}
          <div className="flex items-center">
            <img 
              src="/sp-black.png"
              alt="Semen Padang"
              className="w-14 h-14 rounded-xl shadow-lg object-contain bg-white p-1"
            />
            <div className="ml-3">
              <h1 className="text-slate-800 font-bold text-lg leading-tight">PT. Yoga Wibawa Mandiri</h1>
              <p className="text-slate-500 text-sm">Pengantongan Semen Padang Lhokseumawe</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`font-medium transition-all duration-300 hover:text-cyan-600 transform hover:scale-105 ${
                  isActive(item.path) ? 'text-cyan-600 border-b-2 border-cyan-500 pb-1' : 'text-slate-600'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right side: Mitra Resmi badge + Developer credit */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Mitra Resmi badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50/80 rounded-lg border border-slate-200/50">
              <span className="text-slate-500 text-xs font-medium">Mitra Resmi</span>
              <span className="text-slate-700 text-xs font-bold">Semen Padang</span>
            </div>

            {/* Developer Credit */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-cyan-50 to-purple-50 rounded-lg border border-cyan-200/40">
              <Code className="text-cyan-600" size={14} />
              <div>
                <p className="text-slate-600 text-[10px] leading-tight">Developer</p>
                <p className="text-cyan-700 text-xs font-semibold leading-tight">Tim Teknik | Mulky Malikul Dhaher</p>
              </div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden pb-4 animate-fade-in">
            <div className="bg-slate-50/80 backdrop-blur-xl rounded-lg p-4 space-y-2 border border-slate-200/50">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`block py-3 px-4 rounded-lg font-medium transition-all duration-300 hover:bg-cyan-500 hover:text-white ${
                    isActive(item.path) ? 'bg-cyan-500 text-white' : 'text-slate-700 hover:pl-6'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {/* Mobile: Mitra Resmi badge */}
              <div className="flex items-center justify-center pt-4 border-t border-slate-200/50">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 rounded-lg">
                  <span className="text-slate-500 text-xs">Mitra Resmi</span>
                  <span className="text-slate-700 text-xs font-bold">Semen Padang</span>
                </div>
              </div>
              {/* Mobile: Developer Credit */}
              <div className="flex items-center justify-center pt-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-cyan-50 to-purple-50 rounded-lg border border-cyan-200/40">
                  <Code className="text-cyan-600" size={14} />
                  <div>
                    <p className="text-slate-500 text-[10px] leading-tight">Developer</p>
                    <p className="text-cyan-700 text-xs font-semibold leading-tight">Tim Teknik | Mulky Malikul Dhaher</p>
                  </div>
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
