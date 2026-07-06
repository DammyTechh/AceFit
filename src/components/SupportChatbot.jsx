import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Loader, CheckCircle, Bot } from 'lucide-react'
import { useStore } from '../lib/store'
import { supabase, sendEmail } from '../lib/supabase'
import { emailTemplates } from '../lib/emailTemplates'
import toast from 'react-hot-toast'

const BOT_INTRO = [
  "Hi! 👋 Welcome to AceFit support. How can I help you today?",
  "I can help with orders, sizing, payments, or general enquiries.",
]

const QUICK = ['Track my order', 'Size guide', 'Payment issue', 'Return policy', 'Speak to agent']

const ADMIN_EMAIL = 'acefitandgainz@gmail.com'

const autoReply = (text) => {
  const t = text.toLowerCase()
  if (t.includes('order') || t.includes('track'))
    return "For order enquiries, share your order ID or the email you used to order. You can also WhatsApp us on 07025692097. 📦"
  if (t.includes('size'))
    return "Our sizes run XS–XXL. When in doubt, size up! XS (32-34\"), S (34-36\"), M (36-38\"), L (38-40\"), XL (40-42\"), XXL (42-44\"). 💪"
  if (t.includes('pay'))
    return "We use Paystack for secure payments — cards, bank transfer, USSD all accepted. If payment failed, try again or contact us. 💳"
  if (t.includes('return') || t.includes('exchange'))
    return "Returns accepted within 7 days of delivery for unworn items with tags intact. Email acefitandgainz@gmail.com to start a return. 🔄"
  if (t.includes('deliver') || t.includes('shipping'))
    return "We deliver nationwide! Lagos: 1-2 days · Southwest: 2-3 days · Other states: 3-5 days. 🚚"
  if (t.includes('supplement') || t.includes('gainz'))
    return "AceGainz supplements are available in-store and online. Visit our Gainz page or WhatsApp us for more details! 💊"
  if (t.includes('human') || t.includes('agent') || t.includes('talk'))
    return null // triggers form
  return "Got it! Our team is ready to help. Fill in the form below and we'll respond within 1 hour. 🙌"
}

