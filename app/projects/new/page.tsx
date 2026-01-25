import { ProjectIntake } from '@/components/projects/ProjectIntake'

export default function ProjectIntakePage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">New Project</h2>
        <p className="text-muted-foreground">
          Discover scripts, wire commands, and pin them to the wall.
        </p>
      </div>
      <ProjectIntake />
    </div>
  )
}
