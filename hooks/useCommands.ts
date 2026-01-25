'use client'

import { useMemo } from 'react'
import { commandRegistry } from '@/lib/commands'

export function useCommands(search: string, category: string) {
  return useMemo(() => {
    return commandRegistry.filter((command) => {
      const matchesCategory = category === 'all' || command.category === category
      const matchesSearch =
        !search ||
        command.name.toLowerCase().includes(search.toLowerCase()) ||
        command.description.toLowerCase().includes(search.toLowerCase()) ||
        command.command.toLowerCase().includes(search.toLowerCase()) ||
        command.shortcut?.toLowerCase().includes(search.toLowerCase())
      return matchesCategory && matchesSearch
    })
  }, [search, category])
}
