import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Package, Truck, CheckCircle, Clock, XCircle,
  MapPin, Phone, Mail, ChevronDown, ChevronUp,
  RefreshCw, MessageCircle, ArrowLeft, ShoppingBag,
  Search, Copy, Star, Navigation, Box, Zap
} from 'lucide-react'
import { useStore } from '../lib/store'
import { getPlaceholder } from '../lib/placeholders'
import { supabase } from '../lib/supabase'
import { Link } from 'react-router-dom'
import Footer from '../components/Footer'
import toast from 'react-hot-toast'

// ─── Status pipeline ──────────────────────────────────────────
const PIPELINE = [
  {
    key: 'pending',
    label: 'Order Placed',
    short: 'Placed',
    icon: Box,
    desc: 'Your order has been received and is awaiting confirmation.',
    color: '#eab308',
    bg: 'rgba(234,179,8,0.12)',
  },
  {
    key: 'processing',
    label: 'Being Packed',
    short: 'Packing',
    icon: Package,
    desc: 'Our team is carefully picking and packing your items.',
    color: '#3b82f6',
    bg: 'rgba(59,130,246,0.12)',
  },
  {
    key: 'shipped',
    label: 'Out for Delivery',
    short: 'In Transit',
    icon: Truck,
    desc: 'Your order is on its way! Estimated arrival soon.',
    color: '#FF6B00',
    bg: 'rgba(255,107,0,0.12)',
  },
  {
    key: 'delivered',
    label: 'Delivered',
    short: 'Done',
    icon: CheckCircle,
    desc: 'Your order has been delivered. Enjoy your AceFit gear! 🔥',
    color: '#22c55e',
    bg: 'rgba(34,197,94,0.12)',
  },
]


