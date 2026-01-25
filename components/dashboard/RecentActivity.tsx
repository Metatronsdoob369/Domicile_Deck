'use client'

import {
  GitCommit,
  Upload,
  AlertTriangle,
  Clock,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

const activities = [
  {
    id: '1',
    type: 'deploy',
    message: 'Deployed devdeck-web to production',
    time: '2 minutes ago',
    icon: Upload,
    status: 'success',
  },
  {
    id: '2',
    type: 'commit',
    message: 'Pushed 3 commits to main',
    time: '15 minutes ago',
    icon: GitCommit,
    status: 'success',
  },
  {
    id: '3',
    type: 'error',
    message: 'Build failed for api-service',
    time: '1 hour ago',
    icon: AlertTriangle,
    status: 'error',
  },
  {
    id: '4',
    type: 'deploy',
    message: 'Deployed mobile-app preview',
    time: '3 hours ago',
    icon: Upload,
    status: 'success',
  },
]

const statusColors = {
  success: 'text-green-500 bg-green-500/10',
  error: 'text-red-500 bg-red-500/10',
  pending: 'text-yellow-500 bg-yellow-500/10',
}

export function RecentActivity() {
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-3">Recent Activity</h3>
      <div className="space-y-3">
        {activities.map((activity) => (
          <div key={activity.id} className="flex gap-3">
            <div
              className={cn(
                'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
                statusColors[activity.status as keyof typeof statusColors]
              )}
            >
              <activity.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">{activity.message}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
