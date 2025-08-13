import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, Users, Settings } from "lucide-react"
import Link from "next/link"

export default function QuickActionsCard() {
  const actions = [
    {
      title: "Create Event",
      description: "Schedule something new",
      icon: Plus,
      href: "/events/create",
      variant: "default" as const,
    },
    {
      title: "View Calendar",
      description: "See all events",
      icon: Calendar,
      href: "/calendar",
      variant: "outline" as const,
    },
    {
      title: "Manage Family",
      description: "Add or edit members",
      icon: Users,
      href: "/family/manage",
      variant: "outline" as const,
    },
    {
      title: "Settings",
      description: "Update preferences",
      icon: Settings,
      href: "/settings",
      variant: "outline" as const,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon
            return (
              <Button key={action.title} variant={action.variant} className="h-auto p-4 flex-col gap-2" asChild>
                <Link href={action.href}>
                  <Icon className="h-5 w-5" />
                  <div className="text-center">
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs opacity-70">{action.description}</div>
                  </div>
                </Link>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
