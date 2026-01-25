export interface ServiceState {
  id: string
  name: string
  status: 'connected' | 'disconnected' | 'error'
  description: string
}

export const defaultServices: ServiceState[] = [
  { id: 'vercel', name: 'Vercel', status: 'connected', description: 'Production deployments' },
  { id: 'github', name: 'GitHub', status: 'connected', description: 'Source control' },
  { id: 'docker', name: 'Docker', status: 'disconnected', description: 'Local containers' },
]
