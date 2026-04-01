import { NextResponse, type NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { z } from 'zod'
import { listRunRecords } from '@/lib/runner'
import { fetchRunRecords, persistRunRecord } from '@/lib/supabase'

const RunRequestSchema = z.object({
  commandId: z.string().min(1),
  args: z.array(z.string()).optional(),
})

/** GET /api/runs – return run history (Supabase if configured, else in-memory). */
export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
  if (!token) {
    return NextResponse.json({ ok: false, error: 'Authentication required.' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const limit = Math.min(Number(searchParams.get('limit') ?? 50), 200)

  // Prefer Supabase when configured; fall back to in-memory store.
  const supabaseRuns = await fetchRunRecords(limit)
  if (supabaseRuns !== null) {
    return NextResponse.json({ ok: true, runs: supabaseRuns })
  }

  const runs = listRunRecords(limit)
  return NextResponse.json({ ok: true, runs })
}

/** POST /api/runs – queue a run record (used by external callers / future scheduler). */
export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON payload.' }, { status: 400 })
  }

  const parsed = RunRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: 'Validation failed.', issues: parsed.error.flatten() },
      { status: 422 }
    )
  }

  const { commandId, args } = parsed.data

  const run = {
    id: `run_${Date.now()}`,
    commandId,
    mode: 'live' as const,
    status: 'queued' as const,
    output: '',
    stderr: '',
    exitCode: null,
    executedBy: 'anonymous',
    executedAt: new Date().toISOString(),
    completedAt: null,
    args: args ?? [],
  }

  // Persist to Supabase when configured.
  persistRunRecord(run).catch(err => {
    console.error('[api/runs] Failed to persist run record:', err)
  })

  return NextResponse.json({ ok: true, run }, { status: 202 })
}
