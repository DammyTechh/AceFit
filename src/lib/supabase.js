import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL     || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️  Supabase env vars missing. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken:  true,
    persistSession:    true,
    detectSessionInUrl: true,
  }
})

// Unified email helper — calls the send-email edge function
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

export default supabase
