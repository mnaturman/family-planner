"use client"

import { format, startOfWeek, eachDayOfInterval, isToday, isSameDay } from "date-fns"
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

interface WeekViewProps {
  currentDate: Date
  events: Event[]
}

export default function WeekView({ currentDate, events }: WeekViewProps) {
  const weekStart = startOfWeek(currentDate)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekStart.getDate() + 6)

  const days = eachDayOfInterval({ start: weekStart, end: weekEnd })

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start_time)
      return isSameDay(eventDate, day)
    })
  }

  return (
    <div className="grid grid-cols-7 gap-4">
      {days.map((day) => {
        const dayEvents = getEventsForDay(day)
        const isCurrentDay = isToday(day)

        return (
          <div key={day.toISOString()} className="space-y-2">
            <div className={`text-center p-2 rounded-lg ${isCurrentDay ? "bg-blue-100 text-blue-800" : "bg-gray-100"}`}>
              <div className="text-xs font-medium">{format(day, "EEE")}</div>
              <div className="text-lg font-bold">{format(day, "d")}</div>
            </div>

            <div className="space-y-2 min-h-[400px]">
              {dayEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
