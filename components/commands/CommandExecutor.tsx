'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface CommandExecutorProps {
  command: string
}

export function CommandExecutor({ command }: CommandExecutorProps) {
  const [output, setOutput] = useState<string[]>([])

  const handleRun = async () => {
    setOutput((prev) => [...prev, `$ ${command}`])
    await new Promise((resolve) => setTimeout(resolve, 500))
    setOutput((prev) => [...prev, 'Simulated execution complete.'])
  }

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="font-mono text-sm text-muted-foreground">
          {command}
        </div>
        <Button size="sm" onClick={handleRun}>
          Run
        </Button>
      </div>
      <div className="rounded-lg bg-muted p-3 font-mono text-xs text-muted-foreground min-h-[120px]">
        {output.length === 0 ? 'No output yet.' : output.join('\n')}
      </div>
    </Card>
  )
}
