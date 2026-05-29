// ============================================================
// DashboardSidebar — Bright glassmorphic frosted glass sidebar
// ============================================================

import React from 'react';
import { cn } from '@/lib/utils';
import type { DashboardModule } from '@/types/dashboard';
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
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

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
];

interface DashboardSidebarProps {
  activeModule: DashboardModule;
  onModuleChange: (mod: DashboardModule) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  unreadCount: number;
  onNotificationClick?: () => void;
}

export default function DashboardSidebar({
  activeModule,
  onModuleChange,
  collapsed,
  onToggleCollapse,
  unreadCount,
  onNotificationClick,
}: DashboardSidebarProps) {
  return (
    <aside
      className={cn(
        'h-screen sticky top-0 backdrop-blur-2xl bg-white/40 border-r border-white/60 transition-all duration-300 flex flex-col z-20',
        'hidden md:flex shadow-lg shadow-black/[0.03]',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      {/* Logo / Title */}
      <div className="px-4 py-5 border-b border-slate-200/40 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-cyan-500/20">
          <span className="text-white font-bold text-sm">YWM</span>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-slate-800 font-semibold text-sm truncate">YWM Dashboard</h1>
            <p className="text-slate-400 text-xs truncate">PT. Yoga Wibawa Mandiri</p>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-3 overflow-y-auto custom-scrollbar">
        {MODULES.map((mod) => {
          const isActive = activeModule === mod.id;
          const isNotif = mod.id === 'notifications';
          return (
            <button
              key={mod.id}
              onClick={() => {
                if (isNotif && onNotificationClick) {
                  onNotificationClick();
                } else {
                  onModuleChange(mod.id);
                }
              }}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl transition-all duration-200 text-left',
                'max-w-[calc(100%-16px)]',
                isActive && !isNotif
                  ? 'bg-gradient-to-r from-cyan-500/15 to-cyan-400/10 text-cyan-700 shadow-[0_0_15px_rgba(6,182,212,0.12)] border border-cyan-200/40'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'
              )}
              title={collapsed ? mod.label : undefined}
            >
              <span className="flex-shrink-0 relative">
                {mod.icon}
                {isNotif && unreadCount > 0 && collapsed && (
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </span>
              {!collapsed && (
                <span className="text-sm truncate">{mod.label}</span>
              )}
              {!collapsed && isNotif && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-slate-200/40 p-3 flex flex-col gap-1">
        <button
          onClick={() => window.open('/', '_blank')}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white/40 transition-all text-sm"
          title="Kembali ke Website"
        >
          <ExternalLink size={18} />
          {!collapsed && <span>Website Utama</span>}
        </button>
        <button
          onClick={onToggleCollapse}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-white/40 transition-all text-sm"
          title={collapsed ? 'Perluas Sidebar' : 'Perkecil Sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span>Perkecil</span>}
        </button>
      </div>
    </aside>
  );
}
