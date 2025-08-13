import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NotificationSettings } from "@/components/settings/notification-settings"
import { GoogleCalendarSync } from "@/components/calendar/google-calendar-sync"

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Get user's family member data with notification preferences and Google Calendar info
  const { data: familyMember } = await supabase
    .from("family_members")
    .select(
      "phone_number, sms_notifications_enabled, notification_preferences, google_calendar_sync_enabled, google_calendar_last_sync",
    )
    .eq("user_id", user.id)
    .single()

  const initialData = {
    phoneNumber: familyMember?.phone_number || "",
    smsEnabled: familyMember?.sms_notifications_enabled || false,
    preferences: familyMember?.notification_preferences || {
      event_reminders: true,
      event_invites: true,
      schedule_changes: true,
    },
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your notification preferences and account settings</p>
        </div>

        <div className="space-y-6">
          <NotificationSettings initialData={initialData} />

          <GoogleCalendarSync
            isConnected={familyMember?.google_calendar_sync_enabled || false}
            lastSync={familyMember?.google_calendar_last_sync}
            showImportExport={true}
          />
        </div>
      </div>
    </div>
  )
}
