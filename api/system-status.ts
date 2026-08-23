// ============================================================
// Vercel Serverless Function — /api/system-status
// Aggregated infrastructure telemetry (read-only):
//   * Vercel production deployments (token stays server-side)
//   * Mirror remote HEADs (Codeberg / GitHub org+user / GitLab)
//   * Supabase reachability + row counts
// ============================================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders, handleCorsPreflightRequest } from '../_shared/cors.js';
import { checkRateLimit, getClientIp } from '../_shared/rate-limit.js';

async function fetchJson(url: string, headers?: Record<string, string>, timeoutMs = 8000): Promise<{ ok: boolean; status: number; json: unknown }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { headers, signal: controller.signal });
    let json: unknown = null;
    try { json = await res.json(); } catch { /* non-json */ }
    return { ok: res.ok, status: res.status, json };
  } catch {
    return { ok: false, status: 0, json: null };
  } finally {
    clearTimeout(timer);
  }
}

interface DeploymentInfo { id: string; state: string; sha: string | null; date: string | null }
async function getVercelDeployments(): Promise<DeploymentInfo[] | null> {
  const token = process.env.SYSTEM_VERCEL_TOKEN;
  const projectId = 'prj_qXJPqonV3CxVronu6wUdakk6KI0K';
  if (!token) return null;
  const r = await fetchJson(`https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=5&target=production`, { Authorization: `Bearer ${token}` });
  if (!r.ok || !r.json) return null;
  const deploys = ((r.json as { deployments?: unknown[] }).deployments ?? []) as Array<Record<string, unknown>>;
  return deploys.map((d) => ({
    id: String(d.uid ?? '').slice(0, 10),
    state: String(d.readyState ?? 'UNKNOWN'),
    sha: ((d.meta as Record<string, string> | undefined)?.githubCommitSha ?? '').slice(0, 7) || null,
    date: typeof d.createdAt === 'number' ? new Date(d.createdAt).toISOString() : null,
  }));
}

interface RemoteHead { name: string; url: string; sha: string; date: string | null; state: 'OK' | 'FAIL' }

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res);
  if (handleCorsPreflightRequest(req, res)) return;

  if (!checkRateLimit(getClientIp(req), 20)) {
    return res.status(429).json({ error: 'Rate limit exceeded.' });
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const [vercel, codebergMain, ghOrg, gh1, gitlab] = await Promise.all([
    getVercelDeployments(),
    fetchJson('https://codeberg.org/api/v1/repos/Dhaher-Labs/yoga-wibawa-mandiri/branches/main'),
    fetchJson('https://api.github.com/repos/dhaher-labs/Yoga-Wibawa-Mandiri/commits/main'),
    fetchJson('https://api.github.com/repos/mulkymalikuldhrs/yoga-wibawa-mandiri/commits/main'),
    fetchJson('https://gitlab.com/api/v4/projects/mulkymalikuldhr%2Fyoga-wibawa-mandiri/repository/commits/main'),
  ]);

  const remotes: RemoteHead[] = [
    {
      name: 'CODEBERG/PRIMARY',
      url: 'https://codeberg.org/Dhaher-Labs/yoga-wibawa-mandiri',
      sha: (codebergMain.json as { sha?: string } | null)?.sha?.slice(0, 7) ?? '--------',
      date: (codebergMain.json as { commit?: { author?: { date?: string } } } | null)?.commit?.author?.date ?? null,
      state: codebergMain.ok ? 'OK' : 'FAIL',
    },
    {
      name: 'GITHUB/ORG',
      url: 'https://github.com/dhaher-labs/Yoga-Wibawa-Mandiri',
      sha: (ghOrg.json as { sha?: string } | null)?.sha?.slice(0, 7) ?? '--------',
      date: (ghOrg.json as { commit?: { author?: { date?: string } } } | null)?.commit?.author?.date ?? null,
      state: ghOrg.ok ? 'OK' : 'FAIL',
    },
    {
      name: 'GITHUB/USER',
      url: 'https://github.com/mulkymalikuldhrs/yoga-wibawa-mandiri',
      sha: (gh1.json as { sha?: string } | null)?.sha?.slice(0, 7) ?? '--------',
      date: (gh1.json as { commit?: { author?: { date?: string } } } | null)?.commit?.author?.date ?? null,
      state: gh1.ok ? 'OK' : 'FAIL',
    },
    {
      name: 'GITLAB/MIRROR',
      url: 'https://gitlab.com/mulkymalikuldhr/yoga-wibawa-mandiri',
      sha: (gitlab.json as { id?: string } | null)?.id?.slice(0, 7) ?? '--------',
      date: (gitlab.json as { created_at?: string } | null)?.created_at ?? null,
      state: gitlab.ok ? 'OK' : 'FAIL',
    },
  ];

  // Supabase reachability probe (service-side, count query)
  let database: { state: 'OK' | 'FAIL'; detail: string } = { state: 'FAIL', detail: 'NOT CONFIGURED' };
  const sbUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (sbUrl && sbKey) {
    const r = await fetchJson(`${sbUrl}/rest/v1/spare_parts?select=id&limit=1`, { apikey: sbKey, Authorization: `Bearer ${sbKey}`, Prefer: 'count=exact' }, 6000);
    const range = (r.json as unknown) && (r as unknown as { headers?: unknown }).headers;
    void range;
    database = r.ok ? { state: 'OK', detail: 'REACHABLE' } : { state: 'FAIL', detail: `HTTP ${r.status}` };
  }

  return res.status(200).json({
    generatedAt: new Date().toISOString(),
    deployments: vercel,
    remotes,
    database,
  });
}
