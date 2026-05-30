     1|// ============================================================
     2|// Vercel Serverless Function — /api/db/data
     3|// CRUD operations for YWM dashboard data via Supabase
     4|// Updated: Added input validation & sanitization
     5|// ============================================================
     6|
     7|import { createClient } from '@supabase/supabase-js';
     8|import type { VercelRequest, VercelResponse } from '@vercel/node';
     9|import { sanitizeData, validateData } from '../shared/validation.js';
    10|import { setCorsHeaders, handleCorsPreflightRequest } from '../shared/cors.js';
    11|import { requireAuth } from '../shared/auth.js';
    12|
    13|const VALID_TABLES = [
    14|  'spare_parts', 'production', 'maintenance',
    15|  'team_activity', 'safety_incident', 'finance',
    16|  'employee', 'notifications', 'chat_history',
    17|  'pispot', 'documents', 'silo_calculation', 'silo_opname'
    18|];
    19|
    20|/** Convert camelCase keys to snake_case for Supabase */
    21|function toSnakeCase(obj: Record<string, unknown>): Record<string, unknown> {
    22|  const result: Record<string, unknown> = {};
    23|  for (const [key, value] of Object.entries(obj)) {
    24|    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    25|    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
    26|      result[snakeKey] = toSnakeCase(value as Record<string, unknown>);
    27|    } else {
    28|      result[snakeKey] = value;
    29|    }
    30|  }
    31|  return result;
    32|}
    33|
    34|function getSupabase() {
    35|  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
    36|  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
    37|  if (!url || !key) return null;
    38|  return createClient(url, key);
    39|}
    40|
    41|export default async function handler(req: VercelRequest, res: VercelResponse) {
    42|  // CORS headers (uses configurable origin instead of wildcard)
    43|  setCorsHeaders(req, res);
    44|
    45|  // Handle CORS preflight
    46|  if (handleCorsPreflightRequest(req, res)) return;
    47|
    48|  // Auth check
    49|  if (!requireAuth(req, res)) return;
    50|
    51|  const supabase = getSupabase();
    52|  if (!supabase) {
    53|    return res.status(503).json({ error: 'Database not configured' });
    54|  }
    55|
    56|  try {
    57|    // GET: Read data
    58|    if (req.method === 'GET') {
    59|      const { table: tbl, limit: lim, orderBy: ob } = req.query as any;
    60|      if (!tbl || !VALID_TABLES.includes(tbl)) {
    61|        return res.status(400).json({ error: 'Invalid table name', validTables: VALID_TABLES });
    62|      }
    63|
    64|      let query = supabase.from(tbl).select('*');
    65|      if (ob) query = query.order(ob, { ascending: false });
    66|      if (lim) query = query.limit(Number(lim));
    67|
    68|      const { data: rows, error } = await query;
    69|      if (error) return res.status(500).json({ error: error.message });
    70|      return res.status(200).json({ data: rows, count: rows?.length || 0 });
    71|    }
    72|
    73|    // POST: Create or query
    74|    if (req.method === 'POST') {
    75|      const { table, action, id, data, filters, orderBy, limit } = req.body || {};
    76|
    77|      if (!table || !VALID_TABLES.includes(table)) {
    78|        return res.status(400).json({ error: 'Invalid table name', validTables: VALID_TABLES });
    79|      }
    80|
    81|      // Action: select with filters
    82|      if (action === 'select') {
    83|        let query = supabase.from(table).select(data?.columns || '*');
    84|        if (filters) {
    85|          Object.entries(filters).forEach(([key, value]) => {
    86|            query = query.eq(key, value as string);
    87|          });
    88|        }
    89|        if (orderBy) query = query.order(orderBy, { ascending: false });
    90|        if (limit) query = query.limit(Number(limit));
    91|
    92|        const { data: rows, error } = await query;
    93|        if (error) return res.status(500).json({ error: error.message });
    94|        return res.status(200).json({ data: rows, count: rows?.length || 0 });
    95|      }
    96|
    97|      // Action: insert (default)
    98|      if (!data) {
    99|        return res.status(400).json({ error: 'Data required for insert' });
   100|      }
   101|
   102|      // Sanitize and validate input data
   103|      const snakeData = toSnakeCase(data);
   104|      const sanitizedInsertData = sanitizeData(table, snakeData);
   105|      const validationError = validateData(sanitizedInsertData);
   106|      if (validationError) {
   107|        return res.status(400).json({ error: validationError });
   108|      }
   109|
   110|      const { data: inserted, error } = await supabase
   111|        .from(table)
   112|        .insert(sanitizedInsertData)
   113|        .select();
   114|
   115|      if (error) return res.status(500).json({ error: error.message });
   116|      return res.status(201).json({ data: inserted });
   117|    }
   118|
   119|    // PUT: Update
   120|    if (req.method === 'PUT') {
   121|      const { table, id, data } = req.body || {};
   122|      if (!table || !VALID_TABLES.includes(table)) {
   123|        return res.status(400).json({ error: 'Invalid table name' });
   124|      }
   125|      if (!id || !data) {
   126|        return res.status(400).json({ error: 'ID and data required for update' });
   127|      }
   128|
   129|      // Sanitize and validate input data
   130|      const snakeData = toSnakeCase(data);
   131|      const sanitizedUpdateData = sanitizeData(table, snakeData);
   132|      const validationError = validateData(sanitizedUpdateData);
   133|      if (validationError) {
   134|        return res.status(400).json({ error: validationError });
   135|      }
   136|
   137|      const { data: updated, error } = await supabase
   138|        .from(table)
   139|        .update({ ...sanitizedUpdateData, updated_at: new Date().toISOString() })
   140|        .eq('id', id)
   141|        .select();
   142|
   143|      if (error) return res.status(500).json({ error: error.message });
   144|      return res.status(200).json({ data: updated });
   145|    }
   146|
   147|    // DELETE: Remove
   148|    if (req.method === 'DELETE') {
   149|      const { table, id } = req.body || {};
   150|      if (!table || !VALID_TABLES.includes(table)) {
   151|        return res.status(400).json({ error: 'Invalid table name' });
   152|      }
   153|      if (!id) {
   154|        return res.status(400).json({ error: 'ID required for delete' });
   155|      }
   156|
   157|      const { error } = await supabase.from(table).delete().eq('id', id);
   158|      if (error) return res.status(500).json({ error: error.message });
   159|      return res.status(200).json({ success: true });
   160|    }
   161|
   162|    return res.status(405).json({ error: 'Method not allowed' });
   163|  } catch (err: any) {
   164|    console.error('[YWM DB API] Error:', err.message);
   165|    return res.status(500).json({ error: err.message });
   166|  }
   167|}
   168|