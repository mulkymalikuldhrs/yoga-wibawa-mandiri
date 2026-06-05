// ============================================================
// Vercel Serverless Function — /api/health
// Public endpoint — lightweight system health check
// ============================================================

import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders, handleCorsPreflightRequest } from '../shared/cors.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS — use shared helper (checks origin against allowed list)
  setCorsHeaders(req, res);

  // Handle CORS preflight
  if (handleCorsPreflightRequest(req, res)) return;

  // Quick DB check — no loop, just 1 table
  let db = 'not_configured';
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase.from('spare_parts').select('id').limit(1);
      db = error ? 'error' : 'connected';
    }
  } catch {
    db = 'error';
  }

  return res.status(200).json({
    status: 'ok',
    database: db,
    version: '8.0.0',
    timestamp: new Date().toISOString(),
  });
}
