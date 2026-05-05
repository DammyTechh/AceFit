import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Loader, Shield, CheckCircle, KeyRound, AlertCircle, RefreshCw, Info } from 'lucide-react'
import { useStore } from '../lib/store'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

// Number of digits in the OTP. Must match Supabase Dashboard
// → Authentication → Providers → Email → "Email OTP Length"
const OTP_LENGTH = 8

export default function AuthModal() {
  const { authModalOpen, setAuthModalOpen, setUser, theme } = useStore()
  const [step, setStep]           = useState('email')
  const [email, setEmail]         = useState('')
  const [otp, setOtp]             = useState(Array(OTP_LENGTH).fill(''))
  const [loading, setLoading]     = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [errorMsg, setErrorMsg]   = useState('')
  const [errorTone, setErrorTone] = useState('error') // 'error' | 'warning' | 'info'
  const otpRefs = useRef([])
  const isDark  = theme === 'dark'

  // Reset everything when modal closes
  useEffect(() => {
    if (!authModalOpen) {
      const t = setTimeout(() => {
        setStep('email')
        setEmail('')
        setOtp(Array(OTP_LENGTH).fill(''))
        setCountdown(0)
        setErrorMsg('')
        setErrorTone('error')
      }, 300)
      return () => clearTimeout(t)
    }
  }, [authModalOpen])

  // Countdown ticker
  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [countdown])

  // ── Send OTP ──────────────────────────────────────────────
  const handleSendOTP = async (e, isResend = false) => {
    e?.preventDefault()
    setErrorMsg('')
    setErrorTone('error')

    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setErrorMsg('Please enter a valid email address.')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: true,
        },
      })

      if (error) {
        const msg = (error.message || '').toLowerCase()

        if (msg.includes('security') || msg.includes('seconds') || error.status === 429) {
          const match = error.message.match(/(\d+)\s*second/i)
          const wait = match ? parseInt(match[1], 10) : 60
          setCountdown(wait)
          setErrorTone('info')
          throw new Error(
            isResend
              ? `Please wait ${wait} seconds before requesting another code. Check your inbox first — including spam.`
              : `A code was just sent. Please check your inbox, or wait ${wait} seconds for a new one.`
          )
        }

        if (msg.includes('rate') || msg.includes('limit')) {
          throw new Error('Too many attempts. Please wait a minute and try again.')
        }

        throw error
      }

      setStep('otp')
      setCountdown(60)
      toast.success('Code sent! Check your inbox 📬', { duration: 4000 })
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send code. Please check your internet connection.')
    } finally {
      setLoading(false)
    }
  }

  // ── Verify OTP ────────────────────────────────────────────
  const handleVerifyOTP = async (code) => {
    if (code.length !== OTP_LENGTH) return
    if (loading) return

    setErrorMsg('')
    setErrorTone('error')
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: code,
        type: 'email',
      })

      if (error) {
        const msg = (error.message || '').toLowerCase()

        if (msg.includes('expired')) {
          setErrorTone('warning')
          throw new Error('This code has expired. Tap "Send a new code" below to get a fresh one.')
        }
        if (msg.includes('invalid') || msg.includes('token')) {
          throw new Error('Incorrect code. Please double-check the email and try again.')
        }
        throw error
      }

      setUser(data.user)
      setStep('success')
      setTimeout(() => {
        setAuthModalOpen(false)
        toast.success('Welcome to AceFit! 🔥')
      }, 1800)
    } catch (err) {
      setErrorMsg(err.message || 'Verification failed. Please try again.')
      setOtp(Array(OTP_LENGTH).fill(''))
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    } finally {
      setLoading(false)
    }
  }

  // ── OTP input handlers ────────────────────────────────────
  const handleOTPChange = (i, val) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[i] = val.slice(-1)
    setOtp(next)
    setErrorMsg('')
    if (val && i < OTP_LENGTH - 1) otpRefs.current[i + 1]?.focus()
    if (next.every(d => d)) handleVerifyOTP(next.join(''))
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus()
    if (e.key === 'ArrowLeft'  && i > 0) otpRefs.current[i - 1]?.focus()
    if (e.key === 'ArrowRight' && i < OTP_LENGTH - 1) otpRefs.current[i + 1]?.focus()
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return
    const next = Array(OTP_LENGTH).fill('')
    pasted.split('').forEach((d, idx) => { next[idx] = d })
    setOtp(next)
    otpRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus()
    if (pasted.length === OTP_LENGTH) handleVerifyOTP(pasted)
  }

  const alertStyles = {
    error:   { bg: 'bg-red-400/10',    border: 'border-red-400/20',    text: 'text-red-400'    },
    warning: { bg: 'bg-yellow-400/10', border: 'border-yellow-400/20', text: 'text-yellow-400' },
    info:    { bg: 'bg-blue-400/10',   border: 'border-blue-400/20',   text: 'text-blue-400'   },
  }[errorTone]

  const AlertIcon = errorTone === 'info' ? Info : AlertCircle

  return (
    <AnimatePresence>
      {authModalOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 modal-backdrop"
          style={{ background: 'rgba(0,0,0,0.85)' }}
          onClick={e => e.target === e.currentTarget && step !== 'success' && setAuthModalOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', damping: 22, stiffness: 300 }}
            className={`relative w-full max-w-sm rounded-2xl overflow-hidden ${
              isDark ? 'bg-[#141414] border border-[#242424]' : 'bg-white border border-gray-200 shadow-2xl'
            }`}
          >
            <div className="h-1 bg-gradient-to-r from-brand-orange via-orange-400 to-yellow-400" />

            <div className="p-7">
              {step !== 'success' && (
                <button
                  onClick={() => setAuthModalOpen(false)}
                  className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors ${
                    isDark ? 'text-gray-500 hover:text-white hover:bg-white/5'
                           : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              )}

              <div className="flex items-center gap-3 mb-6">
                <img src="https://i.imgur.com/eDF88SE.png" alt="AceFit" className="h-9 w-auto" />
                <div>
                  <h2 className={`font-bold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {step === 'email'   && 'Sign In / Create Account'}
                    {step === 'otp'     && 'Enter Your Code'}
                    {step === 'success' && "You're In!"}
                  </h2>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {step === 'email'   && 'No password needed'}
                    {step === 'otp'     && `Code sent to ${email}`}
                    {step === 'success' && 'Welcome to AceFit 🔥'}
                  </p>
                </div>
              </div>

              <AnimatePresence mode="wait">

                {/* ── EMAIL STEP ── */}
                {step === 'email' && (
                  <motion.div key="email"
                    initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
                    <form onSubmit={handleSendOTP} className="space-y-4">
                      <div>
                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Email Address
                        </label>
                        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
                          errorMsg && errorTone === 'error' ? 'border-red-400'
                            : isDark ? 'bg-black/40 border-[#2a2a2a] focus-within:border-brand-orange'
                                     : 'bg-gray-50 border-gray-200 focus-within:border-brand-orange'
                        }`}>
                          <Mail size={15} className="text-brand-orange shrink-0" />
                          <input
                            type="email"
                            value={email}
                            onChange={e => { setEmail(e.target.value); setErrorMsg('') }}
                            placeholder="you@example.com"
                            required
                            autoFocus
                            autoComplete="email"
                            className={`flex-1 bg-transparent text-sm outline-none ${
                              isDark ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'
                            }`}
                          />
                        </div>
                      </div>

                      {errorMsg && (
                        <div className={`flex items-start gap-2 p-3 rounded-xl ${alertStyles.bg} border ${alertStyles.border}`}>
                          <AlertIcon size={13} className={`${alertStyles.text} shrink-0 mt-0.5`} />
                          <p className={`${alertStyles.text} text-xs leading-relaxed`}>{errorMsg}</p>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading || countdown > 0}
                        className="w-full py-3 bg-brand-orange hover:bg-brand-orange-light text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all btn-press disabled:opacity-60 shadow-lg shadow-brand-orange/25"
                      >
                        {loading ? <Loader size={15} className="animate-spin" />
                          : countdown > 0 ? <>Wait {countdown}s</>
                          : <><KeyRound size={15} /> Send Verification Code</>}
                      </button>
                    </form>

                    <p className={`text-xs text-center mt-4 leading-relaxed ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                      We'll email you a one-time code. No password required.
                    </p>
                  </motion.div>
                )}

                {/* ── OTP STEP ── */}
                {step === 'otp' && (
                  <motion.div key="otp"
                    initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>

                    <div className={`flex items-start gap-2 p-3 rounded-xl mb-5 ${
                      isDark ? 'bg-brand-orange/10 border border-brand-orange/20' : 'bg-orange-50 border border-orange-100'
                    }`}>
                      <Shield size={13} className="text-brand-orange shrink-0 mt-0.5" />
                      <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        Check <strong className="text-brand-orange">{email}</strong> for an <strong>{OTP_LENGTH}-digit code</strong>. Don't see it? Check spam. Code valid for 1 hour.
                      </p>
                    </div>

                    {/* OTP boxes — responsive: smaller on narrow screens to fit 8 digits */}
                    <div className="flex gap-1.5 justify-between mb-4" onPaste={handlePaste}>
                      {otp.map((d, i) => (
                        <input
                          key={i}
                          ref={el => otpRefs.current[i] = el}
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={1}
                          value={d}
                          onChange={e => handleOTPChange(i, e.target.value)}
                          onKeyDown={e => handleKeyDown(i, e)}
                          autoFocus={i === 0}
                          autoComplete={i === 0 ? 'one-time-code' : 'off'}
                          className={`flex-1 min-w-0 max-w-[40px] text-center text-base font-bold rounded-lg border-2 outline-none transition-all ${
                            d ? 'border-brand-orange bg-brand-orange/10 text-brand-orange'
                              : isDark ? 'border-[#2a2a2a] bg-black/40 text-white focus:border-brand-orange'
                                       : 'border-gray-200 bg-gray-50 text-gray-900 focus:border-brand-orange'
                          }`}
                          style={{ height: '48px' }}
                        />
                      ))}
                    </div>

                    {errorMsg && (
                      <div className={`flex items-start gap-2 p-3 rounded-xl ${alertStyles.bg} border ${alertStyles.border} mb-4`}>
                        <AlertIcon size={13} className={`${alertStyles.text} shrink-0 mt-0.5`} />
                        <p className={`${alertStyles.text} text-xs leading-relaxed`}>{errorMsg}</p>
                      </div>
                    )}

                    <button
                      onClick={() => handleVerifyOTP(otp.join(''))}
                      disabled={loading || otp.some(d => !d)}
                      className="w-full py-3 bg-brand-orange hover:bg-brand-orange-light text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all btn-press disabled:opacity-40 shadow-lg shadow-brand-orange/25"
                    >
                      {loading ? <Loader size={15} className="animate-spin" /> : <><Shield size={15} /> Verify & Sign In</>}
                    </button>

                    <div className="flex items-center justify-between mt-4">
                      <button
                        onClick={() => {
                          setStep('email')
                          setOtp(Array(OTP_LENGTH).fill(''))
                          setErrorMsg('')
                        }}
                        className={`text-xs hover:text-brand-orange transition-colors ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
                      >
                        ← Change email
                      </button>
                      {countdown > 0 ? (
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          Resend in <span className="text-brand-orange font-bold">{countdown}s</span>
                        </span>
                      ) : (
                        <button
                          onClick={(e) => handleSendOTP(e, true)}
                          disabled={loading}
                          className="text-xs text-brand-orange hover:underline font-semibold disabled:opacity-50 flex items-center gap-1"
                        >
                          <RefreshCw size={11} /> Send a new code
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ── SUCCESS STEP ── */}
                {step === 'success' && (
                  <motion.div key="success"
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }} className="text-center py-6">
                    <motion.div
                      initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.1 }}
                      className="w-20 h-20 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                      <CheckCircle size={40} className="text-brand-orange" />
                    </motion.div>
                    <h3 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      You're in! 🔥
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Welcome to the AceFit family
                    </p>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}