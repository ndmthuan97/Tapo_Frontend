/**
 * Contact service — dual-mode:
 * 1. Calls backend POST /api/contact (primary, persists to DB)
 * 2. Falls back to EmailJS if backend fails and EmailJS env vars are set
 * 3. Dev simulation if neither is configured
 */
import emailjs from '@emailjs/browser'
import { httpClient } from '@/lib/http/http-client'

const EMAILJS_SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
const EMAILJS_PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY

const emailjsIsConfigured = Boolean(EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY)

export interface ContactPayload {
  from_name:  string
  from_email: string
  phone:      string
  topic:      string
  message:    string
}

/**
 * Primary send: persists to backend DB via REST API.
 */
async function sendViaBackend(payload: ContactPayload): Promise<void> {
  const res = await httpClient.post('/api/contact', {
    name:    payload.from_name,
    email:   payload.from_email,
    phone:   payload.phone || undefined,
    topic:   payload.topic,
    message: payload.message,
  })
  // httpClient throws on non-2xx — if we get here it succeeded
  void res
}

/**
 * Fallback send via EmailJS (if configured).
 */
async function sendViaEmailJs(payload: ContactPayload): Promise<void> {
  await emailjs.send(
    EMAILJS_SERVICE_ID!,
    EMAILJS_TEMPLATE_ID!,
    {
      from_name:  payload.from_name,
      from_email: payload.from_email,
      reply_to:   payload.from_email,
      phone:      payload.phone || 'Không cung cấp',
      topic:      payload.topic,
      message:    payload.message,
    },
    EMAILJS_PUBLIC_KEY!,
  )
}

/**
 * Send a contact message.
 * Strategy: Backend → EmailJS → Dev simulation
 */
export async function sendContactMessage(payload: ContactPayload): Promise<void> {
  // 1. Try backend (always — no config needed)
  try {
    await sendViaBackend(payload)
    return
  } catch (backendError) {
    console.warn('[ContactService] Backend failed, falling back:', backendError)
  }

  // 2. Fall back to EmailJS if configured
  if (emailjsIsConfigured) {
    await sendViaEmailJs(payload)
    return
  }

  // 3. Dev simulation
  await new Promise(r => setTimeout(r, 1200))
  console.info('[ContactService] Dev mode — simulated send:', payload)
}

export { emailjsIsConfigured as emailjsConfigured }