// ─── Fancy progress bar ──────────────────────────────────────
function TrackingTimeline({ order, isDark }) {
  const currentIdx = PIPELINE.findIndex(s => s.key === order.status)
  const isCancelled = order.status === 'cancelled'
  const history = order.status_history || []

  const getStepTime = (key) => {
    const h = history.find(h => h.status === key)
    if (!h) return null
    return new Date(h.timestamp).toLocaleString('en-NG', {
      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
    })
  }

  if (isCancelled) {
    return (
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-400/10 border border-red-400/20">
        <XCircle size={22} className="text-red-400 shrink-0" />
        <div>
          <p className="text-red-400 font-semibold">Order Cancelled</p>
          <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            This order has been cancelled. Contact us if you need help.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative py-2">
      {/* Desktop: horizontal stepper */}
      <div className="hidden sm:block">
        <div className="relative flex items-start justify-between mb-3">
          {/* Background track */}
          <div className={`absolute top-5 left-6 right-6 h-0.5 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
          {/* Filled track */}
          <motion.div
            className="absolute top-5 left-6 h-0.5"
            style={{ background: 'linear-gradient(90deg,#FF6B00,#FF8C3A)' }}
            initial={{ width: '0%' }}
            animate={{ width: isCancelled ? '0%' : `${Math.min(currentIdx / (PIPELINE.length - 1), 1) * (100 - 12)}%` }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
          />
          {PIPELINE.map((step, i) => {
            const done = i <= currentIdx
            const active = i === currentIdx
            const time = getStepTime(step.key)
            return (
              <div key={step.key} className="relative flex flex-col items-center z-10" style={{ width: '25%' }}>
                <motion.div
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: active ? 1.15 : 1, opacity: 1 }}
                  transition={{ delay: i * 0.12, duration: 0.4 }}
                  className="w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all"
                  style={{
                    background: done ? step.color : isDark ? '#1A1A1A' : '#F5F5F0',
                    borderColor: done ? step.color : isDark ? '#2A2A2A' : '#E5E5E5',
                    boxShadow: active ? `0 0 0 4px ${step.color}25, 0 0 20px ${step.color}40` : 'none',
                  }}
                >
                  <step.icon size={16} color={done ? '#fff' : isDark ? '#444' : '#ccc'} />
                </motion.div>
                <p className="text-[11px] font-semibold mt-2 text-center" style={{ color: done ? step.color : isDark ? '#555' : '#aaa' }}>
                  {step.short}
                </p>
                {time && (
                  <p className={`text-[9px] text-center mt-0.5 leading-tight ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{time}</p>
                )}
              </div>
            )
          })}
        </div>
        {/* Current step description */}
        {currentIdx >= 0 && (
          <motion.div
            key={order.status}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-xl text-center"
            style={{ background: PIPELINE[currentIdx].bg, border: `1px solid ${PIPELINE[currentIdx].color}30` }}
          >
            <p className="text-xs font-semibold" style={{ color: PIPELINE[currentIdx].color }}>
              {PIPELINE[currentIdx].desc}
            </p>
            {order.status === 'shipped' && order.estimated_delivery && (
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                📦 Est. delivery: {order.estimated_delivery}
              </p>
            )}
          </motion.div>
        )}
      </div>

      {/* Mobile: vertical stepper */}
      <div className="sm:hidden space-y-0">
        {PIPELINE.map((step, i) => {
          const done = i <= currentIdx
          const active = i === currentIdx
          const last = i === PIPELINE.length - 1
          const time = getStepTime(step.key)
          return (
            <div key={step.key} className="flex gap-3">
              <div className="flex flex-col items-center">
                <motion.div
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0"
                  style={{
                    background: done ? step.color : isDark ? '#1A1A1A' : '#F5F5F0',
                    borderColor: done ? step.color : isDark ? '#2A2A2A' : '#e5e5e5',
                    boxShadow: active ? `0 0 0 3px ${step.color}30` : 'none',
                  }}
                >
                  <step.icon size={13} color={done ? '#fff' : isDark ? '#555' : '#bbb'} />
                </motion.div>
                {!last && (
                  <div className="w-0.5 flex-1 mt-0.5 mb-0.5 min-h-[28px]"
                    style={{ background: done && i < currentIdx ? step.color : isDark ? '#2A2A2A' : '#e5e5e5' }} />
                )}
              </div>
              <div className="pb-5 flex-1">
                <p className="text-sm font-semibold" style={{ color: done ? step.color : isDark ? '#555' : '#aaa' }}>
                  {step.label}
                </p>
                {done && time && (
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{time}</p>
                )}
                {active && (
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{step.desc}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Single order card ────────────────────────────────────────
function OrderCard({ order, isDark, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen || false)
  const stepInfo = PIPELINE.find(s => s.key === order.status) || PIPELINE[0]
  const isCancelled = order.status === 'cancelled'

  const copyId = () => {
    navigator.clipboard?.writeText(order.id?.slice(0, 8).toUpperCase())
    toast.success('Order ID copied!')
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-brand-dark-card border-brand-dark-border' : 'bg-white border-gray-200 shadow-sm'}`}
    >
      {/* ── Header row ── */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center justify-between p-4 sm:p-5 text-left transition-colors ${isDark ? 'hover:bg-white/[0.025]' : 'hover:bg-gray-50/70'}`}
      >
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: stepInfo.bg }}>
            <stepInfo.icon size={18} style={{ color: stepInfo.color }} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`font-bold text-sm font-mono ${isDark ? 'text-white' : 'text-gray-900'}`}>
                #{order.id?.slice(0, 8).toUpperCase()}
              </span>
              <button
                onClick={e => { e.stopPropagation(); copyId() }}
                className={`p-0.5 rounded transition-colors ${isDark ? 'text-gray-600 hover:text-gray-400' : 'text-gray-300 hover:text-gray-500'}`}
              >
                <Copy size={11} />
              </button>
            </div>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {new Date(order.created_at).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
              {' · '}{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="text-right hidden xs:block">
            <p className="text-brand-orange font-bold text-sm">₦{Number(order.total || 0).toLocaleString()}</p>
          </div>
          <span
            className="text-[10px] px-2.5 py-1 rounded-full font-bold capitalize"
            style={{ background: isCancelled ? 'rgba(239,68,68,0.12)' : stepInfo.bg, color: isCancelled ? '#ef4444' : stepInfo.color }}
          >
            {order.status}
          </span>
          <div className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
            <ChevronDown size={16} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
          </div>
        </div>
      </button>

      {/* ── Expanded body ── */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className={`border-t px-4 sm:px-5 pt-5 pb-5 space-y-6 ${isDark ? 'border-brand-dark-border' : 'border-gray-100'}`}>

              {/* Tracking timeline */}
              <TrackingTimeline order={order} isDark={isDark} />

              {/* Items */}
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Items Ordered</p>
                <div className="space-y-2">
                  {(order.items || []).map((item, i) => (
                    <div key={i} className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-black/25 border border-brand-dark-border' : 'bg-gray-50 border border-gray-100'}`}>
                      <div className="w-12 h-14 rounded-xl overflow-hidden bg-gray-800 shrink-0">
                        <img
                          src={item.image_url || getPlaceholder(item.category || 'default')}
                          alt={item.name}
                          className="w-full h-full object-cover object-top"
                          onError={e => { e.target.src = 'https://i.imgur.com/YmQ8fjQ.png' }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.name}</p>
                        <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Size: <span className="font-medium">{item.size}</span> · Qty: {item.qty}</p>
                      </div>
                      <p className="text-brand-orange font-bold text-sm shrink-0">₦{(item.price * item.qty).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Two column info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Delivery address */}
                <div className={`p-4 rounded-xl border ${isDark ? 'bg-black/20 border-brand-dark-border' : 'bg-gray-50 border-gray-100'}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Delivery Address</p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <MapPin size={13} className="text-brand-orange shrink-0 mt-0.5" />
                      <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {order.delivery_address}
                        {order.delivery_landmark && <><br/><span className="italic">Near: {order.delivery_landmark}</span></>}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-brand-orange shrink-0" />
                      <p className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{order.customer_phone}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={13} className="text-brand-orange shrink-0" />
                      <p className={`text-xs truncate ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{order.customer_email}</p>
                    </div>
                  </div>
                </div>

                {/* Payment summary */}
                <div className={`p-4 rounded-xl border ${isDark ? 'bg-black/20 border-brand-dark-border' : 'bg-gray-50 border-gray-100'}`}>
                  <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Payment</p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>Subtotal</span>
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>₦{Number(order.subtotal || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>Delivery</span>
                      <span className={order.delivery_fee === 0 ? 'text-green-400 font-semibold' : isDark ? 'text-gray-300' : 'text-gray-700'}>
                        {order.delivery_fee === 0 ? 'FREE' : `₦${Number(order.delivery_fee || 0).toLocaleString()}`}
                      </span>
                    </div>
                    <div className={`flex justify-between font-bold text-sm pt-2 border-t ${isDark ? 'border-brand-dark-border' : 'border-gray-200'}`}>
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>Total Paid</span>
                      <span className="text-brand-orange">₦{Number(order.total || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between pt-1">
                      <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>Method</span>
                      <span className={`capitalize font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{order.payment_method}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>Status</span>
                      <span className={`font-semibold capitalize text-[10px] px-2 py-0.5 rounded-full ${order.payment_status === 'paid' ? 'bg-green-400/10 text-green-400' : 'bg-yellow-400/10 text-yellow-400'}`}>
                        {order.payment_status}
                      </span>
                    </div>
                    {order.payment_reference && (
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-gray-600' : 'text-gray-400'}>Ref</span>
                        <span className="font-mono text-[9px] text-brand-orange">{order.payment_reference?.slice(0, 18)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2">
                <a
                  href={`https://wa.me/2347025692097?text=${encodeURIComponent(`Hi AceFit! I need help with my order #${order.id?.slice(0, 8).toUpperCase()}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-green-600 hover:bg-green-500 text-white text-xs font-semibold rounded-xl transition-all btn-press"
                >
                  <MessageCircle size={13} /> WhatsApp Support
                </a>
                {order.status === 'delivered' && (
                  <Link
                    to="/"
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl border transition-all btn-press ${isDark ? 'border-brand-dark-border text-gray-400 hover:border-brand-orange hover:text-brand-orange' : 'border-gray-200 text-gray-500 hover:border-brand-orange hover:text-brand-orange'}`}
                  >
                    <RefreshCw size={13} /> Reorder
                  </Link>
                )}
                {order.status === 'delivered' && (
                  <Link
                    to="/?section=feedback"
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl border transition-all btn-press ${isDark ? 'border-brand-dark-border text-gray-400 hover:border-yellow-400 hover:text-yellow-400' : 'border-gray-200 text-gray-500 hover:border-yellow-500 hover:text-yellow-500'}`}
                  >
                    <Star size={13} /> Leave Review
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ─── Track by order ID (guest) ────────────────────────────────
function GuestTracker({ isDark }) {
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const handleTrack = async (e) => {
    e.preventDefault()
    if (!input.trim()) return
    setLoading(true)
    setResult(null)
    setNotFound(false)
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .or(`id.ilike.%${input.trim()}%,payment_reference.eq.${input.trim()}`)
        .limit(1)
        .single()
      if (error || !data) throw new Error('not found')
      setResult(data)
    } catch {
      setNotFound(true)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`rounded-2xl border p-5 ${isDark ? 'bg-brand-dark-card border-brand-dark-border' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center gap-2 mb-4">
        <Navigation size={16} className="text-brand-orange" />
        <p className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Track by Order ID or Payment Ref</p>
      </div>
      <form onSubmit={handleTrack} className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="e.g. ACE-001FAB2 or payment reference..."
          className={`flex-1 px-4 py-3 rounded-xl border text-sm outline-none neon-focus ${isDark ? 'bg-black/30 border-brand-dark-border text-white placeholder-gray-600 focus:border-brand-orange' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-brand-orange'}`}
        />
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-3 bg-brand-orange hover:bg-brand-orange-light text-white font-bold rounded-xl flex items-center gap-2 transition-all btn-press disabled:opacity-60 shrink-0"
        >
          {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Search size={15} />}
          Track
        </button>
      </form>
      {notFound && (
        <p className="text-red-400 text-xs mt-2">No order found with that ID. Try your full Order ID or payment reference.</p>
      )}
      {result && (
        <div className="mt-4">
          <OrderCard order={result} isDark={isDark} defaultOpen />
        </div>
      )}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────
export default function OrdersPage() {
  const { theme, user } = useStore()
  const isDark = theme === 'dark'
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [refreshing, setRefreshing] = useState(false)

  const loadOrders = async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    try {
      if (!user?.id) throw new Error('no user')
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      setOrders(data || [])
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { loadOrders() }, [user])

  const statusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    processing: orders.filter(o => o.status === 'processing').length,
    shipped: orders.filter(o => o.status === 'shipped').length,
    delivered: orders.filter(o => o.status === 'delivered').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  }
  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  const activeOrder = orders.find(o => ['pending','processing','shipped'].includes(o.status))

  return (
    <div className={`min-h-screen ${isDark ? 'bg-brand-black' : 'bg-[#F5F5F0]'}`}>
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-24">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link to="/" className={`p-2 rounded-xl border btn-press ${isDark ? 'border-brand-dark-border text-gray-400 hover:text-white' : 'border-gray-200 text-gray-500 hover:text-gray-900'}`}>
              <ArrowLeft size={16} />
            </Link>
            <div>
              <h1 className={`font-display text-4xl leading-none ${isDark ? 'text-white' : 'text-gray-900'}`}>
                MY <span className="gradient-text">ORDERS.</span>
              </h1>
              {user && <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{user.email}</p>}
            </div>
          </div>
          <button
            onClick={() => loadOrders(true)}
            disabled={refreshing}
            className={`p-2.5 rounded-xl border transition-all btn-press ${isDark ? 'border-brand-dark-border text-gray-400 hover:text-white' : 'border-gray-200 text-gray-500 hover:text-gray-900'}`}
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin text-brand-orange' : ''} />
          </button>
        </div>

        {/* Active order spotlight */}
        {activeOrder && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-brand-orange rounded-full animate-pulse" />
              <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Active Order</p>
            </div>
            <OrderCard order={activeOrder} isDark={isDark} defaultOpen />
          </motion.div>
        )}

        {/* Guest tracker */}
        {!user && <div className="mb-6"><GuestTracker isDark={isDark} /></div>}

        {/* Filter tabs */}
        {orders.length > 0 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 pb-1">
            {[
              { key: 'all', label: 'All' },
              { key: 'pending', label: 'Pending' },
              { key: 'processing', label: 'Packing' },
              { key: 'shipped', label: 'In Transit' },
              { key: 'delivered', label: 'Delivered' },
            ].filter(tab => tab.key === 'all' || statusCounts[tab.key] > 0).map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all btn-press ${
                  filter === tab.key
                    ? 'bg-brand-orange text-white shadow-md shadow-brand-orange/20'
                    : isDark ? 'bg-brand-dark-card border border-brand-dark-border text-gray-400 hover:border-brand-orange/40' : 'bg-white border border-gray-200 text-gray-500'
                }`}
              >
                {tab.label}
                {statusCounts[tab.key] > 0 && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${filter === tab.key ? 'bg-white/20 text-white' : isDark ? 'bg-brand-dark-border text-gray-500' : 'bg-gray-100 text-gray-400'}`}>
                    {statusCounts[tab.key]}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Orders list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <div key={i} className={`h-20 rounded-2xl skeleton`} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className={`rounded-2xl p-16 text-center border ${isDark ? 'bg-brand-dark-card border-brand-dark-border' : 'bg-white border-gray-200'}`}>
            <ShoppingBag size={40} className={`mx-auto mb-4 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
            <p className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {!user ? 'Sign in to see your orders' : 'No orders yet'}
            </p>
            <p className={`text-sm mb-6 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {!user ? 'Sign in to view your full order history and live tracking.' : 'Your orders will appear here once you checkout.'}
            </p>
            <Link to="/" className="inline-block px-6 py-3 bg-brand-orange text-white rounded-xl font-bold text-sm btn-press shadow-lg shadow-brand-orange/25">
              Shop Now 🔥
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {filtered.map((order, i) => (
                order.id !== activeOrder?.id && (
                  <motion.div key={order.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <OrderCard order={order} isDark={isDark} />
                  </motion.div>
                )
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Guest order tracker (below) */}
        {user && (
          <div className="mt-8">
            <GuestTracker isDark={isDark} />
          </div>
        )}

        {/* Demo notice */}
        {!user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`mt-6 p-4 rounded-2xl border ${isDark ? 'bg-brand-dark-card border-brand-orange/20' : 'bg-orange-50 border-orange-100'}`}
          >
            <p className="text-brand-orange font-semibold text-sm mb-1 flex items-center gap-1.5">
              <Zap size={14} /> Sign in to see your real orders
            </p>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              The orders shown above are demo data only. Sign in with your email OTP to view your actual order history with live status tracking.
            </p>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  )
}
