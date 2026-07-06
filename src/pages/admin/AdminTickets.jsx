import React, { useState, useEffect } from 'react'
import { MessageSquare, X, Send, Loader } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase, sendEmail } from '../../lib/supabase'
import { emailTemplates } from '../../lib/emailTemplates'
import toast from 'react-hot-toast'

const STATUS_COLOR = { open:'text-red-400 bg-red-400/10', 'in-progress':'text-yellow-400 bg-yellow-400/10', resolved:'text-green-400 bg-green-400/10', closed:'text-gray-400 bg-gray-400/10' }

export default function AdminTickets() {
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [reply, setReply] = useState('')
  const [sending, setSending] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false })
    setTickets(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const filtered = statusFilter === 'all' ? tickets : tickets.filter(t => t.status === statusFilter)

  const handleReply = async () => {
    if (!reply.trim()) return
    setSending(true)
    try {
      await supabase.from('support_tickets').update({ reply, status: 'resolved', replied_at: new Date().toISOString() }).eq('id', selected.id)
      const tpl = emailTemplates.ticketReply({ ticket: selected, reply })
      await sendEmail({ to: selected.email, ...tpl, replyTo: 'acefitandgainz@gmail.com' })
      toast.success('Reply sent!')
      setSelected(prev => ({ ...prev, reply, status: 'resolved' }))
      setReply('')
      load()
    } catch (err) { toast.error(err.message) }
    finally { setSending(false) }
  }

  const updateStatus = async (id, status) => {
    await supabase.from('support_tickets').update({ status }).eq('id', id)
    load()
    if (selected?.id === id) setSelected(prev => ({ ...prev, status }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Support Tickets</h1>
          <p className="text-gray-500 text-sm mt-1">{tickets.filter(t => t.status === 'open').length} open tickets</p>
        </div>
        <div className="flex gap-2">
          {['all','open','in-progress','resolved','closed'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${statusFilter === s ? 'bg-brand-orange text-white' : 'bg-[#141414] text-gray-400 hover:text-white border border-[#2A2A2A]'}`}>
              {s.replace('-',' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1A1A1A]">
              {['Ticket','From','Subject','Status','Date',''].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? [1,2].map(i => (
              <tr key={i} className="border-b border-[#1A1A1A]">
                {[1,2,3,4,5,6].map(j => <td key={j} className="px-4 py-4"><div className="h-4 bg-[#2A2A2A] rounded animate-pulse"/></td>)}
              </tr>
            )) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-gray-500 py-16"><MessageSquare size={32} className="mx-auto mb-3 opacity-30"/>No tickets</td></tr>
            ) : filtered.map(t => (
              <tr key={t.id} className={`border-b border-[#1A1A1A] hover:bg-white/2 transition-colors cursor-pointer ${t.status === 'open' ? 'border-l-2 border-l-red-400' : ''}`} onClick={() => { setSelected(t); setReply(t.reply || '') }}>
                <td className="px-4 py-3 font-mono text-brand-orange text-sm">{t.ticket_no}</td>
                <td className="px-4 py-3"><p className="text-white text-sm">{t.name}</p><p className="text-gray-500 text-xs">{t.email}</p></td>
                <td className="px-4 py-3 text-gray-300 text-sm">{t.subject || 'General'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold capitalize ${STATUS_COLOR[t.status]}`}>{t.status}</span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs">{new Date(t.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-brand-orange text-xs">View →</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-end" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30 }}
              className="h-full w-full max-w-lg bg-[#0F0F0F] border-l border-[#2A2A2A] overflow-y-auto flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-[#2A2A2A]">
                <div>
                  <h2 className="text-white font-bold">{selected.ticket_no}</h2>
                  <span className={`text-xs px-2 py-0.5 rounded-lg font-bold capitalize ${STATUS_COLOR[selected.status]}`}>{selected.status}</span>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5"><X size={18}/></button>
              </div>
              <div className="p-6 flex-1 space-y-4 overflow-y-auto">
                <div className="bg-[#141414] rounded-xl p-4 space-y-2">
                  {[['From', selected.name],['Email', selected.email],['Phone', selected.phone],['Subject', selected.subject]].filter(([,v]) => v).map(([k,v]) => (
                    <div key={k} className="flex justify-between text-sm">
                      <span className="text-gray-500">{k}</span><span className="text-white">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-[#141414] rounded-xl p-4">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Message</p>
                  <p className="text-gray-300 text-sm leading-relaxed">{selected.message}</p>
                </div>
                {selected.reply && (
                  <div className="bg-brand-orange/5 border border-brand-orange/20 rounded-xl p-4">
                    <p className="text-xs text-brand-orange font-bold uppercase tracking-wider mb-2">Previous Reply</p>
                    <p className="text-gray-300 text-sm leading-relaxed">{selected.reply}</p>
                  </div>
                )}

                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Update Status</p>
                  <div className="flex gap-2 flex-wrap">
                    {['open','in-progress','resolved','closed'].map(s => (
                      <button key={s} onClick={() => updateStatus(selected.id, s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize border transition-all ${s === selected.status ? STATUS_COLOR[s] + ' border-current' : 'border-[#2A2A2A] text-gray-400 hover:border-brand-orange hover:text-brand-orange'}`}>
                        {s.replace('-',' ')}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Reply to Customer</p>
                  <textarea value={reply} onChange={e => setReply(e.target.value)} rows={4}
                    placeholder="Type your reply… (will be emailed to customer)"
                    className="w-full px-3 py-2.5 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-white text-sm outline-none focus:border-brand-orange placeholder-gray-600 resize-none"/>
                  <button onClick={handleReply} disabled={sending}
                    className="mt-3 w-full py-3 bg-brand-orange text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-orange-500 transition-all disabled:opacity-60">
                    {sending ? <><Loader size={14} className="animate-spin"/>Sending…</> : <><Send size={14}/> Send Reply</>}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
