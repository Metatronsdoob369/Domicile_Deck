'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  LayoutGrid,
  FolderKanban,
  Terminal,
  TerminalSquare,
  Settings,
  GitBranch,
  Cloud,
  Database,
  Container,
  Server,
  Package,
  ChevronLeft,
  Zap,
} from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Command Wall', href: '/wall', icon: LayoutGrid },
  { name: 'Terminal', href: '/terminal', icon: TerminalSquare },
  { name: 'Commands', href: '/commands', icon: Terminal },
  { name: 'Settings', href: '/settings', icon: Settings },
]

const services = [
  { name: 'Git/GitHub', icon: GitBranch, status: 'connected' },
  { name: 'Vercel', icon: Cloud, status: 'connected' },
  { name: 'Docker', icon: Container, status: 'disconnected' },
  { name: 'Database', icon: Database, status: 'connected' },
  { name: 'SSH', icon: Server, status: 'idle' },
  { name: 'npm/pnpm', icon: Package, status: 'connected' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const { theme, toggle, mounted } = useTheme()

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-border bg-card transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-border">
        {!collapsed && (
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded border border-gold-dim bg-deep shadow-[0_0_15px_rgba(201,168,76,0.1)]">
              <Zap className="h-6 w-6 text-gold" />
            </div>
            <div className="flex flex-col">
              <span className="font-light text-lg tracking-[0.2em] text-white uppercase">Protocol</span>
              <span className="text-[9px] text-muted-foreground tracking-[0.3em] uppercase -mt-1 font-mono">Autonomous</span>
            </div>
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'p-1.5 rounded-md hover:bg-muted transition-colors',
            collapsed && 'mx-auto'
          )}
        >
          <ChevronLeft
            className={cn(
              'h-5 w-5 transition-transform',
              collapsed && 'rotate-180'
            )}
          />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                'hover:bg-muted',
                isActive && 'bg-primary/10 text-primary',
                collapsed && 'justify-center'
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.name}</span>}
            </Link>
          )
        })}
      </nav>

      {!collapsed && (
        <div className="p-3 border-t border-border">
          <h3 className="px-3 mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Services
          </h3>
          <div className="space-y-1">
            {services.map((service) => (
              <div
                key={service.name}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm"
              >
                <service.icon className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 truncate">{service.name}</span>
                <span
                  className={cn(
                    'h-2 w-2 rounded-full',
                    service.status === 'connected' && 'bg-green-500',
                    service.status === 'disconnected' && 'bg-red-500',
                    service.status === 'idle' && 'bg-yellow-500'
                  )}
                />
              </div>
            ))}
          </div>
          <button
            onClick={toggle}
            className="mt-3 w-full rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
          >
            {mounted ? (theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode') : 'Switch Theme'}
          </button>
        </div>
      )}
    </aside>
  )
}
