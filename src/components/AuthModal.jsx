import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Loader, CheckCircle, ArrowLeft } from 'lucide-react'
import { supabase, sendEmail } from '../lib/supabase'
import { emailTemplates } from '../lib/emailTemplates'
import { useStore } from '../lib/store'
import toast from 'react-hot-toast'

export default function AuthModal({ open, onClose }) {
  const { theme } = useStore()
  const isDark = theme === 'dark'
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendOTP = async (e) => {
    e?.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          // Do NOT set emailRedirectTo for OTP — only needed for magic links
        }
      })
      if (error) throw error
      setStep('otp')
      toast.success('Code sent! Check your email 📬')
    } catch (err) {
      console.error('OTP error:', err)
      // More helpful error messages
      if (err.message?.includes('Email') || err.message?.includes('SMTP') || err.message?.includes('confirmation')) {
        setError('Email delivery failed. Check Supabase SMTP settings — see SETUP_GUIDE.md Step 2.')
      } else if (err.message?.includes('rate')) {
        setError('Too many attempts. Please wait 60 seconds and try again.')
      } else {
        setError(err.message || 'Failed to send code. Try again.')
      }
    } finally { setLoading(false) }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    if (!otp || otp.length < 6) return setError('Please enter the full code')
    setLoading(true)
    setError('')
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      })
      if (error) throw error

      setStep('success')

      // Send welcome email for brand new users
      if (data?.user) {
        try {
          const createdRecently = new Date(data.user.created_at) > new Date(Date.now() - 15000)
          if (createdRecently) {
            const tpl = emailTemplates.welcome({ email, name: data.user.user_metadata?.name || '' })
            await sendEmail({ to: email, ...tpl })
          }
        } catch (_) { /* welcome email failing shouldn't block login */ }
      }

      setTimeout(() => {
        onClose()
        setStep('email')
        setEmail('')
        setOtp('')
        setError('')
      }, 1600)

    } catch (err) {
      console.error('Verify OTP error:', err)
      if (err.message?.includes('expired')) {
        setError('Code expired. Please request a new one.')
      } else if (err.message?.includes('invalid')) {
        setError('Wrong code. Check your email and try again.')
      } else {
        setError(err.message || 'Invalid code. Try again.')
      }
    } finally { setLoading(false) }
  }

  const reset = () => { setStep('email'); setOtp(''); setError('') }

  const inp = `w-full px-4 py-3.5 border rounded-xl text-sm outline-none transition-colors ${
    isDark
      ? 'bg-black/30 border-[#2A2A2A] text-white placeholder-gray-600 focus:border-brand-orange'
      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-brand-orange'
  }`

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[250] flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
        onClick={e => { if (e.target === e.currentTarget) onClose() }}>

        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
          className={`relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl ${
            isDark ? 'bg-[#141414] border border-[#2A2A2A]' : 'bg-white border border-gray-200'
          }`}>

          {/* Top accent bar */}
          <div className="h-1 bg-gradient-to-r from-brand-orange via-orange-400 to-yellow-400"/>

          {/* Close */}
          <button onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-all z-10">
            <X size={16}/>
          </button>

          <div className="p-8">
            <img src="https://i.imgur.com/eDF88SE.png" alt="AceFit" className="h-10 mb-6"/>

            {/* ── Step: email ── */}
            {step === 'email' && (
              <>
                <h2 className={`font-display text-3xl mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>SIGN IN</h2>
                <p className={`text-sm mb-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Enter your email — we'll send a one-time code
                </p>
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                      <input type="email" required autoFocus value={email}
                        onChange={e => { setEmail(e.target.value); setError('') }}
                        placeholder="you@example.com"
                        className={inp + ' pl-10'}/>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                      <p className="text-red-400 text-xs leading-relaxed">{error}</p>
                    </div>
                  )}

                  <button type="submit" disabled={loading}
                    className="w-full py-3.5 bg-brand-orange hover:bg-brand-orange-light text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-orange/25 disabled:opacity-60 active:scale-95">
                    {loading ? <><Loader size={16} className="animate-spin"/> Sending…</> : 'Send Code →'}
                  </button>

                  <p className={`text-center text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                    New here? An account is created automatically. No password needed.
                  </p>
                </form>
              </>
            )}

            {/* ── Step: OTP ── */}
            {step === 'otp' && (
              <>
                <button onClick={reset}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-orange mb-5 transition-colors">
                  <ArrowLeft size={12}/> Back
                </button>
                <h2 className={`font-display text-3xl mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>CHECK EMAIL</h2>
                <p className={`text-sm mb-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  We sent a code to <strong className="text-brand-orange">{email}</strong> — enter it below (6 or 8 digits)
                </p>
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Login Code (6 or 8 digits)
                    </label>
                    <input type="text" required inputMode="numeric" pattern="[0-9]*"
                      maxLength={8} autoFocus value={otp}
                      onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setError('') }}
                      placeholder="00000000"
                      className={inp + ' text-center text-xl tracking-[0.4rem] font-bold font-mono'}/>
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                      <p className="text-red-400 text-xs leading-relaxed">{error}</p>
                    </div>
                  )}

                  <button type="submit" disabled={loading || otp.length < 6 || otp.length > 8}
                    className="w-full py-3.5 bg-brand-orange hover:bg-brand-orange-light text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-orange/25 disabled:opacity-60 active:scale-95">
                    {loading ? <><Loader size={16} className="animate-spin"/> Verifying…</> : 'Verify Code →'}
                  </button>

                  <button type="button" onClick={() => handleSendOTP()}
                    className={`w-full text-xs text-center py-2 transition-colors ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                    Didn't receive it? Resend code
                  </button>
                </form>
              </>
            )}

            {/* ── Step: success ── */}
            {step === 'success' && (
              <div className="text-center py-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 12 }}>
                  <CheckCircle size={56} className="text-green-400 mx-auto mb-4"/>
                </motion.div>
                <h2 className={`font-display text-3xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>WELCOME!</h2>
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>You're signed in 🎉</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
