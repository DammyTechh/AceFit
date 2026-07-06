// supabase/functions/send-email/index.ts
// Deploy: supabase functions deploy send-email --no-verify-jwt
// Secrets: supabase secrets set RESEND_API_KEY=re_xxx PAYSTACK_SECRET_KEY=sk_xxx

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY      = Deno.env.get("RESEND_API_KEY") || ""
const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY") || ""
const ADMIN_EMAIL         = "acefitandgainz@gmail.com"

// Until you verify a domain in Resend use onboarding@resend.dev
// Once acefit.com is verified, change to: AceFit <noreply@acefit.com>
const FROM_EMAIL = "AceFit <onboarding@resend.dev>"

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  })

// ── Send via Resend ──────────────────────────────────────────
async function sendEmail(to: string | string[], subject: string, html: string, replyTo?: string) {
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not set")
  const payload: Record<string, unknown> = {
    from: FROM_EMAIL,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  }
  if (replyTo) payload.reply_to = replyTo

  const res  = await fetch("https://api.resend.com/emails", {
    method:  "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
    body:    JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || "Resend error")
  return data
}

// ── Verify Paystack payment ──────────────────────────────────
async function verifyPaystack(reference: string) {
  if (!PAYSTACK_SECRET_KEY) throw new Error("PAYSTACK_SECRET_KEY not set")
  const res  = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
  })
  const data = await res.json()
  if (!res.ok || !data.status) throw new Error(data.message || "Paystack verify failed")
  return data.data
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS })

  try {
    const url      = new URL(req.url)
    const action   = url.searchParams.get("action") || "send-email"
    const body     = req.method === "POST" ? await req.json() : {}

    // ── Route: verify-payment ──────────────────────────────
    if (action === "verify-payment") {
      const { reference } = body
      if (!reference) return json({ error: "reference required" }, 400)
      const tx = await verifyPaystack(reference)
      return json({ success: true, data: tx })
    }

    // ── Route: send-email (default) ────────────────────────
    const { to, subject, html, replyTo } = body
    if (!to || !subject || !html) return json({ error: "Missing to/subject/html" }, 400)
    const data = await sendEmail(to, subject, html, replyTo)
    console.log("Email sent:", data.id, "→", to)
    return json({ success: true, id: data.id })

  } catch (err) {
    console.error("Edge fn error:", err.message)
    return json({ error: err.message }, 500)
  }
})
