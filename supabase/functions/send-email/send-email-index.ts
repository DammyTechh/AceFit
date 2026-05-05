// supabase/functions/send-email/index.ts
// ─────────────────────────────────────────────────────────────
// Deploy command (run from your project root):
//   supabase functions deploy send-email --no-verify-jwt
//   supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
// ─────────────────────────────────────────────────────────────

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")

// ─── IMPORTANT: Resend onboarding FROM address ───────────────
// Until you verify a domain in Resend, you MUST use:
//   onboarding@resend.dev
// Once you verify a domain (e.g. acefit.com), change to:
//   AceFit <noreply@acefit.com>
const FROM_EMAIL = "AceFit <onboarding@resend.dev>"

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS })
  }

  try {
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY secret not set")
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...CORS } }
      )
    }

    const { to, subject, html, replyTo } = await req.json()

    if (!to || !subject || !html) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, html" }),
        { status: 400, headers: { "Content-Type": "application/json", ...CORS } }
      )
    }

    const payload: Record<string, unknown> = {
      from: FROM_EMAIL,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    }

    // Optional reply-to (useful for support tickets)
    if (replyTo) payload.reply_to = replyTo

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error("Resend API error:", data)
      return new Response(
        JSON.stringify({ error: data.message || "Resend API error", details: data }),
        { status: res.status, headers: { "Content-Type": "application/json", ...CORS } }
      )
    }

    console.log("Email sent:", data.id, "→", to)

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { headers: { "Content-Type": "application/json", ...CORS } }
    )

  } catch (error) {
    console.error("Edge function error:", error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...CORS } }
    )
  }
})
