import { CommandWall } from '@/components/commands/CommandWall'

export default function CommandWallPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Command Wall</h2>
        <p className="text-muted-foreground">
          Pin every command in sight. Tap to run, wire more as they appear.
        </p>
      </div>
      <CommandWall />
    </div>
  )
}
