import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { getProjectById } from '@/lib/projects'

interface ProjectPageProps {
  params: {
    id: string
  }
}

export default function ProjectDetailPage({ params }: ProjectPageProps) {
  const project = getProjectById(params.id)

  if (!project) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{project.name}</h2>
          <p className="text-muted-foreground">{project.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary">Open Folder</Button>
          <Button variant="primary">Deploy</Button>
        </div>
      </div>

      <Card className="p-4 space-y-3">
        <div className="flex gap-6 text-sm">
          <div>
            <p className="text-muted-foreground">Branch</p>
            <p className="font-medium">{project.gitBranch}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Remote</p>
            <p className="font-medium">{project.gitRemote}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Last Activity</p>
            <p className="font-medium">{project.lastActivity.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {project.services.map((service) => (
            <Badge key={service} variant="secondary" size="sm">
              {service}
            </Badge>
          ))}
        </div>
        {project.deploymentUrl && (
          <a
            href={project.deploymentUrl}
            className="text-primary text-sm hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            {project.deploymentUrl}
          </a>
        )}
      </Card>
    </div>
  )
}
