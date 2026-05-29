// ============================================================
// Dashboard.tsx — Main dashboard page with module routing
// ============================================================

import { useState, useEffect, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import type { DashboardModule } from '@/types/dashboard';
import { initializeSampleData } from '@/lib/dashboard-storage';
import LoadingSpinner from '@/components/LoadingSpinner';

// Lazy-loaded module components
const OverviewModule = lazy(() => import('@/components/dashboard/modules/OverviewModule'));
const SparePartsModule = lazy(() => import('@/components/dashboard/modules/SparePartsModule'));
const TeamActivityModule = lazy(() => import('@/components/dashboard/modules/TeamActivityModule'));
const MaintenanceModule = lazy(() => import('@/components/dashboard/modules/MaintenanceModule'));
const ProductionModule = lazy(() => import('@/components/dashboard/modules/ProductionModule'));
const SafetyModule = lazy(() => import('@/components/dashboard/modules/SafetyModule'));
const FinanceModule = lazy(() => import('@/components/dashboard/modules/FinanceModule'));
const HrModule = lazy(() => import('@/components/dashboard/modules/HrModule'));
const DocumentsModule = lazy(() => import('@/components/dashboard/modules/DocumentsModule'));
const AnalyticsModule = lazy(() => import('@/components/dashboard/modules/AnalyticsModule'));
const NotificationsModule = lazy(() => import('@/components/dashboard/modules/NotificationsModule'));

const MODULE_MAP: Record<DashboardModule, React.LazyExoticComponent<React.ComponentType>> = {
  overview: OverviewModule,
  'spare-parts': SparePartsModule,
  'team-activity': TeamActivityModule,
  maintenance: MaintenanceModule,
  production: ProductionModule,
  safety: SafetyModule,
  finance: FinanceModule,
  hr: HrModule,
  documents: DocumentsModule,
  analytics: AnalyticsModule,
  notifications: NotificationsModule,
};

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const moduleParam = searchParams.get('module') as DashboardModule | null;

  const [activeModule, setActiveModule] = useState<DashboardModule>(
    moduleParam && MODULE_MAP[moduleParam] ? moduleParam : 'overview'
  );

  // Initialize sample data on first load
  useEffect(() => {
    initializeSampleData();
  }, []);

  // Sync URL params with active module
  useEffect(() => {
    if (moduleParam && MODULE_MAP[moduleParam] && moduleParam !== activeModule) {
      setActiveModule(moduleParam);
    }
  }, [moduleParam]);

  const handleModuleChange = (mod: DashboardModule) => {
    setActiveModule(mod);
    setSearchParams({ module: mod });
  };

  const ActiveComponent = MODULE_MAP[activeModule];

  return (
    <DashboardLayout activeModule={activeModule} onModuleChange={handleModuleChange}>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-full min-h-[60vh]">
            <LoadingSpinner />
          </div>
        }
      >
        <ActiveComponent />
      </Suspense>
    </DashboardLayout>
  );
}
