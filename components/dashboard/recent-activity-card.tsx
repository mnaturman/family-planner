import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity } from "lucide-react"
import { format } from "date-fns"

interface RecentEvent {
  id: string
  title: string
  event_type: string
  created_at: string
  created_by?: {
    display_name: string
    color: string
  }
}

interface RecentActivityCardProps {
  recentActivity: RecentEvent[]
}

export default function RecentActivityCard({ recentActivity }: RecentActivityCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
        <CardDescription>Latest family calendar updates</CardDescription>
      </CardHeader>
      <CardContent>
        {recentActivity.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-2 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.created_by?.display_name}</span> created{" "}
                      <span className="font-medium">"{activity.title}"</span>
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {activity.event_type}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(activity.created_at), "MMM d, h:mm a")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
