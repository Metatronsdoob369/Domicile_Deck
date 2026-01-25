'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { Terminal as XTermTerminal } from 'xterm'
import type { FitAddon as XTermFitAddon } from 'xterm-addon-fit'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

type ShellStatus = 'disconnected' | 'connected' | 'running' | 'error'

export function LiveShell() {
  const [host, setHost] = useState('ws://localhost:3211')
  const [cwd, setCwd] = useState('')
  const [token, setToken] = useState('')
  const [armed, setArmed] = useState(false)
  const [status, setStatus] = useState<ShellStatus>('disconnected')
  const [statusMessage, setStatusMessage] = useState('')

  const terminalRef = useRef<HTMLDivElement | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const xtermRef = useRef<XTermTerminal | null>(null)
  const fitRef = useRef<XTermFitAddon | null>(null)

  const statusBadge = useMemo(() => {
    if (status === 'running') return { label: 'Running', variant: 'success' as const }
    if (status === 'connected') return { label: 'Connected', variant: 'secondary' as const }
    if (status === 'error') return { label: 'Error', variant: 'error' as const }
    return { label: 'Disconnected', variant: 'default' as const }
  }, [status])

  useEffect(() => {
    if (!terminalRef.current) return

    let isActive = true
    let rafId: number | null = null
    let terminal: XTermTerminal | null = null
    let fitAddon: XTermFitAddon | null = null

    const fitSafely = () => {
      if (!isActive) return
      if (!terminalRef.current || !terminal || !fitAddon) {
        rafId = requestAnimationFrame(fitSafely)
        return
      }
      if (terminalRef.current.clientWidth === 0 || terminalRef.current.clientHeight === 0) {
        rafId = requestAnimationFrame(fitSafely)
        return
      }
      if (!terminal.element) {
        rafId = requestAnimationFrame(fitSafely)
        return
      }
      try {
        fitAddon.fit()
      } catch {}
    }

    const initTerminal = async () => {
      try {
        const [{ Terminal }, { FitAddon }] = await Promise.all([
          import('xterm'),
          import('xterm-addon-fit'),
          import('xterm/css/xterm.css'),
        ])

        if (!terminalRef.current || !isActive) return

        terminal = new Terminal({
          cursorBlink: true,
          fontSize: 13,
          theme: {
            background: '#0f1115',
            foreground: '#e4e7ef',
          },
        })
        fitAddon = new FitAddon()
        terminal.loadAddon(fitAddon)
        terminal.open(terminalRef.current)

        xtermRef.current = terminal
        fitRef.current = fitAddon

        terminal.onData((data) => {
          if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
          wsRef.current.send(JSON.stringify({ type: 'input', data }))
        })

        rafId = requestAnimationFrame(fitSafely)
      } catch {
        // If xterm fails to load, keep the shell disabled.
      }
    }

    initTerminal()

    const handleResize = () => {
      fitSafely()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      isActive = false
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener('resize', handleResize)
      terminal?.dispose()
    }
  }, [])

  const connect = () => {
    if (wsRef.current) {
      wsRef.current.close()
    }

    const socket = new WebSocket(host)
    wsRef.current = socket

    socket.onopen = () => {
      setStatus('connected')
      setStatusMessage('Socket connected.')
      if (armed) {
        startShell()
      }
    }

    socket.onerror = () => {
      setStatus('error')
      setStatusMessage('Failed to connect to live shell.')
    }

    socket.onmessage = (event) => {
      let payload
      try {
        payload = JSON.parse(event.data as string)
      } catch {
        return
      }

      if (payload.type === 'output') {
        xtermRef.current?.write(payload.data)
      }

      if (payload.type === 'status') {
        setStatusMessage(payload.message)
        if (payload.message?.startsWith('Shell started')) {
          setStatus('running')
        }
      }

      if (payload.type === 'error') {
        setStatus('error')
        setStatusMessage(payload.message)
      }
    }

    socket.onclose = () => {
      setStatus('disconnected')
      setStatusMessage('Socket closed.')
    }
  }

  const startShell = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return
    const cols = xtermRef.current?.cols ?? 120
    const rows = xtermRef.current?.rows ?? 30

    wsRef.current.send(
      JSON.stringify({
        type: 'init',
        token: token || undefined,
        cwd: cwd || undefined,
        cols,
        rows,
      })
    )
  }

  const stopShell = () => {
    wsRef.current?.send(JSON.stringify({ type: 'kill' }))
    setStatus('connected')
  }

  const clearShell = () => {
    xtermRef.current?.clear()
  }

  return (
    <Card className="p-4 space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-lg font-semibold">Live Shell</h3>
            <p className="text-xs text-muted-foreground">
              Direct terminal session on the host running this dashboard.
            </p>
          </div>
          <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" onClick={connect}>
            Connect
          </Button>
          <Button size="sm" variant="ghost" onClick={startShell} disabled={!armed || status === 'running'}>
            Start Shell
          </Button>
          <Button size="sm" variant="ghost" onClick={stopShell} disabled={status !== 'running'}>
            Stop
          </Button>
          <Button size="sm" variant="ghost" onClick={clearShell}>
            Clear
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="space-y-1 text-xs text-muted-foreground">
          Host
          <input
            value={host}
            onChange={(e) => setHost(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            placeholder="ws://localhost:3211"
          />
        </label>
        <label className="space-y-1 text-xs text-muted-foreground">
          Working directory
          <input
            value={cwd}
            onChange={(e) => setCwd(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            placeholder="/Users/joewales"
          />
        </label>
        <label className="space-y-1 text-xs text-muted-foreground">
          Auth token (optional)
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            placeholder="Set if server requires"
          />
        </label>
      </div>

      <div className="flex items-center gap-2">
        <input
          id="arm-shell"
          type="checkbox"
          checked={armed}
          onChange={(e) => setArmed(e.target.checked)}
          className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
        />
        <label htmlFor="arm-shell" className="text-sm text-muted-foreground">
          Arm live shell (opens full terminal control)
        </label>
      </div>

      <div className={cn('rounded-lg border border-border bg-black/90 p-2', status === 'error' && 'border-red-500/60')}>
        <div ref={terminalRef} className="h-[360px]" />
      </div>

      {statusMessage && (
        <p className="text-xs text-muted-foreground">{statusMessage}</p>
      )}
    </Card>
  )
}
