// ============================================================
// Vercel Serverless Function — /api/db/status
// Check Supabase database connection & table availability
// ============================================================

import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
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
      'team_activity', 'safety', 'finance',
      'hr', 'notifications', 'chat_history'
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
