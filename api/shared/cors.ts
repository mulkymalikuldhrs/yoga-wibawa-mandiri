// ============================================================
// Shared CORS Helper — Replaces wildcard with configurable origin
// Usage: Call setCorsHeaders(req, res) in each API handler
// ============================================================

import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Returns the appropriate Access-Control-Allow-Origin value
 * based on the request's Origin header and CORS_ORIGIN env var.
 *
 * CORS_ORIGIN can be a comma-separated list of allowed origins.
 * Defaults to 'https://teknikywm.vercel.app' if not set.
 */
export function getCorsOrigin(req: VercelRequest): string {
  const allowed = process.env.CORS_ORIGIN || 'https://teknikywm.vercel.app';
  const origin = req.headers.origin || '';

  if (origin) {
    const allowedList = allowed.split(',').map((o) => o.trim());
    const match = allowedList.some((o) => {
      // Compare hostnames (strip protocol)
      const allowedHost = o.replace(/^https?:\/\//, '');
      const originHost = origin.replace(/^https?:\/\//, '');
      return originHost === allowedHost || originHost.endsWith('.' + allowedHost);
    });
    if (match) return origin;
  }

  // Fallback to the first allowed origin
  return allowed.split(',')[0].trim();
}

/**
 * Sets all CORS headers on the response.
 * Replaces the old wildcard (*) with the proper origin.
 */
export function setCorsHeaders(req: VercelRequest, res: VercelResponse): void {
  const origin = getCorsOrigin(req);
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24h preflight cache
}

/**
 * Handles CORS preflight (OPTIONS) requests.
 * Returns true if the request was a preflight (and response was sent).
 */
export function handleCorsPreflightRequest(
  req: VercelRequest,
  res: VercelResponse
): boolean {
  if (req.method === 'OPTIONS') {
    setCorsHeaders(req, res);
    res.status(200).end();
    return true;
  }
  return false;
}
