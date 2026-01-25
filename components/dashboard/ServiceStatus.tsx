'use client'

import {
  GitBranch,
  Cloud,
  Container,
  Database,
  Server,
  Package,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

const services = [
  { name: 'GitHub', icon: GitBranch, status: 'connected', latency: '45ms' },
  { name: 'Vercel', icon: Cloud, status: 'connected', latency: '120ms' },
  { name: 'Docker', icon: Container, status: 'disconnected', latency: null },
  { name: 'PostgreSQL', icon: Database, status: 'connected', latency: '12ms' },
  { name: 'SSH Server', icon: Server, status: 'warning', latency: '890ms' },
  { name: 'npm Registry', icon: Package, status: 'connected', latency: '67ms' },
]

const statusIcons = {
  connected: CheckCircle2,
  disconnected: XCircle,
  warning: AlertCircle,
}

const statusColors = {
  connected: 'text-green-500',
  disconnected: 'text-red-500',
  warning: 'text-yellow-500',
}

export function ServiceStatus() {
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-3">Service Status</h3>
      <div className="space-y-2">
        {services.map((service) => {
          const StatusIcon = statusIcons[service.status as keyof typeof statusIcons]
          return (
            <div
              key={service.name}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-2">
                <service.icon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{service.name}</span>
              </div>
              <div className="flex items-center gap-2">
                {service.latency && (
                  <span className="text-xs text-muted-foreground">
                    {service.latency}
                  </span>
                )}
                <StatusIcon
                  className={cn(
                    'h-4 w-4',
                    statusColors[service.status as keyof typeof statusColors]
                  )}
                />
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
