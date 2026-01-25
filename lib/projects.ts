import type { Project } from '@/types'

const projects: Project[] = [
  {
    id: 'devdeck-web',
    name: 'DevDeck Web',
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
    id: 'api-service',
    name: 'API Service',
    description: 'Backend API microservice',
    status: 'deploying',
    services: ['docker', 'github', 'database'],
    lastActivity: new Date(Date.now() - 3600000),
    gitBranch: 'develop',
    gitRemote: 'origin',
    localPath: '~/projects/api-service',
  },
  {
    id: 'mobile-app',
    name: 'Mobile App',
    description: 'React Native client',
    status: 'idle',
    services: ['github', 'npm'],
    lastActivity: new Date(Date.now() - 86400000),
    gitBranch: 'feature/auth',
    gitRemote: 'origin',
    localPath: '~/projects/mobile-app',
  },
]

export function getMockProjects() {
  return projects
}

export function getProjectById(id: string) {
  return projects.find((project) => project.id === id)
}
