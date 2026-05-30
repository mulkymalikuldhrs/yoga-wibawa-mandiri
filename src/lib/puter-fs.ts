// ============================================================
// Puter File System Wrapper
// ============================================================

import { waitForPuter, ensureAuth } from './puter';

const YWM_DOCS_PATH = '/ywm-documents';

export interface FsItem {
  name: string;
  path: string;
  size: number;
  type: 'file' | 'directory';
  modified: string;
}

// Ensure the documents directory exists
export async function ensureDocsDir(): Promise<void> {
  try {
    await ensureAuth();
    const puter = await waitForPuter();
    try {
      await puter.fs.mkdir(YWM_DOCS_PATH);
    } catch {
      // Directory might already exist, that's fine
    }
  } catch (err) {
    console.error('Gagal membuat direktori dokumen:', err);
  }
}

// Upload a document to YWM docs directory
export async function uploadDocument(
  file: File,
  subPath = ''
): Promise<{ path: string; name: string; size: number }> {
  try {
    await ensureAuth();
    const puter = await waitForPuter();
    await ensureDocsDir();

    const fullPath = subPath
      ? `${YWM_DOCS_PATH}/${subPath}/${file.name}`
      : `${YWM_DOCS_PATH}/${file.name}`;

    await puter.fs.upload(fullPath, file);

    return {
      path: fullPath,
      name: file.name,
      size: file.size,
    };
  } catch (err) {
    console.error('Upload dokumen gagal:', err);
    throw new Error('Gagal mengunggah dokumen.');
  }
}

// List documents in the YWM docs directory
export async function listDocuments(subPath = ''): Promise<FsItem[]> {
  try {
    await ensureAuth();
    const puter = await waitForPuter();

    const dirPath = subPath
      ? `${YWM_DOCS_PATH}/${subPath}`
      : YWM_DOCS_PATH;

    const items = (await puter.fs.readdir(dirPath)) as Array<{
      name?: string;
      path?: string;
      size?: number;
      is_dir?: boolean;
      modified?: string;
    }>;

    return items.map((item) => ({
      name: item.name || '',
      path: item.path || '',
      size: item.size || 0,
      type: item.is_dir ? 'directory' : 'file',
      modified: item.modified || new Date().toISOString(),
    }));
  } catch (err) {
    console.error('List dokumen gagal:', err);
    return [];
  }
}

// Delete a document
export async function deleteDocument(path: string): Promise<void> {
  try {
    await ensureAuth();
    const puter = await waitForPuter();
    await puter.fs.delete(path);
  } catch (err) {
    console.error('Hapus dokumen gagal:', err);
    throw new Error('Gagal menghapus dokumen.');
  }
}

// Read a document
export async function readDocument(path: string): Promise<unknown> {
  try {
    await ensureAuth();
    const puter = await waitForPuter();
    return await puter.fs.read(path);
  } catch (err) {
    console.error('Baca dokumen gagal:', err);
    throw new Error('Gagal membaca dokumen.');
  }
}
