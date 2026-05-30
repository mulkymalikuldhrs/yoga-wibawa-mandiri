import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import ChatBot from './ChatBot';
import WhatsAppButton from './WhatsAppButton';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen font-poppins bg-gray-50">
      <Header />
      <main className="relative">
        {children}
      </main>
      <Footer />
      <ChatBot />
      <WhatsAppButton />
    </div>
  );
};

export default Layout;