// ============================================================
// Shared Auth Middleware — Simple API key check for API routes
// If YWM_API_KEY env var is set, require matching x-api-key header
// If not set, allow all requests (backward compatibility)
// Skips auth for OPTIONS (CORS preflight) and /api/health
// ============================================================

import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Checks API key authentication.
 * Returns true if the request is authorized, false otherwise.
 * If YWM_API_KEY is not set, all requests are allowed.
 */
export function checkAuth(req: VercelRequest): { authorized: boolean; error?: string } {
  const requiredKey = process.env.YWM_API_KEY;

  // If no key is configured, allow all requests
  if (!requiredKey) {
    return { authorized: true };
  }

  // Skip auth for OPTIONS (CORS preflight)
  if (req.method === 'OPTIONS') {
    return { authorized: true };
  }

  // Check x-api-key header
  const providedKey = req.headers['x-api-key'] as string | undefined;

  // Also check Authorization: Bearer ***
  const authHeader = req.headers['authorization'] as string | undefined;
  const bearerKey = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (providedKey === requiredKey || bearerKey === requiredKey) {
    return { authorized: true };
  }

  return {
    authorized: false,
    error: 'Unauthorized: Valid API key required. Set x-api-key header or Authorization: Bearer <key>.',
  };
}

/**
 * Convenience function: checks auth and sends 401 if unauthorized.
 * Returns true if the request should proceed, false if it was rejected.
 */
export function requireAuth(
  req: VercelRequest,
  res: VercelResponse
): boolean {
  const { authorized, error } = checkAuth(req);
  if (!authorized) {
    res.status(401).json({ error: error || 'Unauthorized' });
    return false;
  }
  return true;
}
