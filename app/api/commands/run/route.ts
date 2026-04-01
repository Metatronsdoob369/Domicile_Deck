import { NextResponse, type NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { z } from 'zod'
import { getCommandById } from '@/lib/commands'
import { executeRun } from '@/lib/runner'
import { persistRunRecord } from '@/lib/supabase'
import { checkRateLimit } from '@/lib/rate-limit'
import type { ExecutionMode, UserRole } from '@/types'

const RunCommandSchema = z.object({
  commandId: z.string().min(1),
  mode: z.enum(['dry-run', 'guarded', 'live']).default('live'),
  args: z.array(z.string()).optional(),
  confirm: z.boolean().optional(),
  armed: z.boolean().optional(),
  timeoutMs: z.number().int().positive().max(300_000).optional(),
})

export async function POST(request: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  const actor = (token?.email as string | undefined) ?? 'anonymous'
  const role = ((token?.role as UserRole | undefined) ?? 'viewer') as UserRole

  // ── Parse & validate body ─────────────────────────────────────────────────
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON payload.' }, { status: 400 })
  }

  const parsed = RunCommandSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Validation failed.', issues: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const { commandId, mode, args, confirm, armed, timeoutMs } = parsed.data

  // ── Lookup command ────────────────────────────────────────────────────────
  const command = getCommandById(commandId)
  if (!command) {
    return NextResponse.json({ ok: false, error: 'Command not found.' }, { status: 404 })
  }

  // ── Permission check: only admin may run dangerous commands ───────────────
  if (command.dangerous && role !== 'admin') {
    return NextResponse.json(
      { ok: false, error: 'Admin role required for dangerous commands.' },
      { status: 403 }
    )
  }

  // ── Rate limiting ─────────────────────────────────────────────────────────
  // Prefer authenticated identity; fall back to IP header for anonymous callers.
  const rateLimitKey =
    token?.sub ??
    (request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'anon')
      .split(',')[0]
      .trim()
  const rateTier = command.dangerous ? 'strict' : 'standard'
  const rateResult = checkRateLimit(rateLimitKey, rateTier)

  if (!rateResult.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: `Rate limit exceeded. Try again in ${Math.ceil(rateResult.resetInMs / 1000)}s.`,
      },
      {
        status: 429,
        headers: { 'Retry-After': String(Math.ceil(rateResult.resetInMs / 1000)) },
      }
    )
  }

  // ── Execute via runner ────────────────────────────────────────────────────
  const result = await executeRun(command, mode as ExecutionMode, {
    args,
    confirm,
    armed,
    timeoutMs,
    executedBy: actor,
  })

  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status ?? 500 })
  }

  // ── Persist to Supabase (fire-and-forget; falls back to in-memory) ────────
  persistRunRecord(result.record).catch(() => {
    // Supabase may not be configured; the in-memory runner store is the fallback.
  })

  return NextResponse.json({ ok: true, run: result.record })
}
