"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Download, Upload, Unlink } from "lucide-react"
import {
  initiateGoogleCalendarAuth,
  syncToGoogleCalendar,
  importFromGoogleCalendar,
  disconnectGoogleCalendar,
} from "@/lib/google-calendar-actions"

interface GoogleCalendarSyncProps {
  isConnected: boolean
  lastSync?: string
  eventId?: string // For single event sync
  showImportExport?: boolean // For bulk operations
}

export function GoogleCalendarSync({
  isConnected,
  lastSync,
  eventId,
  showImportExport = false,
}: GoogleCalendarSyncProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleConnect = async () => {
    setIsLoading(true)
    const result = await initiateGoogleCalendarAuth()
    if (result?.error) {
      setMessage({ type: "error", text: result.error })
    }
    setIsLoading(false)
  }

  const handleSyncEvent = async () => {
    if (!eventId) return

    setIsLoading(true)
    const result = await syncToGoogleCalendar(eventId)
    if (result.error) {
      setMessage({ type: "error", text: result.error })
    } else {
      setMessage({ type: "success", text: "Event synced to Google Calendar successfully!" })
    }
    setIsLoading(false)
  }

  const handleImport = async () => {
    setIsLoading(true)
    const result = await importFromGoogleCalendar()
    if (result.error) {
      setMessage({ type: "error", text: result.error })
    } else {
      const { importedCount, errors } = result
      if (errors.length === 0) {
        setMessage({ type: "success", text: `Successfully imported ${importedCount} events from Google Calendar!` })
      } else {
        setMessage({
          type: "error",
          text: `Imported ${importedCount} events with ${errors.length} errors. Check sync logs for details.`,
        })
      }
    }
    setIsLoading(false)
  }

  const handleDisconnect = async () => {
    setIsLoading(true)
    const result = await disconnectGoogleCalendar()
    if (result.error) {
      setMessage({ type: "error", text: result.error })
    } else {
      setMessage({ type: "success", text: "Google Calendar disconnected successfully!" })
    }
    setIsLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          <CardTitle>Google Calendar Sync</CardTitle>
          {isConnected && <Badge variant="secondary">Connected</Badge>}
        </div>
        <CardDescription>
          {isConnected ? "Sync your family events with Google Calendar" : "Connect your Google Calendar to sync events"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <div
            className={`p-3 rounded-md text-sm ${
              message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            }`}
          >
            {message.text}
          </div>
        )}

        {!isConnected ? (
          <Button onClick={handleConnect} disabled={isLoading} className="w-full">
            {isLoading ? "Connecting..." : "Connect Google Calendar"}
          </Button>
        ) : (
          <div className="space-y-3">
            {lastSync && (
              <p className="text-sm text-muted-foreground">
                Last sync: {new Date(lastSync).toLocaleDateString()} at {new Date(lastSync).toLocaleTimeString()}
              </p>
            )}

            {eventId && (
              <Button onClick={handleSyncEvent} disabled={isLoading} className="w-full">
                <Upload className="h-4 w-4 mr-2" />
                {isLoading ? "Syncing..." : "Sync to Google Calendar"}
              </Button>
            )}

            {showImportExport && (
              <div className="grid grid-cols-1 gap-2">
                <Button onClick={handleImport} disabled={isLoading} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  {isLoading ? "Importing..." : "Import from Google Calendar"}
                </Button>
              </div>
            )}

            <Button onClick={handleDisconnect} disabled={isLoading} variant="destructive" size="sm">
              <Unlink className="h-4 w-4 mr-2" />
              {isLoading ? "Disconnecting..." : "Disconnect"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
