// ============================================================
// DashboardSidebar — Frosted glass navigation sidebar
// ============================================================

import React from 'react';
import { cn } from '@/lib/utils';
import type { DashboardModule } from '@/types/dashboard';
import {
  LayoutDashboard,
  Package,
  Users,
  Wrench,
  Factory,
  ShieldCheck,
  Wallet,
  UserCog,
  FileText,
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

const MODULES: { id: DashboardModule; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Ringkasan', icon: <LayoutDashboard size={20} /> },
  { id: 'spare-parts', label: 'Suku Cadang', icon: <Package size={20} /> },
  { id: 'team-activity', label: 'Aktivitas Tim', icon: <Users size={20} /> },
  { id: 'maintenance', label: 'Perawatan', icon: <Wrench size={20} /> },
  { id: 'production', label: 'Produksi', icon: <Factory size={20} /> },
  { id: 'safety', label: 'Keselamatan (HSE)', icon: <ShieldCheck size={20} /> },
  { id: 'finance', label: 'Keuangan', icon: <Wallet size={20} /> },
  { id: 'hr', label: 'SDM / Payroll', icon: <UserCog size={20} /> },
  { id: 'documents', label: 'Dokumen & OCR', icon: <FileText size={20} /> },
  { id: 'analytics', label: 'Analitik', icon: <BarChart3 size={20} /> },
  { id: 'notifications', label: 'Notifikasi', icon: <Bell size={20} /> },
];

interface DashboardSidebarProps {
  activeModule: DashboardModule;
  onModuleChange: (mod: DashboardModule) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  unreadCount: number;
}

export default function DashboardSidebar({
  activeModule,
  onModuleChange,
  collapsed,
  onToggleCollapse,
  unreadCount,
}: DashboardSidebarProps) {
  return (
    <aside
      className={cn(
        'h-screen sticky top-0 backdrop-blur-xl bg-white/5 border-r border-white/10 transition-all duration-300 flex flex-col z-20',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      {/* Logo / Title */}
      <div className="px-4 py-5 border-b border-white/10 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
          <span className="text-cyan-400 font-bold text-sm">YWM</span>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-white font-semibold text-sm truncate">YWM Dashboard</h1>
            <p className="text-white/40 text-xs truncate">PT. Yoga Wibawa Mandiri</p>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-3 overflow-y-auto custom-scrollbar">
        {MODULES.map((mod) => {
          const isActive = activeModule === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => onModuleChange(mod.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl transition-all duration-200 text-left',
                'max-w-[calc(100%-16px)]',
                isActive
                  ? 'bg-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(0,212,255,0.1)]'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              )}
              title={collapsed ? mod.label : undefined}
            >
              <span className="flex-shrink-0">{mod.icon}</span>
              {!collapsed && (
                <span className="text-sm truncate">{mod.label}</span>
              )}
              {!collapsed && mod.id === 'notifications' && unreadCount > 0 && (
                <span className="ml-auto bg-red-500/80 text-white text-xs px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-white/10 p-3 flex flex-col gap-1">
        <button
          onClick={() => window.open('/', '_blank')}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all text-sm"
          title="Kembali ke Website"
        >
          <ExternalLink size={18} />
          {!collapsed && <span>Website Utama</span>}
        </button>
        <button
          onClick={onToggleCollapse}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-white/50 hover:text-white hover:bg-white/5 transition-all text-sm"
          title={collapsed ? 'Perluas Sidebar' : 'Perkecil Sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span>Perkecil</span>}
        </button>
      </div>
    </aside>
  );
}
