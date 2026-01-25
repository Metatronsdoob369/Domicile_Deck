'use client'

import { useState } from 'react'
import { CommandGrid } from '@/components/commands/CommandGrid'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import {
  Search,
  Settings,
  GitBranch,
  Cloud,
  Container,
  Database,
  Server,
  Package,
  Workflow,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const categories = [
  { id: 'all', label: 'All', icon: Settings },
  { id: 'github', label: 'Git/GitHub', icon: GitBranch },
  { id: 'vercel', label: 'Vercel', icon: Cloud },
  { id: 'docker', label: 'Docker', icon: Container },
  { id: 'database', label: 'Database', icon: Database },
  { id: 'ssh', label: 'SSH', icon: Server },
  { id: 'npm', label: 'npm/pnpm', icon: Package },
  { id: 'workflow', label: 'Workflows', icon: Workflow },
]

export default function CommandsPage() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Commands</h2>
          <p className="text-muted-foreground">
            Browse and execute development commands
          </p>
        </div>
        <Button variant="primary">
          Create Custom Command
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search commands..."
              className="w-full rounded-lg border border-border bg-background py-2 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                  activeCategory === cat.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                )}
              >
                <cat.icon className="h-4 w-4" />
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      <CommandGrid search={search} category={activeCategory} />
    </div>
  )
}
