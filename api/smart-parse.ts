     1|// ============================================================
     2|// Vercel Serverless Function — /api/smart-parse
     3|// Natural language to structured data parsing
     4|// ============================================================
     5|
     6|import ZAI from 'z-ai-web-dev-sdk';
     7|import type { VercelRequest, VercelResponse } from '@vercel/node';
     8|import { setCorsHeaders, handleCorsPreflightRequest } from '../shared/cors.js';
     9|import { requireAuth } from '../shared/auth.js';
    10|
    11|let zaiInstance: any = null;
    12|
    13|async function getAI() {
    14|  if (zaiInstance) return zaiInstance;
    15|  try {
    16|    zaiInstance = await ZAI.create();
    17|    return zaiInstance;
    18|  } catch {
    19|    return null;
    20|  }
    21|}
    22|
    23|export default async function handler(req: VercelRequest, res: VercelResponse) {
    24|  // CORS headers (uses configurable origin instead of wildcard)
    25|  setCorsHeaders(req, res);
    26|
    27|  // Handle CORS preflight
    28|  if (handleCorsPreflightRequest(req, res)) return;
    29|
    30|  // Auth check
    31|  if (!requireAuth(req, res)) return;
    32|
    33|  if (req.method !== 'POST') {
    34|    return res.status(405).json({ error: 'Method not allowed' });
    35|  }
    36|
    37|  try {
    38|    const ai = await getAI();
    39|    if (!ai) {
    40|      return res.status(503).json({ error: 'AI not initialized' });
    41|    }
    42|
    43|    const { input, context } = req.body;
    44|    if (!input) {
    45|      return res.status(400).json({ error: 'Input required' });
    46|    }
    47|
    48|    const completion = await ai.chat.completions.create({
    49|      messages: [
    50|        { role: 'system', content: 'Output hanya JSON murni tanpa markdown. Jangan tambahkan teks lain.' },
    51|        { role: 'user', content: `Parse input berikut menjadi data terstruktur:\n\nInput: "${input}"\nModul: ${context || 'auto-detect'}\n\nOutput format:\n{"module":"","action":"create","data":{}}\n\nModul tersedia: spare-parts, production, maintenance, team-activity, safety, finance, hr` }
    52|      ],
    53|      temperature: 0.1,
    54|      max_tokens: 1000,
    55|    });
    56|
    57|    const text = completion.choices?.[0]?.message?.content || '{}';
    58|    const jsonMatch = text.match(/\{[\s\S]*\}/);
    59|    return res.status(200).json(jsonMatch ? JSON.parse(jsonMatch[0]) : {});
    60|  } catch (err: any) {
    61|    console.error('[YWM AI Vercel] Parse error:', err.message);
    62|    return res.status(500).json({ error: err.message });
    63|  }
    64|}
    65|