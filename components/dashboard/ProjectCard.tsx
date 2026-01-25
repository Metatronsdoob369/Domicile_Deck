'use client'

import Link from 'next/link'
import {
  GitBranch,
  ExternalLink,
  MoreHorizontal,
  Play,
  RefreshCw,
  Folder,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button, buttonClasses } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { Project } from '@/types'

const statusConfig: Record<
  Project['status'],
  { label: string; variant: 'success' | 'warning' | 'error' | 'default' }
> = {
  active: { label: 'Active', variant: 'success' },
  deploying: { label: 'Deploying', variant: 'warning' },
  idle: { label: 'Idle', variant: 'default' },
  error: { label: 'Error', variant: 'error' },
}

interface ProjectCardProps {
  project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
  const status = statusConfig[project.status]

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg hover:border-primary/50">
      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Folder className="h-5 w-5 text-primary" />
            </div>
            <div>
              <Link
                href={`/projects/${project.id}`}
                className="font-semibold hover:text-primary transition-colors"
              >
                {project.name}
              </Link>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <GitBranch className="h-3 w-3" />
                {project.gitBranch}
              </div>
            </div>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">
          {project.description}
        </p>

        <div className="flex flex-wrap gap-1.5">
          {project.services.map((service) => (
            <Badge key={service} variant="secondary" size="sm">
              {service}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Play className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <RefreshCw className="h-4 w-4" />
            </Button>
            {project.deploymentUrl && (
              <a
                href={project.deploymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses({ variant: 'ghost', size: 'sm', className: 'h-8 w-8 p-0' })}
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {project.status === 'deploying' && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted overflow-hidden">
          <div className="h-full w-1/3 bg-primary animate-pulse-subtle" />
        </div>
      )}
    </Card>
  )
}
