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
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: undefined,
          shouldCreateUser: true,
        }
      })
      if (error) throw error
      setStep('otp')
      toast.success('Check your email for the code!')
    } catch (err) {
      setError(err.message || 'Failed to send code')
    } finally { setLoading(false) }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    if (!otp) return
    setLoading(true)
    setError('')
    try {
      const { data, error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' })
      if (error) throw error
      setStep('success')
      // Send welcome email for new users
      if (data?.user) {
        const isNew = new Date(data.user.created_at) > new Date(Date.now() - 10000)
        if (isNew) {
          const tpl = emailTemplates.welcome({ email, name: data.user.user_metadata?.name || '' })
          await sendEmail({ to: email, ...tpl })
        }
      }
      setTimeout(() => { onClose(); setStep('email'); setEmail(''); setOtp('') }, 1500)
    } catch (err) {
      setError(err.message || 'Invalid code')
    } finally { setLoading(false) }
  }

  const inp = `w-full px-4 py-3.5 border rounded-xl text-sm outline-none transition-colors ${isDark ? 'bg-black/30 border-[#2A2A2A] text-white placeholder-gray-600 focus:border-brand-orange' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-brand-orange'}`

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[250] flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
        onClick={e => { if (e.target === e.currentTarget) onClose() }}>

        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
          className={`relative w-full max-w-sm rounded-2xl overflow-hidden ${isDark ? 'bg-[#141414] border border-[#2A2A2A]' : 'bg-white border border-gray-200'}`}>

          <div className="h-1 bg-gradient-to-r from-brand-orange via-orange-400 to-yellow-400"/>

          <button onClick={onClose} className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-all z-10">
            <X size={16}/>
          </button>

          <div className="p-8">
            <div className="mb-8">
              <img src="https://i.imgur.com/eDF88SE.png" alt="AceFit" className="h-10 mb-6"/>

              {step === 'email' && (
                <>
                  <h2 className={`font-display text-3xl mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>SIGN IN</h2>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Enter your email — we'll send a code</p>
                </>
              )}
              {step === 'otp' && (
                <>
                  <button onClick={() => setStep('email')} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-brand-orange mb-4 transition-colors">
                    <ArrowLeft size={12}/> Back
                  </button>
                  <h2 className={`font-display text-3xl mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>CHECK EMAIL</h2>
                  <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Code sent to <strong className="text-brand-orange">{email}</strong></p>
                </>
              )}
              {step === 'success' && (
                <div className="text-center">
                  <CheckCircle size={48} className="text-green-400 mx-auto mb-4"/>
                  <h2 className={`font-display text-3xl ${isDark ? 'text-white' : 'text-gray-900'}`}>WELCOME!</h2>
                  <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>You're signed in 🎉</p>
                </div>
              )}
            </div>

            {step === 'email' && (
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Email Address</label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
                    <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com"
                      className={inp + ' pl-10'}/>
                  </div>
                </div>
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 bg-brand-orange hover:bg-brand-orange-light text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-orange/25 disabled:opacity-60 active:scale-95">
                  {loading ? <><Loader size={16} className="animate-spin"/> Sending…</> : 'Send Code →'}
                </button>
                <p className={`text-center text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                  New customers automatically get an account. No password needed.
                </p>
              </form>
            )}

            {step === 'otp' && (
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>6-Digit Code</label>
                  <input type="text" required maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} placeholder="000000"
                    className={inp + ' text-center text-2xl tracking-[1rem] font-bold'}/>
                </div>
                {error && <p className="text-red-400 text-xs">{error}</p>}
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 bg-brand-orange hover:bg-brand-orange-light text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-orange/25 disabled:opacity-60 active:scale-95">
                  {loading ? <><Loader size={16} className="animate-spin"/> Verifying…</> : 'Verify Code →'}
                </button>
                <button type="button" onClick={() => handleSendOTP({ preventDefault: () => {} })}
                  className={`w-full text-xs text-center ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'} transition-colors`}>
                  Didn't get it? Resend code
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
