// ============================================================
// DashboardLayout — Layout wrapper with sidebar + AI panel
// ============================================================

import React, { useState } from 'react';
import DashboardSidebar from './DashboardSidebar';
import AiAssistantPanel from './AiAssistantPanel';
import type { DashboardModule } from '@/types/dashboard';

interface DashboardLayoutProps {
  activeModule: DashboardModule;
  onModuleChange: (mod: DashboardModule) => void;
  children: React.ReactNode;
}

export default function DashboardLayout({
  activeModule,
  onModuleChange,
  children,
}: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(true);
  const [unreadNotifs] = useState(0);

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
      {/* Sidebar */}
      <DashboardSidebar
        activeModule={activeModule}
        onModuleChange={onModuleChange}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((p) => !p)}
        unreadCount={unreadNotifs}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar">
        {children}
      </main>

      {/* AI Assistant Panel */}
      <AiAssistantPanel
        isOpen={aiPanelOpen}
        onToggle={() => setAiPanelOpen((p) => !p)}
      />
    </div>
  );
}
