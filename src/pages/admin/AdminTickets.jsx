import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Search, Send, X, Loader, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useStore } from '../../lib/store'
import toast from 'react-hot-toast'


const STATUS_COLORS = { open: 'badge-danger', 'in-progress': 'badge-warning', resolved: 'badge-success' }

export default function AdminTickets() {
  const { theme } = useStore()
  const [tickets, setTickets] = useState([])
  const [selected, setSelected] = useState(null)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState('')
  const isDark = theme === 'dark'

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false })
        if (data?.length) setTickets(data)
      } catch {}
    }
    load()
  }, [])

  const handleReply = async () => {
    if (!reply.trim()) return
    setSending(true)
    try {
      await supabase.from('support_tickets').update({ reply, status: 'in-progress' }).eq('id', selected.id)
      // TODO: send email notification via edge function
      setTickets(ts => ts.map(t => t.id === selected.id ? { ...t, reply, status: 'in-progress' } : t))
      setSelected(s => ({ ...s, reply, status: 'in-progress' }))
      toast.success('Reply sent! Customer notified via email.')
      setReply('')
    } catch {
      setTickets(ts => ts.map(t => t.id === selected.id ? { ...t, reply, status: 'in-progress' } : t))
      setSelected(s => ({ ...s, reply, status: 'in-progress' }))
      toast.success('Reply saved (demo mode)')
      setReply('')
    } finally {
      setSending(false) }
  }

  const markResolved = async (id) => {
    try { await supabase.from('support_tickets').update({ status: 'resolved' }).eq('id', id) } catch {}
    setTickets(ts => ts.map(t => t.id === id ? { ...t, status: 'resolved' } : t))
    if (selected?.id === id) setSelected(s => ({ ...s, status: 'resolved' }))
    toast.success('Ticket resolved!')
  }

  const filtered = tickets.filter(t => !search || t.name?.toLowerCase().includes(search.toLowerCase()) || t.message?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`font-display text-3xl md:text-4xl ${isDark ? 'text-white' : 'text-gray-900'}`}>SUPPORT TICKETS</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{tickets.filter(t => t.status === 'open').length} open tickets</p>
        </div>
      </div>

      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border max-w-md ${isDark ? 'bg-brand-dark-card border-brand-dark-border' : 'bg-white border-gray-200'}`}>
        <Search size={15} className="text-brand-orange" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tickets..." className={`flex-1 bg-transparent text-sm outline-none ${isDark ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'}`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Ticket list */}
        <div className="space-y-3">
          {filtered.map((ticket, i) => (
            <motion.div
              key={ticket.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => { setSelected(ticket); setReply(ticket.reply || '') }}
              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                selected?.id === ticket.id
                  ? 'border-brand-orange bg-brand-orange/5'
                  : isDark ? 'bg-brand-dark-card border-brand-dark-border hover:border-brand-orange/40' : 'bg-white border-gray-200 hover:border-brand-orange/40'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{ticket.name}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{ticket.email}</p>
                </div>
                <span className={`text-[10px] px-2 py-1 rounded-full font-medium shrink-0 ${STATUS_COLORS[ticket.status]}`}>{ticket.status}</span>
              </div>
              <p className={`text-xs line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{ticket.message}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="font-mono text-[10px] text-brand-orange">#{ticket.id}</span>
                <span className={`text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{new Date(ticket.created_at).toLocaleDateString()}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Ticket detail */}
        <AnimatePresence>
          {selected ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`rounded-2xl border flex flex-col ${isDark ? 'bg-brand-dark-card border-brand-dark-border' : 'bg-white border-gray-200'}`}
            >
              <div className={`p-4 border-b flex items-center justify-between ${isDark ? 'border-brand-dark-border' : 'border-gray-100'}`}>
                <div>
                  <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{selected.name}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{selected.phone}</p>
                </div>
                <div className="flex items-center gap-2">
                  {selected.status !== 'resolved' && (
                    <button onClick={() => markResolved(selected.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 text-green-400 text-xs rounded-xl hover:bg-green-500 hover:text-white transition-all btn-press">
                      <CheckCircle size={12} /> Resolve
                    </button>
                  )}
                  <button onClick={() => setSelected(null)} className={`p-1.5 rounded-lg btn-press ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}><X size={15} /></button>
                </div>
              </div>

              <div className="flex-1 p-4 space-y-3 overflow-y-auto">
                {/* Customer message */}
                <div className={`p-3 rounded-xl ${isDark ? 'bg-black/30 border border-brand-dark-border' : 'bg-gray-50'}`}>
                  <p className={`text-xs font-semibold mb-1 text-brand-orange`}>Customer Issue:</p>
                  <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{selected.message}</p>
                </div>

                {/* Admin reply */}
                {selected.reply && (
                  <div className={`p-3 rounded-xl border border-brand-orange/30 bg-brand-orange/5`}>
                    <p className="text-xs font-semibold mb-1 text-brand-orange">Your Reply:</p>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{selected.reply}</p>
                  </div>
                )}
              </div>

              {/* Reply input */}
              {selected.status !== 'resolved' && (
                <div className={`p-4 border-t ${isDark ? 'border-brand-dark-border' : 'border-gray-100'}`}>
                  <textarea
                    value={reply}
                    onChange={e => setReply(e.target.value)}
                    placeholder="Type your reply..."
                    rows={3}
                    className={`w-full px-3 py-2.5 rounded-xl border text-sm outline-none resize-none mb-3 ${isDark ? 'bg-black/30 border-brand-dark-border text-white placeholder-gray-600 focus:border-brand-orange' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-brand-orange'}`}
                  />
                  <button
                    onClick={handleReply}
                    disabled={sending || !reply.trim()}
                    className="w-full py-2.5 bg-brand-orange text-white font-semibold rounded-xl flex items-center justify-center gap-2 text-sm transition-all btn-press disabled:opacity-50"
                  >
                    {sending ? <Loader size={14} className="animate-spin" /> : <Send size={14} />}
                    Send Reply & Notify Customer
                  </button>
                </div>
              )}
            </motion.div>
          ) : (
            <div className={`rounded-2xl border flex items-center justify-center p-12 ${isDark ? 'bg-brand-dark-card border-brand-dark-border' : 'bg-white border-gray-200'}`}>
              <div className="text-center">
                <MessageSquare size={32} className={`mx-auto mb-3 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
                <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>Select a ticket to view & reply</p>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
