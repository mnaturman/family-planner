"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { updateNotificationPreferences } from "@/lib/notification-actions"
import { useActionState } from "react"
import { MessageCircle, Shield, Clock } from "lucide-react"

interface NotificationSettingsProps {
  initialData: {
    phoneNumber?: string
    smsEnabled: boolean
    preferences: {
      event_reminders: boolean
      event_invites: boolean
      schedule_changes: boolean
    }
  }
}

export function NotificationSettings({ initialData }: NotificationSettingsProps) {
  const [state, formAction, isPending] = useActionState(updateNotificationPreferences, null)
  const [whatsappEnabled, setWhatsappEnabled] = useState(initialData.smsEnabled)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5 text-green-600" />
          WhatsApp Notifications
        </CardTitle>
        <CardDescription>
          Configure WhatsApp notifications for your family calendar.
          <span className="block mt-1 text-amber-600 font-medium">
            ⚠️ Temporarily disabled - WhatsApp Business account setup required
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">WhatsApp Phone Number</Label>
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              placeholder="+1 (555) 123-4567"
              defaultValue={initialData.phoneNumber || ""}
            />
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Must be a verified WhatsApp number. Include country code (e.g., +1 for US).
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="smsEnabled">WhatsApp Notifications</Label>
              <p className="text-sm text-muted-foreground">Enable WhatsApp message notifications</p>
            </div>
            <Switch id="smsEnabled" name="smsEnabled" checked={whatsappEnabled} onCheckedChange={setWhatsappEnabled} />
          </div>

          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 mb-4">
            <h5 className="font-medium text-amber-800 mb-2">Setup Required</h5>
            <p className="text-sm text-amber-700">
              WhatsApp notifications are temporarily disabled. To enable them, you'll need to:
            </p>
            <ul className="text-sm text-amber-700 mt-2 space-y-1">
              <li>• Set up a Meta Business account</li>
              <li>• Get WhatsApp Business API approval</li>
              <li>• Create and approve message templates</li>
              <li>• Add environment variables to your project</li>
            </ul>
          </div>

          {whatsappEnabled && (
            <div className="space-y-4 pl-4 border-l-2 border-green-200">
              <h4 className="font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Notification Types
              </h4>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="eventReminders">Event Reminders</Label>
                  <p className="text-sm text-muted-foreground">Get WhatsApp reminders before events start</p>
                </div>
                <Switch
                  id="eventReminders"
                  name="eventReminders"
                  defaultChecked={initialData.preferences.event_reminders}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="eventInvites">Event Invitations</Label>
                  <p className="text-sm text-muted-foreground">Get notified via WhatsApp when invited to events</p>
                </div>
                <Switch id="eventInvites" name="eventInvites" defaultChecked={initialData.preferences.event_invites} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="scheduleChanges">Schedule Changes</Label>
                  <p className="text-sm text-muted-foreground">
                    Get WhatsApp notifications when events are updated or cancelled
                  </p>
                </div>
                <Switch
                  id="scheduleChanges"
                  name="scheduleChanges"
                  defaultChecked={initialData.preferences.schedule_changes}
                />
              </div>
            </div>
          )}

          {state?.error && <p className="text-sm text-destructive">{state.error}</p>}

          {state?.success && <p className="text-sm text-green-600">WhatsApp settings updated successfully!</p>}

          <Button type="submit" disabled={isPending} className="bg-green-600 hover:bg-green-700">
            {isPending ? "Saving..." : "Save WhatsApp Settings"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
