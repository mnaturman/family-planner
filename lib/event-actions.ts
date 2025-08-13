"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function createEvent(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const title = formData.get("title")
  const description = formData.get("description")
  const startDate = formData.get("startDate")
  const startTime = formData.get("startTime")
  const endDate = formData.get("endDate")
  const endTime = formData.get("endTime")
  const location = formData.get("location")
  const eventType = formData.get("eventType") || "general"
  const color = formData.get("color") || "#3B82F6"
  const isAllDay = formData.get("isAllDay") === "on"
  const participants = formData.getAll("participants") as string[]

  if (!title || !startDate) {
    return { error: "Title and start date are required" }
  }

  const supabase = createClient()

  try {
    // Get current user and their family membership
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: "You must be logged in to create events" }
    }

    const { data: familyMember, error: memberError } = await supabase
      .from("family_members")
      .select("id, family_id")
      .eq("user_id", user.id)
      .single()

    if (memberError || !familyMember) {
      return { error: "You must be part of a family to create events" }
    }

    // Construct start and end times
    let startDateTime: string
    let endDateTime: string

    if (isAllDay) {
      startDateTime = `${startDate}T00:00:00.000Z`
      endDateTime = `${endDate || startDate}T23:59:59.999Z`
    } else {
      if (!startTime) {
        return { error: "Start time is required for non-all-day events" }
      }
      startDateTime = `${startDate}T${startTime}:00.000Z`
      endDateTime = `${endDate || startDate}T${endTime || startTime}:00.000Z`
    }

    // Create the event
    const { data: event, error: eventError } = await supabase
      .from("events")
      .insert({
        family_id: familyMember.family_id,
        created_by: familyMember.id,
        title: title.toString(),
        description: description?.toString() || null,
        start_time: startDateTime,
        end_time: endDateTime,
        location: location?.toString() || null,
        event_type: eventType.toString(),
        color: color.toString(),
        is_all_day: isAllDay,
      })
      .select()
      .single()

    if (eventError) {
      return { error: "Failed to create event: " + eventError.message }
    }

    // Add participants
    if (participants.length > 0) {
      const participantInserts = participants.map((participantId) => ({
        event_id: event.id,
        family_member_id: participantId,
        status: participantId === familyMember.id ? "accepted" : "invited",
        is_organizer: participantId === familyMember.id,
      }))

      const { error: participantError } = await supabase.from("event_participants").insert(participantInserts)

      if (participantError) {
        console.error("Error adding participants:", participantError)
        // Don't fail the entire operation for participant errors
      }
    }

    revalidatePath("/calendar")
    return { success: true, eventId: event.id }
  } catch (error) {
    console.error("Create event error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function updateEvent(prevState: any, formData: FormData) {
  if (!formData) {
    return { error: "Form data is missing" }
  }

  const eventId = formData.get("eventId")
  const title = formData.get("title")
  const description = formData.get("description")
  const startDate = formData.get("startDate")
  const startTime = formData.get("startTime")
  const endDate = formData.get("endDate")
  const endTime = formData.get("endTime")
  const location = formData.get("location")
  const eventType = formData.get("eventType") || "general"
  const color = formData.get("color") || "#3B82F6"
  const isAllDay = formData.get("isAllDay") === "on"

  if (!eventId || !title || !startDate) {
    return { error: "Event ID, title, and start date are required" }
  }

  const supabase = createClient()

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: "You must be logged in" }
    }

    // Construct start and end times
    let startDateTime: string
    let endDateTime: string

    if (isAllDay) {
      startDateTime = `${startDate}T00:00:00.000Z`
      endDateTime = `${endDate || startDate}T23:59:59.999Z`
    } else {
      if (!startTime) {
        return { error: "Start time is required for non-all-day events" }
      }
      startDateTime = `${startDate}T${startTime}:00.000Z`
      endDateTime = `${endDate || startDate}T${endTime || startTime}:00.000Z`
    }

    // Update the event
    const { error: updateError } = await supabase
      .from("events")
      .update({
        title: title.toString(),
        description: description?.toString() || null,
        start_time: startDateTime,
        end_time: endDateTime,
        location: location?.toString() || null,
        event_type: eventType.toString(),
        color: color.toString(),
        is_all_day: isAllDay,
        updated_at: new Date().toISOString(),
      })
      .eq("id", eventId.toString())

    if (updateError) {
      return { error: "Failed to update event: " + updateError.message }
    }

    revalidatePath("/calendar")
    return { success: true }
  } catch (error) {
    console.error("Update event error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function deleteEvent(eventId: string) {
  const supabase = createClient()

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: "You must be logged in" }
    }

    // Delete the event (participants will be deleted automatically due to CASCADE)
    const { error: deleteError } = await supabase.from("events").delete().eq("id", eventId)

    if (deleteError) {
      return { error: "Failed to delete event: " + deleteError.message }
    }

    revalidatePath("/calendar")
    return { success: true }
  } catch (error) {
    console.error("Delete event error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}

export async function updateParticipantStatus(participantId: string, status: string) {
  const supabase = createClient()

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()
    if (userError || !user) {
      return { error: "You must be logged in" }
    }

    const { error: updateError } = await supabase
      .from("event_participants")
      .update({
        status: status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", participantId)

    if (updateError) {
      return { error: "Failed to update participation status: " + updateError.message }
    }

    revalidatePath("/calendar")
    return { success: true }
  } catch (error) {
    console.error("Update participant status error:", error)
    return { error: "An unexpected error occurred. Please try again." }
  }
}
