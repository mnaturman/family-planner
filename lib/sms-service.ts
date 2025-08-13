// SMS notification service using Twilio
interface SMSConfig {
  accountSid: string
  authToken: string
  fromNumber: string
}

interface SMSMessage {
  to: string
  body: string
}

class SMSService {
  private config: SMSConfig

  constructor() {
    this.config = {
      accountSid: process.env.TWILIO_ACCOUNT_SID || "",
      authToken: process.env.TWILIO_AUTH_TOKEN || "",
      fromNumber: process.env.TWILIO_PHONE_NUMBER || "",
    }
  }

  private isConfigured(): boolean {
    return !!(this.config.accountSid && this.config.authToken && this.config.fromNumber)
  }

  async sendSMS(message: SMSMessage): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured()) {
      console.warn("Twilio not configured - SMS not sent")
      return { success: false, error: "SMS service not configured" }
    }

    try {
      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${this.config.accountSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(`${this.config.accountSid}:${this.config.authToken}`).toString("base64")}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            From: this.config.fromNumber,
            To: message.to,
            Body: message.body,
          }),
        },
      )

      if (!response.ok) {
        const error = await response.text()
        console.error("Twilio API error:", error)
        return { success: false, error: "Failed to send SMS" }
      }

      return { success: true }
    } catch (error) {
      console.error("SMS sending error:", error)
      return { success: false, error: "Network error sending SMS" }
    }
  }

  async sendEventReminder(
    phoneNumber: string,
    eventTitle: string,
    eventDate: Date,
    familyName: string,
  ): Promise<boolean> {
    const formattedDate = eventDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })

    const message = `📅 Family Calendar Reminder\n\n"${eventTitle}" is coming up on ${formattedDate}.\n\nFamily: ${familyName}`

    const result = await this.sendSMS({
      to: phoneNumber,
      body: message,
    })

    return result.success
  }

  async sendEventInvite(
    phoneNumber: string,
    eventTitle: string,
    eventDate: Date,
    familyName: string,
    inviterName: string,
  ): Promise<boolean> {
    const formattedDate = eventDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })

    const message = `📨 Family Event Invitation\n\n${inviterName} invited you to "${eventTitle}" on ${formattedDate}.\n\nFamily: ${familyName}\n\nCheck your family calendar for details!`

    const result = await this.sendSMS({
      to: phoneNumber,
      body: message,
    })

    return result.success
  }
}

export const smsService = new SMSService()
