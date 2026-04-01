'use client'

import type { Command, ExecutionMode, RunRecord } from '@/types'

export interface CommandRunResult {
  ok: true
  run: RunRecord
}

export interface CommandRunFailure {
  ok: false
  error: string
  cancelled?: undefined
}

export interface CommandRunCancelled {
  ok: false
  cancelled: true
  error?: undefined
}

export type ExecuteCommandResult = CommandRunResult | CommandRunFailure | CommandRunCancelled

export interface RunCommandOptions {
  mode?: ExecutionMode
  args?: string[]
  confirm?: boolean
  armed?: boolean
  timeoutMs?: number
}

export async function runCommand(
  command: Command,
  options: RunCommandOptions = {}
): Promise<CommandRunResult | CommandRunFailure> {
  const response = await fetch('/api/commands/run', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      commandId: command.id,
      mode: options.mode ?? 'live',
      args: options.args,
      confirm: options.confirm,
      armed: options.armed,
      timeoutMs: options.timeoutMs,
    }),
  })

  const data = await response.json().catch(() => null)
  if (!response.ok) {
    return {
      ok: false,
      error: data?.error ?? 'Command failed.',
    }
  }

  return data as CommandRunResult
}

export async function executeCommand(
  command: Command,
  mode: ExecutionMode = 'live'
): Promise<ExecuteCommandResult> {
  if (command.status !== 'wired') {
    return { ok: false, error: 'Command is not wired yet.' }
  }

  // Dry-run: skip confirmation dialogs — no side effects.
  if (mode === 'dry-run') {
    return runCommand(command, { mode: 'dry-run' })
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
    return runCommand(command, { mode, confirm: true, armed: true })
  }

  return runCommand(command, { mode, confirm: command.requiresConfirmation })
}

