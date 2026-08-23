// ============================================================
// Vercel Serverless Function — /api/system-status
// Aggregated infrastructure telemetry (read-only):
//   * Vercel production deployments (token stays server-side)
//   * Mirror remote HEADs (Codeberg / GitHub org+user / GitLab)
//   * Supabase reachability
// Fully defensive: never throws, always returns JSON.
// ============================================================

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setCorsHeaders, handleCorsPreflightRequest } from '../server/shared/cors.js';
import { checkRateLimit, getClientIp } from '../server/shared/rate-limit.js';

const TIMEOUT_MS = 6000;

interface RemoteResult { state: 'OK' | 'FAIL'; sha: string; date: string | null }

async function safeFetchJson(url: string, headers?: Record<string, string>): Promise<RemoteResult> {
  const fallback: RemoteResult = { state: 'FAIL', sha: '--------', date: null };
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { headers, signal: controller.signal });
    if (!res.ok) return fallback;
    const json = (await res.json()) as Record<string, unknown> | null;
    if (!json) return fallback;
    // Gitea branch shape vs commit API shapes
    const directSha = typeof json.sha === 'string' ? json.sha : undefined;
    const nestedCommit = json.commit as { sha?: string; author?: { date?: string }; committer?: { date?: string } } | undefined;
    const sha = directSha ?? nestedCommit?.sha ?? nestedCommit?.id ?? (typeof json.id === 'string' ? json.id : undefined);
    const date =
      nestedCommit?.author?.date ??
      nestedCommit?.committer?.date ??
      (json.created_at as string | undefined) ??
      null;
    return { state: 'OK', sha: (sha ?? '--------').slice(0, 7), date };
  } catch {
    return fallback;
  } finally {
    clearTimeout(timer);
  }
}

interface DeploymentInfo { id: string; state: string; sha: string; date: string | null }

async function getVercelDeployments(): Promise<{ deployments: DeploymentInfo[] | null; error: string | null }> {
  const token = process.env.SYSTEM_VERCEL_TOKEN;
  if (!token) return { deployments: null, error: 'TOKEN NOT SET' };
  const projectId = process.env.SYSTEM_VERCEL_PROJECT_ID || 'prj_qXJPqonV3CxVronu6wUdakk6KI0K';
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`https://api.vercel.com/v6/deployments?projectId=${projectId}&limit=5&target=production`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal,
    });
    if (!res.ok) return { deployments: null, error: `HTTP ${res.status}` };
    const json = (await res.json()) as { deployments?: Array<Record<string, unknown>> };
    const deployments = (json.deployments ?? []).map((d) => ({
      id: String(d.uid ?? '').slice(0, 10),
      state: String(d.readyState ?? 'UNKNOWN'),
      sha: String((d.meta as Record<string, unknown> | undefined)?.githubCommitSha ?? '').slice(0, 7) || '--------',
      date: typeof d.createdAt === 'number' ? new Date(d.createdAt).toISOString() : null,
    }));
    return { deployments, error: null };
  } catch (err) {
    return { deployments: null, error: err instanceof Error ? err.message.slice(0, 40) : 'FETCH FAIL' };
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res);
  if (handleCorsPreflightRequest(req, res)) return;

  if (!checkRateLimit(getClientIp(req), 20)) {
    return res.status(429).json({ error: 'Rate limit exceeded.' });
  }
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const ghHeaders: Record<string, string> | undefined = process.env.SYSTEM_GITHUB_TOKEN
    ? { Authorization: `Bearer ${process.env.SYSTEM_GITHUB_TOKEN}`, 'X-GitHub-Api-Version': '2022-11-28' }
    : undefined;

  const remoteTargets = [
    { name: 'CODEBERG/PRIMARY', url: 'https://codeberg.org/Dhaher-Labs/yoga-wibawa-mandiri', apiUrl: 'https://codeberg.org/api/v1/repos/Dhaher-Labs/yoga-wibawa-mandiri/branches/main', headers: undefined },
    { name: 'GITHUB/ORG', url: 'https://github.com/dhaher-labs/Yoga-Wibawa-Mandiri', apiUrl: 'https://api.github.com/repos/dhaher-labs/Yoga-Wibawa-Mandiri/commits/main', headers: ghHeaders },
    { name: 'GITHUB/USER', url: 'https://github.com/mulkymalikuldhrs/yoga-wibawa-mandiri', apiUrl: 'https://api.github.com/repos/mulkymalikuldhrs/yoga-wibawa-mandiri/commits/main', headers: ghHeaders },
    { name: 'GITLAB/MIRROR', url: 'https://gitlab.com/mulkymalikuldhr/yoga-wibawa-mandiri', apiUrl: 'https://gitlab.com/api/v4/projects/mulkymalikuldhr%2Fyoga-wibawa-mandiri/repository/commits/main', headers: undefined },
  ];

  const [vercel, ...remoteResults] = await Promise.all([
    getVercelDeployments(),
    ...remoteTargets.map((t) => safeFetchJson(t.apiUrl, t.headers)),
  ]);

  const remotes = remoteTargets.map((t, i) => ({ name: t.name, url: t.url, ...remoteResults[i] }));

  let database: { state: 'OK' | 'FAIL'; detail: string } = { state: 'FAIL', detail: 'NOT CONFIGURED' };
  const sbUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (sbUrl && sbKey) {
    const probe = await safeFetchJson(`${sbUrl}/rest/v1/spare_parts?select=id&limit=1`, {
      apikey: sbKey,
      Authorization: `Bearer ${sbKey}`,
    });
    database = probe.state === 'OK'
      ? { state: 'OK', detail: 'REACHABLE' }
      : { state: 'FAIL', detail: 'UNREACHABLE' };
  }

  return res.status(200).json({
    generatedAt: new Date().toISOString(),
    vercelError: vercel.error,
    deployments: vercel.deployments,
    remotes,
    database,
  });
}
