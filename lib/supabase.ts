/**
 * Supabase client setup.
 *
 * Two clients are exported:
 *   - `supabaseAnon`    – uses the public anon key; safe for client-side code.
 *   - `supabaseService` – uses the service-role key; ONLY for server-side use.
 *
 * Both return `null` when the required environment variables are absent so
 * callers can fall back gracefully (e.g. use the in-memory runner store).
 *
 * Required env vars (see .env.local.example):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_ROLE_KEY  (server only)
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { RunRecord } from '@/types'

// ─── Database row types (mirrors the Supabase schema) ─────────────────────────

export interface RunRow {
  id: string
  command_id: string
  mode: string
  status: string
  output: string
  stderr: string
  exit_code: number | null
  executed_by: string
  executed_at: string
  completed_at: string | null
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rowToRunRecord(row: RunRow): RunRecord {
  return {
    id: row.id,
    commandId: row.command_id,
    mode: row.mode as RunRecord['mode'],
    status: row.status as RunRecord['status'],
    output: row.output,
    stderr: row.stderr,
    exitCode: row.exit_code,
    executedBy: row.executed_by,
    executedAt: row.executed_at,
    completedAt: row.completed_at,
  }
}

// ─── Client singletons ────────────────────────────────────────────────────────

let _anonClient: SupabaseClient | null = null
let _serviceClient: SupabaseClient | null = null

/** Public anon client — safe to use in browser and server code. */
export function getSupabaseAnon(): SupabaseClient | null {
  if (_anonClient) return _anonClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null

  _anonClient = createClient(url, key)
  return _anonClient
}

/** Service-role client — **only** call from server-side code. */
export function getSupabaseService(): SupabaseClient | null {
  if (_serviceClient) return _serviceClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null

  _serviceClient = createClient(url, key, {
    auth: { persistSession: false },
  })
  return _serviceClient
}

/** Returns true when Supabase is fully configured for server-side use. */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
  )
}

// ─── Run record persistence helpers ──────────────────────────────────────────

/** Persist a RunRecord to Supabase.  Returns the stored row or null on error. */
export async function persistRunRecord(record: RunRecord): Promise<RunRecord | null> {
  const client = getSupabaseService()
  if (!client) return null

  const row: RunRow = {
    id: record.id,
    command_id: record.commandId,
    mode: record.mode,
    status: record.status,
    output: record.output,
    stderr: record.stderr,
    exit_code: record.exitCode,
    executed_by: record.executedBy,
    executed_at: record.executedAt,
    completed_at: record.completedAt,
  }

  const { data, error } = await client.from('runs').upsert(row).select().single()
  if (error) {
    console.error('[supabase] Failed to persist run record:', error.message)
    return null
  }
  return rowToRunRecord(data as RunRow)
}

/** Fetch a page of run records from Supabase. */
export async function fetchRunRecords(limit = 50): Promise<RunRecord[] | null> {
  const client = getSupabaseService()
  if (!client) return null

  const { data, error } = await client
    .from('runs')
    .select('*')
    .order('executed_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[supabase] Failed to fetch run records:', error.message)
    return null
  }

  return (data as RunRow[]).map(rowToRunRecord)
}
