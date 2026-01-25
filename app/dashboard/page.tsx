import { ProjectCard } from '@/components/dashboard/ProjectCard'
import { QuickActions } from '@/components/dashboard/QuickActions'
import { ServiceStatus } from '@/components/dashboard/ServiceStatus'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import type { Project } from '@/types'

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'devdeck-web',
    description: 'Main web application for DevDeck',
    status: 'active',
    services: ['vercel', 'github', 'database'],
    lastActivity: new Date(),
    gitBranch: 'main',
    gitRemote: 'origin',
    deploymentUrl: 'https://devdeck.vercel.app',
    localPath: '~/projects/devdeck-web',
  },
  {
    id: '2',
    name: 'api-service',
    description: 'Backend API microservice',
    status: 'deploying',
    services: ['docker', 'github', 'database'],
    lastActivity: new Date(Date.now() - 3600000),
    gitBranch: 'develop',
    gitRemote: 'origin',
    localPath: '~/projects/api-service',
  },
  {
    id: '3',
    name: 'mobile-app',
    description: 'React Native mobile application',
    status: 'idle',
    services: ['github', 'npm'],
    lastActivity: new Date(Date.now() - 86400000),
    gitBranch: 'feature/auth',
    gitRemote: 'origin',
    localPath: '~/projects/mobile-app',
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Welcome back! 👋</h2>
          <p className="text-muted-foreground">
            Here&apos;s what&apos;s happening with your projects.
          </p>
        </div>
      </div>

      <QuickActions />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Active Projects</h3>
            <a
              href="/projects"
              className="text-sm text-primary hover:underline"
            >
              View all
            </a>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {mockProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <ServiceStatus />
          <RecentActivity />
        </div>
      </div>
    </div>
  )
}
