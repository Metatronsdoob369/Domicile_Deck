export type ServiceType = 'vercel' | 'github' | 'docker' | 'database' | 'ssh' | 'npm'

export type ProjectStatus = 'active' | 'idle' | 'error' | 'deploying'

export interface Project {
  id: string
  name: string
  description: string
  status: ProjectStatus
  services: ServiceType[]
  lastActivity: Date
  gitBranch: string
  gitRemote: string
  deploymentUrl?: string
  localPath: string
}

export interface Command {
  id: string
  name: string
  description: string
  category: ServiceType | 'workflow' | 'custom'
  command: string
  shortcut?: string
  icon: string
  status?: 'wired' | 'stub'
  dangerous?: boolean
  requiresConfirmation?: boolean
  params?: CommandParam[]
}

export interface CommandParam {
  name: string
  type: 'string' | 'select' | 'boolean'
  required: boolean
  default?: string
  options?: string[]
}

export interface CommandExecution {
  id: string
  commandId: string
  projectId: string
  status: 'pending' | 'running' | 'success' | 'error'
  output: string[]
  startedAt: Date
  completedAt?: Date
}

export interface ServiceStatus {
  service: ServiceType
  status: 'connected' | 'disconnected' | 'error'
  lastChecked: Date
  details?: string
}

export interface QuickAction {
  id: string
  label: string
  icon: string
  command: string
  category: string
}
