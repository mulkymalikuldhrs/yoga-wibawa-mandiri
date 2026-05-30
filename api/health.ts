// ============================================================
// Vercel Serverless Function — /api/health
// Checks AI SDK & Supabase availability
// Public endpoint — auth is skipped
// ============================================================

import ZAI from 'z-ai-web-dev-sdk';
import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders, handleCorsPreflightRequest } from '../shared/cors.js';

// Keep AI instance warm across invocations
let zaiInstance: any = null;

async function getAI() {
  if (zaiInstance) return zaiInstance;
  try {
    zaiInstance = await ZAI.create();
    return zaiInstance;
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers (uses configurable origin instead of wildcard)
  setCorsHeaders(req, res);

  // Handle CORS preflight
  if (handleCorsPreflightRequest(req, res)) return;

  // NOTE: /api/health is a public endpoint — no auth required

  const ai = await getAI();

  // Check Supabase
  let dbStatus = 'not_configured';
  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
  
  if (supabaseUrl && supabaseKey) {
    try {
      const supabase = createClient(supabaseUrl, supabaseKey);
      const { error } = await supabase.from('spare_parts').select('id').limit(1);
      dbStatus = error ? 'error' : 'connected';
    } catch {
      dbStatus = 'error';
    }
  }

  return res.status(200).json({
    status: 'ok',
    ai: ai ? 'ready' : 'not_ready',
    database: dbStatus,
    version: '5.1.0',
    timestamp: new Date().toISOString(),
  });
}
