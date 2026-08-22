// db:check - Smoke test koneksi Supabase produksi (read-only).
// Usage: node scripts/db-check.mjs
// Env: VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY (wajib), atau SUPABASE_URL/ANON_KEY fallback.
// Exit codes: 0 = skip (env kosong) atau semua tabel OK; 1 = dikonfigurasi tapi gagal koneksi.

import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.log('[SKIP] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY tidak diset - lewati cek DB.');
  process.exit(0);
}

const TABLES = [
  'spare_parts', 'maintenance', 'team_activity', 'pispot', 'documents',
  'notifications', 'chat_history', 'silo_calculation', 'silo_opname',
  'production', 'finance', 'safety_incident', 'employee',
];

const supabase = createClient(url, key);
console.log(`[DB] ${url}`);

let failures = 0;
for (const table of TABLES) {
  const { error } = await supabase.from(table).select('*', { count: 'exact', head: true });
  if (!error) {
    console.log(`  OK       ${table}`);
  } else if (error.code === 'PGRST205' || /does not exist|Could not find/i.test(error.message)) {
    console.log(`  MISSING  ${table}`);
    failures++;
  } else {
    console.log(`  DENIED   ${table}  (${error.message.slice(0, 60)})`);
    failures++;
  }
}

console.log(failures === 0 ? '[OK] Semua tabel reachable.' : `[FAIL] ${failures}/${TABLES.length} tabel bermasalah.`);
process.exit(failures > 0 ? 1 : 0);