export default function SupportChatbot() {
  const { supportOpen, setSupportOpen, theme, user } = useStore()
  const [step, setStep] = useState('chat')
  const [messages, setMessages] = useState(BOT_INTRO.map(text => ({ type: 'bot', text })))
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: user?.user_metadata?.name || '', email: user?.email || '', phone: '', subject: 'General Enquiry', message: '' })
  const chatEndRef = useRef()
  const isDark = theme === 'dark'

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const addMsg = (type, text) => setMessages(m => [...m, { type, text, ts: Date.now() }])

  const sendMessage = (text) => {
    if (!text.trim()) return
    addMsg('user', text)
    setInput('')

    const reply = autoReply(text)
    setTimeout(() => {
      if (reply === null) {
        addMsg('bot', "Sure! Please fill in the form below and our team will get back to you ASAP. 🙌")
        setTimeout(() => setStep('form'), 600)
      } else {
        addMsg('bot', reply)
      }
    }, 700)
  }

  const handleSubmitTicket = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const ticketNo = `TKT-${Date.now().toString(36).toUpperCase().slice(-6)}`
      const ticketData = {
        ...form, ticket_no: ticketNo,
        user_id: user?.id || null,
        status: 'open', priority: 'normal',
        created_at: new Date().toISOString(),
      }
      const { data: ticket } = await supabase.from('support_tickets').insert([ticketData]).select().single()

      // Email customer
      const custTpl = emailTemplates.ticketCreated({ ticket: ticket || { ...ticketData, ticket_no: ticketNo } })
      await sendEmail({ to: form.email, ...custTpl })

      // Email admin
      const adminTpl = emailTemplates.adminNewTicket({ ticket: ticket || ticketData })
      await sendEmail({ to: ADMIN_EMAIL, ...adminTpl, replyTo: form.email })

      setStep('submitted')
      toast.success('Ticket submitted! Check your email 📬')
    } catch (err) {
      console.error(err)
      // Still show success to user even if DB fails
      setStep('submitted')
      toast.success('Message sent! We\'ll respond shortly 📬')
    } finally { setLoading(false) }
  }

  const inputCls = `w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors ${isDark ? 'bg-black/30 border-[#2A2A2A] text-white placeholder-gray-600 focus:border-brand-orange' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-brand-orange'}`

  return (
    <>
      {/* Floating trigger */}
      <motion.button
        onClick={() => setSupportOpen(s => !s)}
        className="fixed bottom-6 right-6 z-[100] w-14 h-14 bg-brand-orange hover:bg-brand-orange-light text-white rounded-full shadow-2xl shadow-brand-orange/40 flex items-center justify-center transition-all active:scale-95"
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        animate={{ boxShadow: supportOpen ? '0 0 0 0 rgba(255,107,0,0)' : ['0 0 0 0 rgba(255,107,0,0.4)', '0 0 0 20px rgba(255,107,0,0)', '0 0 0 0 rgba(255,107,0,0)'] }}
        transition={{ duration: 2, repeat: Infinity }}>
        <AnimatePresence mode="wait">
          {supportOpen ? <motion.div key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}><X size={20}/></motion.div>
            : <motion.div key="msg" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}><MessageCircle size={20}/></motion.div>}
        </AnimatePresence>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {supportOpen && (
          <motion.div initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={`fixed bottom-24 right-6 z-[99] w-80 sm:w-96 rounded-2xl shadow-2xl overflow-hidden border ${isDark ? 'bg-[#0F0F0F] border-[#2A2A2A]' : 'bg-white border-gray-200'}`}>

            {/* Header */}
            <div className="bg-brand-orange p-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center"><Bot size={18} className="text-white"/></div>
              <div>
                <p className="text-white font-bold text-sm">AceFit Support</p>
                <p className="text-white/70 text-xs flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-400 rounded-full"/> Typically replies in 1 hour</p>
              </div>
            </div>

            {/* Chat / form / submitted */}
            {step === 'chat' && (
              <>
                <div className="h-72 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                        msg.type === 'user' ? 'bg-brand-orange text-white rounded-br-sm'
                          : isDark ? 'bg-[#1A1A1A] text-gray-200 rounded-bl-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                        {msg.text}
                      </div>
                    </motion.div>
                  ))}
                  <div ref={chatEndRef}/>
                </div>
                {/* Quick replies */}
                <div className={`px-4 pb-2 flex flex-wrap gap-1.5 border-t ${isDark ? 'border-[#2A2A2A]' : 'border-gray-100'}`}>
                  {QUICK.map(q => (
                    <button key={q} onClick={() => sendMessage(q)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all mt-2 ${isDark ? 'border-[#2A2A2A] text-gray-400 hover:border-brand-orange hover:text-brand-orange' : 'border-gray-200 text-gray-600 hover:border-brand-orange hover:text-brand-orange'}`}>
                      {q}
                    </button>
                  ))}
                </div>
                <div className={`p-4 flex gap-2 border-t ${isDark ? 'border-[#2A2A2A]' : 'border-gray-100'}`}>
                  <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                    placeholder="Type a message…"
                    className={`flex-1 px-3 py-2 rounded-xl border text-sm outline-none ${isDark ? 'bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder-gray-600' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}/>
                  <button onClick={() => sendMessage(input)} className="p-2 bg-brand-orange text-white rounded-xl hover:bg-brand-orange-light transition-all active:scale-95">
                    <Send size={16}/>
                  </button>
                </div>
              </>
            )}

            {step === 'form' && (
              <form onSubmit={handleSubmitTicket} className="p-4 space-y-3">
                <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Contact Support</p>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" className={inputCls}/>
                <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email address" className={inputCls}/>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone (optional)" className={inputCls}/>
                <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className={inputCls}>
                  {['General Enquiry','Order Issue','Payment Problem','Return / Exchange','Sizing Help','Product Question'].map(s => <option key={s}>{s}</option>)}
                </select>
                <textarea required rows={3} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Describe your issue…" className={inputCls + ' resize-none'}/>
                <button type="submit" disabled={loading}
                  className="w-full py-3 bg-brand-orange text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-brand-orange-light transition-all disabled:opacity-60">
                  {loading ? <><Loader size={16} className="animate-spin"/> Sending…</> : <><Send size={16}/> Submit Ticket</>}
                </button>
              </form>
            )}

            {step === 'submitted' && (
              <div className="p-8 text-center">
                <CheckCircle size={48} className="text-green-400 mx-auto mb-4"/>
                <p className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Ticket Submitted!</p>
                <p className={`text-sm mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Check your email for confirmation. We'll reply within 1 hour.</p>
                <button onClick={() => { setStep('chat'); setMessages(BOT_INTRO.map(t => ({ type: 'bot', text: t }))); setSupportOpen(false) }}
                  className="px-6 py-2.5 bg-brand-orange text-white rounded-xl text-sm font-semibold hover:bg-brand-orange-light transition-all">
                  Close
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
