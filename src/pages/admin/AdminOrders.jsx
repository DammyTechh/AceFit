import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, ChevronDown, Package, Loader, Eye } from 'lucide-react'
import { supabase, sendEmail } from '../../lib/supabase'
import { emailTemplates } from '../../lib/emailTemplates'
import toast from 'react-hot-toast'

const STATUSES = ['pending','processing','packed','shipped','out_for_delivery','delivered','cancelled']
const STATUS_COLOR = {
  pending: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  processing: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  packed: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  shipped: 'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',
  out_for_delivery: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  delivered: 'text-green-400 bg-green-400/10 border-green-400/20',
  cancelled: 'text-red-400 bg-red-400/10 border-red-400/20',
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [adminNote, setAdminNote] = useState('')

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const filtered = orders.filter(o => {
    const matchSearch = !search || o.customer_name?.toLowerCase().includes(search.toLowerCase()) || o.id?.includes(search) || o.customer_email?.includes(search)
    const matchStatus = statusFilter === 'all' || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const updateStatus = async (orderId, newStatus, order) => {
    setUpdating(true)
    try {
      await supabase.from('orders').update({ status: newStatus, admin_notes: adminNote || order.admin_notes }).eq('id', orderId)
      // Send email
      const tpl = emailTemplates.orderStatus({ order, newStatus })
      await sendEmail({ to: order.customer_email, ...tpl })
      toast.success(`Status updated to ${newStatus}`)
      load()
      if (selected?.id === orderId) setSelected(prev => ({ ...prev, status: newStatus }))
    } catch (err) { toast.error(err.message) }
    finally { setUpdating(false) }
  }

  const openDetail = (o) => { setSelected(o); setAdminNote(o.admin_notes || '') }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">{orders.length} total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, ID, email…"
            className="w-full pl-9 pr-4 py-2.5 bg-[#141414] border border-[#2A2A2A] rounded-xl text-white text-sm outline-none focus:border-brand-orange placeholder-gray-600"/>
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 bg-[#141414] border border-[#2A2A2A] rounded-xl text-gray-300 text-sm outline-none focus:border-brand-orange">
          <option value="all">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1A1A1A]">
                {['Order','Customer','Items','Total','Status','Date',''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [1,2,3].map(i => (
                <tr key={i} className="border-b border-[#1A1A1A]">
                  {[1,2,3,4,5,6,7].map(j => <td key={j} className="px-4 py-4"><div className="h-4 bg-[#2A2A2A] rounded animate-pulse"/></td>)}
                </tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-gray-500 py-16"><Package size={32} className="mx-auto mb-3 opacity-30"/>No orders found</td></tr>
              ) : filtered.map(o => (
                <tr key={o.id} className="border-b border-[#1A1A1A] hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 font-mono text-brand-orange text-sm">#{o.id.slice(0,8).toUpperCase()}</td>
                  <td className="px-4 py-3">
                    <p className="text-white text-sm">{o.customer_name}</p>
                    <p className="text-gray-500 text-xs">{o.customer_phone}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{o.items?.length || 0} item{(o.items?.length || 0) !== 1 ? 's' : ''}</td>
                  <td className="px-4 py-3 text-white font-semibold text-sm">₦{Number(o.total).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold border capitalize ${STATUS_COLOR[o.status] || 'text-gray-400 bg-gray-400/10'}`}>
                      {o.status?.replace(/_/g,' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => openDetail(o)} className="p-2 text-gray-400 hover:text-brand-orange hover:bg-brand-orange/10 rounded-lg transition-all"><Eye size={14}/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-end" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30 }}
              className="h-full w-full max-w-lg bg-[#0F0F0F] border-l border-[#2A2A2A] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-[#2A2A2A] sticky top-0 bg-[#0F0F0F] z-10">
                <div>
                  <h2 className="text-white font-bold">Order #{selected.id.slice(0,8).toUpperCase()}</h2>
                  <p className="text-gray-500 text-xs mt-0.5">{new Date(selected.created_at).toLocaleString()}</p>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5"><X size={18}/></button>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer */}
                <section>
                  <h3 className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-3">Customer</h3>
                  <div className="bg-[#141414] rounded-xl p-4 space-y-2">
                    {[['Name', selected.customer_name],['Email', selected.customer_email],['Phone', selected.customer_phone],
                      ['Address', selected.delivery_address],['State', selected.delivery_state],['Landmark', selected.delivery_landmark]
                    ].filter(([,v]) => v).map(([k,v]) => (
                      <div key={k} className="flex justify-between text-sm">
                        <span className="text-gray-500">{k}</span>
                        <span className="text-white text-right max-w-[60%]">{v}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Items */}
                <section>
                  <h3 className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-3">Items</h3>
                  <div className="space-y-2">
                    {(selected.items || []).map((item, i) => (
                      <div key={i} className="bg-[#141414] rounded-xl p-3 flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm font-medium">{item.name}</p>
                          <p className="text-gray-500 text-xs">{item.size}{item.color ? ` · ${item.color}` : ''} × {item.qty}</p>
                        </div>
                        <span className="text-brand-orange font-semibold text-sm">₦{(item.price * item.qty).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 space-y-1.5 bg-[#141414] rounded-xl p-4">
                    {[['Subtotal', `₦${Number(selected.subtotal).toLocaleString()}`],
                      ['Delivery', `₦${Number(selected.delivery_fee).toLocaleString()}`],
                      ['Total', `₦${Number(selected.total).toLocaleString()}`]
                    ].map(([k,v]) => (
                      <div key={k} className={`flex justify-between text-sm ${k === 'Total' ? 'font-bold text-white border-t border-[#2A2A2A] pt-2 mt-1' : 'text-gray-400'}`}>
                        <span>{k}</span><span className={k === 'Total' ? 'text-brand-orange' : ''}>{v}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Payment */}
                <section>
                  <h3 className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-3">Payment</h3>
                  <div className="bg-[#141414] rounded-xl p-4 space-y-2">
                    {[['Method', selected.payment_method],['Status', selected.payment_status],['Reference', selected.payment_reference]].map(([k,v]) => (
                      <div key={k} className="flex justify-between text-sm">
                        <span className="text-gray-500">{k}</span>
                        <span className={`font-medium ${v === 'paid' ? 'text-green-400' : v === 'failed' ? 'text-red-400' : 'text-white'}`}>{v || '—'}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Status update */}
                <section>
                  <h3 className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-3">Update Status</h3>
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    {STATUSES.map(s => (
                      <button key={s} onClick={() => updateStatus(selected.id, s, selected)} disabled={updating || s === selected.status}
                        className={`px-3 py-2.5 rounded-xl text-xs font-bold capitalize border transition-all ${s === selected.status ? STATUS_COLOR[s] + ' cursor-default' : 'border-[#2A2A2A] text-gray-400 hover:border-brand-orange hover:text-brand-orange'} disabled:opacity-50`}>
                        {updating && s !== selected.status ? <Loader size={12} className="animate-spin mx-auto"/> : s.replace(/_/g,' ')}
                      </button>
                    ))}
                  </div>
                  <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} rows={3}
                    placeholder="Admin note (optional)"
                    className="w-full px-3 py-2.5 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-white text-sm outline-none focus:border-brand-orange placeholder-gray-600 resize-none"/>
                </section>

                {/* Status history */}
                {selected.status_history?.length > 0 && (
                  <section>
                    <h3 className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-3">History</h3>
                    <div className="space-y-2">
                      {[...selected.status_history].reverse().map((h, i) => (
                        <div key={i} className="flex items-center gap-3 text-xs">
                          <span className={`px-2 py-1 rounded-lg font-bold capitalize ${STATUS_COLOR[h.status] || ''}`}>{h.status?.replace(/_/g,' ')}</span>
                          <span className="text-gray-500">{new Date(h.timestamp).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
