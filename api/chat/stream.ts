// ============================================================
// Vercel Serverless Function — /api/chat/stream
// AI chat streaming endpoint using SSE
// ============================================================

import ZAI from 'z-ai-web-dev-sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';

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

const YWM_SYSTEM_PROMPT = `Kamu adalah asisten AI cerdas dan proaktif untuk PT. Yoga Wibawa Mandiri (YWM), perusahaan pengantongan Semen Padang di Pelabuhan Krueng Geukueh, Lhokseumawe, Aceh.

## PROFIL PERUSAHAAN
- Nama: PT. Yoga Wibawa Mandiri (YWM)
- Lokasi: Pelabuhan Krueng Geukueh, Lhokseumawe, Aceh
- Bisnis: Pengantongan semen Semen Padang
- Kapasitas: 500 ton/hari
- Kontak: +62 823-0443-3145
- Email: info@ywm.co.id

## PERALATAN PABRIK
- **Packer A**: 4 nozzle (A1, A2, A3, A4)
- **Packer B**: 4 nozzle (B1, B2, B3, B4)
- **Silo A**: 7 lubang pengisian, kapasitas ~500 ton
- **Silo B**: 7 lubang pengisian, kapasitas ~500 ton

## MODUL DASHBOARD
1. Spare Parts, 2. Produksi, 3. Maintenance, 4. Tim & Aktivitas, 5. Keuangan, 6. Safety/HSE, 7. HR/Payroll, 8. Dokumen & OCR, 9. Analytics, 10. Notifikasi

## FORMAT INPUT DATA
Ketika user meminta input data:
\`\`\`ACTION:INPUT_DATA
{"module":"nama_modul","action":"create","data":{...}}
\`\`\`

## ATURAN
1. SELALU jawab dalam Bahasa Indonesia profesional dan ramah
2. Berikan jawaban DETAIL dan ACTIONABLE
3. Proaktif beri PERINGATAN jika ada potensi masalah
4. Untuk input data, tanyakan field yang kurang sebelum parsing`;

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
