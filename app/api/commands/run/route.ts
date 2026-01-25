import { NextResponse } from 'next/server'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
import { getCommandById } from '@/lib/commands'

const execAsync = promisify(exec)
const DEFAULT_TIMEOUT_MS = 60000
const MAX_TIMEOUT_MS = 300000

function quoteArg(value: string) {
  return JSON.stringify(value)
}

export async function POST(request: Request) {
  let payload: {
    commandId?: string
    args?: string[]
    confirm?: boolean
    armed?: boolean
    timeoutMs?: number
  }

  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON payload.' }, { status: 400 })
  }

  if (!payload.commandId) {
    return NextResponse.json({ ok: false, error: 'commandId is required.' }, { status: 400 })
  }

  const command = getCommandById(payload.commandId)
  if (!command) {
    return NextResponse.json({ ok: false, error: 'Command not found.' }, { status: 404 })
  }

  if (command.status !== 'wired') {
    return NextResponse.json({ ok: false, error: 'Command is not wired yet.' }, { status: 409 })
  }

  if (command.requiresConfirmation && !payload.confirm) {
    return NextResponse.json({ ok: false, error: 'Confirmation required.' }, { status: 412 })
  }

  if (command.dangerous && !payload.armed) {
    return NextResponse.json({ ok: false, error: 'Command requires arming.' }, { status: 412 })
  }

  const args = Array.isArray(payload.args) ? payload.args : []
  if (command.params && command.params.length > 0 && args.length === 0) {
    return NextResponse.json({ ok: false, error: 'Command parameters are required.' }, { status: 400 })
  }

  const timeoutMs = Math.min(
    Math.max(payload.timeoutMs ?? DEFAULT_TIMEOUT_MS, 1000),
    MAX_TIMEOUT_MS
  )

  const fullCommand = args.length > 0
    ? `${command.command} ${args.map(quoteArg).join(' ')}`
    : command.command

  try {
    const { stdout, stderr } = await execAsync(fullCommand, {
      timeout: timeoutMs,
      maxBuffer: 5 * 1024 * 1024,
    })

    return NextResponse.json({
      ok: true,
      command: fullCommand,
      stdout,
      stderr,
      exitCode: 0,
    })
  } catch (error) {
    const execError = error as { stdout?: string; stderr?: string; code?: number; message?: string }
    return NextResponse.json(
      {
        ok: false,
        command: fullCommand,
        stdout: execError.stdout ?? '',
        stderr: execError.stderr ?? execError.message ?? 'Command failed.',
        exitCode: execError.code ?? 1,
      },
      { status: 500 }
    )
  }
}
