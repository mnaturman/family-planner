// WhatsApp Business Platform notification service
interface WhatsAppConfig {
  accessToken: string
  phoneNumberId: string
  businessAccountId: string
}

interface WhatsAppMessage {
  to: string
  type: "template"
  template: {
    name: string
    language: {
      code: string
    }
    components: Array<{
      type: string
      parameters: Array<{
        type: string
        text: string
      }>
    }>
  }
}

class WhatsAppService {
  private config: WhatsAppConfig
  private baseUrl = "https://graph.facebook.com/v18.0"

  constructor() {
    this.config = {
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN || "",
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || "",
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || "",
    }
  }

  private isConfigured(): boolean {
    return false
    // Uncomment when ready: return !!(this.config.accessToken && this.config.phoneNumberId && this.config.businessAccountId)
  }

  async sendMessage(message: WhatsAppMessage): Promise<{ success: boolean; error?: string }> {
    if (!this.isConfigured()) {
      console.warn("WhatsApp Business API not configured - message not sent")
      return { success: false, error: "WhatsApp service not configured" }
    }

    try {
      const response = await fetch(`${this.baseUrl}/${this.config.phoneNumberId}/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: message.to,
          type: message.type,
          template: message.template,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error("WhatsApp API error:", error)
        return { success: false, error: error.error?.message || "Failed to send WhatsApp message" }
      }

      return { success: true }
    } catch (error) {
      console.error("WhatsApp sending error:", error)
      return { success: false, error: "Network error sending WhatsApp message" }
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

    const message: WhatsAppMessage = {
      to: phoneNumber,
      type: "template",
      template: {
        name: "event_reminder", // This template needs to be created and approved in Meta Business
        language: {
          code: "en_US",
        },
        components: [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: eventTitle,
              },
              {
                type: "text",
                text: formattedDate,
              },
              {
                type: "text",
                text: familyName,
              },
            ],
          },
        ],
      },
    }

    const result = await this.sendMessage(message)
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

    const message: WhatsAppMessage = {
      to: phoneNumber,
      type: "template",
      template: {
        name: "event_invitation", // This template needs to be created and approved in Meta Business
        language: {
          code: "en_US",
        },
        components: [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: inviterName,
              },
              {
                type: "text",
                text: eventTitle,
              },
              {
                type: "text",
                text: formattedDate,
              },
              {
                type: "text",
                text: familyName,
              },
            ],
          },
        ],
      },
    }

    const result = await this.sendMessage(message)
    return result.success
  }

  async sendScheduleChange(
    phoneNumber: string,
    eventTitle: string,
    changeType: "updated" | "cancelled",
    familyName: string,
  ): Promise<boolean> {
    const message: WhatsAppMessage = {
      to: phoneNumber,
      type: "template",
      template: {
        name: "schedule_change", // This template needs to be created and approved in Meta Business
        language: {
          code: "en_US",
        },
        components: [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: eventTitle,
              },
              {
                type: "text",
                text: changeType,
              },
              {
                type: "text",
                text: familyName,
              },
            ],
          },
        ],
      },
    }

    const result = await this.sendMessage(message)
    return result.success
  }
}

export const whatsappService = new WhatsAppService()
