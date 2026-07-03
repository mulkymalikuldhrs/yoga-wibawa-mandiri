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
    <div className="min-h-screen font-poppins public-glassmorphic-bg">
      {/* Floating glassmorphic orbs for public site */}
      <div className="glassmorphic-orb-red" style={{ top: '30%', left: '5%' }} />
      <div className="glassmorphic-orb-light-amber" style={{ top: '60%', right: '5%' }} />
      <div className="glassmorphic-orb-light-emerald" style={{ bottom: '20%', left: '40%' }} />

      <Header />
      <main className="relative z-10">
        {children}
      </main>
      <Footer />
      <ChatBot />
      <WhatsAppButton />
    </div>
  );
};

export default Layout;