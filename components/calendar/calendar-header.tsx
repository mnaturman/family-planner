"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar, Grid, List } from "lucide-react"
import { format, addMonths, subMonths } from "date-fns"

interface CalendarHeaderProps {
  currentDate: Date
  onDateChange: (date: Date) => void
  view: "month" | "week" | "day"
  onViewChange: (view: "month" | "week" | "day") => void
}

export default function CalendarHeader({ currentDate, onDateChange, view, onViewChange }: CalendarHeaderProps) {
  const handlePrevious = () => {
    if (view === "month") {
      onDateChange(subMonths(currentDate, 1))
    } else if (view === "week") {
      const newDate = new Date(currentDate)
      newDate.setDate(newDate.getDate() - 7)
      onDateChange(newDate)
    } else {
      const newDate = new Date(currentDate)
      newDate.setDate(newDate.getDate() - 1)
      onDateChange(newDate)
    }
  }

  const handleNext = () => {
    if (view === "month") {
      onDateChange(addMonths(currentDate, 1))
    } else if (view === "week") {
      const newDate = new Date(currentDate)
      newDate.setDate(newDate.getDate() + 7)
      onDateChange(newDate)
    } else {
      const newDate = new Date(currentDate)
      newDate.setDate(newDate.getDate() + 1)
      onDateChange(newDate)
    }
  }

  const handleToday = () => {
    onDateChange(new Date())
  }

  const getDateDisplay = () => {
    if (view === "month") {
      return format(currentDate, "MMMM yyyy")
    } else if (view === "week") {
      const startOfWeek = new Date(currentDate)
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      return `${format(startOfWeek, "MMM d")} - ${format(endOfWeek, "MMM d, yyyy")}`
    } else {
      return format(currentDate, "EEEE, MMMM d, yyyy")
    }
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handlePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
        </div>
        <h2 className="text-2xl font-bold">{getDateDisplay()}</h2>
      </div>

      <div className="flex items-center gap-2">
        <Button variant={view === "month" ? "default" : "outline"} size="sm" onClick={() => onViewChange("month")}>
          <Grid className="h-4 w-4 mr-2" />
          Month
        </Button>
        <Button variant={view === "week" ? "default" : "outline"} size="sm" onClick={() => onViewChange("week")}>
          <Calendar className="h-4 w-4 mr-2" />
          Week
        </Button>
        <Button variant={view === "day" ? "default" : "outline"} size="sm" onClick={() => onViewChange("day")}>
          <List className="h-4 w-4 mr-2" />
          Day
        </Button>
      </div>
    </div>
  )
}
