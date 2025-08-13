"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Clock, MapPin, Users, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { deleteEvent, updateParticipantStatus } from "@/lib/event-actions"

interface EventDetailsModalProps {
  event: {
    id: string
    title: string
    description?: string
    start_time: string
    end_time: string
    location?: string
    color: string
    is_all_day: boolean
    event_type: string
    created_by?: {
      id: string
      display_name: string
      color: string
    }
    event_participants?: Array<{
      id: string
      status: string
      family_member_id: string
      family_members: {
        id: string
        display_name: string
        color: string
      }
    }>
  }
  isOpen: boolean
  onClose: () => void
  onEdit?: () => void
  currentUserId?: string
}

export default function EventDetailsModal({ event, isOpen, onClose, onEdit, currentUserId }: EventDetailsModalProps) {
  const [loading, setLoading] = useState(false)

  const startTime = new Date(event.start_time)
  const endTime = new Date(event.end_time)

  const currentUserParticipant = event.event_participants?.find((p) => p.family_members.id === currentUserId)

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this event?")) return

    setLoading(true)
    try {
      const result = await deleteEvent(event.id)
      if (result.success) {
        onClose()
      } else {
        alert(result.error || "Failed to delete event")
      }
    } catch (error) {
      alert("An error occurred while deleting the event")
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (status: string) => {
    if (!currentUserParticipant) return

    setLoading(true)
    try {
      const result = await updateParticipantStatus(currentUserParticipant.id, status)
      if (!result.success) {
        alert(result.error || "Failed to update status")
      }
    } catch (error) {
      alert("An error occurred while updating your status")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: event.color }} />
            <DialogTitle className="text-xl">{event.title}</DialogTitle>
            <Badge variant="secondary">{event.event_type}</Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {event.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-muted-foreground">{event.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                {event.is_all_day ? (
                  <span>All day</span>
                ) : (
                  <span>
                    {format(startTime, "MMM d, yyyy 'at' h:mm a")} - {format(endTime, "h:mm a")}
                  </span>
                )}
              </div>
            </div>

            {event.location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{event.location}</span>
              </div>
            )}
          </div>

          {event.created_by && (
            <div>
              <h4 className="font-medium mb-2">Organizer</h4>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: event.created_by.color }} />
                <span className="text-sm">{event.created_by.display_name}</span>
              </div>
            </div>
          )}

          {event.event_participants && event.event_participants.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Participants ({event.event_participants.length})
              </h4>
              <div className="space-y-2">
                {event.event_participants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: participant.family_members.color }}
                      />
                      <span className="text-sm">{participant.family_members.display_name}</span>
                    </div>
                    <Badge
                      variant={
                        participant.status === "accepted"
                          ? "default"
                          : participant.status === "declined"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {participant.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {currentUserParticipant && (
            <div>
              <h4 className="font-medium mb-2">Your Response</h4>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={currentUserParticipant.status === "accepted" ? "default" : "outline"}
                  onClick={() => handleStatusUpdate("accepted")}
                  disabled={loading}
                >
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant={currentUserParticipant.status === "maybe" ? "default" : "outline"}
                  onClick={() => handleStatusUpdate("maybe")}
                  disabled={loading}
                >
                  Maybe
                </Button>
                <Button
                  size="sm"
                  variant={currentUserParticipant.status === "declined" ? "destructive" : "outline"}
                  onClick={() => handleStatusUpdate("declined")}
                  disabled={loading}
                >
                  Decline
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-4 border-t">
            <div className="flex gap-2">
              {onEdit && (
                <Button variant="outline" onClick={onEdit} disabled={loading}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
