// ============================================================
// Vercel Serverless Function — /api/health
// Public endpoint — checks Supabase connectivity
// ============================================================

import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders, handleCorsPreflightRequest } from '../shared/cors.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  setCorsHeaders(req, res);

  // Handle CORS preflight
  if (handleCorsPreflightRequest(req, res)) return;

  // NOTE: /api/health is a public endpoint — no auth required

  // Check Supabase
  let dbStatus = 'not_configured';
  let tablesCount = 0;
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
  
  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase.from('spare_parts').select('id').limit(1);
      dbStatus = error ? 'error' : 'connected';
      if (!error) {
        // Count tables quickly
        const tables = ['spare_parts','production','maintenance','team_activity','safety_incident','finance','employee','notifications','chat_history','pispot','documents','silo_calculation','silo_opname'];
        let ok = 0;
        for (const t of tables) {
          const { error: e } = await supabase.from(t).select('id').limit(1);
          if (!e) ok++;
        }
        tablesCount = ok;
      }
    } catch {
      dbStatus = 'error';
    }
  }

  return res.status(200).json({
    status: 'ok',
    database: dbStatus,
    tablesOnline: tablesCount || 0,
    version: '5.2.0',
    timestamp: new Date().toISOString(),
  });
}
