'use client'

import { useMemo } from 'react'
import { getMockProjects } from '@/lib/projects'

export function useProjects(status?: string) {
  const projects = getMockProjects()
  return useMemo(() => {
    if (!status) return projects
    return projects.filter((project) => project.status === status)
  }, [projects, status])
}
