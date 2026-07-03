// ============================================================
// Puter.js SDK Wrapper — Type-safe interface
// ============================================================

declare global {
  interface Window {
    puter: PuterSDK;
  }
}

interface PuterSDK {
  ai: {
    chat: (
      messages: string | Array<{ role: string; content: string }>,
      options?: { model?: string; stream?: boolean }
    ) => Promise<unknown>;
  };
  kv: {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string) => Promise<void>;
    del: (key: string) => Promise<void>;
    list: (prefix: string) => Promise<string[]>;
  };
  fs: {
    upload: (path: string, file: File | Blob) => Promise<unknown>;
    read: (path: string) => Promise<unknown>;
    delete: (path: string) => Promise<void>;
    mkdir: (path: string) => Promise<unknown>;
    readdir: (path: string) => Promise<unknown[]>;
  };
  auth: {
    isSignedIn: () => boolean;
    signIn: () => Promise<void>;
    getUser: () => Promise<unknown>;
  };
}

export function getPuter(): PuterSDK | null {
  if (typeof window !== 'undefined' && window.puter) {
    return window.puter;
  }
  return null;
}

export function isPuterLoaded(): boolean {
  return typeof window !== 'undefined' && !!window.puter;
}

export async function waitForPuter(maxMs = 10000): Promise<PuterSDK> {
  const start = Date.now();
  while (!isPuterLoaded()) {
    if (Date.now() - start > maxMs) {
      throw new Error('Puter.js tidak tersedia. Pastikan koneksi internet stabil.');
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  return window.puter;
}

export async function ensureAuth(): Promise<void> {
  const puter = await waitForPuter();
  if (!puter.auth.isSignedIn()) {
    await puter.auth.signIn();
  }
}
