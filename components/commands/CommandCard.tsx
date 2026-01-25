'use client'

import { useState } from 'react'
import {
  GitBranch,
  Cloud,
  Container,
  Database,
  Server,
  Package,
  Workflow,
  Play,
  Copy,
  AlertTriangle,
  Check,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { executeCommand } from '@/lib/command-execution'
import type { Command } from '@/types'

const categoryIcons: Record<string, React.ElementType> = {
  github: GitBranch,
  vercel: Cloud,
  docker: Container,
  database: Database,
  ssh: Server,
  npm: Package,
  workflow: Workflow,
  custom: Workflow,
}

const categoryColors: Record<string, string> = {
  github: 'text-orange-500 bg-orange-500/10',
  vercel: 'text-blue-500 bg-blue-500/10',
  docker: 'text-cyan-500 bg-cyan-500/10',
  database: 'text-purple-500 bg-purple-500/10',
  ssh: 'text-green-500 bg-green-500/10',
  npm: 'text-red-500 bg-red-500/10',
  workflow: 'text-yellow-500 bg-yellow-500/10',
}

interface CommandCardProps {
  command: Command
}

export function CommandCard({ command }: CommandCardProps) {
  const [copied, setCopied] = useState(false)
  const [executing, setExecuting] = useState(false)

  const Icon = categoryIcons[command.category] || Workflow
  const colorClasses = categoryColors[command.category] || 'text-gray-500 bg-gray-500/10'
  const status = command.status ?? 'stub'
  const statusVariant = status === 'wired' ? 'success' : 'secondary'
  const isWired = status === 'wired'

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command.command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExecute = async () => {
    if (command.requiresConfirmation) {
      if (!confirm(`Are you sure you want to run: ${command.command}?`)) {
        return
      }
    }
    setExecuting(true)
    const result = await executeCommand(command)
    setExecuting(false)
    if (!result.ok && !('cancelled' in result)) {
      alert(result.error ?? 'Command failed.')
      return
    }
    if (result.ok) {
      console.log('Executed:', command.command)
      if (result.stdout) console.log(result.stdout)
      if (result.stderr) console.warn(result.stderr)
    }
  }

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg hover:border-primary/50">
      <div className="p-4 space-y-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-lg',
              colorClasses
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{command.name}</h3>
              {command.shortcut && (
                <kbd className="flex h-5 items-center rounded border border-border bg-muted px-1.5 text-xs text-muted-foreground">
                  {command.shortcut}
                </kbd>
              )}
            </div>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {command.description}
            </p>
          </div>
        </div>

        <div className="rounded-lg bg-muted p-2.5 font-mono text-xs text-muted-foreground overflow-x-auto">
          <code>{command.command}</code>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Badge variant={statusVariant} size="sm">
            {status === 'wired' ? 'Wired' : 'Stub'}
          </Badge>
          {command.dangerous && (
            <Badge variant="error" size="sm" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              Dangerous
            </Badge>
          )}
          {command.requiresConfirmation && (
            <Badge variant="warning" size="sm">
              Requires confirmation
            </Badge>
          )}
          {command.params && command.params.length > 0 && (
            <Badge variant="secondary" size="sm">
              {command.params.length} param{command.params.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-border">
          <Button
            variant="primary"
            size="sm"
            onClick={handleExecute}
            disabled={executing || !isWired}
            className="flex-1"
          >
            {executing ? (
              <span className="flex items-center gap-1.5">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Running...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Play className="h-4 w-4" />
                Run
              </span>
            )}
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCopy}>
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </Card>
  )
}
