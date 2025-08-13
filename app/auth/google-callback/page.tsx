import { handleGoogleCalendarCallback } from "@/lib/google-calendar-actions"
import { redirect } from "next/navigation"

interface GoogleCallbackPageProps {
  searchParams: {
    code?: string
    state?: string
    error?: string
  }
}

export default async function GoogleCallbackPage({ searchParams }: GoogleCallbackPageProps) {
  if (searchParams.error) {
    redirect("/settings?error=google_auth_cancelled")
  }

  if (!searchParams.code || !searchParams.state) {
    redirect("/settings?error=invalid_google_callback")
  }

  const result = await handleGoogleCalendarCallback(searchParams.code, searchParams.state)

  if (result.error) {
    redirect(`/settings?error=${encodeURIComponent(result.error)}`)
  }

  redirect("/settings?success=google_calendar_connected")
}
