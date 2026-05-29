// ============================================================
// DashboardLayout — Responsive layout wrapper
// Mobile: Full width + MobileNav drawer
// Tablet: Collapsed sidebar by default
// Desktop: Full sidebar + AI panel + Notifications
// ============================================================

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import DashboardSidebar from './DashboardSidebar';
import MobileNav from './MobileNav';
import AiAssistantPanel from './AiAssistantPanel';
import FloatingChatBot from './FloatingChatBot';
import InstallPWAButton from './InstallPWAButton';
import NotificationPopup from './NotificationPopup';
import NotificationCenter from './NotificationCenter';
import {
  NotificationProvider,
  useNotifications,
} from './NotificationProvider';
import type { DashboardModule } from '@/types/dashboard';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardLayoutProps {
  activeModule: DashboardModule;
  onModuleChange: (mod: DashboardModule) => void;
  children: React.ReactNode;
}

function DashboardLayoutInner({
  activeModule,
  onModuleChange,
  children,
}: DashboardLayoutProps) {
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const { unreadCount, setCenterOpen } = useNotifications();

  // Auto-collapse sidebar on tablet (< 1024px but >= 768px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="h-screen flex overflow-hidden bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e]">
      {/* Desktop Sidebar — hidden on mobile */}
      <DashboardSidebar
        activeModule={activeModule}
        onModuleChange={onModuleChange}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((p) => !p)}
        unreadCount={unreadCount}
        onNotificationClick={() => setCenterOpen(true)}
      />

      {/* Mobile Navigation — hidden on desktop */}
      <MobileNav
        activeModule={activeModule}
        onModuleChange={onModuleChange}
        unreadCount={unreadCount}
        onNotificationClick={() => setCenterOpen(true)}
      />

      {/* Main Content Area */}
      <main
        className={cn(
          'flex-1 overflow-y-auto custom-scrollbar',
          // Responsive padding
          isMobile ? 'px-3 pt-14 pb-20' : 'px-6 pt-6 pb-6 lg:px-8'
        )}
      >
        {children}

        {/* PWA Install Banner — mobile only, at bottom of content */}
        {isMobile && (
          <div className="mt-6">
            <InstallPWAButton variant="full" />
          </div>
        )}
      </main>

      {/* AI Assistant Panel (side panel) — hidden on mobile */}
      {!isMobile && (
        <AiAssistantPanel
          isOpen={aiPanelOpen}
          onToggle={() => setAiPanelOpen((p) => !p)}
        />
      )}

      {/* Floating Chatbot — always available */}
      <FloatingChatBot />

      {/* Notification Pop-ups (bottom-right, above chat button) */}
      <NotificationPopup />

      {/* Notification Center (Sheet/Drawer) */}
      <NotificationCenter />
    </div>
  );
}

export default function DashboardLayout(props: DashboardLayoutProps) {
  return (
    <NotificationProvider navigateToModule={props.onModuleChange}>
      <DashboardLayoutInner {...props} />
    </NotificationProvider>
  );
}
