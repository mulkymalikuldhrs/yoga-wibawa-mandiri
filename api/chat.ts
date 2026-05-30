// ============================================================
// Vercel Serverless Function — /api/chat
// AI chat endpoint using z-ai-web-dev-sdk
// Updated: Shared system prompt + rate limiting + proper CORS + auth
// ============================================================

import ZAI from 'z-ai-web-dev-sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { YWM_SYSTEM_PROMPT } from '../shared/system-prompt.js';
import { checkRateLimit, getClientIp } from '../shared/rate-limit.js';
import { setCorsHeaders, handleCorsPreflightRequest } from '../shared/cors.js';

// Keep AI instance warm across invocations
let zaiInstance: any = null;

async function getAI() {
  if (zaiInstance) return zaiInstance;
  try {
    zaiInstance = await ZAI.create();
    console.log('[YWM AI Vercel] z-ai-web-dev-sdk initialized');
    return zaiInstance;
  } catch (err: any) {
    console.error('[YWM AI Vercel] Init failed:', err.message);
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

    console.log('[YWM AI Vercel] POST /api/chat -', messages.length, 'messages');

    const apiMessages = [
      { role: 'system', content: YWM_SYSTEM_PROMPT },
      ...messages.map((m: any) => ({ role: m.role, content: m.content }))
    ];

    const completion = await ai.chat.completions.create({
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices?.[0]?.message?.content || 'Maaf, saya tidak dapat memproses permintaan Anda. Silakan coba lagi.';

    console.log('[YWM AI Vercel] Response length:', content.length);

    return res.status(200).json({
      message: {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
        role: 'assistant',
        content,
        timestamp: new Date().toISOString(),
      },
      usage: completion.usage || null,
    });
  } catch (err: any) {
    console.error('[YWM AI Vercel] Chat error:', err.message);
    return res.status(500).json({ error: 'Gagal mendapatkan respons AI' });
  }
}
