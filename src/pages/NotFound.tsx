import Layout from '@/components/Layout';
import { Link } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    if (import.meta.env.DEV) console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-red-700 mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-6">Halaman tidak ditemukan</p>
          <Link to="/" className="bg-red-700 text-white px-6 py-3 rounded-lg hover:bg-red-800 transition-colors font-semibold">
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
