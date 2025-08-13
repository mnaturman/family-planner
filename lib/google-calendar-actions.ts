"use server"

import { createClient } from "@/lib/supabase/server"
import { googleCalendarService } from "@/lib/google-calendar-service"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function initiateGoogleCalendarAuth() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    const state = `${user.id}-${Date.now()}`
    const authUrl = googleCalendarService.getAuthUrl(state)
    redirect(authUrl)
  } catch (error) {
    console.error("Error initiating Google Calendar auth:", error)
    return { error: "Failed to initiate Google Calendar authentication" }
  }
}

export async function handleGoogleCalendarCallback(code: string, state: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    // Verify state parameter
    const [userId] = state.split("-")
    if (userId !== user.id) {
      return { error: "Invalid state parameter" }
    }

    // Exchange code for tokens
    const tokens = await googleCalendarService.exchangeCodeForTokens(code)

    // Store tokens in database
    const expiresAt = new Date(Date.now() + tokens.expires_in * 1000)

    const { error } = await supabase
      .from("family_members")
      .update({
        google_access_token: tokens.access_token,
        google_refresh_token: tokens.refresh_token,
        google_token_expires_at: expiresAt.toISOString(),
        google_calendar_sync_enabled: true,
      })
      .eq("user_id", user.id)

    if (error) {
      console.error("Error storing Google Calendar tokens:", error)
      return { error: "Failed to store authentication tokens" }
    }

    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    console.error("Error handling Google Calendar callback:", error)
    return { error: "Failed to complete Google Calendar authentication" }
  }
}

export async function syncToGoogleCalendar(eventId: string) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    // Get user's Google Calendar tokens
    const { data: familyMember } = await supabase
      .from("family_members")
      .select("google_access_token, google_refresh_token, google_token_expires_at, google_calendar_sync_enabled")
      .eq("user_id", user.id)
      .single()

    if (!familyMember?.google_calendar_sync_enabled || !familyMember.google_access_token) {
      return { error: "Google Calendar not connected" }
    }

    // Check if token needs refresh
    let accessToken = familyMember.google_access_token
    if (new Date(familyMember.google_token_expires_at) <= new Date()) {
      const refreshedTokens = await googleCalendarService.refreshAccessToken(familyMember.google_refresh_token)
      accessToken = refreshedTokens.access_token

      // Update stored tokens
      await supabase
        .from("family_members")
        .update({
          google_access_token: accessToken,
          google_token_expires_at: new Date(Date.now() + refreshedTokens.expires_in * 1000).toISOString(),
        })
        .eq("user_id", user.id)
    }

    // Get event details
    const { data: event } = await supabase.from("events").select("*").eq("id", eventId).single()

    if (!event) {
      return { error: "Event not found" }
    }

    // Convert and create/update Google Calendar event
    const googleEvent = googleCalendarService.convertFamilyEventToGoogle(event)

    let googleCalendarId: string

    if (event.google_calendar_id) {
      // Update existing Google Calendar event
      await googleCalendarService.updateEvent(accessToken, event.google_calendar_id, googleEvent)
      googleCalendarId = event.google_calendar_id
    } else {
      // Create new Google Calendar event
      googleCalendarId = await googleCalendarService.createEvent(accessToken, googleEvent)

      // Update our event with Google Calendar ID
      await supabase
        .from("events")
        .update({
          google_calendar_id: googleCalendarId,
          sync_to_google: true,
        })
        .eq("id", eventId)
    }

    revalidatePath("/calendar")
    return { success: true, googleCalendarId }
  } catch (error) {
    console.error("Error syncing to Google Calendar:", error)
    return { error: "Failed to sync event to Google Calendar" }
  }
}

export async function importFromGoogleCalendar() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  try {
    // Get user's Google Calendar tokens and family info
    const { data: familyMember } = await supabase
      .from("family_members")
      .select(
        "id, family_id, google_access_token, google_refresh_token, google_token_expires_at, google_calendar_sync_enabled",
      )
      .eq("user_id", user.id)
      .single()

    if (!familyMember?.google_calendar_sync_enabled || !familyMember.google_access_token) {
      return { error: "Google Calendar not connected" }
    }

    // Check if token needs refresh
    let accessToken = familyMember.google_access_token
    if (new Date(familyMember.google_token_expires_at) <= new Date()) {
      const refreshedTokens = await googleCalendarService.refreshAccessToken(familyMember.google_refresh_token)
      accessToken = refreshedTokens.access_token

      await supabase
        .from("family_members")
        .update({
          google_access_token: accessToken,
          google_token_expires_at: new Date(Date.now() + refreshedTokens.expires_in * 1000).toISOString(),
        })
        .eq("user_id", user.id)
    }

    // Get events from Google Calendar (next 30 days)
    const timeMin = new Date().toISOString()
    const timeMax = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    const googleEvents = await googleCalendarService.getEvents(accessToken, timeMin, timeMax)

    let importedCount = 0
    const errors = []

    for (const googleEvent of googleEvents) {
      try {
        // Check if event already exists
        const { data: existingEvent } = await supabase
          .from("events")
          .select("id")
          .eq("google_calendar_id", googleEvent.id)
          .single()

        if (existingEvent) continue // Skip if already imported

        // Convert and create family event
        const familyEvent = googleCalendarService.convertGoogleEventToFamily(googleEvent)

        const { error } = await supabase.from("events").insert({
          ...familyEvent,
          family_id: familyMember.family_id,
          created_by: familyMember.id,
          sync_to_google: true,
        })

        if (error) {
          errors.push(`Failed to import "${googleEvent.summary}": ${error.message}`)
        } else {
          importedCount++
        }
      } catch (error) {
        errors.push(`Error processing "${googleEvent.summary}": ${error.message}`)
      }
    }

    // Update last sync time
    await supabase
      .from("family_members")
      .update({ google_calendar_last_sync: new Date().toISOString() })
      .eq("user_id", user.id)

    // Log sync operation
    await supabase.from("calendar_sync_logs").insert({
      family_member_id: familyMember.id,
      sync_type: "import",
      status: errors.length === 0 ? "success" : errors.length < googleEvents.length ? "partial" : "error",
      events_processed: googleEvents.length,
      errors_count: errors.length,
      error_details: errors.length > 0 ? { errors } : null,
      completed_at: new Date().toISOString(),
    })

    revalidatePath("/calendar")
    return { success: true, importedCount, errors }
  } catch (error) {
    console.error("Error importing from Google Calendar:", error)
    return { error: "Failed to import events from Google Calendar" }
  }
}

export async function disconnectGoogleCalendar() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const { error } = await supabase
    .from("family_members")
    .update({
      google_access_token: null,
      google_refresh_token: null,
      google_token_expires_at: null,
      google_calendar_sync_enabled: false,
    })
    .eq("user_id", user.id)

  if (error) {
    console.error("Error disconnecting Google Calendar:", error)
    return { error: "Failed to disconnect Google Calendar" }
  }

  revalidatePath("/settings")
  return { success: true }
}
