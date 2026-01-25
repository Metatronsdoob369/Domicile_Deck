'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  GitBranch,
  Cloud,
  Terminal,
  Database,
  Container,
  Server,
  ArrowRight,
  Command as CommandIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { commandRegistry } from '@/lib/commands'
import { executeCommand } from '@/lib/command-execution'
import type { Command as CommandType } from '@/types'

const categoryIcons: Record<string, React.ElementType> = {
  github: GitBranch,
  vercel: Cloud,
  docker: Container,
  database: Database,
  ssh: Server,
  npm: Terminal,
  workflow: Terminal,
  custom: Terminal,
}

export function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const filteredCommands = useMemo(() => {
    if (!search) return commandRegistry
    const lower = search.toLowerCase()
    return commandRegistry.filter(
      (cmd) =>
        cmd.name.toLowerCase().includes(lower) ||
        cmd.description.toLowerCase().includes(lower) ||
        cmd.command.toLowerCase().includes(lower) ||
        cmd.shortcut?.toLowerCase().includes(lower)
    )
  }, [search])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }

      if (!open) return

      if (e.key === 'Escape') {
        setOpen(false)
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) =>
          i < filteredCommands.length - 1 ? i + 1 : 0
        )
      }

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) =>
          i > 0 ? i - 1 : filteredCommands.length - 1
        )
      }

      if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
        e.preventDefault()
        runCommand(filteredCommands[selectedIndex])
      }
    },
    [open, filteredCommands, selectedIndex]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    setSelectedIndex(0)
  }, [search])

  const runCommand = async (cmd: CommandType) => {
    const result = await executeCommand(cmd)
    if (!result.ok && !("cancelled" in result)) {
      alert(result.error ?? 'Command failed.')
      return
    }
    setOpen(false)
    setSearch('')
  }


  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 command-palette-backdrop"
            onClick={() => setOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed left-1/2 top-[20%] z-50 w-full max-w-xl -translate-x-1/2"
          >
            <div className="overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <Search className="h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search commands..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  autoFocus
                />
                <kbd className="flex h-6 items-center gap-1 rounded border border-border bg-muted px-2 text-xs text-muted-foreground">
                  ESC
                </kbd>
              </div>

              <div className="max-h-80 overflow-auto p-2">
                {filteredCommands.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No commands found.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredCommands.map((cmd, index) => {
                      const Icon = categoryIcons[cmd.category] || Terminal
                      return (
                        <button
                          key={cmd.id}
                          onClick={() => runCommand(cmd)}
                          onMouseEnter={() => setSelectedIndex(index)}
                          className={cn(
                            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                            index === selectedIndex
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-muted'
                          )}
                        >
                          <div
                            className={cn(
                              'flex h-8 w-8 items-center justify-center rounded-md',
                              index === selectedIndex
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            )}
                          >
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium truncate">
                                {cmd.name}
                              </span>
                              {cmd.shortcut && (
                                <kbd className="flex h-5 items-center rounded border border-border bg-muted px-1.5 text-xs text-muted-foreground">
                                  {cmd.shortcut}
                                </kbd>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground truncate">
                              {cmd.description}
                            </p>
                          </div>
                          <ArrowRight
                            className={cn(
                              'h-4 w-4 opacity-0 transition-opacity',
                              index === selectedIndex && 'opacity-100'
                            )}
                          />
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-border px-4 py-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-border bg-muted px-1">↑</kbd>
                    <kbd className="rounded border border-border bg-muted px-1">↓</kbd>
                    to navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded border border-border bg-muted px-1">↵</kbd>
                    to run
                  </span>
                </div>
                <span className="flex items-center gap-1">
                  <CommandIcon className="h-3 w-3" />K to toggle
                </span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
