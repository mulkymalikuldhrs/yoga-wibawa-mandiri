// ============================================================
// Puter KV Store Wrapper — YWM Key Patterns
// ============================================================

import { waitForPuter, ensureAuth } from './puter';
import { KV_PREFIXES } from '@/types/dashboard';

// Get a single item by key
export async function kvGet<T>(key: string): Promise<T | null> {
  try {
    await ensureAuth();
    const puter = await waitForPuter();
    const raw = await puter.kv.get(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`KV GET gagal untuk key "${key}":`, err);
    return null;
  }
}

// Set a single item by key
export async function kvSet<T>(key: string, value: T): Promise<void> {
  try {
    await ensureAuth();
    const puter = await waitForPuter();
    await puter.kv.set(key, JSON.stringify(value));
  } catch (err) {
    console.error(`KV SET gagal untuk key "${key}":`, err);
    throw err;
  }
}

// Delete a single item by key
export async function kvDel(key: string): Promise<void> {
  try {
    await ensureAuth();
    const puter = await waitForPuter();
    await puter.kv.del(key);
  } catch (err) {
    console.error(`KV DEL gagal untuk key "${key}":`, err);
    throw err;
  }
}

// List all keys with a given prefix
export async function kvList(prefix: string): Promise<string[]> {
  try {
    await ensureAuth();
    const puter = await waitForPuter();
    const keys = await puter.kv.list(prefix);
    return Array.isArray(keys) ? keys : [];
  } catch (err) {
    console.error(`KV LIST gagal untuk prefix "${prefix}":`, err);
    return [];
  }
}

// Get all items with a prefix (e.g., all spare parts)
export async function kvGetAll<T>(prefix: string): Promise<T[]> {
  const keys = await kvList(prefix);
  const items: T[] = [];
  for (const key of keys) {
    const item = await kvGet<T>(key);
    if (item) items.push(item);
  }
  return items;
}

// Generate a unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Create a timestamped item with auto-generated ID
export function createTimestampedItem<T extends Record<string, unknown>>(
  data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>,
  _prefix: keyof typeof KV_PREFIXES
): T & { id: string; createdAt: string; updatedAt: string } {
  const id = generateId();
  const now = new Date().toISOString();
  return {
    ...data,
    id,
    createdAt: now,
    updatedAt: now,
  } as T & { id: string; createdAt: string; updatedAt: string };
}

// Save an item with its prefix key
export async function kvSaveItem<T extends { id: string; updatedAt?: string }>(
  prefix: keyof typeof KV_PREFIXES,
  item: T
): Promise<void> {
  const key = KV_PREFIXES[prefix] + item.id;
  const toSave = { ...item, updatedAt: new Date().toISOString() };
  await kvSet(key, toSave);
}

// Delete an item by ID and prefix
export async function kvDeleteItem(
  prefix: keyof typeof KV_PREFIXES,
  id: string
): Promise<void> {
  const key = KV_PREFIXES[prefix] + id;
  await kvDel(key);
}
