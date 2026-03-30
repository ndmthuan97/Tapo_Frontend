/**
 * EmailJS integration for ContactPage.
 *
 * Setup:
 *   1. Create account at https://www.emailjs.com (free: 200 emails/month)
 *   2. Create Email Service (Gmail recommended)
 *   3. Create Email Template with these variables:
 *      {{from_name}}, {{from_email}}, {{phone}}, {{topic}}, {{message}}, {{reply_to}}
 *   4. Get your Public Key from Account > API Keys
 *   5. Fill in .env:
 *      VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
 *      VITE_EMAILJS_TEMPLATE_ID=template_xxxxxxx
 *      VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
 *
 * If env vars are not set, the form will simulate submission (dev mode).
 */
import emailjs from '@emailjs/browser'

const SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID
const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

const isConfigured = Boolean(SERVICE_ID && TEMPLATE_ID && PUBLIC_KEY)

export interface ContactPayload {
  from_name:  string
  from_email: string
  phone:      string
  topic:      string
  message:    string
}

/**
 * Send a contact message via EmailJS.
 * Falls back to a simulated 1.5s delay if EmailJS is not configured (dev/demo mode).
 */
export async function sendContactMessage(payload: ContactPayload): Promise<void> {
  if (!isConfigured) {
    // Dev/demo mode — simulate network delay
    await new Promise(r => setTimeout(r, 1500))
    console.info('[ContactService] EmailJS not configured — simulated send:', payload)
    return
  }

  await emailjs.send(
    SERVICE_ID!,
    TEMPLATE_ID!,
    {
      from_name:  payload.from_name,
      from_email: payload.from_email,
      reply_to:   payload.from_email,
      phone:      payload.phone || 'Không cung cấp',
      topic:      payload.topic,
      message:    payload.message,
    },
    PUBLIC_KEY!,
  )
}

export { isConfigured as emailjsConfigured }
