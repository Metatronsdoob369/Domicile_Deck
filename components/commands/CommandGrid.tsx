'use client'

import { CommandCard } from './CommandCard'
import { useCommands } from '@/hooks/useCommands'

interface CommandGridProps {
  search: string
  category: string
}

export function CommandGrid({ search, category }: CommandGridProps) {
  const filteredCommands = useCommands(search, category)

  if (filteredCommands.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No commands found matching your criteria.
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filteredCommands.map((command) => (
        <CommandCard key={command.id} command={command} />
      ))}
    </div>
  )
}
