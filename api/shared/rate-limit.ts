// ============================================================
// Shared rate limiter for AI endpoints
// Simple in-memory sliding window rate limiter
// ============================================================

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Check if the given IP is within rate limits.
 * @param ip - Client IP address
 * @param limit - Max requests per minute (default: 20)
 * @returns true if allowed, false if rate limited
 */
export function checkRateLimit(ip: string, limit = 20): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + 60000 }); // 1 minute window
    return true;
  }

  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

/**
 * Extract client IP from Vercel request headers.
 */
export function getClientIp(req: { headers: Record<string, string | string[] | undefined> }): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = typeof forwarded === 'string' ? forwarded : forwarded[0];
    return ips?.split(',')[0]?.trim() || 'unknown';
  }
  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return typeof realIp === 'string' ? realIp : realIp[0] || 'unknown';
  }
  return 'unknown';
}
