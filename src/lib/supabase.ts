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

// ── Table names matching YWM modules ──
export const TABLES = {
  SPARE_PARTS: 'spare_parts',
  PRODUCTION: 'production',
  MAINTENANCE: 'maintenance',
  TEAM_ACTIVITY: 'team_activity',
  SAFETY: 'safety',
  FINANCE: 'finance',
  HR: 'hr',
  NOTIFICATIONS: 'notifications',
  CHAT_HISTORY: 'chat_history',
} as const;

// ── Generic CRUD helpers ──
export async function dbSelect(table: string, options?: {
  columns?: string;
  filter?: Record<string, unknown>;
  orderBy?: string;
  limit?: number;
}) {
  const { columns = '*', filter, orderBy, limit } = options || {};

  let query = supabase.from(table).select(columns);

  if (filter) {
    Object.entries(filter).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
  }

  if (orderBy) {
    query = query.order(orderBy, { ascending: false });
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

// ── Check Supabase connection ──
export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  tables: string[];
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
        error: 'Tables not created yet. Run migration.',
      };
    }

    if (error) {
      return {
        connected: false,
        tables: [],
        error: error.message,
      };
    }

    // List available tables
    const tableNames = Object.values(TABLES);
    const existingTables: string[] = [];

    for (const tableName of tableNames) {
      const { error: tableError } = await supabase
        .from(tableName)
        .select('id')
        .limit(1);

      if (!tableError || tableError.code !== '42P01') {
        existingTables.push(tableName);
      }
    }

    return {
      connected: true,
      tables: existingTables,
    };
  } catch (err: any) {
    return {
      connected: false,
      tables: [],
      error: err.message,
    };
  }
}

export default supabase;
