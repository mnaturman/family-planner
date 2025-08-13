"use server"

import { createClient } from "@/lib/supabase/server"

export async function getDashboardData(familyId: string, userId: string) {
  const supabase = createClient()

  try {
    // Get upcoming events (next 7 days)
    const today = new Date()
    const nextWeek = new Date()
    nextWeek.setDate(today.getDate() + 7)

    const { data: upcomingEvents, error: eventsError } = await supabase
      .from("events")
      .select(`
        *,
        created_by:family_members!events_created_by_fkey (
          display_name,
          color
        ),
        event_participants (
          status,
          family_member_id,
          family_members (
            display_name,
            color
          )
        )
      `)
      .eq("family_id", familyId)
      .gte("start_time", today.toISOString())
      .lte("start_time", nextWeek.toISOString())
      .order("start_time")
      .limit(5)

    // Get events this month for stats
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)

    const { data: monthEvents, error: monthError } = await supabase
      .from("events")
      .select("id")
      .eq("family_id", familyId)
      .gte("start_time", monthStart.toISOString())
      .lte("start_time", monthEnd.toISOString())

    // Get recent events (last 7 days) for activity
    const lastWeek = new Date()
    lastWeek.setDate(today.getDate() - 7)

    const { data: recentEvents, error: recentError } = await supabase
      .from("events")
      .select(`
        *,
        created_by:family_members!events_created_by_fkey (
          display_name,
          color
        )
      `)
      .eq("family_id", familyId)
      .gte("created_at", lastWeek.toISOString())
      .order("created_at", { ascending: false })
      .limit(5)

    // Get family member count
    const { data: familyMembers, error: membersError } = await supabase
      .from("family_members")
      .select("id")
      .eq("family_id", familyId)
      .eq("is_active", true)

    if (eventsError || monthError || recentError || membersError) {
      console.error("Dashboard data errors:", { eventsError, monthError, recentError, membersError })
    }

    return {
      upcomingEvents: upcomingEvents || [],
      monthEventsCount: monthEvents?.length || 0,
      recentActivity: recentEvents || [],
      familyMemberCount: familyMembers?.length || 0,
      error: null,
    }
  } catch (error) {
    console.error("Error fetching dashboard data:", error)
    return {
      upcomingEvents: [],
      monthEventsCount: 0,
      recentActivity: [],
      familyMemberCount: 0,
      error: "Failed to load dashboard data",
    }
  }
}
