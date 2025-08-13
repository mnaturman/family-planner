"use client"

import { format, isToday } from "date-fns"
import EventCard from "./event-card"

interface Event {
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

interface DayViewProps {
  currentDate: Date
  events: Event[]
}

export default function DayView({ currentDate, events }: DayViewProps) {
  const isCurrentDay = isToday(currentDate)

  // Filter events for the current day
  const dayEvents = events.filter((event) => {
    const eventDate = new Date(event.start_time)
    return eventDate.toDateString() === currentDate.toDateString()
  })

  // Sort events by start time
  const sortedEvents = dayEvents.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

  return (
    <div className="space-y-4">
      <div className={`text-center p-4 rounded-lg ${isCurrentDay ? "bg-blue-100 text-blue-800" : "bg-gray-100"}`}>
        <h2 className="text-2xl font-bold">{format(currentDate, "EEEE")}</h2>
        <p className="text-lg">{format(currentDate, "MMMM d, yyyy")}</p>
      </div>

      <div className="space-y-3">
        {sortedEvents.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-lg">No events scheduled for this day</p>
            <p className="text-sm">Why not add something to your calendar?</p>
          </div>
        ) : (
          sortedEvents.map((event) => <EventCard key={event.id} event={event} />)
        )}
      </div>
    </div>
  )
}
