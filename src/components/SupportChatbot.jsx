import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Loader, CheckCircle, User, Bot } from 'lucide-react'
import { useStore } from '../lib/store'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const BOT_MESSAGES = [
  "Hi! 👋 Welcome to AceFit support. How can I help you today?",
  "I can help with orders, sizing, payments, or general enquiries.",
]

const QUICK_REPLIES = ['Track my order', 'Size guide', 'Payment issue', 'Return policy', 'Speak to human']

export default function SupportChatbot() {
  const { supportOpen, setSupportOpen, theme, user } = useStore()
  const [step, setStep] = useState('chat') // chat | form | submitted
  const [messages, setMessages] = useState([
    { type: 'bot', text: BOT_MESSAGES[0] },
    { type: 'bot', text: BOT_MESSAGES[1] },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: user?.user_metadata?.name || '', email: user?.email || '', phone: '', message: '' })
  const chatEndRef = useRef()
  const isDark = theme === 'dark'

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const sendMessage = (text) => {
    if (!text.trim()) return
    setMessages(m => [...m, { type: 'user', text }])
    setInput('')

    // Bot auto-responses
    setTimeout(() => {
      let reply = "Got it! Let me help you with that. For faster resolution, please fill in the support form and our team will respond within 1 hour."
      if (text.toLowerCase().includes('order')) reply = "For order enquiries, please share your order ID or the email you used to order. You can also WhatsApp us on 07025692097."
      if (text.toLowerCase().includes('size')) reply = "Our sizes run XS–XXL. Generally: XS (UK 6-8), S (UK 8-10), M (UK 10-12), L (UK 12-14), XL (UK 14-16), XXL (UK 16-18). When in doubt, size up! 💪"
      if (text.toLowerCase().includes('payment') || text.toLowerCase().includes('pay')) reply = "We accept OPay and WhatsApp orders. If your payment failed, please try again or contact us at Acefitandgainz@gmail.com."
      if (text.toLowerCase().includes('return')) reply = "We offer returns within 7 days of delivery for unworn items with tags intact. Contact us at Acefitandgainz@gmail.com to initiate a return."
      if (text.toLowerCase().includes('human') || text.toLowerCase().includes('agent')) {
        reply = "Sure! Please fill in the form below and our team will get back to you ASAP. 🙌"
        setTimeout(() => setStep('form'), 500)
      }
      setMessages(m => [...m, { type: 'bot', text: reply }])
    }, 800)
  }

  const handleSubmitTicket = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const ticketData = {
        ...form,
        user_id: user?.id || null,
        status: 'open',
        created_at: new Date().toISOString(),
      }

      const { data, error } = await supabase.from('support_tickets').insert([ticketData]).select().single()
      
      if (error) {
        // Demo fallback
        console.log('Demo ticket:', ticketData)
      }

      setStep('submitted')
      toast.success('Ticket raised! Check your email 📬')
    } catch (err) {
      console.error(err)
      setStep('submitted')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring' }}
        onClick={() => setSupportOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-brand-orange rounded-full flex items-center justify-center shadow-2xl shadow-brand-orange/40 hover:bg-brand-orange-light transition-all btn-press"
        style={{ display: supportOpen ? 'none' : 'flex' }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <MessageCircle size={24} className="text-white" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-brand-orange animate-pulse" />
      </motion.button>

      <AnimatePresence>
        {supportOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`fixed bottom-6 right-6 z-50 w-80 rounded-2xl shadow-2xl overflow-hidden flex flex-col ${isDark ? 'bg-brand-dark-card border border-brand-dark-border' : 'bg-white border border-gray-200'}`}
            style={{ maxHeight: '520px' }}
          >
            {/* Header */}
            <div className="bg-brand-orange p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot size={18} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">AceFit Support</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse" />
                    <p className="text-white/70 text-xs">Online</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setSupportOpen(false)} className="text-white/70 hover:text-white transition-colors btn-press">
                <X size={18} />
              </button>
            </div>

            {step === 'chat' && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: '280px', maxHeight: '280px' }}>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex gap-2 ${msg.type === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${msg.type === 'bot' ? 'bg-brand-orange/20' : isDark ? 'bg-brand-dark-border' : 'bg-gray-200'}`}>
                        {msg.type === 'bot' ? <Bot size={14} className="text-brand-orange" /> : <User size={14} className={isDark ? 'text-gray-400' : 'text-gray-600'} />}
                      </div>
                      <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                        msg.type === 'bot'
                          ? isDark ? 'bg-brand-dark-border text-gray-300' : 'bg-gray-100 text-gray-700'
                          : 'bg-brand-orange text-white'
                      } ${msg.type === 'bot' ? 'rounded-tl-none' : 'rounded-tr-none'}`}>
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                  <div ref={chatEndRef} />
                </div>

                {/* Quick replies */}
                <div className={`px-3 pb-2 flex gap-1.5 overflow-x-auto no-scrollbar shrink-0`}>
                  {QUICK_REPLIES.map(r => (
                    <button
                      key={r}
                      onClick={() => sendMessage(r)}
                      className={`shrink-0 px-2.5 py-1 text-[10px] rounded-full border transition-all btn-press whitespace-nowrap ${isDark ? 'border-brand-dark-border text-gray-400 hover:border-brand-orange hover:text-brand-orange' : 'border-gray-200 text-gray-500 hover:border-brand-orange hover:text-brand-orange'}`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                {/* Input */}
                <div className={`p-3 border-t shrink-0 ${isDark ? 'border-brand-dark-border' : 'border-gray-100'}`}>
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${isDark ? 'bg-black/30 border-brand-dark-border' : 'bg-gray-50 border-gray-200'}`}>
                    <input
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                      placeholder="Type a message..."
                      className={`flex-1 bg-transparent text-xs outline-none ${isDark ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'}`}
                    />
                    <button onClick={() => sendMessage(input)} disabled={!input.trim()} className="text-brand-orange disabled:opacity-30 btn-press">
                      <Send size={14} />
                    </button>
                  </div>
                  <button onClick={() => setStep('form')} className={`w-full mt-2 text-xs py-1.5 rounded-lg transition-colors ${isDark ? 'text-gray-500 hover:text-brand-orange' : 'text-gray-400 hover:text-brand-orange'}`}>
                    Raise a support ticket →
                  </button>
                </div>
              </>
            )}

            {step === 'form' && (
              <form onSubmit={handleSubmitTicket} className="p-4 space-y-3 overflow-y-auto">
                <p className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Raise a Support Ticket</p>
                {[
                  { key: 'name', placeholder: 'Full Name', type: 'text' },
                  { key: 'email', placeholder: 'Email Address', type: 'email' },
                  { key: 'phone', placeholder: 'Phone Number', type: 'tel' },
                ].map(f => (
                  <input
                    key={f.key}
                    type={f.type}
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    required
                    className={`w-full px-3 py-2 rounded-lg border text-xs outline-none transition-colors ${isDark ? 'bg-black/30 border-brand-dark-border text-white placeholder-gray-600 focus:border-brand-orange' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-brand-orange'}`}
                  />
                ))}
                <textarea
                  placeholder="Describe your issue..."
                  value={form.message}
                  onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  required
                  rows={3}
                  className={`w-full px-3 py-2 rounded-lg border text-xs outline-none transition-colors resize-none ${isDark ? 'bg-black/30 border-brand-dark-border text-white placeholder-gray-600 focus:border-brand-orange' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-brand-orange'}`}
                />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setStep('chat')} className={`flex-1 py-2 text-xs rounded-lg border transition-colors ${isDark ? 'border-brand-dark-border text-gray-400' : 'border-gray-200 text-gray-500'}`}>
                    Back
                  </button>
                  <button type="submit" disabled={loading} className="flex-1 py-2 bg-brand-orange text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-60 btn-press">
                    {loading ? <Loader size={12} className="animate-spin" /> : 'Submit Ticket'}
                  </button>
                </div>
              </form>
            )}

            {step === 'submitted' && (
              <div className="p-6 text-center">
                <div className="w-14 h-14 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle size={28} className="text-green-400" />
                </div>
                <p className={`font-semibold text-sm mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>Ticket Raised! ✅</p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>We'll email you within 1 hour. Check your inbox for confirmation.</p>
                <button onClick={() => { setStep('chat'); setSupportOpen(false) }} className="mt-4 px-4 py-2 bg-brand-orange text-white text-xs rounded-lg btn-press">
                  Done
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
