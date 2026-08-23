import { requireSupabase } from './supabase';

/**
 * Run server-side vision OCR on an image file.
 * Throws with a readable message when unsupported or the API fails.
 */
export async function runOcrFromFile(file: File): Promise<string> {
  const mime = file.type || 'image/png';
  if (!/^image\/(png|jpe?g|webp|gif)$/.test(mime)) {
    throw new Error('OCR mendukung PNG/JPG/WEBP/GIF.');
  }
  if (file.size > 6 * 1024 * 1024) {
    throw new Error('Gambar terlalu besar (maks 6 MB).');
  }

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Gagal membaca file.'));
    reader.readAsDataURL(file);
  });

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    if (data.session?.access_token) headers.Authorization = `Bearer ${data.session.access_token}`;
  }

  const res = await fetch('/api/ocr', {
    method: 'POST',
    headers,
    body: JSON.stringify({ dataUrl }),
  });
  const body = (await res.json().catch(() => null)) as { text?: string; error?: string } | null;
  if (!res.ok) throw new Error(body?.error ?? 'Gagal memproses OCR.');
  return body?.text ?? '';
}
