import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL     || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Supabase env vars missing.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession:   true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  }
})

// ── Unified email helper ─────────────────────────────────────
export const sendEmail = async ({ to, subject, html, replyTo }) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { to, subject, html, ...(replyTo ? { replyTo } : {}) }
    })
    if (error) throw error
    return { ok: true, data }
  } catch (err) {
    console.warn('sendEmail error:', err.message)
    return { ok: false, error: err.message }
  }
}

// ── Paystack verification via edge function ──────────────────
export const verifyPaystackPayment = async (reference) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-email?action=verify-payment', {
      body: { reference }
    })
    if (error) throw error
    return { ok: true, data }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

// ── Log email to DB ──────────────────────────────────────────
export const logEmail = async ({ to, subject, template, resendId, error }) => {
  try {
    await supabase.from('email_logs').insert([{
      to_email: to, subject, template,
      resend_id: resendId || null,
      status: error ? 'error' : 'sent',
      error: error || null,
    }])
  } catch (_) {}
}

export default supabase
