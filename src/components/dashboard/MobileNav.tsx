// ============================================================
// MobileNav — Bright glassmorphic mobile navigation drawer
// Opens as a Sheet from the left, contains same nav items as sidebar
// Shows YWM logo at top, Install App button at bottom
// ============================================================

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import type { DashboardModule } from '@/types/dashboard';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  LayoutDashboard,
  Package,
  Users,
  Wrench,
  Droplets,
  Cylinder,
  ClipboardCheck,
  FileText,
  BarChart3,
  Bell,
  Menu,
  ExternalLink,
  Factory,
  Wallet,
  ShieldCheck,
  UserCog,
} from 'lucide-react';
import InstallPWAButton from './InstallPWAButton';

const MODULES: { id: DashboardModule; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Ringkasan', icon: <LayoutDashboard size={20} /> },
  { id: 'spare-parts', label: 'Suku Cadang', icon: <Package size={20} /> },
  { id: 'team-activity', label: 'Aktivitas Tim', icon: <Users size={20} /> },
  { id: 'maintenance', label: 'Perawatan', icon: <Wrench size={20} /> },
  { id: 'pispot', label: 'Pispot (Pelumasan)', icon: <Droplets size={20} /> },
  { id: 'silo-calculation', label: 'Kalkulasi Silo', icon: <Cylinder size={20} /> },
  { id: 'silo-opname', label: 'Opname Silo', icon: <ClipboardCheck size={20} /> },
  { id: 'documents', label: 'Dokumen & OCR', icon: <FileText size={20} /> },
  { id: 'analytics', label: 'Analitik', icon: <BarChart3 size={20} /> },
  { id: 'notifications', label: 'Notifikasi', icon: <Bell size={20} /> },
  { id: 'production', label: 'Produksi', icon: <Factory size={20} /> },
  { id: 'finance', label: 'Keuangan', icon: <Wallet size={20} /> },
  { id: 'safety', label: 'Keselamatan (HSE)', icon: <ShieldCheck size={20} /> },
  { id: 'hr', label: 'SDM / Payroll', icon: <UserCog size={20} /> },
];

interface MobileNavProps {
  activeModule: DashboardModule;
  onModuleChange: (mod: DashboardModule) => void;
  unreadCount: number;
  onNotificationClick?: () => void;
}

export default function MobileNav({
  activeModule,
  onModuleChange,
  unreadCount,
  onNotificationClick,
}: MobileNavProps) {
  const [open, setOpen] = useState(false);

  const handleModuleChange = (mod: DashboardModule) => {
    onModuleChange(mod);
    setOpen(false);
  };

  const handleNavClick = (mod: DashboardModule) => {
    if (mod === 'notifications' && onNotificationClick) {
      onNotificationClick();
      setOpen(false);
    } else {
      handleModuleChange(mod);
    }
  };

  return (
    <>
      {/* Hamburger Menu Button — visible only on mobile */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed top-3 left-3 z-40 p-2.5 rounded-xl
          bg-white/50 backdrop-blur-xl border border-white/60
          text-slate-600 hover:text-slate-800 hover:bg-white/70
          transition-all duration-200 shadow-lg shadow-black/[0.05]"
        aria-label="Buka Menu Navigasi"
      >
        <Menu size={22} />
      </button>

      {/* Mobile Navigation Sheet */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className={cn(
            'w-[280px] p-0',
            'bg-white/80 backdrop-blur-2xl',
            'border-r border-white/60'
          )}
        >
          {/* Logo / Title */}
          <SheetHeader className="px-4 py-5 border-b border-slate-200/40 space-y-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center flex-shrink-0
                shadow-md shadow-cyan-500/20">
                <span className="text-white font-bold text-sm">YWM</span>
              </div>
              <div>
                <SheetTitle className="text-slate-800 font-semibold text-sm text-left">
                  YWM Dashboard
                </SheetTitle>
                <p className="text-slate-400 text-xs">PT. Yoga Wibawa Mandiri</p>
              </div>
            </div>
          </SheetHeader>

          {/* Active Module Indicator */}
          <div className="px-4 py-2.5 border-b border-slate-200/30">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
              <span className="text-cyan-600 text-xs font-medium">
                {MODULES.find((m) => m.id === activeModule)?.label || 'Ringkasan'}
              </span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 py-2 overflow-y-auto custom-scrollbar" style={{ maxHeight: 'calc(100vh - 220px)' }}>
            {MODULES.map((mod) => {
              const isActive = activeModule === mod.id;
              return (
                <button
                  key={mod.id}
                  onClick={() => handleNavClick(mod.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all duration-200 text-left',
                    'max-w-[calc(100%-16px)]',
                    isActive && mod.id !== 'notifications'
                      ? 'bg-gradient-to-r from-cyan-500/15 to-cyan-400/10 text-cyan-700 border border-cyan-200/40'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'
                  )}
                >
                  <span className="flex-shrink-0">{mod.icon}</span>
                  <span className="text-sm truncate">{mod.label}</span>
                  {mod.id === 'notifications' && unreadCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-500" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="border-t border-slate-200/40 p-3 space-y-2">
            {/* Install App Button */}
            <InstallPWAButton variant="compact" />

            {/* Back to Website */}
            <button
              onClick={() => {
                window.open('/', '_blank');
                setOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white/40 transition-all text-sm"
            >
              <ExternalLink size={18} />
              <span>Website Utama</span>
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
