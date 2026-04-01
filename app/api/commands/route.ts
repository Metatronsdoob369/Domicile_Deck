import { NextResponse } from 'next/server'
import { z } from 'zod'
import { commandRegistry } from '@/lib/commands'

const CommandParamSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['string', 'select', 'boolean']),
  required: z.boolean(),
  default: z.string().optional(),
  options: z.array(z.string()).optional(),
})

const CommandSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(['vercel', 'github', 'docker', 'database', 'ssh', 'npm', 'workflow', 'custom']),
  command: z.string().min(1),
  icon: z.string().min(1),
  shortcut: z.string().optional(),
  status: z.enum(['wired', 'stub']).optional(),
  dangerous: z.boolean().optional(),
  requiresConfirmation: z.boolean().optional(),
  params: z.array(CommandParamSchema).optional(),
})

export async function GET() {
  return NextResponse.json({ ok: true, commands: commandRegistry })
}

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON payload.' }, { status: 400 })
  }

  const result = CommandSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json(
      { ok: false, error: 'Validation failed.', issues: result.error.flatten() },
      { status: 422 }
    )
  }

  const command = result.data
  return NextResponse.json(
    {
      ok: true,
      command: {
        ...command,
        createdAt: new Date().toISOString(),
      },
    },
    { status: 201 }
  )
}
