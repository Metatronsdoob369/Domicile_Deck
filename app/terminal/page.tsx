import dynamic from 'next/dynamic'

const LiveShell = dynamic(() => import('@/components/terminal/LiveShell').then((mod) => mod.LiveShell), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
      Loading live shell...
    </div>
  ),
})

export default function TerminalPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Terminal</h2>
        <p className="text-muted-foreground">
          Live shell switchboard for the host machine.
        </p>
      </div>
      <LiveShell />
    </div>
  )
}
