// ============================================================
// Vercel Serverless Function — /api/health
// Checks AI SDK & Supabase availability
// ============================================================

import ZAI from 'z-ai-web-dev-sdk';
import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

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
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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
