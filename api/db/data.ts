// ============================================================
// Vercel Serverless Function — /api/db/data
// CRUD operations for YWM dashboard data via Supabase
// Updated: Added input validation & sanitization
// ============================================================

import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sanitizeData, validateData } from '../shared/validation';

const VALID_TABLES = [
  'spare_parts', 'production', 'maintenance',
  'team_activity', 'safety', 'finance',
  'hr', 'notifications', 'chat_history'
];

function getSupabase() {
  const url = process.env.VITE_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
  if (!url || !key) return null;
  return createClient(url, key);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers (uses configurable origin instead of wildcard)
  setCorsHeaders(req, res);

  // Handle CORS preflight
  if (handleCorsPreflightRequest(req, res)) return;

  // Auth check
  if (!requireAuth(req, res)) return;

  const supabase = getSupabase();
  if (!supabase) {
    return res.status(503).json({ error: 'Database not configured' });
  }

  try {
    // GET: Read data
    if (req.method === 'GET') {
      const { table: tbl, limit: lim, orderBy: ob } = req.query as any;
      if (!tbl || !VALID_TABLES.includes(tbl)) {
        return res.status(400).json({ error: 'Invalid table name', validTables: VALID_TABLES });
      }

      let query = supabase.from(tbl).select('*');
      if (ob) query = query.order(ob, { ascending: false });
      if (lim) query = query.limit(Number(lim));

      const { data: rows, error } = await query;
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ data: rows, count: rows?.length || 0 });
    }

    // POST: Create or query
    if (req.method === 'POST') {
      const { table, action, id, data, filters, orderBy, limit } = req.body || {};

      if (!table || !VALID_TABLES.includes(table)) {
        return res.status(400).json({ error: 'Invalid table name', validTables: VALID_TABLES });
      }

      // Action: select with filters
      if (action === 'select') {
        let query = supabase.from(table).select(data?.columns || '*');
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            query = query.eq(key, value as string);
          });
        }
        if (orderBy) query = query.order(orderBy, { ascending: false });
        if (limit) query = query.limit(Number(limit));

        const { data: rows, error } = await query;
        if (error) return res.status(500).json({ error: error.message });
        return res.status(200).json({ data: rows, count: rows?.length || 0 });
      }

      // Action: insert (default)
      if (!data) {
        return res.status(400).json({ error: 'Data required for insert' });
      }

      // Sanitize and validate input data
      const sanitizedInsertData = sanitizeData(table, data);
      const validationError = validateData(sanitizedInsertData);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      const { data: inserted, error } = await supabase
        .from(table)
        .insert(sanitizedInsertData)
        .select();

      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json({ data: inserted });
    }

    // PUT: Update
    if (req.method === 'PUT') {
      const { table, id, data } = req.body || {};
      if (!table || !VALID_TABLES.includes(table)) {
        return res.status(400).json({ error: 'Invalid table name' });
      }
      if (!id || !data) {
        return res.status(400).json({ error: 'ID and data required for update' });
      }

      // Sanitize and validate input data
      const sanitizedUpdateData = sanitizeData(table, data);
      const validationError = validateData(sanitizedUpdateData);
      if (validationError) {
        return res.status(400).json({ error: validationError });
      }

      const { data: updated, error } = await supabase
        .from(table)
        .update({ ...sanitizedUpdateData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select();

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ data: updated });
    }

    // DELETE: Remove
    if (req.method === 'DELETE') {
      const { table, id } = req.body || {};
      if (!table || !VALID_TABLES.includes(table)) {
        return res.status(400).json({ error: 'Invalid table name' });
      }
      if (!id) {
        return res.status(400).json({ error: 'ID required for delete' });
      }

      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('[YWM DB API] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
