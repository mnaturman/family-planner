"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import CalendarHeader from "@/components/calendar/calendar-header"
import MonthView from "@/components/calendar/month-view"
import WeekView from "@/components/calendar/week-view"
import DayView from "@/components/calendar/day-view"
import EventDetailsModal from "@/components/events/event-details-modal"
import { Button } from "@/components/ui/button"
import { Plus, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getEvents } from "@/lib/calendar-actions"

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<"month" | "week" | "day">("month")
  const [events, setEvents] = useState<any[]>([])
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadUserAndEvents() {
      try {
        // Get current user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser()
        if (userError || !user) {
          router.push("/auth/login")
          return
        }

        // Get user's family membership
        const { data: familyMember, error: memberError } = await supabase
          .from("family_members")
          .select("id, family_id")
          .eq("user_id", user.id)
          .single()

        if (memberError || !familyMember) {
          router.push("/family/setup")
          return
        }

        setFamilyId(familyMember.family_id)
        setCurrentUserId(familyMember.id)

        // Load events for the current view
        await loadEvents(familyMember.family_id)
      } catch (error) {
        console.error("Error loading user and events:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUserAndEvents()
  }, [])

  useEffect(() => {
    if (familyId) {
      loadEvents(familyId)
    }
  }, [currentDate, view, familyId])

  async function loadEvents(familyId: string) {
    try {
      // Calculate date range based on current view
      let startDate: Date, endDate: Date

      if (view === "month") {
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      } else if (view === "week") {
        startDate = new Date(currentDate)
        startDate.setDate(currentDate.getDate() - currentDate.getDay())
        endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + 6)
      } else {
        startDate = new Date(currentDate)
        endDate = new Date(currentDate)
      }

      const { events: fetchedEvents, error } = await getEvents(familyId, startDate.toISOString(), endDate.toISOString())

      if (error) {
        console.error("Error loading events:", error)
      } else {
        setEvents(fetchedEvents)
      }
    } catch (error) {
      console.error("Error loading events:", error)
    }
  }

  const handleEventClick = (event: any) => {
    setSelectedEvent(event)
  }

  const handleCreateEvent = () => {
    const dateParam = currentDate.toISOString().split("T")[0]
    router.push(`/events/create?date=${dateParam}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleCreateEvent}>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>

        <CalendarHeader currentDate={currentDate} onDateChange={setCurrentDate} view={view} onViewChange={setView} />

        <div className="bg-white rounded-lg shadow-sm p-6">
          {view === "month" && <MonthView currentDate={currentDate} events={events} onEventClick={handleEventClick} />}
          {view === "week" && <WeekView currentDate={currentDate} events={events} onEventClick={handleEventClick} />}
          {view === "day" && <DayView currentDate={currentDate} events={events} onEventClick={handleEventClick} />}
        </div>

        {selectedEvent && (
          <EventDetailsModal
            event={selectedEvent}
            isOpen={!!selectedEvent}
            onClose={() => setSelectedEvent(null)}
            currentUserId={currentUserId}
          />
        )}
      </div>
    </div>
  )
}
