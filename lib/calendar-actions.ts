"use server"

import { createClient } from "@/lib/supabase/server"

export async function getEvents(familyId: string, startDate: string, endDate: string) {
  const supabase = createClient()

  try {
    const { data: events, error } = await supabase
      .from("events")
      .select(`
        *,
        created_by:family_members!events_created_by_fkey (
          id,
          display_name,
          color
        ),
        event_participants (
          id,
          status,
          family_member_id,
          family_members (
            id,
            display_name,
            color
          )
        )
      `)
      .eq("family_id", familyId)
      .gte("start_time", startDate)
      .lte("start_time", endDate)
      .order("start_time")

    if (error) {
      console.error("Error fetching events:", error)
      return { events: [], error: error.message }
    }

    return { events: events || [], error: null }
  } catch (error) {
    console.error("Unexpected error fetching events:", error)
    return { events: [], error: "Failed to fetch events" }
  }
}

export async function getFamilyMembers(familyId: string) {
  const supabase = createClient()

  try {
    const { data: members, error } = await supabase
      .from("family_members")
      .select("id, display_name, color, role")
      .eq("family_id", familyId)
      .eq("is_active", true)
      .order("display_name")

    if (error) {
      console.error("Error fetching family members:", error)
      return { members: [], error: error.message }
    }

    return { members: members || [], error: null }
  } catch (error) {
    console.error("Unexpected error fetching family members:", error)
    return { members: [], error: "Failed to fetch family members" }
  }
}
