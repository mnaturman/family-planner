// Google Calendar API integration service
interface GoogleCalendarConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
}

interface GoogleCalendarEvent {
  id?: string
  summary: string
  description?: string
  start: {
    dateTime: string
    timeZone?: string
  }
  end: {
    dateTime: string
    timeZone?: string
  }
  attendees?: Array<{
    email: string
    displayName?: string
  }>
}

interface FamilyEvent {
  id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  location?: string
  google_calendar_id?: string
}

class GoogleCalendarService {
  private config: GoogleCalendarConfig

  constructor() {
    this.config = {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirectUri: process.env.GOOGLE_REDIRECT_URI || "",
    }
  }

  private isConfigured(): boolean {
    return !!(this.config.clientId && this.config.clientSecret && this.config.redirectUri)
  }

  getAuthUrl(state: string): string {
    if (!this.isConfigured()) {
      throw new Error("Google Calendar not configured")
    }

    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: "code",
      scope: "https://www.googleapis.com/auth/calendar",
      access_type: "offline",
      prompt: "consent",
      state,
    })

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }

  async exchangeCodeForTokens(code: string): Promise<{
    access_token: string
    refresh_token: string
    expires_in: number
  }> {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        code,
        grant_type: "authorization_code",
        redirect_uri: this.config.redirectUri,
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to exchange code for tokens")
    }

    return response.json()
  }

  async refreshAccessToken(refreshToken: string): Promise<{
    access_token: string
    expires_in: number
  }> {
    const response = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to refresh access token")
    }

    return response.json()
  }

  async createEvent(accessToken: string, event: GoogleCalendarEvent): Promise<string> {
    const response = await fetch("https://www.googleapis.com/calendar/v3/calendars/primary/events", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    })

    if (!response.ok) {
      throw new Error("Failed to create Google Calendar event")
    }

    const result = await response.json()
    return result.id
  }

  async updateEvent(accessToken: string, eventId: string, event: GoogleCalendarEvent): Promise<void> {
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    })

    if (!response.ok) {
      throw new Error("Failed to update Google Calendar event")
    }
  }

  async deleteEvent(accessToken: string, eventId: string): Promise<void> {
    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${eventId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to delete Google Calendar event")
    }
  }

  async getEvents(accessToken: string, timeMin: string, timeMax: string): Promise<GoogleCalendarEvent[]> {
    const params = new URLSearchParams({
      timeMin,
      timeMax,
      singleEvents: "true",
      orderBy: "startTime",
    })

    const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to fetch Google Calendar events")
    }

    const result = await response.json()
    return result.items || []
  }

  convertFamilyEventToGoogle(familyEvent: FamilyEvent): GoogleCalendarEvent {
    return {
      summary: familyEvent.title,
      description: familyEvent.description || "",
      start: {
        dateTime: familyEvent.start_time,
        timeZone: "America/New_York", // You might want to make this configurable
      },
      end: {
        dateTime: familyEvent.end_time,
        timeZone: "America/New_York",
      },
    }
  }

  convertGoogleEventToFamily(googleEvent: GoogleCalendarEvent): Partial<FamilyEvent> {
    return {
      title: googleEvent.summary,
      description: googleEvent.description || "",
      start_time: googleEvent.start.dateTime,
      end_time: googleEvent.end.dateTime,
      google_calendar_id: googleEvent.id,
    }
  }
}

export const googleCalendarService = new GoogleCalendarService()
