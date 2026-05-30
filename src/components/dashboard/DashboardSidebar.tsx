// ============================================================
// DashboardSidebar — White frosted glass navigation sidebar
// YWM Red accent theme matching website
// Includes Opname & Pispot modules
// ============================================================

import React from 'react';
import { cn } from '@/lib/utils';
import type { DashboardModule } from '@/types/dashboard';
import {
  LayoutDashboard,
  Package,
  Users,
  Wrench,
  ShieldCheck,
  FileText,
  Bell,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ClipboardCheck,
  Factory,
} from 'lucide-react';

const MODULES: { id: DashboardModule; label: string; icon: React.ReactNode }[] = [
  { id: 'overview', label: 'Ringkasan', icon: <LayoutDashboard size={20} /> },
  { id: 'spare-parts', label: 'Suku Cadang', icon: <Package size={20} /> },
  { id: 'team-activity', label: 'Aktivitas Tim', icon: <Users size={20} /> },
  { id: 'maintenance', label: 'Perawatan', icon: <Wrench size={20} /> },
  { id: 'safety', label: 'Keselamatan (HSE)', icon: <ShieldCheck size={20} /> },
  { id: 'opname', label: 'Stok Opname', icon: <ClipboardCheck size={20} /> },
  { id: 'pispot', label: 'Produksi Packer', icon: <Factory size={20} /> },
  { id: 'documents', label: 'Dokumen & OCR', icon: <FileText size={20} /> },
  { id: 'notifications', label: 'Notifikasi', icon: <Bell size={20} /> },
];

interface DashboardSidebarProps {
  activeModule: DashboardModule;
  onModuleChange: (mod: DashboardModule) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  unreadCount: number;
  dbStatus: 'connected' | 'disconnected' | 'checking';
}

export default function DashboardSidebar({
  activeModule,
  onModuleChange,
  collapsed,
  onToggleCollapse,
  unreadCount,
  dbStatus,
}: DashboardSidebarProps) {
  return (
    <aside
      className={cn(
        'h-screen sticky top-0 backdrop-blur-xl bg-white/95 border-r border-gray-200 transition-all duration-300 flex flex-col z-20 shadow-sm',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      {/* Logo / Title */}
      <div className="px-4 py-5 border-b border-gray-100 flex items-center gap-3">
        <img 
          src="/lovable-uploads/ywm-logo.png" 
          alt="YWM Logo"
          className="w-9 h-9 rounded-full object-contain flex-shrink-0"
        />
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-[#212121] font-semibold text-sm truncate">YWM Dashboard</h1>
            <div className="flex items-center gap-1.5">
              <div className={cn(
                'w-1.5 h-1.5 rounded-full',
                dbStatus === 'connected' ? 'bg-emerald-500' : dbStatus === 'disconnected' ? 'bg-red-500' : 'bg-yellow-500'
              )} />
              <p className="text-gray-400 text-xs truncate">
                {dbStatus === 'connected' ? 'Database Terhubung' : dbStatus === 'disconnected' ? 'Offline Mode' : 'Menyambung...'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-3 overflow-y-auto custom-scrollbar-light">
        {MODULES.map((mod) => {
          const isActive = activeModule === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => onModuleChange(mod.id)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5 mx-2 transition-all duration-200 text-left',
                'max-w-[calc(100%-16px)]',
                isActive
                  ? 'bg-red-50 text-red-600 border-l-4 border-red-600 font-medium rounded-r-xl'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-l-4 border-transparent rounded-r-xl'
              )}
              title={collapsed ? mod.label : undefined}
            >
              <span className={cn('flex-shrink-0', isActive ? 'text-red-600' : 'text-gray-400')}>{mod.icon}</span>
              {!collapsed && (
                <span className="text-sm truncate">{mod.label}</span>
              )}
              {!collapsed && mod.id === 'notifications' && unreadCount > 0 && (
                <span className="ml-auto bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="border-t border-gray-100 p-3 flex flex-col gap-1">
        <button
          onClick={() => window.open('/', '_blank')}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all text-sm"
          title="Kembali ke Website"
        >
          <ExternalLink size={18} />
          {!collapsed && <span>Website Utama</span>}
        </button>
        <button
          onClick={onToggleCollapse}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all text-sm"
          title={collapsed ? 'Perluas Sidebar' : 'Perkecil Sidebar'}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span>Perkecil</span>}
        </button>
      </div>
    </aside>
  );
}
