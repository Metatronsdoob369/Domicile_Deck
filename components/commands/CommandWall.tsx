'use client'

import { useMemo } from 'react'
import {
  GitBranch,
  Cloud,
  Container,
  Database,
  Server,
  Package,
  Workflow,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import { commandRegistry } from '@/lib/commands'
import { executeCommand } from '@/lib/command-execution'
import type { Command } from '@/types'

const categoryMeta: Record<
  Command['category'],
  { label: string; icon: React.ElementType; color: string }
> = {
  github: { label: 'Git/GitHub', icon: GitBranch, color: 'text-orange-500 bg-orange-500/10' },
  vercel: { label: 'Vercel', icon: Cloud, color: 'text-blue-500 bg-blue-500/10' },
  docker: { label: 'Docker', icon: Container, color: 'text-cyan-500 bg-cyan-500/10' },
  database: { label: 'Database', icon: Database, color: 'text-purple-500 bg-purple-500/10' },
  ssh: { label: 'SSH', icon: Server, color: 'text-green-500 bg-green-500/10' },
  npm: { label: 'npm/pnpm', icon: Package, color: 'text-red-500 bg-red-500/10' },
  workflow: { label: 'Workflows', icon: Workflow, color: 'text-yellow-500 bg-yellow-500/10' },
  custom: { label: 'Custom', icon: Workflow, color: 'text-slate-500 bg-slate-500/10' },
}

const categoryOrder: Command['category'][] = [
  'github',
  'vercel',
  'docker',
  'database',
  'ssh',
  'npm',
  'workflow',
  'custom',
]

export function CommandWall() {
  const grouped = useMemo(() => {
    const byCategory = new Map<Command['category'], Command[]>()
    for (const command of commandRegistry) {
      const current = byCategory.get(command.category) ?? []
      current.push(command)
      byCategory.set(command.category, current)
    }

    return categoryOrder
      .map((category) => ({
        category,
        meta: categoryMeta[category],
        commands: byCategory.get(category) ?? [],
      }))
      .filter((group) => group.commands.length > 0)
  }, [])

  const handleRun = async (command: Command) => {
    const result = await executeCommand(command)
    if (!result.ok && !('cancelled' in result)) {
      alert(result.error ?? 'Command failed.')
    }
  }

  return (
    <div className="space-y-8">
      {grouped.map((group) => {
        const Icon = group.meta.icon
        return (
          <section key={group.category} className="space-y-3">
            <div className="flex items-center gap-3">
              <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', group.meta.color)}>
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{group.meta.label}</h3>
                <p className="text-xs text-muted-foreground">
                  {group.commands.length} command{group.commands.length > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {group.commands.map((command) => {
                const status = command.status ?? 'stub'
                const statusVariant = status === 'wired' ? 'success' : 'secondary'
                const isWired = status === 'wired'
                return (
                  <button
                    key={command.id}
                    type="button"
                    onClick={() => handleRun(command)}
                    disabled={!isWired}
                    className={cn('text-left', !isWired && 'cursor-not-allowed opacity-70')}
                  >
                    <Card className="h-full p-4 transition-all hover:border-primary/50 hover:shadow-md">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="font-semibold">{command.name}</h4>
                          <p className="text-sm text-muted-foreground">{command.description}</p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant={statusVariant} size="sm">
                            {status === 'wired' ? 'Wired' : 'Stub'}
                          </Badge>
                          {command.dangerous && (
                            <Badge variant="error" size="sm">
                              Dangerous
                            </Badge>
                          )}
                          {command.requiresConfirmation && (
                            <Badge variant="warning" size="sm">
                              Confirm
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 rounded-lg bg-muted px-3 py-2 font-mono text-xs text-muted-foreground">
                        {command.command}
                      </div>
                    </Card>
                  </button>
                )
              })}
            </div>
          </section>
        )
      })}
    </div>
  )
}
