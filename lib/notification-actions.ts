"use server"

import { createClient } from "@/lib/supabase/server"
import { whatsappService } from "@/lib/whatsapp-service"
import { revalidatePath } from "next/cache"

export async function updateNotificationPreferences(formData: FormData) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Not authenticated" }
  }

  const phoneNumber = formData.get("phoneNumber") as string
  const whatsappEnabled = formData.get("smsEnabled") === "on"
  const eventReminders = formData.get("eventReminders") === "on"
  const eventInvites = formData.get("eventInvites") === "on"
  const scheduleChanges = formData.get("scheduleChanges") === "on"

  const preferences = {
    event_reminders: eventReminders,
    event_invites: eventInvites,
    schedule_changes: scheduleChanges,
  }

  const { error } = await supabase
    .from("family_members")
    .update({
      phone_number: phoneNumber || null,
      sms_notifications_enabled: whatsappEnabled,
      notification_preferences: preferences,
    })
    .eq("user_id", user.id)

  if (error) {
    console.error("Error updating notification preferences:", error)
    return { error: "Failed to update preferences" }
  }

  revalidatePath("/dashboard")
  return { success: true }
}

export async function sendEventNotifications(eventId: string, type: "reminder" | "invite" | "update") {
  const supabase = await createClient()

  // Get event details and participants
  const { data: event } = await supabase
    .from("events")
    .select(`
      *,
      families (name),
      family_members!events_created_by_fkey (name)
    `)
    .eq("id", eventId)
    .single()

  if (!event) return { error: "Event not found" }

  // Get participants with phone numbers and notification preferences
  const { data: participants } = await supabase
    .from("event_participants")
    .select(`
      *,
      family_members (
        name,
        phone_number,
        sms_notifications_enabled,
        notification_preferences
      )
    `)
    .eq("event_id", eventId)

  if (!participants) return { error: "No participants found" }

  const results = []

  for (const participant of participants) {
    const member = participant.family_members
    if (!member?.phone_number || !member.sms_notifications_enabled) continue

    const preferences = member.notification_preferences || {}

    // Check if user wants this type of notification
    if (type === "reminder" && !preferences.event_reminders) continue
    if (type === "invite" && !preferences.event_invites) continue
    if (type === "update" && !preferences.schedule_changes) continue

    let success = false
    let message = ""

    try {
      if (type === "reminder") {
        success = await whatsappService.sendEventReminder(
          member.phone_number,
          event.title,
          new Date(event.start_time),
          event.families.name,
        )
        message = `WhatsApp reminder sent for "${event.title}"`
      } else if (type === "invite") {
        success = await whatsappService.sendEventInvite(
          member.phone_number,
          event.title,
          new Date(event.start_time),
          event.families.name,
          event.family_members.name,
        )
        message = `WhatsApp invitation sent for "${event.title}"`
      } else if (type === "update") {
        success = await whatsappService.sendScheduleChange(
          member.phone_number,
          event.title,
          "updated",
          event.families.name,
        )
        message = `WhatsApp update notification sent for "${event.title}"`
      }

      // Log the notification
      await supabase.from("notifications").insert({
        family_member_id: participant.family_member_id,
        event_id: eventId,
        type,
        message,
        status: success ? "sent" : "failed",
      })

      results.push({ member: member.name, success, message })
    } catch (error) {
      console.error(`Failed to send WhatsApp ${type} to ${member.name}:`, error)
      results.push({ member: member.name, success: false, error: error.message })
    }
  }

  return { results }
}
