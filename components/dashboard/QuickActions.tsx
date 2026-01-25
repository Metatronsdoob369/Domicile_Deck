'use client'

import {
  GitCommit,
  Upload,
  Terminal,
  Database,
  RefreshCw,
  Plus,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import { getCommandById } from '@/lib/commands'
import { executeCommand } from '@/lib/command-execution'

const actions = [
  {
    id: 'git-commit',
    label: 'Git Commit',
    icon: GitCommit,
    color: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    commandId: 'git-commit',
  },
  {
    id: 'deploy',
    label: 'Deploy',
    icon: Upload,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    commandId: 'vercel-prod',
  },
  {
    id: 'terminal',
    label: 'Terminal',
    icon: Terminal,
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    commandId: 'terminal-open',
  },
  {
    id: 'db-studio',
    label: 'DB Studio',
    icon: Database,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    commandId: 'db-studio',
  },
  {
    id: 'sync',
    label: 'Sync All',
    icon: RefreshCw,
    color: 'text-cyan-500',
    bgColor: 'bg-cyan-500/10',
    commandId: 'wf-sync-install',
  },
  {
    id: 'new',
    label: 'New Project',
    icon: Plus,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
    commandId: 'project-new',
  },
]

export function QuickActions() {
  const handleAction = async (commandId: string) => {
    const command = getCommandById(commandId)
    if (!command) {
      console.warn('Missing command for action:', commandId)
      return
    }
    const result = await executeCommand(command)
    if (!result.ok && !('cancelled' in result)) {
      alert(result.error ?? 'Command failed.')
    }
  }

  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
      {actions.map((action) => (
        <button
          key={action.id}
          type="button"
          onClick={() => handleAction(action.commandId)}
          className="group"
        >
          <Card className="p-4 text-center transition-all hover:shadow-md hover:border-primary/50 group-hover:scale-[1.02]">
            <div
              className={cn(
                'mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg transition-colors',
                action.bgColor
              )}
            >
              <action.icon className={cn('h-5 w-5', action.color)} />
            </div>
            <span className="text-xs font-medium">{action.label}</span>
          </Card>
        </button>
      ))}
    </div>
  )
}
