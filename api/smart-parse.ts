// ============================================================
// Vercel Serverless Function — /api/smart-parse
// Natural language to structured data parsing
// ============================================================

import ZAI from 'z-ai-web-dev-sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders, handleCorsPreflightRequest } from '../../server/shared/cors.js';
import { requireAuth } from '../../server/shared/auth.js';
import { checkRateLimit, getClientIp } from '../../server/shared/rate-limit.js';

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

  // Auth check
  if (!requireAuth(req, res)) return;

  // Rate limiting (AI endpoint — cost protection)
  if (!checkRateLimit(getClientIp(req), 30)) {
    return res.status(429).json({ error: 'Rate limit exceeded. Please try again in a minute.' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const ai = await getAI();
    if (!ai) {
      return res.status(503).json({ error: 'AI not initialized' });
    }

    const { input, context } = req.body;
    if (!input || typeof input !== 'string') {
      return res.status(400).json({ error: 'Input required' });
    }
    if (input.length > 2000) {
      return res.status(400).json({ error: 'Input too long. Maximum 2000 characters.' });
    }

    const completion = await ai.chat.completions.create({
      messages: [
        { role: 'system', content: 'Output hanya JSON murni tanpa markdown. Jangan tambahkan teks lain.' },
        { role: 'user', content: `Parse input berikut menjadi data terstruktur:\n\nInput: "${input}"\nModul: ${context || 'auto-detect'}\n\nOutput format:\n{"module":"","action":"create","data":{}}\n\nModul tersedia: spare-parts, production, maintenance, team-activity, safety, finance, hr` }
      ],
      temperature: 0.1,
      max_tokens: 1000,
    });

    const text = completion.choices?.[0]?.message?.content || '{}';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    return res.status(200).json(jsonMatch ? JSON.parse(jsonMatch[0]) : {});
  } catch (err: any) {
    console.error('[YWM AI Vercel] Parse error:', err.message);
    return res.status(500).json({ error: 'Gagal parse data' });
  }
}
