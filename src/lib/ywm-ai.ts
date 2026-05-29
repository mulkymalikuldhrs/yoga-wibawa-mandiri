// ============================================================
// YWM AI Service — Backend API calls (no more Puter.js!)
// Uses Vite middleware with z-ai-web-dev-sdk
// Updated: 2026-05-29 — Added dashboard data context builder
// ============================================================

import type { AiMessage } from '@/types/dashboard';
import { KV_PREFIXES } from '@/types/dashboard';
import { getData as getLocalData } from '@/lib/dashboard-storage';

const API_BASE = '/api';

// ── Health Check ──
export async function checkAIHealth(): Promise<{ status: string; ai: string }> {
  try {
    const res = await fetch(`${API_BASE}/health`, { 
      signal: AbortSignal.timeout(5000) 
    });
    return await res.json();
  } catch {
    return { status: 'error', ai: 'not_ready' };
  }
}

// ── Chat (non-streaming) — Primary method ──
export async function chatWithAi(
  messages: AiMessage[]
): Promise<{ message: AiMessage; usage?: unknown }> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages }),
    signal: AbortSignal.timeout(120000), // 2 min timeout for AI
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || err.detail || 'Gagal menghubungi AI');
  }

  return await res.json();
}

// ── Chat (streaming) — Fallback: uses non-streaming with simulated streaming ──
export async function chatWithAiStream(
  messages: AiMessage[],
  onChunk: (chunk: string) => void,
  onDone: () => void,
  onError?: (error: string) => void
): Promise<void> {
  try {
    // First try streaming endpoint
    const res = await fetch(`${API_BASE}/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
      signal: AbortSignal.timeout(120000),
    });

    if (res.ok && res.headers.get('Content-Type')?.includes('text/event-stream')) {
      // Use SSE streaming
      const reader = res.body?.getReader();
      if (reader) {
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') {
                onDone();
                return;
              }
              try {
                const parsed = JSON.parse(data);
                if (parsed.content) onChunk(parsed.content);
                if (parsed.error) onError?.(parsed.error);
              } catch { /* skip */ }
            }
          }
        }
        onDone();
        return;
      }
    }

    // Fallback: Use non-streaming endpoint and simulate streaming
    const fallbackRes = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
      signal: AbortSignal.timeout(120000),
    });

    if (!fallbackRes.ok) {
      throw new Error('Gagal menghubungi AI');
    }

    const data = await fallbackRes.json();
    const fullContent = data.message?.content || '';

    // Simulate streaming by breaking the response into chunks
    if (fullContent) {
      const words = fullContent.split(/(\s+)/);
      for (const word of words) {
        onChunk(word);
        // Small delay to simulate streaming feel
        await new Promise(r => setTimeout(r, 15));
      }
    }

    onDone();
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gagal menghubungi AI';
    onError?.(message);
    onDone();
  }
}

// ── Smart Parse — Natural language to structured data ──
export async function smartParse(
  input: string,
  context?: string
): Promise<Record<string, unknown>> {
  try {
    const res = await fetch(`${API_BASE}/smart-parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input, context }),
      signal: AbortSignal.timeout(60000),
    });

    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}

