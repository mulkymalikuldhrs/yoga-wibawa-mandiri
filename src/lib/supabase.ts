// ============================================================
// Supabase Client — YWM AI Dashboard
// PT. Yoga Wibawa Mandiri
// ============================================================

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://aymvpyehihbgmllcgilq.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_KEY || '';

// Public client (anon key - for frontend use, respects RLS)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Admin client (service key - bypasses RLS, use with caution)
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Default export for convenience
export default supabase;

// Database table names
export const TABLES = {
  SPARE_PARTS: 'spare_parts',
  TEAM_ACTIVITIES: 'team_activities',
  MAINTENANCE_RECORDS: 'maintenance_records',
  SAFETY_INCIDENTS: 'safety_incidents',
  DOCUMENTS: 'documents',
  NOTIFICATIONS: 'notifications',
  SILO_DATA: 'silo_data',
  OPNAME_RECORDS: 'opname_records',
  OPNAME_SILO_RECORDS: 'opname_silo_records',
  PISPOT_RECORDS: 'pispot_records',
  PISPOT_GREASE: 'pispot_grease',
  DISCHARGE_OPERATIONS: 'discharge_operations',
  CHAT_MESSAGES: 'chat_messages',
  PRODUCTION_DATA: 'production_data',
} as const;

export type TableName = typeof TABLES[keyof typeof TABLES];
