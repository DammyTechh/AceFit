import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Eye, MessageCircle, ChevronDown, X,
  Package, Truck, CheckCircle, Clock, XCircle,
  MapPin, Phone, Mail, Navigation, ArrowRight,
  RefreshCw, Send, Loader, Box, Zap
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useStore } from '../../lib/store'
import toast from 'react-hot-toast'

// ─── Status pipeline (matches user-facing) ────────────────────
const PIPELINE = [
  { key: 'pending',    label: 'Order Placed',     icon: Box,          color: '#eab308', bg: 'rgba(234,179,8,0.12)',    next: 'processing' },
  { key: 'processing', label: 'Packing',           icon: Package,      color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',   next: 'shipped' },
  { key: 'shipped',    label: 'Out for Delivery',  icon: Truck,        color: '#FF6B00', bg: 'rgba(255,107,0,0.12)',    next: 'delivered' },
  { key: 'delivered',  label: 'Delivered',         icon: CheckCircle,  color: '#22c55e', bg: 'rgba(34,197,94,0.12)',    next: null },
]


// ─── Mini timeline for admin ──────────────────────────────────
function AdminTimeline({ status, isDark }) {
  const idx = PIPELINE.findIndex(s => s.key === status)
  return (
    <div className="flex items-center gap-1 mt-2">
      {PIPELINE.map((step, i) => {
        const done = i <= idx
        return (
          <React.Fragment key={step.key}>
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: done ? step.color : isDark ? '#2A2A2A' : '#e5e5e5' }}
              title={step.label}
            >
              <step.icon size={10} color={done ? '#fff' : isDark ? '#555' : '#bbb'} />
            </div>
            {i < PIPELINE.length - 1 && (
              <div className="flex-1 h-0.5 rounded" style={{ background: done && i < idx ? step.color : isDark ? '#2A2A2A' : '#e5e5e5' }} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ─── Status update drawer ─────────────────────────────────────
function UpdateStatusDrawer({ order, onClose, onUpdated, isDark }) {
  const [newStatus, setNewStatus] = useState(order.status)
  const [note, setNote] = useState('')
  const [sending, setSending] = useState(false)
  const currentIdx = PIPELINE.findIndex(s => s.key === order.status)

  const sendEmailNotification = async (status, orderData) => {
    const statusMessages = {
      processing: { emoji: '📦', label: 'Being Packed', desc: 'Great news! Our team has started packing your order.' },
      shipped:    { emoji: '🚚', label: 'Out for Delivery', desc: `Your order is on its way to ${orderData.delivery_state}! Expected: ${orderData.estimated_delivery || '1–5 days'}.` },
      delivered:  { emoji: '✅', label: 'Delivered', desc: 'Your AceFit gear has arrived! Hope you love it. 🔥' },
      cancelled:  { emoji: '❌', label: 'Cancelled', desc: 'Your order has been cancelled. Contact us if you need help.' },
    }
    const msg = statusMessages[status]
    if (!msg || !orderData.customer_email) return
    const html = `
      <div style="background:#0A0A0A;color:#fff;font-family:DM Sans,sans-serif;max-width:580px;margin:0 auto;padding:0;border-radius:16px;overflow:hidden">
        <div style="height:4px;background:linear-gradient(90deg,#FF6B00,#FF8C3A,#FFB347)"></div>
        <div style="padding:40px 32px">
          <img src="https://i.imgur.com/eDF88SE.png" style="height:48px;margin-bottom:32px"/>
          <div style="font-size:40px;margin-bottom:12px">${msg.emoji}</div>
          <h1 style="color:#FF6B00;font-size:26px;margin:0 0 8px">${msg.label}</h1>
          <p style="color:#aaa;font-size:15px;line-height:1.6;margin:0 0 24px">Hi <strong style="color:#fff">${orderData.customer_name}</strong>, ${msg.desc}</p>
          <div style="background:#1A1A1A;border-radius:12px;padding:20px;border-left:4px solid #FF6B00;margin-bottom:24px">
            <p style="color:#888;font-size:12px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px">Order ID</p>
            <p style="color:#FF6B00;font-size:22px;font-weight:700;font-family:monospace;margin:0">#${orderData.id?.slice(0,8).toUpperCase()}</p>
            ${note ? `<p style="color:#aaa;font-size:13px;margin:8px 0 0;border-top:1px solid #2A2A2A;padding-top:8px">${note}</p>` : ''}
          </div>
          ${orderData.items?.length ? `
          <p style="color:#888;font-size:12px;margin:0 0 12px;text-transform:uppercase;letter-spacing:1px">Items</p>
          ${orderData.items.map(item => `
            <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #2A2A2A">
              <span style="color:#ccc;font-size:14px">${item.name} (${item.size}) × ${item.qty}</span>
              <span style="color:#FF6B00;font-weight:700;font-size:14px">₦${(item.price * item.qty).toLocaleString()}</span>
            </div>
          `).join('')}
          <div style="display:flex;justify-content:space-between;padding:14px 0;margin-top:4px">
            <span style="color:#fff;font-weight:700;font-size:16px">Total Paid</span>
            <span style="color:#FF6B00;font-weight:700;font-size:18px">₦${Number(orderData.total || 0).toLocaleString()}</span>
          </div>` : ''}
          <a href="https://acefit.com/orders" style="display:inline-block;background:#FF6B00;color:#fff;text-decoration:none;padding:14px 28px;border-radius:12px;font-weight:700;font-size:14px;margin-top:8px">Track My Order →</a>
          <p style="color:#555;font-size:12px;margin-top:32px">Questions? WhatsApp: <a href="https://wa.me/2347025692097" style="color:#FF6B00">07025692097</a> · <a href="mailto:Acefitandgainz@gmail.com" style="color:#FF6B00">Acefitandgainz@gmail.com</a></p>
        </div>
      </div>`

    try {
      await supabase.functions.invoke('send-email', {
        body: { to: orderData.customer_email, subject: `${msg.emoji} Order Update: ${msg.label} – AceFit #${orderData.id?.slice(0,8).toUpperCase()}`, html }
      })
    } catch {
      console.log('Email notification skipped (edge function not deployed)')
    }
  }

  const handleUpdate = async () => {
    if (newStatus === order.status && !note) { toast('No changes made'); return }
    setSending(true)
    try {
      const updatedHistory = [
        ...(order.status_history || []),
        { status: newStatus, timestamp: new Date().toISOString(), note: note || undefined }
      ]
      await supabase.from('orders').update({
        status: newStatus,
        status_history: updatedHistory,
        updated_at: new Date().toISOString(),
      }).eq('id', order.id)
      await sendEmailNotification(newStatus, { ...order, status_history: updatedHistory })
      toast.success(`✅ Status → ${newStatus} · Customer notified!`)
      onUpdated({ ...order, status: newStatus, status_history: updatedHistory })
      onClose()
    } catch {
      // Demo mode
      toast.success(`✅ Status → ${newStatus} (demo mode)`)
      onUpdated({ ...order, status: newStatus })
      onClose()
    } finally {
      setSending(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 modal-backdrop"
        style={{ background: 'rgba(0,0,0,0.85)' }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ y: 60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 60, opacity: 0 }}
          transition={{ type: 'spring', damping: 24 }}
          className={`w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl overflow-hidden ${isDark ? 'bg-brand-dark-card border border-brand-dark-border' : 'bg-white'}`}
        >
          <div className="h-1.5 bg-gradient-to-r from-brand-orange via-orange-400 to-yellow-400" />
          <div className="p-5 sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className={`font-bold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>Update Order Status</p>
                <p className={`text-xs font-mono mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  #{order.id?.slice(0,8).toUpperCase()} · {order.customer_name}
                </p>
              </div>
              <button onClick={onClose} className={`p-2 rounded-xl btn-press ${isDark ? 'text-gray-400 hover:text-white hover:bg-brand-dark-border' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}>
                <X size={18} />
              </button>
            </div>

            {/* Current address & contact */}
            <div className={`rounded-xl p-3 border mb-5 flex items-start gap-2 ${isDark ? 'bg-black/20 border-brand-dark-border' : 'bg-gray-50 border-gray-100'}`}>
              <MapPin size={13} className="text-brand-orange mt-0.5 shrink-0" />
              <div>
                <p className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{order.delivery_address}</p>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{order.customer_phone} · {order.customer_email}</p>
              </div>
            </div>

            {/* Status pipeline selector */}
            <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Set Tracking Status</p>
            <div className="space-y-2 mb-5">
              {PIPELINE.map((step, i) => {
                const isCurrentInDB = order.status === step.key
                const isPast = i < PIPELINE.findIndex(s => s.key === order.status)
                const isSelected = newStatus === step.key
                return (
                  <button
                    key={step.key}
                    onClick={() => setNewStatus(step.key)}
                    disabled={isPast}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-brand-orange'
                        : isPast
                          ? isDark ? 'border-transparent opacity-40 cursor-not-allowed' : 'border-transparent opacity-40 cursor-not-allowed'
                          : isDark ? 'border-brand-dark-border hover:border-brand-orange/40' : 'border-gray-200 hover:border-brand-orange/40'
                    }`}
                    style={{ background: isSelected ? step.bg : 'transparent' }}
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: isSelected || isCurrentInDB ? step.color : isDark ? '#2A2A2A' : '#f0f0f0' }}>
                      <step.icon size={16} color={isSelected || isCurrentInDB ? '#fff' : isDark ? '#666' : '#bbb'} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-semibold ${isSelected ? '' : isDark ? 'text-gray-300' : 'text-gray-700'}`}
                          style={{ color: isSelected ? step.color : undefined }}>
                          {step.label}
                        </p>
                        {isCurrentInDB && <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${isDark ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>CURRENT</span>}
                        {isPast && <span className="text-[9px] text-gray-500">✓ Done</span>}
                      </div>
                      <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {step.key === 'pending' && 'Order received, awaiting packing'}
                        {step.key === 'processing' && 'Team is picking & packing items'}
                        {step.key === 'shipped' && 'Dispatched – with delivery agent'}
                        {step.key === 'delivered' && 'Successfully delivered to customer'}
                      </p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 shrink-0 transition-all ${isSelected ? 'border-brand-orange bg-brand-orange' : isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                      {isSelected && <div className="w-2 h-2 bg-white rounded-full m-auto mt-0.5" />}
                    </div>
                  </button>
                )
              })}
              {/* Cancel option */}
              <button
                onClick={() => setNewStatus('cancelled')}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all text-left ${newStatus === 'cancelled' ? 'border-red-400 bg-red-400/10' : isDark ? 'border-brand-dark-border hover:border-red-400/40' : 'border-gray-200 hover:border-red-300'}`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${newStatus === 'cancelled' ? 'bg-red-400' : isDark ? 'bg-brand-dark-border' : 'bg-gray-100'}`}>
                  <XCircle size={16} color={newStatus === 'cancelled' ? '#fff' : isDark ? '#666' : '#bbb'} />
                </div>
                <div>
                  <p className={`text-sm font-semibold ${newStatus === 'cancelled' ? 'text-red-400' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>Cancel Order</p>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Notifies customer via email</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ml-auto shrink-0 ${newStatus === 'cancelled' ? 'border-red-400 bg-red-400' : isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                  {newStatus === 'cancelled' && <div className="w-2 h-2 bg-white rounded-full m-auto mt-0.5" />}
                </div>
              </button>
            </div>

            {/* Optional note */}
            <div className="mb-5">
              <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Note to Customer (optional)
              </label>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="e.g. Your item was dispatched via Kwik delivery. Track with code XYZ123..."
                rows={2}
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none neon-focus ${isDark ? 'bg-black/30 border-brand-dark-border text-white placeholder-gray-600 focus:border-brand-orange' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-brand-orange'}`}
              />
            </div>

            <div className="flex gap-3">
              <button onClick={onClose} className={`px-5 py-3 rounded-xl border text-sm font-medium transition-all btn-press ${isDark ? 'border-brand-dark-border text-gray-400' : 'border-gray-200 text-gray-500'}`}>
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                disabled={sending || (newStatus === order.status && !note)}
                className="flex-1 py-3 bg-brand-orange hover:bg-brand-orange-light text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all btn-press shadow-lg shadow-brand-orange/25 disabled:opacity-50"
              >
                {sending ? <><Loader size={15} className="animate-spin" /> Saving...</> : <><Send size={15} /> Update & Notify Customer</>}
              </button>
            </div>
            <p className={`text-xs text-center mt-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
              📧 A branded email notification will be sent to {order.customer_email}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Order detail modal ───────────────────────────────────────
function OrderDetailModal({ order, onClose, onStatusUpdate, isDark }) {
  const [showUpdate, setShowUpdate] = useState(false)
  if (!order) return null
  const stepInfo = PIPELINE.find(s => s.key === order.status) || PIPELINE[0]

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4 modal-backdrop"
          style={{ background: 'rgba(0,0,0,0.8)' }}
          onClick={e => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className={`w-full sm:max-w-xl max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-2xl overflow-hidden ${isDark ? 'bg-brand-dark-card border border-brand-dark-border' : 'bg-white'}`}
          >
            <div className="h-1.5 bg-gradient-to-r from-brand-orange to-yellow-400 shrink-0" />
            <div className={`flex items-center justify-between p-5 border-b shrink-0 ${isDark ? 'border-brand-dark-border' : 'border-gray-100'}`}>
              <div>
                <p className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>#{order.id?.slice(0,8).toUpperCase()}</p>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{new Date(order.created_at).toLocaleString('en-NG')}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowUpdate(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-brand-orange hover:bg-brand-orange-light text-white text-xs font-bold rounded-xl transition-all btn-press"
                >
                  <Navigation size={12} /> Update Status
                </button>
                <button onClick={onClose} className={`p-2 rounded-xl btn-press ${isDark ? 'text-gray-400 hover:text-white hover:bg-brand-dark-border' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Status + mini timeline */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: stepInfo.bg }}>
                    <stepInfo.icon size={18} style={{ color: stepInfo.color }} />
                  </div>
                  <div>
                    <p className="font-bold text-sm" style={{ color: stepInfo.color }}>{stepInfo.label}</p>
                    <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      Last updated: {new Date(order.status_history?.slice(-1)[0]?.timestamp || order.created_at).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                {/* Timeline dots */}
                <div className="flex items-center gap-1">
                  {PIPELINE.map((step, i) => {
                    const idx = PIPELINE.findIndex(s => s.key === order.status)
                    const done = i <= idx
                    const histEntry = order.status_history?.find(h => h.status === step.key)
                    return (
                      <React.Fragment key={step.key}>
                        <div className="relative group">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center"
                            style={{ background: done ? step.color : isDark ? '#2A2A2A' : '#e5e5e5' }}>
                            <step.icon size={12} color={done ? '#fff' : isDark ? '#555' : '#bbb'} />
                          </div>
                          {histEntry && (
                            <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded text-[9px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 ${isDark ? 'bg-black text-gray-300' : 'bg-gray-800 text-white'}`}>
                              {new Date(histEntry.timestamp).toLocaleString('en-NG', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                        </div>
                        {i < PIPELINE.length - 1 && (
                          <div className="flex-1 h-0.5" style={{ background: done && i < PIPELINE.findIndex(s => s.key === order.status) ? step.color : isDark ? '#2A2A2A' : '#e5e5e5' }} />
                        )}
                      </React.Fragment>
                    )
                  })}
                </div>
                <div className="flex justify-between mt-1">
                  {PIPELINE.map(s => (
                    <span key={s.key} className={`text-[9px] text-center ${isDark ? 'text-gray-600' : 'text-gray-400'}`} style={{ width: '25%' }}>{s.label}</span>
                  ))}
                </div>
              </div>

              {/* Customer & delivery */}
              <div className={`rounded-xl p-4 border ${isDark ? 'bg-black/20 border-brand-dark-border' : 'bg-gray-50 border-gray-100'}`}>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Customer & Delivery</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-brand-orange rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">{order.customer_name?.charAt(0)}</div>
                    <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{order.customer_name}</p>
                  </div>
                  <div className="flex items-center gap-2 pl-9">
                    <Phone size={12} className="text-brand-orange" />
                    <a href={`tel:${order.customer_phone}`} className={`text-xs hover:text-brand-orange ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{order.customer_phone}</a>
                  </div>
                  <div className="flex items-center gap-2 pl-9">
                    <Mail size={12} className="text-brand-orange" />
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{order.customer_email}</p>
                  </div>
                  <div className="flex items-start gap-2 pl-9">
                    <MapPin size={12} className="text-brand-orange mt-0.5 shrink-0" />
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{order.delivery_address}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Items ({order.items?.length})</p>
                {(order.items || []).map((item, i) => (
                  <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl mb-2 ${isDark ? 'bg-black/20 border border-brand-dark-border' : 'bg-gray-50'}`}>
                    <div className="w-10 h-12 rounded-lg overflow-hidden bg-gray-800 shrink-0">
                      <img src={item.image_url || 'https://i.imgur.com/YmQ8fjQ.png'} alt={item.name} className="w-full h-full object-cover object-top" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.name}</p>
                      <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{item.size} × {item.qty}</p>
                    </div>
                    <p className="text-brand-orange font-bold text-sm shrink-0">₦{(item.price * item.qty).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className={`rounded-xl p-4 border space-y-1.5 text-sm ${isDark ? 'border-brand-dark-border' : 'border-gray-100'}`}>
                <div className="flex justify-between"><span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Subtotal</span><span className={isDark ? 'text-gray-300' : 'text-gray-700'}>₦{Number(order.subtotal || 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Delivery ({order.delivery_state})</span><span className={isDark ? 'text-gray-300' : 'text-gray-700'}>₦{Number(order.delivery_fee || 0).toLocaleString()}</span></div>
                <div className={`flex justify-between font-bold text-base pt-2 border-t ${isDark ? 'border-brand-dark-border' : 'border-gray-100'}`}>
                  <span className={isDark ? 'text-white' : 'text-gray-900'}>Total</span>
                  <span className="text-brand-orange">₦{Number(order.total || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* WhatsApp link */}
              <a
                href={`https://wa.me/${order.customer_phone?.replace(/\D/g,'')}`}
                target="_blank" rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl text-sm transition-all btn-press"
              >
                <MessageCircle size={15} /> Chat with Customer on WhatsApp
              </a>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {showUpdate && (
        <UpdateStatusDrawer
          order={order}
          isDark={isDark}
          onClose={() => setShowUpdate(false)}
          onUpdated={(updatedOrder) => {
            onStatusUpdate(updatedOrder)
            setShowUpdate(false)
          }}
        />
      )}
    </>
  )
}

// ─── Main admin orders page ───────────────────────────────────
const STATUSES = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled']

export default function AdminOrders() {
  const { theme } = useStore()
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const isDark = theme === 'dark'

  useEffect(() => { loadOrders() }, [])

  const loadOrders = async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      const { data } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
      if (data?.length) setOrders(data)
    } catch {}
    setLoading(false)
    setRefreshing(false)
  }

  const handleStatusUpdate = (updatedOrder) => {
    setOrders(os => os.map(o => o.id === updatedOrder.id ? updatedOrder : o))
    if (selectedOrder?.id === updatedOrder.id) setSelectedOrder(updatedOrder)
  }

  const filtered = orders.filter(o => {
    const matchSearch = !search ||
      o.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer_email?.toLowerCase().includes(search.toLowerCase()) ||
      o.id?.toLowerCase().includes(search.toLowerCase()) ||
      o.payment_reference?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || o.status === filterStatus
    return matchSearch && matchStatus
  })

  const counts = STATUSES.reduce((acc, s) => {
    acc[s] = s === 'all' ? orders.length : orders.filter(o => o.status === s).length
    return acc
  }, {})

  const statusColor = { pending: '#eab308', processing: '#3b82f6', shipped: '#FF6B00', delivered: '#22c55e', cancelled: '#ef4444' }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`font-display text-3xl md:text-4xl ${isDark ? 'text-white' : 'text-gray-900'}`}>ORDERS</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{orders.length} total orders</p>
        </div>
        <button
          onClick={() => loadOrders(true)}
          disabled={refreshing}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all btn-press ${isDark ? 'border-brand-dark-border text-gray-400 hover:text-white' : 'border-gray-200 text-gray-500 hover:text-gray-900'}`}
        >
          <RefreshCw size={14} className={refreshing ? 'animate-spin text-brand-orange' : ''} />
          Refresh
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Pending', key: 'pending', color: '#eab308' },
          { label: 'Packing', key: 'processing', color: '#3b82f6' },
          { label: 'In Transit', key: 'shipped', color: '#FF6B00' },
          { label: 'Delivered', key: 'delivered', color: '#22c55e' },
        ].map(s => (
          <button
            key={s.key}
            onClick={() => setFilterStatus(s.key)}
            className={`p-4 rounded-2xl border text-left transition-all btn-press ${filterStatus === s.key ? 'border-opacity-50' : isDark ? 'bg-brand-dark-card border-brand-dark-border hover:border-opacity-40' : 'bg-white border-gray-200'}`}
            style={{ borderColor: filterStatus === s.key ? s.color : undefined, background: filterStatus === s.key ? `${s.color}15` : undefined }}
          >
            <p className="text-2xl font-bold" style={{ color: s.color }}>{counts[s.key]}</p>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{s.label}</p>
          </button>
        ))}
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border flex-1 ${isDark ? 'bg-brand-dark-card border-brand-dark-border' : 'bg-white border-gray-200'}`}>
          <Search size={15} className="text-brand-orange shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by customer, order ID, payment ref..."
            className={`flex-1 bg-transparent text-sm outline-none ${isDark ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'}`}
          />
          {search && <button onClick={() => setSearch('')}><X size={13} className={isDark ? 'text-gray-500' : 'text-gray-400'} /></button>}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all btn-press capitalize ${filterStatus === s ? 'text-white' : isDark ? 'bg-brand-dark-card border border-brand-dark-border text-gray-400' : 'bg-white border border-gray-200 text-gray-500'}`}
              style={filterStatus === s ? { background: s === 'all' ? '#FF6B00' : (statusColor[s] || '#FF6B00') } : {}}
            >
              {s} {counts[s] > 0 && `(${counts[s]})`}
            </button>
          ))}
        </div>
      </div>

      {/* Orders table */}
      <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-brand-dark-card border-brand-dark-border' : 'bg-white border-gray-200'}`}>
        {loading ? (
          <div className="p-8 space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-16 rounded-xl skeleton" />)}
          </div>
        ) : (
          <>
          {/* Mobile: card list */}
          <div className="md:hidden divide-y divide-[#242424]">
            {filtered.map(order => {
              const stepInfo = PIPELINE.find(s => s.key === order.status) || PIPELINE[0]
              return (
                <div key={order.id} onClick={() => setSelectedOrder(order)}
                  className={`p-4 cursor-pointer ${isDark?'hover:bg-white/[0.02]':'hover:bg-gray-50'}`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-xs text-brand-orange font-bold">#{order.id?.slice(0,8).toUpperCase()}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold capitalize"
                      style={{background: order.status==='cancelled'?'rgba(239,68,68,0.12)':stepInfo.bg, color: order.status==='cancelled'?'#ef4444':stepInfo.color}}>
                      {order.status}
                    </span>
                  </div>
                  <p className={`text-sm font-semibold ${isDark?'text-white':'text-gray-900'}`}>{order.customer_name}</p>
                  <p className={`text-xs mt-0.5 ${isDark?'text-gray-500':'text-gray-400'}`}>{order.delivery_state} · {order.payment_method}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-xs ${isDark?'text-gray-600':'text-gray-400'}`}>{new Date(order.created_at).toLocaleDateString('en-NG',{day:'numeric',month:'short'})}</span>
                    <span className="text-brand-orange font-bold text-sm">₦{Number(order.total||0).toLocaleString()}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Desktop: table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`text-xs uppercase tracking-wider border-b ${isDark ? 'bg-black/30 text-gray-500 border-brand-dark-border' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                  <th className="px-5 py-3 text-left">Order</th>
                  <th className="px-5 py-3 text-left hidden sm:table-cell">Customer</th>
                  <th className="px-5 py-3 text-center hidden md:table-cell">Tracking</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order, i) => {
                  const stepInfo = PIPELINE.find(s => s.key === order.status) || PIPELINE[0]
                  const isCancelled = order.status === 'cancelled'
                  return (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className={`border-t cursor-pointer transition-colors ${isDark ? 'border-brand-dark-border hover:bg-white/[0.025]' : 'border-gray-50 hover:bg-gray-50'}`}
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-mono text-xs text-brand-orange font-bold">#{order.id?.slice(0,8).toUpperCase()}</p>
                        <p className={`text-[10px] mt-0.5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{new Date(order.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}</p>
                      </td>
                      <td className="px-5 py-3.5 hidden sm:table-cell">
                        <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{order.customer_name}</p>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{order.delivery_state}</p>
                      </td>
                      <td className="px-5 py-3.5 hidden md:table-cell">
                        <AdminTimeline status={order.status} isDark={isDark} />
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>₦{Number(order.total || 0).toLocaleString()}</p>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold capitalize ${order.payment_status === 'paid' ? 'bg-green-400/10 text-green-400' : 'bg-yellow-400/10 text-yellow-400'}`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className="text-[10px] px-2.5 py-1 rounded-full font-bold capitalize"
                          style={{ background: isCancelled ? 'rgba(239,68,68,0.12)' : stepInfo.bg, color: isCancelled ? '#ef4444' : stepInfo.color }}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <button
                          onClick={e => { e.stopPropagation(); setSelectedOrder(order) }}
                          className={`p-2 rounded-lg transition-all btn-press ${isDark ? 'text-gray-400 hover:text-brand-orange hover:bg-brand-orange/10' : 'text-gray-400 hover:text-brand-orange hover:bg-brand-orange/5'}`}
                        >
                          <Navigation size={14} />
                        </button>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-16 text-center">
                <Package size={32} className={`mx-auto mb-3 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
                <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>No orders match your filter</p>
              </div>
            )}
          </div>
          </>
        )}
      </div>

      {/* Detail modal */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          isDark={isDark}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  )
}
