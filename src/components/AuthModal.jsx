import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Loader, Shield, CheckCircle, KeyRound, AlertCircle } from 'lucide-react'
import { useStore } from '../lib/store'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function AuthModal() {
  const { authModalOpen, setAuthModalOpen, setUser, theme } = useStore()
  const [step, setStep]         = useState('email')
  const [email, setEmail]       = useState('')
  const [otp, setOtp]           = useState(['','','','','',''])
  const [loading, setLoading]   = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const otpRefs = useRef([])
  const isDark  = theme === 'dark'

  useEffect(() => {
    if (!authModalOpen) {
      setTimeout(() => {
        setStep('email'); setEmail(''); setOtp(['','','','','',''])
        setCountdown(0); setErrorMsg('')
      }, 300)
    }
  }, [authModalOpen])

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(c => c - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [countdown])

  // ── Send OTP ──────────────────────────────────────────────
  // HOW THIS WORKS WITH SUPABASE:
  // Supabase sends either a magic link OR a 6-digit OTP depending on the
  // email template. By default it sends a magic link.
  //
  // To receive a 6-digit OTP code instead, you MUST edit the Magic Link
  // template in Supabase Dashboard:
  //   Authentication → Email Templates → Magic Link
  //   Change the body so it contains: {{ .Token }}
  //   (not {{ .ConfirmationURL }})
  //
  // Template body to use:
  //   <h2>Your AceFit Login Code</h2>
  //   <p>Your 6-digit verification code is:</p>
  //   <h1 style="letter-spacing:8px">{{ .Token }}</h1>
  //   <p>This code expires in 10 minutes.</p>
  // ──────────────────────────────────────────────────────────
  const handleSendOTP = async (e) => {
    e?.preventDefault()
    setErrorMsg('')
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.')
      return
    }
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          shouldCreateUser: true,
          // No emailRedirectTo — forces OTP code mode (when template has {{ .Token }})
        },
      })
      if (error) {
        if (error.message?.includes('rate') || error.message?.includes('limit')) {
          throw new Error('Too many requests. Please wait 60 seconds and try again.')
        }
        throw error
      }
      setStep('otp')
      setCountdown(60)
      toast.success('Code sent! Check your inbox 📬', { duration: 4000 })
    } catch (err) {
      setErrorMsg(err.message || 'Failed to send code. Check your internet connection.')
    } finally {
      setLoading(false)
    }
  }

  // ── Verify OTP ────────────────────────────────────────────
  const handleVerifyOTP = async (code) => {
    if (code.length !== 6) return
    setErrorMsg('')
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: code,
        type: 'email',
      })
      if (error) {
        if (error.message?.toLowerCase().includes('expired')) {
          throw new Error('Code has expired. Please click "Resend Code" to get a new one.')
        }
        if (error.message?.toLowerCase().includes('invalid')) {
          throw new Error('Incorrect code. Please check your email and try again.')
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
      setOtp(['','','','','',''])
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    } finally {
      setLoading(false)
    }
  }

  const handleOTPChange = (i, val) => {
    if (!/^\d*$/.test(val)) return
    const next = [...otp]
    next[i] = val.slice(-1)
    setOtp(next)
    setErrorMsg('')
    if (val && i < 5) otpRefs.current[i + 1]?.focus()
    if (next.every(d => d)) handleVerifyOTP(next.join(''))
  }

  const handleKeyDown = (i, e) => {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus()
    if (e.key === 'ArrowLeft'  && i > 0) otpRefs.current[i - 1]?.focus()
    if (e.key === 'ArrowRight' && i < 5) otpRefs.current[i + 1]?.focus()
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    const next = ['','','','','','']
    pasted.split('').forEach((d, idx) => { next[idx] = d })
    setOtp(next)
    otpRefs.current[Math.min(pasted.length, 5)]?.focus()
    if (pasted.length === 6) handleVerifyOTP(pasted)
  }

  const inputBase = `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors ${
    isDark
      ? 'bg-black/40 border-[#2a2a2a] text-white placeholder-gray-600 focus:border-brand-orange'
      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-brand-orange'
  }`

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
                <button onClick={() => setAuthModalOpen(false)}
                  className={`absolute top-4 right-4 p-1.5 rounded-lg transition-colors ${isDark ? 'text-gray-500 hover:text-white hover:bg-white/5' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}>
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
                        <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Email Address
                        </label>
                        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border transition-colors ${
                          errorMsg ? 'border-red-400' :
                          isDark ? 'bg-black/40 border-[#2a2a2a] focus-within:border-brand-orange' : 'bg-gray-50 border-gray-200 focus-within:border-brand-orange'
                        }`}>
                          <Mail size={15} className="text-brand-orange shrink-0" />
                          <input type="email" value={email} onChange={e => { setEmail(e.target.value); setErrorMsg('') }}
                            placeholder="you@example.com" required autoFocus
                            className={`flex-1 bg-transparent text-sm outline-none ${isDark ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'}`}
                          />
                        </div>
                      </div>

                      {errorMsg && (
                        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-400/10 border border-red-400/20">
                          <AlertCircle size={13} className="text-red-400 shrink-0 mt-0.5" />
                          <p className="text-red-400 text-xs leading-relaxed">{errorMsg}</p>
                        </div>
                      )}

                      <button type="submit" disabled={loading}
                        className="w-full py-3 bg-brand-orange hover:bg-brand-orange-light text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all btn-press disabled:opacity-60 shadow-lg shadow-brand-orange/25">
                        {loading ? <Loader size={15} className="animate-spin" /> : <><KeyRound size={15} /> Send 6-Digit Code</>}
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

                    <div className={`flex items-start gap-2 p-3 rounded-xl mb-5 ${isDark ? 'bg-brand-orange/10 border border-brand-orange/20' : 'bg-orange-50 border border-orange-100'}`}>
                      <Shield size={13} className="text-brand-orange shrink-0 mt-0.5" />
                      <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        Check <strong className="text-brand-orange">{email}</strong> for a <strong>6-digit code</strong>. Expires in 10 min. Check spam too.
                      </p>
                    </div>

                    <div className="flex gap-2 justify-between mb-4" onPaste={handlePaste}>
                      {otp.map((d, i) => (
                        <input key={i} ref={el => otpRefs.current[i] = el}
                          type="text" inputMode="numeric" pattern="[0-9]*" maxLength={1}
                          value={d} onChange={e => handleOTPChange(i, e.target.value)}
                          onKeyDown={e => handleKeyDown(i, e)}
                          autoFocus={i === 0}
                          className={`w-11 text-center text-xl font-bold rounded-xl border-2 outline-none transition-all ${
                            d ? 'border-brand-orange bg-brand-orange/10 text-brand-orange'
                              : isDark ? 'border-[#2a2a2a] bg-black/40 text-white focus:border-brand-orange' : 'border-gray-200 bg-gray-50 text-gray-900 focus:border-brand-orange'
                          }`}
                          style={{ height: '52px' }}
                        />
                      ))}
                    </div>

                    {errorMsg && (
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-red-400/10 border border-red-400/20 mb-4">
                        <AlertCircle size={13} className="text-red-400 shrink-0 mt-0.5" />
                        <p className="text-red-400 text-xs leading-relaxed">{errorMsg}</p>
                      </div>
                    )}

                    <button onClick={() => handleVerifyOTP(otp.join(''))}
                      disabled={loading || otp.some(d => !d)}
                      className="w-full py-3 bg-brand-orange hover:bg-brand-orange-light text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all btn-press disabled:opacity-40 shadow-lg shadow-brand-orange/25">
                      {loading ? <Loader size={15} className="animate-spin" /> : <><Shield size={15} /> Verify & Sign In</>}
                    </button>

                    <div className="flex items-center justify-between mt-4">
                      <button onClick={() => { setStep('email'); setOtp(['','','','','','']); setErrorMsg('') }}
                        className={`text-xs hover:text-brand-orange transition-colors ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        ← Change email
                      </button>
                      {countdown > 0 ? (
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          Resend in <span className="text-brand-orange font-bold">{countdown}s</span>
                        </span>
                      ) : (
                        <button onClick={handleSendOTP} disabled={loading}
                          className="text-xs text-brand-orange hover:underline font-semibold disabled:opacity-50">
                          Resend Code
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* ── SUCCESS ── */}
                {step === 'success' && (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200 }} className="text-center py-6">
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.1 }}
                      className="w-20 h-20 bg-brand-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle size={40} className="text-brand-orange" />
                    </motion.div>
                    <h3 className={`text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>You're in! 🔥</h3>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Welcome to the AceFit family</p>
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
