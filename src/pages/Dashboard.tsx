// ============================================================
// Dashboard.tsx — Main dashboard page with module routing
// Updated: Removed initializeSampleData, added database connection check
// ============================================================

import { useState, useEffect, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import type { DashboardModule } from '@/types/dashboard';
import { initializeDatabase } from '@/lib/db-init';
import { checkDatabaseStatus, type DatabaseStatus } from '@/lib/supabase-data';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

// Lazy-loaded module components
const OverviewModule = lazy(() => import('@/components/dashboard/modules/OverviewModule'));
const SparePartsModule = lazy(() => import('@/components/dashboard/modules/SparePartsModule'));
const TeamActivityModule = lazy(() => import('@/components/dashboard/modules/TeamActivityModule'));
const MaintenanceModule = lazy(() => import('@/components/dashboard/modules/MaintenanceModule'));
const PispotModule = lazy(() => import('@/components/dashboard/modules/PispotModule'));
const SiloCalculationModule = lazy(() => import('@/components/dashboard/modules/SiloCalculationModule'));
const SiloOpnameModule = lazy(() => import('@/components/dashboard/modules/SiloOpnameModule'));
const DocumentsModule = lazy(() => import('@/components/dashboard/modules/DocumentsModule'));
const AnalyticsModule = lazy(() => import('@/components/dashboard/modules/AnalyticsModule'));
const NotificationsModule = lazy(() => import('@/components/dashboard/modules/NotificationsModule'));
const ProductionModule = lazy(() => import('@/components/dashboard/modules/ProductionModule'));
const FinanceModule = lazy(() => import('@/components/dashboard/modules/FinanceModule'));
const SafetyModule = lazy(() => import('@/components/dashboard/modules/SafetyModule'));
const HrModule = lazy(() => import('@/components/dashboard/modules/HrModule'));

const MODULE_MAP: Record<DashboardModule, React.LazyExoticComponent<React.ComponentType>> = {
  overview: OverviewModule,
  'spare-parts': SparePartsModule,
  'team-activity': TeamActivityModule,
  maintenance: MaintenanceModule,
  pispot: PispotModule,
  'silo-calculation': SiloCalculationModule,
  'silo-opname': SiloOpnameModule,
  documents: DocumentsModule,
  analytics: AnalyticsModule,
  notifications: NotificationsModule,
  production: ProductionModule,
  finance: FinanceModule,
  safety: SafetyModule,
  hr: HrModule,
};

export default function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const moduleParam = searchParams.get('module') as DashboardModule | null;

  const [activeModule, setActiveModule] = useState<DashboardModule>(
    moduleParam && MODULE_MAP[moduleParam] ? moduleParam : 'overview'
  );

  const [dbStatus, setDbStatus] = useState<DatabaseStatus | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Initialize database on mount
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // Run database initialization (check connection, migrate data)
        await initializeDatabase();

        if (cancelled) return;

        // Check database status for UI indicator
        const status = await checkDatabaseStatus();
        if (!cancelled) {
          setDbStatus(status);
        }
      } catch (err) {
        console.warn('[YWM Dashboard] Database initialization error:', err);
        if (!cancelled) {
          setDbStatus({
            connected: false,
            tables: [],
            lastSync: null,
            error: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      } finally {
        if (!cancelled) {
          setInitializing(false);
        }
      }
    }

    init();
    return () => { cancelled = true; };
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

  const handleRefreshConnection = async () => {
    setInitializing(true);
    try {
      const status = await checkDatabaseStatus();
      setDbStatus(status);
    } catch {
      setDbStatus({
        connected: false,
        tables: [],
        lastSync: null,
        error: 'Connection check failed',
      });
    } finally {
      setInitializing(false);
    }
  };

  const ActiveComponent = MODULE_MAP[activeModule];

  return (
    <DashboardLayout activeModule={activeModule} onModuleChange={handleModuleChange}>
      {/* Database Connection Status Indicator */}
      <div className="fixed top-2 right-2 z-50">
        {initializing ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 text-[10px]">
            <RefreshCw size={10} className="animate-spin" />
            <span>Checking DB...</span>
          </div>
        ) : dbStatus?.connected ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px]" title={`Connected: ${dbStatus.tables.length} tables${dbStatus.lastSync ? ` | Last sync: ${new Date(dbStatus.lastSync).toLocaleTimeString()}` : ''}`}>
            <Wifi size={10} />
            <span>DB Online ({dbStatus.tables.length})</span>
          </div>
        ) : (
          <button
            onClick={handleRefreshConnection}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] hover:bg-amber-500/20 transition-colors"
            title={dbStatus?.error || 'Database not connected — using localStorage'}
          >
            <WifiOff size={10} />
            <span>Local Mode</span>
          </button>
        )}
      </div>

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
