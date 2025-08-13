"use client"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from "date-fns"
import EventCard from "./event-card"

interface Event {
  id: string
  title: string
  start_time: string
  end_time: string
  color: string
  is_all_day: boolean
  event_type: string
}

interface MonthViewProps {
  currentDate: Date
  events: Event[]
}

export default function MonthView({ currentDate, events }: MonthViewProps) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)

  // Get all days to display (including days from previous/next month to fill the grid)
  const calendarStart = new Date(monthStart)
  calendarStart.setDate(calendarStart.getDate() - monthStart.getDay())

  const calendarEnd = new Date(monthEnd)
  calendarEnd.setDate(calendarEnd.getDate() + (6 - monthEnd.getDay()))

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start_time)
      return isSameDay(eventDate, day)
    })
  }

  return (
    <div className="grid grid-cols-7 gap-1 bg-white rounded-lg border">
      {/* Header with day names */}
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
        <div key={day} className="p-3 text-center font-semibold text-sm text-muted-foreground border-b">
          {day}
        </div>
      ))}

      {/* Calendar days */}
      {days.map((day) => {
        const dayEvents = getEventsForDay(day)
        const isCurrentMonth = isSameMonth(day, currentDate)
        const isCurrentDay = isToday(day)

        return (
          <div
            key={day.toISOString()}
            className={`min-h-[120px] p-2 border-b border-r ${
              !isCurrentMonth ? "bg-gray-50 text-muted-foreground" : ""
            } ${isCurrentDay ? "bg-blue-50" : ""}`}
          >
            <div className={`text-sm font-medium mb-1 ${isCurrentDay ? "text-blue-600" : ""}`}>{format(day, "d")}</div>

            <div className="space-y-1">
              {dayEvents.slice(0, 3).map((event) => (
                <EventCard key={event.id} event={event} compact />
              ))}
              {dayEvents.length > 3 && (
                <div className="text-xs text-muted-foreground">+{dayEvents.length - 3} more</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
