// ============================================================
// Vercel Serverless Function — /api/db/status
// Check Supabase database connection & table availability
// ============================================================

import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders, handleCorsPreflightRequest } from '../shared/cors.js';
import { requireAuth } from '../shared/auth.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers (uses configurable origin instead of wildcard)
  setCorsHeaders(req, res);

  // Handle CORS preflight
  if (handleCorsPreflightRequest(req, res)) return;

  // Auth check
  if (!requireAuth(req, res)) return;

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';

  if (!supabaseUrl || !supabaseKey) {
    return res.status(200).json({
      connected: false,
      error: 'Supabase credentials not configured',
      tables: [],
    });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    const tables = [
      'spare_parts', 'production', 'maintenance',
      'team_activity', 'safety_incident', 'finance',
      'employee', 'notifications', 'chat_history',
      'pispot', 'documents', 'silo_calculation', 'silo_opname'
    ];

    const existingTables: string[] = [];
    const missingTables: string[] = [];

    for (const table of tables) {
      const { error } = await supabase.from(table).select('id').limit(1);
      if (error && error.code === '42P01') {
        missingTables.push(table);
      } else {
        existingTables.push(table);
      }
    }

    return res.status(200).json({
      connected: true,
      tables: existingTables,
      missingTables,
      totalTables: tables.length,
      existingCount: existingTables.length,
    });
  } catch (err: any) {
    return res.status(500).json({
      connected: false,
      error: err.message,
      tables: [],
    });
  }
}
