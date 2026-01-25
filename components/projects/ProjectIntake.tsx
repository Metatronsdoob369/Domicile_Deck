'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import type { Command } from '@/types'

interface ScanResult {
  name: string
  path: string
  scriptCount: number
  commands: Command[]
}

export function ProjectIntake() {
  const [projectPath, setProjectPath] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<ScanResult | null>(null)
  const [commands, setCommands] = useState<Command[]>([])

  const handleScan = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await fetch('/api/projects/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: projectPath }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Failed to scan project.')
      }

      setResult(data.project as ScanResult)
      setCommands(data.project.commands as Command[])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scan project.')
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = (id: string) => {
    setCommands((prev) =>
      prev.map((command) =>
        command.id === id
          ? {
              ...command,
              status: command.status === 'wired' ? 'stub' : 'wired',
            }
          : command
      )
    )
  }

  const copyCommands = async () => {
    const payload = JSON.stringify(commands, null, 2)
    await navigator.clipboard.writeText(payload)
  }

  return (
    <div className="space-y-6">
      <Card className="p-4 space-y-4">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Project Intake</h3>
          <p className="text-sm text-muted-foreground">
            Scan a repo and generate command buttons from package.json scripts.
          </p>
        </div>
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <label className="flex-1 text-sm text-muted-foreground">
            Project path
            <input
              value={projectPath}
              onChange={(e) => setProjectPath(e.target.value)}
              placeholder="/Users/joewales/NODE_OUT_Master/domicile_live"
              className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
            />
          </label>
          <Button variant="primary" onClick={handleScan} disabled={!projectPath || loading}>
            {loading ? 'Scanning...' : 'Scan project'}
          </Button>
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </Card>

      {result && (
        <Card className="p-4 space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h4 className="text-lg font-semibold">{result.name}</h4>
              <p className="text-xs text-muted-foreground">{result.path}</p>
            </div>
            <Badge variant="secondary">{result.scriptCount} scripts</Badge>
          </div>

          <div className="space-y-2">
            {commands.map((command) => {
              const isWired = command.status === 'wired'
              return (
                <div
                  key={command.id}
                  className="flex flex-col gap-2 rounded-lg border border-border bg-background p-3 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-medium">{command.name}</p>
                    <p className="text-xs text-muted-foreground">{command.command}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleStatus(command.id)}
                    className={cn(
                      'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                      isWired
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {isWired ? 'Wired' : 'Stub'}
                  </button>
                </div>
              )
            })}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={copyCommands}>
              Copy JSON for registry
            </Button>
            <p className="text-xs text-muted-foreground">
              Paste into lib/commands.ts or store for later wiring.
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}
