import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Plus } from "lucide-react"
import { format, isToday, isTomorrow } from "date-fns"
import Link from "next/link"

interface Event {
  id: string
  title: string
  start_time: string
  end_time: string
  location?: string
  color: string
  is_all_day: boolean
  event_type: string
  created_by?: {
    display_name: string
    color: string
  }
}

interface UpcomingEventsCardProps {
  events: Event[]
}

export default function UpcomingEventsCard({ events }: UpcomingEventsCardProps) {
  const getDateLabel = (dateString: string) => {
    const date = new Date(dateString)
    if (isToday(date)) return "Today"
    if (isTomorrow(date)) return "Tomorrow"
    return format(date, "MMM d")
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg">Upcoming Events</CardTitle>
          <CardDescription>Next 7 days</CardDescription>
        </div>
        <Button size="sm" asChild>
          <Link href="/events/create">
            <Plus className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {events.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No upcoming events</p>
            <Button size="sm" className="mt-2" asChild>
              <Link href="/events/create">Create your first event</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => {
              const startTime = new Date(event.start_time)
              return (
                <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-gray-50">
                  <div className="w-3 h-3 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: event.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium truncate">{event.title}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {getDateLabel(event.start_time)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {event.is_all_day ? "All day" : format(startTime, "h:mm a")}
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                    </div>
                    {event.created_by && (
                      <div className="text-xs text-muted-foreground mt-1">by {event.created_by.display_name}</div>
                    )}
                  </div>
                </div>
              )
            })}
            {events.length >= 5 && (
              <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                <Link href="/calendar">View all events</Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
