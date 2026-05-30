// ============================================================
// DashboardContext — Provides onModuleChange callback to
// deeply nested module components (e.g., OverviewModule)
// ============================================================

import { createContext, useContext } from 'react';
import type { DashboardModule } from '@/types/dashboard';

interface DashboardContextType {
  onModuleChange: (mod: DashboardModule) => void;
}

export const DashboardContext = createContext<DashboardContextType>({
  onModuleChange: () => {},
});

export function useDashboardContext() {
  return useContext(DashboardContext);
}
