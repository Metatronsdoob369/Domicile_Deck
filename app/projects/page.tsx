import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { getMockProjects } from '@/lib/projects'

export default function ProjectsPage() {
  const projects = getMockProjects()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Projects</h2>
          <p className="text-muted-foreground">Manage every repo and service hook in one hub.</p>
        </div>
        <Link href="/projects/new">
          <Button variant="primary">New Project</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <Link
                  href={`/projects/${project.id}`}
                  className="font-semibold hover:text-primary"
                >
                  {project.name}
                </Link>
                <p className="text-sm text-muted-foreground">{project.description}</p>
              </div>
              <Badge variant="secondary">{project.status}</Badge>
            </div>
            <div className="flex flex-wrap gap-1">
              {project.services.map((service) => (
                <Badge key={service} variant="default" size="sm">
                  {service}
                </Badge>
              ))}
            </div>
            <div className="text-xs text-muted-foreground">
              {project.localPath}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
