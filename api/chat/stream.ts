// ============================================================
// Vercel Serverless Function — /api/chat/stream
// AI chat streaming endpoint using SSE
// Updated: Shared system prompt + rate limiting
// ============================================================

import ZAI from 'z-ai-web-dev-sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { YWM_SYSTEM_PROMPT } from '../../shared/system-prompt';
import { checkRateLimit, getClientIp } from '../../shared/rate-limit';

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
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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
      return res.status(500).json({ error: err.message });
    }
    try {
      res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      res.write('data: [DONE]\n\n');
      return res.end();
    } catch {
      return res.end();
    }
  }
}
