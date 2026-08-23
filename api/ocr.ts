// ============================================================
// Vercel Serverless Function — /api/ocr
// Vision-based text extraction (images) via z-ai SDK
// ============================================================

import ZAI from 'z-ai-web-dev-sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders, handleCorsPreflightRequest } from '../server/shared/cors.js';
import { requireAuth } from '../server/shared/auth.js';
import { checkRateLimit, getClientIp } from '../server/shared/rate-limit.js';

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

const ALLOWED_IMAGE_TYPES = /^image\/(png|jpe?g|webp|gif)$/;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res);
  if (handleCorsPreflightRequest(req, res)) return;

  if (!requireAuth(req, res)) return;

  // Vision is expensive — tight limit
  if (!checkRateLimit(getClientIp(req), 10)) {
    return res.status(429).json({ error: 'Rate limit exceeded. Max 10 OCR per minute.' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const ai = await getAI();
    if (!ai) return res.status(503).json({ error: 'AI not initialized' });

    const { dataUrl } = req.body ?? {};
    if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
      return res.status(400).json({ error: 'dataUrl (base64 image) required' });
    }

    const mime = dataUrl.slice(5, dataUrl.indexOf(';'));
    if (!ALLOWED_IMAGE_TYPES.test(mime)) {
      return res.status(400).json({ error: 'Hanya format PNG/JPG/WEBP/GIF yang didukung.' });
    }
    // ~6 MB decoded cap
    if (dataUrl.length > 8_000_000) {
      return res.status(400).json({ error: 'Gambar terlalu besar. Maksimal sekitar 6 MB.' });
    }

    const completion = await ai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'Kamu adalah mesin OCR. Ekstrak SEMUA teks dari gambar apa adanya. Output hanya teks hasil ekstraksi tanpa komentar, tanpa markdown.',
        },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Ekstrak semua teks dari gambar ini.' },
            { type: 'image_url', image_url: { url: dataUrl } },
          ],
        },
      ],
      temperature: 0,
      max_tokens: 4000,
    });

    const text = completion.choices?.[0]?.message?.content || '';
    return res.status(200).json({ text });
  } catch (err: unknown) {
    console.error('[YWM OCR] Error:', err instanceof Error ? err.message : err);
    return res.status(500).json({ error: 'Gagal memproses OCR' });
  }
}
