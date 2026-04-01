import { NextResponse } from 'next/server'
import { z } from 'zod'

const RunRequestSchema = z.object({
  commandId: z.string().min(1),
  args: z.array(z.string()).optional(),
})

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON payload.' }, { status: 400 })
  }

  const result = RunRequestSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { ok: false, error: 'Validation failed.', issues: result.error.flatten() },
      { status: 422 }
    )
  }

  const { commandId, args } = result.data

  // Mock run metadata — structured for future Supabase-backed persistence
  const run = {
    runId: `run_${Date.now()}`,
    commandId,
    args: args ?? [],
    status: 'queued' as const,
    requestedAt: new Date().toISOString(),
  }

  return NextResponse.json({ ok: true, run }, { status: 202 })
}
