     1|// ============================================================
     2|// Vercel Serverless Function — /api/db/status
     3|// Check Supabase database connection & table availability
     4|// ============================================================
     5|
     6|import { createClient } from '@supabase/supabase-js';
     7|import type { VercelRequest, VercelResponse } from '@vercel/node';
     8|import { setCorsHeaders, handleCorsPreflightRequest } from '../shared/cors.js';
     9|import { requireAuth } from '../shared/auth.js';
    10|
    11|export default async function handler(req: VercelRequest, res: VercelResponse) {
    12|  // CORS headers (uses configurable origin instead of wildcard)
    13|  setCorsHeaders(req, res);
    14|
    15|  // Handle CORS preflight
    16|  if (handleCorsPreflightRequest(req, res)) return;
    17|
    18|  // Auth check
    19|  if (!requireAuth(req, res)) return;
    20|
    21|  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    22|  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
    23|
    24|  if (!supabaseUrl || !supabaseKey) {
    25|    return res.status(200).json({
    26|      connected: false,
    27|      error: 'Supabase credentials not configured',
    28|      tables: [],
    29|    });
    30|  }
    31|
    32|  try {
    33|    const supabase = createClient(supabaseUrl, supabaseKey);
    34|
    35|    const tables = [
    36|      'spare_parts', 'production', 'maintenance',
    37|      'team_activity', 'safety_incident', 'finance',
    38|      'employee', 'notifications', 'chat_history',
    39|      'pispot', 'documents', 'silo_calculation', 'silo_opname'
    40|    ];
    41|
    42|    const existingTables: string[] = [];
    43|    const missingTables: string[] = [];
    44|
    45|    for (const table of tables) {
    46|      const { error } = await supabase.from(table).select('id').limit(1);
    47|      if (error && error.code === '42P01') {
    48|        missingTables.push(table);
    49|      } else {
    50|        existingTables.push(table);
    51|      }
    52|    }
    53|
    54|    return res.status(200).json({
    55|      connected: true,
    56|      tables: existingTables,
    57|      missingTables,
    58|      totalTables: tables.length,
    59|      existingCount: existingTables.length,
    60|    });
    61|  } catch (err: any) {
    62|    return res.status(500).json({
    63|      connected: false,
    64|      error: err.message,
    65|      tables: [],
    66|    });
    67|  }
    68|}
    69|