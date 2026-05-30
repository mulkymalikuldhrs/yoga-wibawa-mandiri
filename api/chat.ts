     1|// ============================================================
     2|// Vercel Serverless Function — /api/chat
     3|// AI chat endpoint using z-ai-web-dev-sdk
     4|// Updated: Shared system prompt + rate limiting + proper CORS + auth
     5|// ============================================================
     6|
     7|import ZAI from 'z-ai-web-dev-sdk';
     8|import type { VercelRequest, VercelResponse } from '@vercel/node';
     9|import { YWM_SYSTEM_PROMPT } from '../shared/system-prompt.js';
    10|import { checkRateLimit, getClientIp } from '../shared/rate-limit.js';
    11|import { setCorsHeaders, handleCorsPreflightRequest } from '../shared/cors.js';
    12|
    13|// Keep AI instance warm across invocations
    14|let zaiInstance: any = null;
    15|
    16|async function getAI() {
    17|  if (zaiInstance) return zaiInstance;
    18|  try {
    19|    zaiInstance = await ZAI.create();
    20|    console.log('[YWM AI Vercel] z-ai-web-dev-sdk initialized');
    21|    return zaiInstance;
    22|  } catch (err: any) {
    23|    console.error('[YWM AI Vercel] Init failed:', err.message);
    24|    return null;
    25|  }
    26|}
    27|
    28|export default async function handler(req: VercelRequest, res: VercelResponse) {
    29|  // CORS — use shared helper (checks origin against allowed list)
    30|  setCorsHeaders(req, res);
    31|
    32|  // Handle CORS preflight
    33|  if (handleCorsPreflightRequest(req, res)) return;
    34|
    35|  if (req.method !== 'POST') {
    36|    return res.status(405).json({ error: 'Method not allowed' });
    37|  }
    38|
    39|  // Rate limiting
    40|  const clientIp = getClientIp(req);
    41|  if (!checkRateLimit(clientIp, 20)) {
    42|    return res.status(429).json({ error: 'Rate limit exceeded. Please try again in a minute.' });
    43|  }
    44|
    45|  try {
    46|    const ai = await getAI();
    47|    if (!ai) {
    48|      return res.status(503).json({ error: 'AI not initialized' });
    49|    }
    50|
    51|    const { messages } = req.body;
    52|    if (!messages || !Array.isArray(messages)) {
    53|      return res.status(400).json({ error: 'Messages array required' });
    54|    }
    55|
    56|    // Limit message count and size
    57|    if (messages.length > 50) {
    58|      return res.status(400).json({ error: 'Too many messages. Maximum 50 messages per request.' });
    59|    }
    60|
    61|    for (const msg of messages) {
    62|      if (msg.content && typeof msg.content === 'string' && msg.content.length > 10000) {
    63|        return res.status(400).json({ error: 'Message too long. Maximum 10000 characters per message.' });
    64|      }
    65|    }
    66|
    67|    console.log('[YWM AI Vercel] POST /api/chat -', messages.length, 'messages');
    68|
    69|    const apiMessages = [
    70|      { role: 'system', content: YWM_SYSTEM_PROMPT },
    71|      ...messages.map((m: any) => ({ role: m.role, content: m.content }))
    72|    ];
    73|
    74|    const completion = await ai.chat.completions.create({
    75|      messages: apiMessages,
    76|      temperature: 0.7,
    77|      max_tokens: 2000,
    78|    });
    79|
    80|    const content = completion.choices?.[0]?.message?.content || 'Maaf, saya tidak dapat memproses permintaan Anda. Silakan coba lagi.';
    81|
    82|    console.log('[YWM AI Vercel] Response length:', content.length);
    83|
    84|    return res.status(200).json({
    85|      message: {
    86|        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
    87|        role: 'assistant',
    88|        content,
    89|        timestamp: new Date().toISOString(),
    90|      },
    91|      usage: completion.usage || null,
    92|    });
    93|  } catch (err: any) {
    94|    console.error('[YWM AI Vercel] Chat error:', err.message);
    95|    return res.status(500).json({ error: 'Gagal mendapatkan respons AI' });
    96|  }
    97|}
    98|