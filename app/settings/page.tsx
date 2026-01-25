import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Tabs } from '@/components/ui/Tabs'

const tabs = [
  { id: 'profile', label: 'Profile' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'appearance', label: 'Appearance' },
]

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground">Tune DevDeck for your workflow.</p>
      </div>

      <Tabs tabs={tabs} defaultTab="profile">
        <div className="space-y-4">
          <Card className="p-4 space-y-4">
            <div>
              <label className="text-sm font-medium">Display Name</label>
              <Input placeholder="Your name" defaultValue="NodeOut Operator" />
            </div>
            <div>
              <label className="text-sm font-medium">Notification Email</label>
              <Input type="email" placeholder="ops@example.com" />
            </div>
            <Button variant="primary">Save changes</Button>
          </Card>
        </div>
      </Tabs>
    </div>
  )
}
