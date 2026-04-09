/**
 * Command Runner Scaffold
 *
 * Supports three execution modes:
 *   - dry-run  : validates and builds the full command string; never executes
 *   - guarded  : requires confirm/armed flags before executing
 *   - live     : executes immediately with the supplied options
 *
 * Run records are stored in an in-memory map so they survive the lifetime of
 * the Node process.  The store is intentionally thin and structured to be
 * swapped out for a Supabase-backed implementation (see lib/supabase.ts).
 */

import { randomUUID } from 'node:crypto'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import type { Command } from '@/types'
import type { ExecutionMode, RunRecord, RunStatus } from '@/types'

const execAsync = promisify(exec)

// ─── In-memory run store ──────────────────────────────────────────────────────

const runStore = new Map<string, RunRecord>()

const DEFAULT_TIMEOUT_MS = 60_000
const MAX_TIMEOUT_MS = 300_000

function generateId(): string {
  return `run_${randomUUID()}`
}

export function createRunRecord(
  commandId: string,
  mode: ExecutionMode,
  executedBy: string
): RunRecord {
  const record: RunRecord = {
    id: generateId(),
    commandId,
    mode,
    status: 'queued',
    output: '',
    stderr: '',
    exitCode: null,
    executedBy,
    executedAt: new Date().toISOString(),
    completedAt: null,
  }
  runStore.set(record.id, record)
  return { ...record }
}

export function updateRunRecord(id: string, patch: Partial<RunRecord>): RunRecord | null {
  const existing = runStore.get(id)
  if (!existing) return null
  const updated = { ...existing, ...patch }
  runStore.set(id, updated)
  return { ...updated }
}

export function getRunRecord(id: string): RunRecord | null {
  const record = runStore.get(id)
  return record ? { ...record } : null
}

export function listRunRecords(limit = 50): RunRecord[] {
  const all = Array.from(runStore.values())
  return all
    .sort((a, b) => (a.executedAt > b.executedAt ? -1 : 1))
    .slice(0, limit)
    .map(r => ({ ...r }))
}

// ─── Argument helpers ─────────────────────────────────────────────────────────

/**
 * Escape a shell argument using single quotes.
 * Single quotes prevent all shell expansions (variables, command substitution, etc).
 * The only limitation is that you cannot include a literal single quote.
 * To work around that, we close the quote, add an escaped quote, and reopen.
 */
function quoteArg(value: string): string {
  // Replace each single quote with: '\'' (end quote, escaped quote, start quote)
  return "'" + value.replace(/'/g, "'\\''") + "'"
}

export function buildFullCommand(command: Command, args: string[] = []): string {
  return args.length > 0
    ? `${command.command} ${args.map(quoteArg).join(' ')}`
    : command.command
}

// ─── Runner ───────────────────────────────────────────────────────────────────

/** Maximum bytes captured from a single command's stdout/stderr. */
const MAX_BUFFER_BYTES = 5 * 1024 * 1024 // 5 MB

export interface RunOptions {
  args?: string[]
  confirm?: boolean
  armed?: boolean
  timeoutMs?: number
  executedBy?: string
}

export interface RunResult {
  record: RunRecord
  /** Present only when the command was actually executed (mode !== 'dry-run'). */
  stdout?: string
  stderr?: string
}

/**
 * Execute (or simulate) a command and return a persisted RunRecord.
 *
 * @param command  The command definition from the registry.
 * @param mode     Execution mode: 'dry-run' | 'guarded' | 'live'.
 * @param options  Runtime options (args, confirmation flags, timeout, actor).
 */
export async function executeRun(
  command: Command,
  mode: ExecutionMode,
  options: RunOptions = {}
): Promise<{ ok: true; record: RunRecord } | { ok: false; error: string; status?: number }> {
  const actor = options.executedBy ?? 'anonymous'

  // ── Guard: only wired commands can run ────────────────────────────────────
  if (command.status !== 'wired') {
    return { ok: false, error: 'Command is not wired yet.', status: 409 }
  }

  // ── Guard: guarded/live modes require safety acknowledgements ─────────────
  if (mode !== 'dry-run') {
    if (command.requiresConfirmation && !options.confirm) {
      return { ok: false, error: 'Confirmation required.', status: 412 }
    }
    if (command.dangerous && !options.armed) {
      return { ok: false, error: 'Command requires arming.', status: 412 }
    }
  }

  // ── Guard: required params must be supplied ───────────────────────────────
  const args = Array.isArray(options.args) ? options.args : []
  if (command.params && command.params.length > 0 && args.length === 0) {
    return { ok: false, error: 'Command parameters are required.', status: 400 }
  }

  const fullCommand = buildFullCommand(command, args)
  const record = createRunRecord(command.id, mode, actor)

  // ── Dry-run: validate and return without executing ────────────────────────
  if (mode === 'dry-run') {
    const completed = updateRunRecord(record.id, {
      status: 'completed' as RunStatus,
      output: `[dry-run] Would execute: ${fullCommand}`,
      exitCode: 0,
      completedAt: new Date().toISOString(),
    })!
    return { ok: true, record: completed }
  }

  // ── Live / Guarded: execute command ──────────────────────────────────────
  updateRunRecord(record.id, { status: 'running' })

  const timeoutMs = Math.min(
    Math.max(options.timeoutMs ?? DEFAULT_TIMEOUT_MS, 1_000),
    MAX_TIMEOUT_MS
  )

  try {
    const { stdout, stderr } = await execAsync(fullCommand, {
      timeout: timeoutMs,
      maxBuffer: MAX_BUFFER_BYTES,
    })

    const completed = updateRunRecord(record.id, {
      status: 'completed' as RunStatus,
      output: stdout,
      stderr,
      exitCode: 0,
      completedAt: new Date().toISOString(),
    })!
    return { ok: true, record: completed }
  } catch (err) {
    const execErr = err as { stdout?: string; stderr?: string; code?: number; message?: string }
    const failed = updateRunRecord(record.id, {
      status: 'failed' as RunStatus,
      output: execErr.stdout ?? '',
      stderr: execErr.stderr ?? execErr.message ?? 'Command failed.',
      exitCode: execErr.code ?? 1,
      completedAt: new Date().toISOString(),
    })!
    return { ok: true, record: failed }
  }
}
