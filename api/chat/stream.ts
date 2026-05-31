// ============================================================
// Vercel Serverless Function — /api/chat/stream
// AI chat streaming endpoint using SSE
// Updated: Shared system prompt + rate limiting + proper CORS
// ============================================================

import ZAI from 'z-ai-web-dev-sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { YWM_SYSTEM_PROMPT } from '../../shared/system-prompt.js';
import { checkRateLimit, getClientIp } from '../../shared/rate-limit.js';
import { setCorsHeaders, handleCorsPreflightRequest } from '../../shared/cors.js';

// Keep AI instance warm
let zaiInstance: any = null;

async function getAI() {
  if (zaiInstance) return zaiInstance;
  try {
    zaiInstance = await ZAI.create();
    return zaiInstance;
  } catch (err: any) {
    console.error('[YWM AI Vercel Stream] Init failed:', err.message);
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS — use shared helper (checks origin against allowed list)
  setCorsHeaders(req, res);

  // Handle CORS preflight
  if (handleCorsPreflightRequest(req, res)) return;

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Rate limiting
  const clientIp = getClientIp(req);
  if (!checkRateLimit(clientIp, 20)) {
    return res.status(429).json({ error: 'Rate limit exceeded. Please try again in a minute.' });
  }

  try {
    const ai = await getAI();
    if (!ai) {
      return res.status(503).json({ error: 'AI not initialized' });
    }

    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array required' });
    }

    // Limit message count and size
    if (messages.length > 50) {
      return res.status(400).json({ error: 'Too many messages. Maximum 50 messages per request.' });
    }

    for (const msg of messages) {
      if (msg.content && typeof msg.content === 'string' && msg.content.length > 10000) {
        return res.status(400).json({ error: 'Message too long. Maximum 10000 characters per message.' });
      }
    }

    // SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');

    const apiMessages = [
      { role: 'system', content: YWM_SYSTEM_PROMPT },
      ...messages.map((m: any) => ({ role: m.role, content: m.content }))
    ];

    const completion = await ai.chat.completions.create({
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 2000,
      stream: true,
    });

    for await (const chunk of completion) {
      const content = chunk.choices?.[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    return res.end();
  } catch (err: any) {
    console.error('[YWM AI Vercel Stream] Error:', err.message);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Gagal streaming respons AI' });
    }
    try {
      res.write(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    } catch {
      return res.end();
    }
  }
}