// ── Build Dashboard Data Context ──
// Reads current dashboard data from localStorage to give AI context
export function buildDashboardContext(): string {
  try {
    const spareParts = getLocalData<{ id: string; nama: string; kode: string; stok: number; stokMinimum: number; satuan: string }>(KV_PREFIXES.sparePart);
    const maintenance = getLocalData<{ id: string; judul: string; mesin: string; status: string; prioritas: string }>(KV_PREFIXES.maintenance);
    const pispot = getLocalData<{ id: string; namaPeralatan: string; kodePeralatan: string; status: string; kondisi: string; bulan: string }>(KV_PREFIXES.pispot);
    const team = getLocalData<{ id: string; namaKaryawan: string; divisi: string; status: string; tanggal: string }>(KV_PREFIXES.teamActivity);

    const lowStockItems = spareParts.filter(p => p.stok <= p.stokMinimum);
    const activeMaintenance = maintenance.filter(m => m.status === 'berjalan');
    const criticalMaintenance = maintenance.filter(m => m.prioritas === 'kritis' && m.status !== 'selesai');
    const todayStr = new Date().toISOString().split('T')[0];
    const todayTeam = team.filter(t => t.tanggal === todayStr);
    const absentToday = todayTeam.filter(t => t.status === 'izin' || t.status === 'sakit' || t.status === 'alpha');

    const currentMonth = new Date().toISOString().slice(0, 7);
    const pispotThisMonth = pispot.filter(p => p.bulan === currentMonth);
    const pispotOverdue = pispotThisMonth.filter(p => p.status === 'terlewat');
    const pispotNeedsAttention = pispotThisMonth.filter(p => p.kondisi === 'perlu_perhatian' || p.kondisi === 'rusak');

    let context = `\n## DATA DASHBOARD TERKINI (Real-time)\n`;
    context += `- Tanggal: ${todayStr}\n`;
    context += `- Total Suku Cadang: ${spareParts.length} item\n`;
    if (lowStockItems.length > 0) {
      context += `- ⚠️ Stok Rendah (${lowStockItems.length} item): ${lowStockItems.map(p => `${p.nama} (${p.stok}/${p.stokMinimum} ${p.satuan})`).join(', ')}\n`;
    }
    context += `- Maintenance Aktif: ${activeMaintenance.length} WO\n`;
    if (criticalMaintenance.length > 0) {
      context += `- 🔴 WO Kritis: ${criticalMaintenance.map(m => m.judul).join(', ')}\n`;
    }
    context += `- Pispot Bulan Ini: ${pispotThisMonth.length} item\n`;
    if (pispotOverdue.length > 0) {
      context += `- 🔴 Pelumasan Terlewat: ${pispotOverdue.map(p => `${p.namaPeralatan} (${p.kodePeralatan})`).join(', ')}\n`;
    }
    if (pispotNeedsAttention.length > 0) {
      context += `- ⚠️ Peralatan Perlu Perhatian: ${pispotNeedsAttention.map(p => `${p.namaPeralatan} (${p.kondisi})`).join(', ')}\n`;
    }
    context += `- Karyawan Hadir Hari Ini: ${todayTeam.filter(t => t.status === 'hadir' || t.status === 'lembur').length}/${todayTeam.length}\n`;
    if (absentToday.length > 0) {
      context += `  - Tidak Hadir: ${absentToday.map(t => `${t.namaKaryawan} (${t.status})`).join(', ')}\n`;
    }

    return context;
  } catch {
    return '\n## DATA DASHBOARD: Tidak dapat membaca data saat ini.\n';
  }
}

// ── Parse AI response for data input actions ──
export function parseDataInputAction(content: string): {
  isDataInput: boolean;
  module?: string;
  action?: string;
  data?: Record<string, unknown>;
} {
  // Look for ACTION:INPUT_DATA pattern
  const actionMatch = content.match(/```ACTION:INPUT_DATA\s*\n?([\s\S]*?)```/);
  if (actionMatch) {
    try {
      const parsed = JSON.parse(actionMatch[1]);
      return {
        isDataInput: true,
        module: parsed.module,
        action: parsed.action,
        data: parsed.data,
      };
    } catch { /* malformed */ }
  }

  // Also check for JSON code blocks that look like data input
  const jsonMatch = content.match(/```json\s*\n?([\s\S]*?)```/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (parsed.module && parsed.data) {
        return {
          isDataInput: true,
          module: parsed.module,
          action: parsed.action || 'create',
          data: parsed.data,
        };
      }
    } catch { /* not valid JSON */ }
  }

  return { isDataInput: false };
}
