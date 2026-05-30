     1|// ============================================================
     2|// Vercel Serverless Function — /api/chat/stream
     3|// AI chat streaming endpoint using SSE
     4|// Updated: Shared system prompt + rate limiting + proper CORS
     5|// ============================================================
     6|
     7|import ZAI from 'z-ai-web-dev-sdk';
     8|import type { VercelRequest, VercelResponse } from '@vercel/node';
     9|import { YWM_SYSTEM_PROMPT } from '../../shared/system-prompt.js';
    10|import { checkRateLimit, getClientIp } from '../../shared/rate-limit.js';
    11|import { setCorsHeaders, handleCorsPreflightRequest } from '../../shared/cors.js';
    12|
    13|// Keep AI instance warm
    14|let zaiInstance: any = null;
    15|
    16|async function getAI() {
    17|  if (zaiInstance) return zaiInstance;
    18|  try {
    19|    zaiInstance = await ZAI.create();
    20|    return zaiInstance;
    21|  } catch (err: any) {
    22|    console.error('[YWM AI Vercel Stream] Init failed:', err.message);
    23|    return null;
    24|  }
    25|}
    26|
    27|export default async function handler(req: VercelRequest, res: VercelResponse) {
    28|  // CORS — use shared helper (checks origin against allowed list)
    29|  setCorsHeaders(req, res);
    30|
    31|  // Handle CORS preflight
    32|  if (handleCorsPreflightRequest(req, res)) return;
    33|
    34|  if (req.method !== 'POST') {
    35|    return res.status(405).json({ error: 'Method not allowed' });
    36|  }
    37|
    38|  // Rate limiting
    39|  const clientIp = getClientIp(req);
    40|  if (!checkRateLimit(clientIp, 20)) {
    41|    return res.status(429).json({ error: 'Rate limit exceeded. Please try again in a minute.' });
    42|  }
    43|
    44|  try {
    45|    const ai = await getAI();
    46|    if (!ai) {
    47|      return res.status(503).json({ error: 'AI not initialized' });
    48|    }
    49|
    50|    const { messages } = req.body;
    51|    if (!messages || !Array.isArray(messages)) {
    52|      return res.status(400).json({ error: 'Messages array required' });
    53|    }
    54|
    55|    // Limit message count and size
    56|    if (messages.length > 50) {
    57|      return res.status(400).json({ error: 'Too many messages. Maximum 50 messages per request.' });
    58|    }
    59|
    60|    for (const msg of messages) {
    61|      if (msg.content && typeof msg.content === 'string' && msg.content.length > 10000) {
    62|        return res.status(400).json({ error: 'Message too long. Maximum 10000 characters per message.' });
    63|      }
    64|    }
    65|
    66|    // SSE headers
    67|    res.setHeader('Content-Type', 'text/event-stream');
    68|    res.setHeader('Cache-Control', 'no-cache');
    69|    res.setHeader('Connection', 'keep-alive');
    70|    res.setHeader('X-Accel-Buffering', 'no');
    71|
    72|    const apiMessages = [
    73|      { role: 'system', content: YWM_SYSTEM_PROMPT },
    74|      ...messages.map((m: any) => ({ role: m.role, content: m.content }))
    75|    ];
    76|
    77|    const completion = await ai.chat.completions.create({
    78|      messages: apiMessages,
    79|      temperature: 0.7,
    80|      max_tokens: 2000,
    81|      stream: true,
    82|    });
    83|
    84|    for await (const chunk of completion) {
    85|      const content = chunk.choices?.[0]?.delta?.content;
    86|      if (content) {
    87|        res.write(`data: ${JSON.stringify({ content })}\n\n`);
    88|      }
    89|    }
    90|
    91|    res.write('data: [DONE]\n\n');
    92|    return res.end();
    93|  } catch (err: any) {
    94|    console.error('[YWM AI Vercel Stream] Error:', err.message);
    95|    if (!res.headersSent) {
    96|      return res.status(500).json({ error: 'Gagal streaming respons AI' });
    97|    }
    98|    try {
    99|      res.write(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`);
   100|      res.write('data: [DONE]\n\n');
   101|      return res.end();
   102|    } catch {
   103|      return res.end();
   104|    }
   105|  }
   106|}
   107|