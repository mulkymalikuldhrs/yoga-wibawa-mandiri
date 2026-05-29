// ============================================================
// Supabase Client — PT Yoga Wibawa Mandiri
// Database persistence layer for all dashboard modules
// ============================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[YWM Supabase] Missing environment variables. Database features disabled.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// ── Table name type ──
export type TableName =
  | 'spare_parts'
  | 'maintenance'
  | 'team_activity'
  | 'pispot'
  | 'documents'
  | 'notifications'
  | 'chat_history'
  | 'silo_calculation'
  | 'silo_opname';

// ── Table names matching YWM modules ──
export const TABLES = {
  SPARE_PARTS: 'spare_parts',
  MAINTENANCE: 'maintenance',
  TEAM_ACTIVITY: 'team_activity',
  PISPOT: 'pispot',
  DOCUMENTS: 'documents',
  NOTIFICATIONS: 'notifications',
  CHAT_HISTORY: 'chat_history',
  SILO_CALCULATION: 'silo_calculation',
  SILO_OPNAME: 'silo_opname',
} as const;

// ── All table names as a list for iteration ──
export const ALL_TABLE_NAMES: TableName[] = Object.values(TABLES) as TableName[];

// ── camelCase ↔ snake_case utility functions ──

/**
 * Convert a camelCase string to snake_case.
 * Example: 'namaKaryawan' → 'nama_karyawan'
 */
export function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Convert a snake_case string to camelCase.
 * Example: 'nama_karyawan' → 'namaKaryawan'
 */
export function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert all keys of an object from camelCase to snake_case.
 * Handles nested objects recursively.
 */
export function objectToSnake<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = camelToSnake(key);
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      result[snakeKey] = objectToSnake(value as Record<string, unknown>);
    } else {
      result[snakeKey] = value;
    }
  }
  return result;
}

/**
 * Convert all keys of an object from snake_case to camelCase.
 * Handles nested objects recursively.
 */
export function objectToCamel<T>(obj: Record<string, unknown>): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = snakeToCamel(key);
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      result[camelKey] = objectToCamel(value as Record<string, unknown>);
    } else {
      result[camelKey] = value;
    }
  }
  return result as T;
}

// ── Generic CRUD helpers ──

/**
 * Select records from a Supabase table.
 */
export async function dbSelect(table: string, options?: {
  columns?: string;
  filter?: Record<string, unknown>;
  orderBy?: string;
  ascending?: boolean;
  limit?: number;
}) {
  const { columns = '*', filter, orderBy, ascending = false, limit } = options || {};

  let query = supabase.from(table).select(columns);

  if (filter) {
    Object.entries(filter).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }

  if (orderBy) {
    query = query.order(orderBy, { ascending });
  }

  if (limit) {
    query = query.limit(limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error(`[YWM DB] Select error on ${table}:`, error.message);
    throw error;
  }
  return data;
}

/**
 * Insert records into a Supabase table.
 */
export async function dbInsert(table: string, records: Record<string, unknown> | Record<string, unknown>[]) {
  const { data, error } = await supabase
    .from(table)
    .insert(records)
    .select();

  if (error) {
    console.error(`[YWM DB] Insert error on ${table}:`, error.message);
    throw error;
  }
  return data;
}

/**
 * Update a record in a Supabase table by ID.
 */
export async function dbUpdate(table: string, id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from(table)
    .update(updates)
    .eq('id', id)
    .select();

  if (error) {
    console.error(`[YWM DB] Update error on ${table}:`, error.message);
    throw error;
  }
  return data;
}

/**
 * Delete a record from a Supabase table by ID.
 */
export async function dbDelete(table: string, id: string) {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`[YWM DB] Delete error on ${table}:`, error.message);
    throw error;
  }
}

// ── Table existence check and creation ──

/**
 * Check if a specific table exists in Supabase by attempting a SELECT.
 * Returns true if the table exists (even if empty), false if it doesn't.
 */
export async function tableExists(tableName: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('id')
      .limit(1);

    if (error && error.code === '42P01') {
      return false; // Table doesn't exist
    }
    return true; // Table exists (even if other error, table likely exists)
  } catch {
    return false;
  }
}

/**
 * Try to create a table if it doesn't exist, using Supabase RPC.
 * This requires an RPC function `execute_sql` to be defined in Supabase,
 * or falls back to logging a warning.
 *
 * @param tableName - The table to create
 * @returns Whether the table was created or already exists
 */
export async function ensureTableExists(tableName: TableName): Promise<boolean> {
  const exists = await tableExists(tableName);
  if (exists) return true;

  try {
    // Try using an RPC function to create the table
    const { error } = await supabase.rpc('ensure_table_exists', { table_name: tableName });

    if (error) {
      console.warn(`[YWM DB] Could not auto-create table ${tableName}:`, error.message);
      console.info(`[YWM DB] Please run the schema.sql in Supabase SQL Editor to create the ${tableName} table.`);
      return false;
    }

    console.info(`[YWM DB] Table ${tableName} created successfully`);
    return true;
  } catch (err) {
    console.warn(`[YWM DB] Error creating table ${tableName}:`, err);
    return false;
  }
}

/**
 * Check all YWM tables and create any that are missing.
 * Uses ensureTableExists for each table in ALL_TABLE_NAMES.
 *
 * @returns Object with table names as keys and boolean (exists) as values
 */
export async function autoCreateTables(): Promise<Record<TableName, boolean>> {
  const results: Record<string, boolean> = {};

  for (const tableName of ALL_TABLE_NAMES) {
    results[tableName] = await ensureTableExists(tableName);
  }

  return results as Record<TableName, boolean>;
}

// ── Check Supabase connection ──

/**
 * Check if Supabase is connected and which tables exist.
 * Tests connection and checks all known tables.
 *
 * @returns Object with connection status, list of existing tables, and optional error
 */
export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  tables: string[];
  missingTables: string[];
  error?: string;
}> {
  try {
    // Try a simple query to check connection
    const { error } = await supabase.from('spare_parts').select('id').limit(1);

    if (error && error.code === '42P01') {
      // Table doesn't exist yet - need to create schema
      return {
        connected: true,
        tables: [],
        missingTables: [...ALL_TABLE_NAMES],
        error: 'Tables not created yet. Run migration.',
      };
    }

    if (error && (error.code === 'PGRST301' || error.message?.includes('fetch'))) {
      return {
        connected: false,
        tables: [],
        missingTables: [...ALL_TABLE_NAMES],
        error: error.message,
      };
    }

    // List available tables
    const existingTables: string[] = [];
    const missingTables: string[] = [];

    for (const tableName of ALL_TABLE_NAMES) {
      const { error: tableError } = await supabase
        .from(tableName)
        .select('id')
        .limit(1);

      if (!tableError || tableError.code !== '42P01') {
        existingTables.push(tableName);
      } else {
        missingTables.push(tableName);
      }
    }

    return {
      connected: true,
      tables: existingTables,
      missingTables,
    };
  } catch (err: unknown) {
    return {
      connected: false,
      tables: [],
      missingTables: [...ALL_TABLE_NAMES],
      error: err instanceof Error ? err.message : 'Unknown connection error',
    };
  }
}

export default supabase;
