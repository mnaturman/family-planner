import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, MapPin, Users } from "lucide-react"
import { format } from "date-fns"

interface EventCardProps {
  event: {
    id: string
    title: string
    description?: string
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
    event_participants?: Array<{
      status: string
      family_members: {
        display_name: string
        color: string
      }
    }>
  }
  compact?: boolean
}

export default function EventCard({ event, compact = false }: EventCardProps) {
  const startTime = new Date(event.start_time)
  const endTime = new Date(event.end_time)

  const acceptedParticipants = event.event_participants?.filter((p) => p.status === "accepted") || []

  if (compact) {
    return (
      <div
        className="text-xs p-1 rounded text-white font-medium truncate cursor-pointer hover:opacity-80"
        style={{ backgroundColor: event.color }}
        title={event.title}
      >
        {event.is_all_day ? event.title : `${format(startTime, "HH:mm")} ${event.title}`}
      </div>
    )
  }

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-3 h-3 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: event.color }} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold truncate">{event.title}</h3>
              <Badge variant="secondary" className="text-xs">
                {event.event_type}
              </Badge>
            </div>

            {event.description && (
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{event.description}</p>
            )}

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {event.is_all_day ? "All day" : `${format(startTime, "HH:mm")} - ${format(endTime, "HH:mm")}`}
              </div>

              {event.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{event.location}</span>
                </div>
              )}

              {acceptedParticipants.length > 0 && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{acceptedParticipants.length}</span>
                </div>
              )}
            </div>

            {event.created_by && (
              <div className="mt-2 text-xs text-muted-foreground">Created by {event.created_by.display_name}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
