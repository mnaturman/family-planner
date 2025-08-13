import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, Clock } from "lucide-react"

interface StatsCardsProps {
  monthEventsCount: number
  familyMemberCount: number
  upcomingEventsCount: number
}

export default function StatsCards({ monthEventsCount, familyMemberCount, upcomingEventsCount }: StatsCardsProps) {
  const stats = [
    {
      title: "This Month",
      value: monthEventsCount,
      description: "Events scheduled",
      icon: Calendar,
      color: "text-blue-600",
    },
    {
      title: "Family Members",
      value: familyMemberCount,
      description: "Active members",
      icon: Users,
      color: "text-green-600",
    },
    {
      title: "Coming Up",
      value: upcomingEventsCount,
      description: "Next 7 days",
      icon: Clock,
      color: "text-orange-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
