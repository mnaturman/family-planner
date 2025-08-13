"use client"

import { useActionState, useState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Calendar, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { createEvent } from "@/lib/event-actions"

interface FamilyMember {
  id: string
  display_name: string
  color: string
  role: string
}

interface CreateEventFormProps {
  familyMembers: FamilyMember[]
  onClose?: () => void
  initialDate?: string
}

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating event...
        </>
      ) : (
        "Create Event"
      )}
    </Button>
  )
}

export default function CreateEventForm({ familyMembers, onClose, initialDate }: CreateEventFormProps) {
  const router = useRouter()
  const [state, formAction] = useActionState(createEvent, null)
  const [isAllDay, setIsAllDay] = useState(false)
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([])

  useEffect(() => {
    if (state?.success) {
      if (onClose) {
        onClose()
      } else {
        router.push("/calendar")
      }
    }
  }, [state, router, onClose])

  const handleParticipantToggle = (memberId: string) => {
    setSelectedParticipants((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId],
    )
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-blue-600" />
            <div>
              <CardTitle>Create New Event</CardTitle>
              <CardDescription>Schedule something for your family</CardDescription>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-6">
          {state?.error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {state.error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium mb-2">
                Event Title *
              </label>
              <Input id="title" name="title" type="text" placeholder="Family dinner, Soccer practice, etc." required />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium mb-2">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                placeholder="Add any additional details about the event"
                rows={3}
              />
            </div>

            <div>
              <label htmlFor="startDate" className="block text-sm font-medium mb-2">
                Start Date *
              </label>
              <Input id="startDate" name="startDate" type="date" defaultValue={initialDate} required />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium mb-2">
                End Date
              </label>
              <Input id="endDate" name="endDate" type="date" />
            </div>

            <div className="md:col-span-2 flex items-center space-x-2">
              <Checkbox id="isAllDay" name="isAllDay" checked={isAllDay} onCheckedChange={setIsAllDay} />
              <label htmlFor="isAllDay" className="text-sm font-medium">
                All day event
              </label>
            </div>

            {!isAllDay && (
              <>
                <div>
                  <label htmlFor="startTime" className="block text-sm font-medium mb-2">
                    Start Time *
                  </label>
                  <Input id="startTime" name="startTime" type="time" required />
                </div>

                <div>
                  <label htmlFor="endTime" className="block text-sm font-medium mb-2">
                    End Time
                  </label>
                  <Input id="endTime" name="endTime" type="time" />
                </div>
              </>
            )}

            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-2">
                Location
              </label>
              <Input id="location" name="location" type="text" placeholder="Where is this happening?" />
            </div>

            <div>
              <label htmlFor="eventType" className="block text-sm font-medium mb-2">
                Event Type
              </label>
              <Select name="eventType" defaultValue="general">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="appointment">Appointment</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="birthday">Birthday</SelectItem>
                  <SelectItem value="holiday">Holiday</SelectItem>
                  <SelectItem value="work">Work</SelectItem>
                  <SelectItem value="personal">Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="color" className="block text-sm font-medium mb-2">
                Event Color
              </label>
              <div className="flex gap-2 items-center">
                <Input id="color" name="color" type="color" defaultValue="#3B82F6" className="w-16 h-10" />
                <span className="text-sm text-muted-foreground">Choose a color for this event</span>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">Invite Family Members</label>
              <div className="grid grid-cols-2 gap-2">
                {familyMembers.map((member) => (
                  <div key={member.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`participant-${member.id}`}
                      checked={selectedParticipants.includes(member.id)}
                      onCheckedChange={() => handleParticipantToggle(member.id)}
                    />
                    <input
                      type="hidden"
                      name="participants"
                      value={member.id}
                      disabled={!selectedParticipants.includes(member.id)}
                    />
                    <label htmlFor={`participant-${member.id}`} className="text-sm flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: member.color }} />
                      {member.display_name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {onClose && (
              <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
                Cancel
              </Button>
            )}
            <SubmitButton />
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
