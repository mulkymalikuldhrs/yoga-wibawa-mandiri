// ============================================================
// Vercel Serverless Function — /api/health
// Checks AI SDK availability
// ============================================================

import ZAI from 'z-ai-web-dev-sdk';

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

export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const ai = await getAI();

  return res.status(200).json({
    status: 'ok',
    ai: ai ? 'ready' : 'not_ready',
    timestamp: new Date().toISOString(),
  });
}
