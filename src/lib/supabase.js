import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL     || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Supabase env vars missing.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken:   true,
    persistSession:     true,
    detectSessionInUrl: false,
    // ⚠️ NO flowType: 'pkce' — that forces magic links instead of OTP codes
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
    const { data, error } = await supabase.functions.invoke('send-email', {
      body: { action: 'verify-payment', reference }
    })
    if (error) throw error
    return { ok: true, data }
  } catch (err) {
    return { ok: false, error: err.message }
  }
}

// ── Storage: ensure bucket exists before upload ──────────────
export const BUCKET = 'acefit-media'

export const ensureBucket = async () => {
  const { error } = await supabase.storage.getBucket(BUCKET)
  if (!error) return { ok: true }
  if (error.message?.includes('not found') || error.message?.includes('404') || error.statusCode === '404') {
    const { error: createError } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 10485760,
      allowedMimeTypes: ['image/jpeg','image/jpg','image/png','image/webp','image/gif'],
    })
    if (createError) return { ok: false, error: createError.message }
    return { ok: true, created: true }
  }
  return { ok: false, error: error.message }
}

// ── Storage: upload file (auto-creates bucket if needed) ─────
export const uploadFile = async (file, folder = 'products') => {
  await ensureBucket()
  const ext  = file.name.split('.').pop().toLowerCase()
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  })
  if (error) throw new Error(error.message)
  const { data: { publicUrl } } = supabase.storage.from(BUCKET).getPublicUrl(path)
  return publicUrl
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
