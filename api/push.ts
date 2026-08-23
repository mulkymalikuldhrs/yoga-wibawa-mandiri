// ============================================================
// Vercel Serverless Function — /api/push
// Web Push (VAPID): subscribe/unsubscribe/test-send
// ============================================================

import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import webpush from 'web-push';
import { setCorsHeaders, handleCorsPreflightRequest } from '../../server/shared/cors.js';
import { requireAuth } from '../../server/shared/auth.js';
import { checkRateLimit, getClientIp } from '../../server/shared/rate-limit.js';

function getSupabase() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!url || !key) return null;
  return createClient(url, key);
}

function getPushConfig() {
  const publicKey = process.env.VAPID_PUBLIC_KEY || '';
  const privateKey = process.env.VAPID_PRIVATE_KEY || '';
  const subject = process.env.VAPID_SUBJECT || 'mailto:admin@example.com';
  if (!publicKey || !privateKey) return null;
  return { publicKey, privateKey, subject };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(req, res);
  if (handleCorsPreflightRequest(req, res)) return;

  if (!requireAuth(req, res)) return;

  if (!checkRateLimit(getClientIp(req), 30)) {
    return res.status(429).json({ error: 'Rate limit exceeded.' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = getSupabase();
  if (!supabase) return res.status(503).json({ error: 'Database not configured' });

  const cfg = getPushConfig();
  if (!cfg) return res.status(503).json({ error: 'Push not configured' });
  webpush.setVapidDetails(cfg.subject, cfg.publicKey, cfg.privateKey);

  try {
    const { action } = req.body ?? {};

    // ── Subscribe / refresh subscription ──
    if (action === 'subscribe') {
      const { subscription, userEmail } = req.body;
      if (!subscription?.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth || !userEmail) {
        return res.status(400).json({ error: 'Invalid subscription payload' });
      }
      const ua = typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : null;
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert(
          {
            endpoint: subscription.endpoint,
            user_email: String(userEmail).slice(0, 200),
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
            user_agent: ua,
          },
          { onConflict: 'endpoint' },
        );
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ ok: true });
    }

    // ── Unsubscribe ──
    if (action === 'unsubscribe') {
      const { endpoint } = req.body;
      if (!endpoint) return res.status(400).json({ error: 'endpoint required' });
      await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
      return res.status(200).json({ ok: true });
    }

    // ── Test send ──
    if (action === 'test') {
      const { userEmail } = req.body;
      if (!userEmail) return res.status(400).json({ error: 'userEmail required' });
      const { data: subs, error } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_email', userEmail);
      if (error) return res.status(500).json({ error: error.message });
      if (!subs?.length) return res.status(404).json({ error: 'No subscriptions for this user' });

      const payload = JSON.stringify({
        title: 'YWM Dashboard',
        body: 'Notifikasi push aktif! Anda akan menerima pemberitahuan operasional di sini.',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'ywm-test',
        data: { url: '/dashboard?module=notifications' },
      });

      let sent = 0;
      const deadEndpoints: string[] = [];
      await Promise.all(
        subs.map(async (s: { endpoint: string; p256dh: string; auth: string }) => {
          try {
            await webpush.sendNotification(
              { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
              payload,
            );
            sent++;
          } catch (err: unknown) {
            const statusCode = (err as { statusCode?: number }).statusCode;
            if (statusCode === 404 || statusCode === 410) deadEndpoints.push(s.endpoint);
          }
        }),
      );
      if (deadEndpoints.length) {
        await supabase.from('push_subscriptions').delete().in('endpoint', deadEndpoints);
      }
      return res.status(200).json({ ok: true, sent, removed: deadEndpoints.length });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (err: unknown) {
    console.error('[YWM Push] Error:', err instanceof Error ? err.message : err);
    return res.status(500).json({ error: 'Push operation failed' });
  }
}
