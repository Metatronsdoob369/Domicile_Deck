'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  Search,
  Command as CommandIcon,
  Bell,
  Moon,
  Sun,
  RefreshCw,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { useTheme } from '@/hooks/useTheme'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/projects': 'Projects',
  '/projects/new': 'New Project',
  '/wall': 'Command Wall',
  '/commands': 'Commands',
  '/terminal': 'Terminal',
  '/settings': 'Settings',
}

export function Header() {
  const pathname = usePathname()
  const { theme, toggle, mounted } = useTheme()
  const [syncing, setSyncing] = useState(false)

  const handleSync = async () => {
    setSyncing(true)
    await new Promise((r) => setTimeout(r, 2000))
    setSyncing(false)
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-6">
      <div>
        <h1 className="text-xl font-semibold">
          {pageTitles[pathname] || 'DevDeck'}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/50 hover:bg-muted transition-colors text-sm text-muted-foreground"
          onClick={() => {
            window.dispatchEvent(
              new KeyboardEvent('keydown', { key: 'k', metaKey: true })
            )
          }}
        >
          <Search className="h-4 w-4" />
          <span className="hidden sm:inline">Search commands...</span>
          <kbd className="hidden sm:inline-flex h-5 items-center gap-1 rounded border border-border bg-background px-1.5 text-xs">
            <CommandIcon className="h-3 w-3" />K
          </kbd>
        </button>

        <Button variant="primary" size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Project</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleSync}
          disabled={syncing}
        >
          <RefreshCw className={cn('h-5 w-5', syncing && 'animate-spin')} />
        </Button>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-primary" />
        </Button>

        <Button variant="ghost" size="icon" onClick={toggle}>
          {mounted ? (theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />) : <Moon className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  )
}
