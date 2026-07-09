// supabase/functions/send-email/index.ts
// Deploy: supabase functions deploy send-email --no-verify-jwt
// Secrets: RESEND_API_KEY, PAYSTACK_SECRET_KEY, SVC_ROLE_KEY

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const RESEND_API_KEY      = Deno.env.get("RESEND_API_KEY") || ""
const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY") || ""
const SUPABASE_URL        = Deno.env.get("SUPABASE_URL") || ""
const SUPABASE_SVC_KEY    = Deno.env.get("SVC_ROLE_KEY") || ""

const FROM_EMAIL = "AceFit <support@acefits.store>"

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  })

async function sendResendEmail(to: string, subject: string, html: string, replyTo?: string) {
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY not set")
  const payload: Record<string, unknown> = { from: FROM_EMAIL, to: [to], subject, html }
  if (replyTo) payload.reply_to = replyTo
  const res  = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${RESEND_API_KEY}` },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || "Resend error")
  return data
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function otpEmailHtml(code: string): string {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:Arial,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0">
  <tr><td align="center" style="padding:40px 20px">
    <table width="520" cellpadding="0" cellspacing="0"
      style="background:#141414;border-radius:16px;border:1px solid #2A2A2A;overflow:hidden">
      <tr><td height="4" style="background:linear-gradient(90deg,#FF6B00,#FF8C3A);font-size:0">&nbsp;</td></tr>
      <tr><td style="padding:32px 40px">
        <img src="https://i.imgur.com/eDF88SE.png" alt="AceFit" height="40" style="display:block;margin-bottom:24px"/>
        <h1 style="color:#fff;font-size:24px;margin:0 0 8px">Your Login Code</h1>
        <p style="color:#888;font-size:14px;margin:0 0 28px">Use this code to sign in to AceFit. Valid for 10 minutes.</p>
        <div style="background:#0A0A0A;border:2px solid #FF6B00;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
          <span style="font-size:40px;font-weight:900;color:#FF6B00;letter-spacing:12px;font-family:monospace">${code}</span>
        </div>
        <p style="color:#555;font-size:12px;margin:0">Do not share this code. AceFit will never ask for it.</p>
      </td></tr>
      <tr><td style="padding:20px 40px;border-top:1px solid #1A1A1A">
        <p style="color:#444;font-size:11px;margin:0">© ${new Date().getFullYear()} AceFit — acefits.store</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`
}

async function verifyPaystack(reference: string) {
  if (!PAYSTACK_SECRET_KEY) throw new Error("PAYSTACK_SECRET_KEY not set")
  const res  = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
  })
  const data = await res.json()
  if (!res.ok || !data.status) throw new Error(data.message || "Paystack verify failed")
  return data.data
}

// ── Find user by email using listUsers filter ────────────────
async function findUserByEmail(db: ReturnType<typeof createClient>, email: string) {
  const { data, error } = await db.auth.admin.listUsers({ perPage: 1000 })
  if (error) return null
  return data.users.find((u: { email: string }) => u.email === email) || null
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS })

  try {
    const body   = req.method === "POST" ? await req.json() : {}
    const url    = new URL(req.url)
    const action = url.searchParams.get("action") || body.action || "send-email"

    // ── SEND OTP ─────────────────────────────────────────────
    if (action === "send-otp") {
      const { email } = body
      if (!email) return json({ error: "email required" }, 400)
      if (!SUPABASE_SVC_KEY) throw new Error("SVC_ROLE_KEY not set")

      const db   = createClient(SUPABASE_URL, SUPABASE_SVC_KEY)
      const code = generateOTP()

      // Remove old OTPs for this email
      await db.from("custom_otps").delete().eq("email", email)

      // Insert new OTP
      const { error: insertErr } = await db.from("custom_otps").insert([{
        email,
        code,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      }])
      if (insertErr) throw new Error("DB insert failed: " + insertErr.message)

      // Send via Resend
      await sendResendEmail(email, `Your AceFit login code: ${code}`, otpEmailHtml(code))
      console.log("✅ OTP sent to:", email)
      return json({ success: true })
    }

    // ── VERIFY OTP ───────────────────────────────────────────
    if (action === "verify-otp") {
      const { email, code } = body
      if (!email || !code) return json({ error: "email and code required" }, 400)
      if (!SUPABASE_SVC_KEY) throw new Error("SVC_ROLE_KEY not set")

      const db = createClient(SUPABASE_URL, SUPABASE_SVC_KEY)

      // Validate OTP
      const { data: record, error: fetchErr } = await db
        .from("custom_otps")
        .select("*")
        .eq("email", email)
        .eq("code", code.toString().trim())
        .eq("used", false)
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      if (fetchErr || !record) {
        console.log("❌ OTP invalid for:", email)
        return json({ success: false, error: "Invalid or expired code" }, 400)
      }

      // Mark OTP as used
      await db.from("custom_otps").update({ used: true }).eq("id", record.id)

      // Find or create user
      const existingUser = await findUserByEmail(db, email)
      const isNewUser    = !existingUser
      let userId: string

      if (isNewUser) {
        const { data: newUser, error: createErr } = await db.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: { email },
        })
        if (createErr) throw new Error("Create user failed: " + createErr.message)
        userId = newUser.user.id
        console.log("✅ New user created:", userId)
      } else {
        userId = existingUser.id
        console.log("✅ Existing user found:", userId)
      }

      // Create a session for the user
      const { data: linkData, error: linkErr } = await db.auth.admin.generateLink({
        type: "magiclink",
        email,
      })

      // Return session token if available, else just userId
      const accessToken  = linkData?.properties?.access_token || null
      const refreshToken = linkData?.properties?.refresh_token || null

      console.log("✅ OTP verified for:", email)
      return json({
        success:      true,
        userId,
        email,
        isNewUser,
        accessToken,
        refreshToken,
      })
    }

    // ── VERIFY PAYMENT ───────────────────────────────────────
    if (action === "verify-payment") {
      const { reference } = body
      if (!reference) return json({ error: "reference required" }, 400)
      const tx = await verifyPaystack(reference)
      return json({ success: true, data: tx })
    }

    // ── SEND GENERIC EMAIL ───────────────────────────────────
    const { to, subject, html, replyTo } = body
    if (!to || !subject || !html) return json({ error: "Missing to/subject/html" }, 400)
    const data = await sendResendEmail(to, subject, html, replyTo)
    console.log("✅ Email sent:", data.id, "→", to)
    return json({ success: true, id: data.id })

  } catch (err) {
    console.error("❌ Edge fn error:", err.message)
    return json({ error: err.message }, 500)
  }
})
