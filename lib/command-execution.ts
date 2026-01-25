'use client'

import type { Command } from '@/types'

export interface CommandRunResult {
  ok: boolean
  command: string
  stdout: string
  stderr: string
  exitCode: number
  error?: string
}

export async function runCommand(
  command: Command,
  options?: { args?: string[]; confirm?: boolean; armed?: boolean; timeoutMs?: number }
): Promise<CommandRunResult> {
  const response = await fetch('/api/commands/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      commandId: command.id,
      args: options?.args,
      confirm: options?.confirm,
      armed: options?.armed,
      timeoutMs: options?.timeoutMs,
    }),
  })

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    return {
      ok: false,
      command: command.command,
      stdout: '',
      stderr: '',
      exitCode: data?.exitCode ?? 1,
      error: data?.error ?? 'Command failed.',
    }
  }

  return data as CommandRunResult
}

export async function executeCommand(command: Command) {
  if (command.status !== 'wired') {
    return { ok: false, error: 'Command is not wired yet.' }
  }

  if (command.requiresConfirmation) {
    const confirmed = window.confirm(`Run command: ${command.command}?`)
    if (!confirmed) {
      return { ok: false, cancelled: true }
    }
  }

  if (command.dangerous) {
    const armed = window.confirm(`Arm and run: ${command.name}?`)
    if (!armed) {
      return { ok: false, cancelled: true }
    }
    return runCommand(command, { confirm: true, armed: true })
  }

  return runCommand(command, { confirm: command.requiresConfirmation })
}
