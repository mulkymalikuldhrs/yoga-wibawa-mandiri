// ============================================================
// DashboardLayout — Layout wrapper with sidebar + AI panel + Floating Chat
// WHITE/RED theme matching YWM website
// DB status indicator
// ============================================================

import React, { useState } from 'react';
import DashboardSidebar from './DashboardSidebar';
import AiAssistantPanel from './AiAssistantPanel';
import FloatingChatBot from './FloatingChatBot';
import type { DashboardModule } from '@/types/dashboard';

interface DashboardLayoutProps {
  activeModule: DashboardModule;
  onModuleChange: (mod: DashboardModule) => void;
  dbStatus: 'connected' | 'disconnected' | 'checking';
  unreadNotifs: number;
  children: React.ReactNode;
}

export default function DashboardLayout({
  activeModule,
  onModuleChange,
  dbStatus,
  unreadNotifs,
  children,
}: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <DashboardSidebar
        activeModule={activeModule}
        onModuleChange={onModuleChange}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((p) => !p)}
        unreadCount={unreadNotifs}
        dbStatus={dbStatus}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar-light">
        {children}
      </main>

      {/* AI Assistant Panel (side panel) */}
      <AiAssistantPanel
        isOpen={aiPanelOpen}
        onToggle={() => setAiPanelOpen((p) => !p)}
      />

      {/* Floating Chatbot — always available */}
      <FloatingChatBot />
    </div>
  );
}
