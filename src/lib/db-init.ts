// ============================================================
// Database Initialization Module — PT Yoga Wibawa Mandiri
// Handles first-run setup: check connection, verify tables,
// migrate localStorage data to Supabase, report status
// ============================================================

import { checkSupabaseConnection, autoCreateTables, ALL_TABLE_NAMES, type TableName } from '@/lib/supabase';
import { syncLocalToSupabase, checkDatabaseStatus, type DatabaseStatus } from '@/lib/supabase-data';

// ── Initialization State ──

export interface DbInitStatus {
  /** Whether initialization has been attempted */
  initialized: boolean;
  /** Whether Supabase is connected */
  connected: boolean;
  /** Tables that exist in Supabase */
  existingTables: string[];
  /** Tables that are missing */
  missingTables: string[];
  /** Number of records migrated from localStorage to Supabase */
  migratedRecords: number;
  /** Any error that occurred */
  error?: string;
  /** Timestamp of initialization */
  timestamp?: string;
}

// Singleton state to avoid re-initializing on every component mount
let _initStatus: DbInitStatus | null = null;
let _initPromise: Promise<DbInitStatus> | null = null;

/**
 * Initialize the database layer.
 * This should be called once on app startup.
 *
 * Steps:
 * 1. Check if Supabase is connected
 * 2. Check which tables exist
 * 3. Try to create missing tables (via RPC if available)
 * 4. Migrate localStorage data to Supabase
 * 5. Report initialization status
 *
 * @returns DbInitStatus with the result of initialization
 */
export async function initializeDatabase(): Promise<DbInitStatus> {
  // Return cached result if already initialized
  if (_initStatus) {
    return _initStatus;
  }

  // Deduplicate concurrent calls
  if (_initPromise) {
    return _initPromise;
  }

  _initPromise = _doInitialize();

  try {
    _initStatus = await _initPromise;
    return _initStatus;
  } catch (err) {
    _initStatus = {
      initialized: true,
      connected: false,
      existingTables: [],
      missingTables: [...ALL_TABLE_NAMES],
      migratedRecords: 0,
      error: err instanceof Error ? err.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    };
    return _initStatus;
  } finally {
    _initPromise = null;
  }
}

async function _doInitialize(): Promise<DbInitStatus> {
  const status: DbInitStatus = {
    initialized: true,
    connected: false,
    existingTables: [],
    missingTables: [],
    migratedRecords: 0,
    timestamp: new Date().toISOString(),
  };

  // Step 1: Check Supabase connection
  try {
    const connectionCheck = await checkSupabaseConnection();
    status.connected = connectionCheck.connected;
    status.existingTables = connectionCheck.tables;
    status.missingTables = connectionCheck.missingTables;
    status.error = connectionCheck.error;

    if (!connectionCheck.connected) {
      console.warn('[YWM DB Init] Supabase not connected. Running in localStorage-only mode.');
      return status;
    }

    console.info(`[YWM DB Init] Connected to Supabase. ${connectionCheck.tables.length} tables exist, ${connectionCheck.missingTables.length} missing.`);
  } catch (err) {
    console.warn('[YWM DB Init] Connection check failed:', err);
    status.error = err instanceof Error ? err.message : 'Connection check failed';
    status.missingTables = [...ALL_TABLE_NAMES];
    return status;
  }

  // Step 2: Try to create missing tables
  if (status.missingTables.length > 0) {
    try {
      console.info(`[YWM DB Init] Attempting to create ${status.missingTables.length} missing tables...`);
      const createResults = await autoCreateTables();

      // Recalculate existing/missing
      status.existingTables = [];
      status.missingTables = [];

      for (const [table, exists] of Object.entries(createResults)) {
        if (exists) {
          status.existingTables.push(table);
        } else {
          status.missingTables.push(table);
        }
      }

      if (status.missingTables.length > 0) {
        console.warn(
          `[YWM DB Init] Could not create ${status.missingTables.length} tables: ${status.missingTables.join(', ')}. ` +
          `Please run supabase/schema.sql in the Supabase SQL Editor.`
        );
      } else {
        console.info('[YWM DB Init] All tables created successfully.');
      }
    } catch (err) {
      console.warn('[YWM DB Init] Auto-create tables failed:', err);
    }
  }

  // Step 3: Migrate localStorage data to Supabase
  if (status.existingTables.length > 0) {
    try {
      console.info('[YWM DB Init] Migrating localStorage data to Supabase...');
      const migrationResults = await syncLocalToSupabase();
      const totalMigrated = Object.values(migrationResults).reduce((sum, count) => sum + count, 0);
      status.migratedRecords = totalMigrated;

      if (totalMigrated > 0) {
        console.info(`[YWM DB Init] Migrated ${totalMigrated} records to Supabase:`, migrationResults);
      } else {
        console.info('[YWM DB Init] No localStorage data to migrate.');
      }
    } catch (err) {
      console.warn('[YWM DB Init] Data migration failed:', err);
    }
  }

  console.info('[YWM DB Init] Initialization complete:', {
    connected: status.connected,
    tables: status.existingTables.length,
    missing: status.missingTables.length,
    migrated: status.migratedRecords,
  });

  return status;
}

/**
 * Get the current initialization status without re-running initialization.
 *
 * @returns DbInitStatus or null if not yet initialized
 */
export function getInitStatus(): DbInitStatus | null {
  return _initStatus;
}

/**
 * Force a re-initialization of the database.
 * Clears the cached status and re-runs the full initialization flow.
 *
 * @returns DbInitStatus with the result of re-initialization
 */
export async function reinitializeDatabase(): Promise<DbInitStatus> {
  _initStatus = null;
  _initPromise = null;
  return initializeDatabase();
}

/**
 * Check the current database status (thin wrapper for convenience).
 *
 * @returns DatabaseStatus with connection info
 */
export async function getDatabaseStatus(): Promise<DatabaseStatus> {
  return checkDatabaseStatus();
}

/**
 * Check if a specific table exists in the database.
 *
 * @param tableName - The table to check
 * @returns Whether the table exists
 */
export function isTableReady(tableName: TableName): boolean {
  if (!_initStatus) return false;
  return _initStatus.existingTables.includes(tableName);
}
