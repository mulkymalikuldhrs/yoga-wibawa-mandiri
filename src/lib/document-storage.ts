import { requireSupabase } from './supabase';

const BUCKET = 'documents';
export const SB_URL_PREFIX = 'sb://documents/';

function safeFileName(name: string): string {
  return name.replace(/[^\w.-]+/g, '_').slice(-120);
}

/**
 * Upload a file to Supabase Storage under documents/{docId}/{filename}.
 * Returns the sb:// URL stored in the documents row, or null when
 * Supabase is unavailable / user not authenticated (caller falls back).
 */
export async function uploadDocumentFile(file: File, docId: string): Promise<string | null> {
  try {
    const supabase = requireSupabase();
    const path = `${docId}/${safeFileName(file.name)}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: '3600',
      upsert: true,
    });
    if (error) throw error;
    return `${SB_URL_PREFIX}${path}`;
  } catch {
    return null;
  }
}

/** Create a short-lived signed URL for a stored document. */
export async function getDocumentSignedUrl(sbUrl: string, expiresInSeconds = 3600): Promise<string | null> {
  try {
    const path = sbUrl.replace(SB_URL_PREFIX, '');
    const { data, error } = await requireSupabase().storage.from(BUCKET).createSignedUrl(path, expiresInSeconds);
    if (error || !data) throw error ?? new Error('no data');
    return data.signedUrl;
  } catch {
    return null;
  }
}

/** Best-effort delete of the underlying storage object. */
export async function deleteDocumentFile(sbUrl: string): Promise<void> {
  try {
    const path = sbUrl.replace(SB_URL_PREFIX, '');
    await requireSupabase().storage.from(BUCKET).remove([path]);
  } catch {
    // non-blocking: row deletion already succeeded
  }
}

export function isStorageUrl(url?: string): boolean {
  return !!url && url.startsWith(SB_URL_PREFIX);
}
