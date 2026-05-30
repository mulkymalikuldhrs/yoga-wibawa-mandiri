// ============================================================
// Puter AI Wrapper — Chat, OCR, Voice, Image Gen
// ============================================================

import { waitForPuter, ensureAuth } from './puter';
import type { AiMessage, ChatResponse } from '@/types/dashboard';

export const AI_MODELS = [
  { id: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { id: 'gpt-4o', label: 'GPT-4o' },
  { id: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet' },
  { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
  { id: 'deepseek-chat', label: 'DeepSeek Chat' },
] as const;

export type AiModelId = (typeof AI_MODELS)[number]['id'];

// System prompt for YWM context
const YWM_SYSTEM_PROMPT = `Kamu adalah asisten AI untuk PT. Yoga Wibawa Mandiri, perusahaan pengantongan Semen Padang di Lhokseumawe, Aceh. 
Kamu membantu operasional harian termasuk: manajemen suku cadang, aktivitas tim, jadwal perawatan mesin, produksi, keselamatan kerja (HSE), keuangan, HR, dan dokumen.
Jawab dalam Bahasa Indonesia yang profesional namun ramah. Berikan jawaban yang praktis dan actionable.
Jika ditanya tentang data spesifik, sarankan untuk mengecek modul yang relevan di dashboard.`;

// Chat with AI (non-streaming)
export async function chatWithAi(
  messages: AiMessage[],
  model: AiModelId = 'gpt-4o-mini'
): Promise<ChatResponse> {
  try {
    await ensureAuth();
    const puter = await waitForPuter();

    const formattedMessages = [
      { role: 'system', content: YWM_SYSTEM_PROMPT },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const response = (await puter.ai.chat(formattedMessages, {
      model,
      stream: false,
    })) as { message?: { content?: string }; usage?: { input_tokens: number; output_tokens: number } };

    const assistantMessage: AiMessage = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      role: 'assistant',
      content: response?.message?.content || 'Maaf, tidak ada respons dari AI.',
      timestamp: new Date().toISOString(),
    };

    return {
      message: assistantMessage,
      usage: response?.usage,
    };
  } catch (err) {
    console.error('AI Chat gagal:', err);
    throw new Error('Gagal menghubungi AI. Silakan coba lagi.');
  }
}

// Chat with AI (streaming)
export async function chatWithAiStream(
  messages: AiMessage[],
  model: AiModelId = 'gpt-4o-mini',
  onChunk: (chunk: string) => void,
  onDone: () => void
): Promise<void> {
  try {
    await ensureAuth();
    const puter = await waitForPuter();

    const formattedMessages = [
      { role: 'system', content: YWM_SYSTEM_PROMPT },
      ...messages.map((m) => ({ role: m.role, content: m.content })),
    ];

    const response = (await puter.ai.chat(formattedMessages, {
      model,
      stream: true,
    })) as AsyncIterable<{ text?: string }>;

    if (response && Symbol.asyncIterator in Object(response)) {
      for await (const chunk of response as AsyncIterable<{ text?: string }>) {
        if (chunk?.text) {
          onChunk(chunk.text);
        }
      }
    }

    onDone();
  } catch (err) {
    console.error('AI Chat Stream gagal:', err);
    onChunk('\n\n⚠️ Gagal menghubungi AI. Silakan coba lagi.');
    onDone();
  }
}

// Smart parse: natural language → structured data
export async function aiSmartParse(
  input: string,
  context: string,
  model: AiModelId = 'gpt-4o-mini'
): Promise<Record<string, unknown>> {
  const prompt = `Parse input bahasa natural berikut menjadi data terstruktur untuk modul "${context}".
Input: "${input}"

Berikan output dalam format JSON saja tanpa markdown. Contoh format:
- Spare Parts: { "nama": "", "kode": "", "kategori": "", "stok": 0, "satuan": "", "lokasi": "", "harga": 0, "pemasok": "", "catatan": "" }
- Team Activity: { "namaKaryawan": "", "divisi": "", "aktivitas": "", "status": "hadir", "jamMasuk": "", "jamKeluar": "", "tanggal": "", "catatan": "" }
- Maintenance: { "judul": "", "mesin": "", "jenis": "preventif", "prioritas": "sedang", "status": "terjadwal", "tanggalMulai": "", "tanggalSelesai": "", "teknisi": "", "estimasiBiaya": 0, "catatan": "" }
- Production: { "tanggal": "", "shift": "pagi", "mesin": "", "target": 0, "aktual": 0, "satuan": "sak", "kualitas": "A", "catatan": "" }
- Safety: { "judul": "", "tanggal": "", "lokasi": "", "severity": "ringan", "status": "dilaporkan", "pelapor": "", "korban": "", "deskripsi": "", "tindakan": "" }
- Finance: { "tanggal": "", "jenis": "pengeluaran", "kategori": "", "deskripsi": "", "jumlah": 0, "metodePembayaran": "", "referensi": "", "catatan": "" }
- HR: { "nama": "", "nip": "", "jabatan": "", "divisi": "", "tanggalMasuk": "", "gajiPokok": 0, "status": "aktif", "noTelepon": "", "email": "", "alamat": "" }

Isi field yang bisa disimpulkan dari input. Biarkan field yang tidak diketahui kosong/default.`;

  try {
    const puter = await waitForPuter();
    const response = (await puter.ai.chat(
      [
        { role: 'system', content: 'Kamu adalah parser data. Output hanya JSON murni tanpa markdown.' },
        { role: 'user', content: prompt },
      ],
      { model, stream: false }
    )) as { message?: { content?: string } };

    const text = response?.message?.content || '{}';
    // Try to extract JSON from possible markdown code blocks
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return {};
  } catch (err) {
    console.error('AI Smart Parse gagal:', err);
    return {};
  }
}

// OCR: extract text from image
export async function ocrFromImage(file: File): Promise<string> {
  try {
    await ensureAuth();
    const puter = await waitForPuter();

    // First upload the file
    const _uploadResult = await puter.fs.upload('/ywm-temp-ocr/' + file.name, file);
    
    void _uploadResult;
    // Then use AI to read it
    const response = (await puter.ai.chat(
      [
        {
          role: 'user',
          content: `Baca dan ekstrak semua teks dari dokumen ini. Berikan hasilnya dalam format teks biasa.`,
        },
      ],
      { model: 'gpt-4o-mini', stream: false }
    )) as { message?: { content?: string } };

    // Clean up temp file
    try { await puter.fs.delete('/ywm-temp-ocr/' + file.name); } catch { /* ignore */ }

    return response?.message?.content || '';
  } catch (err) {
    console.error('OCR gagal:', err);
    throw new Error('Gagal melakukan OCR pada dokumen.');
  }
}

// Voice: transcribe using AI (simple wrapper)
export async function transcribeVoice(_audioBlob: Blob): Promise<string> {
  // Puter doesn't have a direct speech-to-text API yet,
  // so we return a placeholder message
  return 'Fitur transkrip suara akan segera tersedia.';
}
