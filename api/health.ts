     1|// ============================================================
     2|// Vercel Serverless Function — /api/health
     3|// Checks AI SDK & Supabase availability
     4|// Public endpoint — auth is skipped
     5|// ============================================================
     6|
     7|import ZAI from 'z-ai-web-dev-sdk';
     8|import { createClient } from '@supabase/supabase-js';
     9|import type { VercelRequest, VercelResponse } from '@vercel/node';
    10|import { setCorsHeaders, handleCorsPreflightRequest } from '../shared/cors.js';
    11|
    12|// Keep AI instance warm across invocations
    13|let zaiInstance: any = null;
    14|
    15|async function getAI() {
    16|  if (zaiInstance) return zaiInstance;
    17|  try {
    18|    zaiInstance = await ZAI.create();
    19|    return zaiInstance;
    20|  } catch {
    21|    return null;
    22|  }
    23|}
    24|
    25|export default async function handler(req: VercelRequest, res: VercelResponse) {
    26|  // CORS headers (uses configurable origin instead of wildcard)
    27|  setCorsHeaders(req, res);
    28|
    29|  // Handle CORS preflight
    30|  if (handleCorsPreflightRequest(req, res)) return;
    31|
    32|  // NOTE: /api/health is a public endpoint — no auth required
    33|
    34|  const ai = await getAI();
    35|
    36|  // Check Supabase
    37|  let dbStatus = 'not_configured';
    38|  const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
    39|  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
    40|  
    41|  if (supabaseUrl && supabaseKey) {
    42|    try {
    43|      const supabase = createClient(supabaseUrl, supabaseKey);
    44|      const { error } = await supabase.from('spare_parts').select('id').limit(1);
    45|      dbStatus = error ? 'error' : 'connected';
    46|    } catch {
    47|      dbStatus = 'error';
    48|    }
    49|  }
    50|
    51|  return res.status(200).json({
    52|    status: 'ok',
    53|    ai: ai ? 'ready' : 'not_ready',
    54|    database: dbStatus,
    55|    version: '5.1.0',
    56|    timestamp: new Date().toISOString(),
    57|  });
    58|}
    59|