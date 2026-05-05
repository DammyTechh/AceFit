import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, MapPin, User, Phone, CreditCard, Loader,
  CheckCircle, ChevronDown, Search, Package, ArrowRight
} from 'lucide-react'
import { useStore } from '../lib/store'
import { getPlaceholder } from '../lib/placeholders'
import { supabase } from '../lib/supabase'
import { getDeliveryFee, ALL_NIGERIAN_STATES } from '../lib/deliveryFee'
import { emailTemplates } from '../lib/emailTemplates'
import toast from 'react-hot-toast'

const OPAY_MERCHANT_ID = import.meta.env.VITE_OPAY_MERCHANT_ID || ''
const OPAY_PUBLIC_KEY  = import.meta.env.VITE_OPAY_PUBLIC_KEY  || ''

/* ── address autocomplete via OpenStreetMap Nominatim (free, no key) ── */
const useAddressSuggestions = (query) => {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef()

  useEffect(() => {
    if (!query || query.length < 4) { setSuggestions([]); return }
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=ng&limit=6&q=${encodeURIComponent(query)}`,
          { headers: { 'Accept-Language': 'en' } }
        )
        const data = await res.json()
        setSuggestions(data.map(d => d.display_name))
      } catch {
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }, 450)
    return () => clearTimeout(debounceRef.current)
  }, [query])

  return { suggestions, loading }
}

export default function CheckoutModal({ open, onClose }) {
  const { cart, cartTotal, clearCart, user, theme } = useStore()
  const isDark = theme === 'dark'
  const subtotal = cartTotal()

  const [step, setStep] = useState('details') // details | payment | processing | success
  const [form, setForm] = useState({
    name: user?.user_metadata?.name || '',
    phone: '',
    email: user?.email || '',
    address: '',
    state: '',
    lga: '',
    landmark: '',
  })
  const [addressQuery, setAddressQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [delivery, setDelivery] = useState({ fee: 0, eta: '', label: '', zone: '' })
  const [paymentMethod, setPaymentMethod] = useState('opay')
  const [processing, setProcessing] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [errors, setErrors] = useState({})
  const addressRef = useRef()
  const { suggestions, loading: suggestLoading } = useAddressSuggestions(addressQuery)

  // Recalculate delivery fee whenever address/state changes
  useEffect(() => {
    const fullAddress = [form.address, form.lga, form.state].filter(Boolean).join(', ')
    if (fullAddress.length > 3) {
      const result = getDeliveryFee(fullAddress, subtotal)
      setDelivery(result)
    }
  }, [form.address, form.state, form.lga, subtotal])

  // Prefill user data when modal opens
  useEffect(() => {
    if (open && user) {
      setForm(f => ({
        ...f,
        email: user.email || '',
        name: user.user_metadata?.name || f.name,
      }))
    }
    if (open) setStep('details')
  }, [open, user])

  const update = (key, val) => {
    setForm(f => ({ ...f, [key]: val }))
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim()) e.name = 'Full name is required'
    if (!form.phone.trim()) e.phone = 'Phone number is required'
    if (!/^0[789]\d{9}$/.test(form.phone.replace(/\s/g, ''))) e.phone = 'Enter a valid Nigerian phone number'
    if (!form.address.trim()) e.address = 'Delivery address is required'
    if (!form.state) e.state = 'Please select your state'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleAddressSelect = (suggestion) => {
    update('address', suggestion)
    setAddressQuery(suggestion)
    setShowSuggestions(false)
    // Extract state from suggestion
    const stateMatch = ALL_NIGERIAN_STATES.find(s =>
      suggestion.toLowerCase().includes(s.toLowerCase())
    )
    if (stateMatch) update('state', stateMatch)
  }

  /* ── Save order to Supabase ── */
  const saveOrder = async (paymentRef = null, paymentStatus = 'unpaid') => {
    const fullAddress = [form.address, form.lga, form.state].filter(Boolean).join(', ')
    const orderData = {
      user_id: user?.id || null,
      customer_name: form.name,
      customer_email: form.email,
      customer_phone: form.phone,
      delivery_address: fullAddress,
      delivery_landmark: form.landmark,
      delivery_state: form.state,
      delivery_fee: delivery.fee,
      items: cart.map(i => ({
        id: i.id, name: i.name, size: i.size,
        qty: i.qty, price: i.price,
        image_url: i.image_url,
      })),
      subtotal,
      total: subtotal + delivery.fee,
      status: 'pending',
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      payment_reference: paymentRef,
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single()
      if (error) throw error
      return data
    } catch {
      // Return local order with temp ID for demo
      return { ...orderData, id: crypto.randomUUID(), created_at: new Date().toISOString() }
    }
  }

  /* ── Send order confirmation email ── */
  const sendOrderEmail = async (order) => {
    try {
      const { subject, html } = emailTemplates.orderConfirmation(order, cart)
      await supabase.functions.invoke('send-email', {
        body: { to: form.email, subject, html }
      })
    } catch {
      console.log('Email not sent (Supabase edge function not deployed)')
    }
  }

  /* ── OPay Payment ── */
  const handleOpayPayment = async () => {
    if (!validate()) return
    setStep('payment')
  }

  const handleOpayCheckout = async () => {
    setProcessing(true)
    try {
      const ref = `ACE-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`
      const totalAmount = subtotal + delivery.fee

      // Build OPay checkout URL
      // OPay standard integration: redirect to their hosted page
      const opayParams = new URLSearchParams({
        merchantId: OPAY_MERCHANT_ID || 'demo_merchant',
        reference: ref,
        amount: (totalAmount * 100).toString(), // OPay uses kobo
        currency: 'NGN',
        country: 'NG',
        callbackUrl: `${window.location.origin}/?order_ref=${ref}&status=success`,
        cancelUrl: `${window.location.origin}/?order_ref=${ref}&status=cancelled`,
        customerName: form.name,
        customerPhone: form.phone,
        customerEmail: form.email,
        description: `AceFit Order – ${cart.length} item(s)`,
      })

      // Save order first as pending
      const order = await saveOrder(ref, 'unpaid')
      setOrderId(order.id)

      if (OPAY_MERCHANT_ID) {
        // Real OPay: redirect to checkout
        window.location.href = `https://cashier.opayweb.com/cashier/v2?${opayParams.toString()}`
      } else {
        // Demo: simulate payment success after 2s
        await new Promise(r => setTimeout(r, 2000))
        const paidOrder = { ...order, status: 'processing', payment_status: 'paid' }
        try {
          await supabase.from('orders').update({ status: 'processing', payment_status: 'paid' }).eq('id', order.id)
        } catch {}
        await sendOrderEmail(paidOrder)
        clearCart()
        setOrderId(order.id)
        setStep('success')
        toast.success('Order placed successfully! 🔥')
      }
    } catch (err) {
      toast.error('Payment failed. Please try again.')
      console.error(err)
    } finally {
      setProcessing(false)
    }
  }

  const totalWithDelivery = subtotal + delivery.fee

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[95] flex items-end sm:items-center justify-center p-0 sm:p-4 modal-backdrop"
        style={{ background: 'rgba(0,0,0,0.85)' }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: 'spring', damping: 24, stiffness: 280 }}
          className={`relative w-full sm:max-w-2xl max-h-[95vh] flex flex-col rounded-t-3xl sm:rounded-2xl overflow-hidden ${isDark ? 'bg-brand-dark-card border border-brand-dark-border' : 'bg-white'}`}
        >
          {/* Top accent */}
          <div className="h-1.5 bg-gradient-to-r from-brand-orange via-orange-400 to-yellow-400 shrink-0" />

          {/* Header */}
          <div className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${isDark ? 'border-brand-dark-border' : 'border-gray-100'}`}>
            <div className="flex items-center gap-3">
              <img src="https://i.imgur.com/eDF88SE.png" alt="AceFit" className="h-7 w-auto" />
              <div>
                <h2 className={`font-bold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {step === 'details' ? 'Delivery Details' : step === 'payment' ? 'Confirm & Pay' : step === 'success' ? 'Order Confirmed! 🎉' : 'Processing...'}
                </h2>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {step === 'details' ? 'Where should we deliver?' : step === 'payment' ? 'Review your order' : ''}
                </p>
              </div>
            </div>
            {step !== 'processing' && step !== 'success' && (
              <button onClick={onClose} className={`p-2 rounded-xl btn-press ${isDark ? 'text-gray-400 hover:text-white hover:bg-brand-dark-border' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}>
                <X size={18} />
              </button>
            )}
          </div>

          {/* Progress steps */}
          {(step === 'details' || step === 'payment') && (
            <div className={`flex items-center px-6 py-3 gap-2 shrink-0 border-b ${isDark ? 'border-brand-dark-border' : 'border-gray-50'}`}>
              {['details', 'payment'].map((s, i) => (
                <React.Fragment key={s}>
                  <div className={`flex items-center gap-1.5 text-xs font-medium ${step === s || (s === 'details' && step === 'payment') ? 'text-brand-orange' : isDark ? 'text-gray-600' : 'text-gray-300'}`}>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step === s ? 'bg-brand-orange text-white' : s === 'details' && step === 'payment' ? 'bg-brand-orange/20 text-brand-orange' : isDark ? 'bg-brand-dark-border text-gray-600' : 'bg-gray-100 text-gray-400'}`}>
                      {s === 'details' && step === 'payment' ? '✓' : i + 1}
                    </div>
                    {s === 'details' ? 'Delivery Info' : 'Payment'}
                  </div>
                  {i === 0 && <div className={`flex-1 h-px ${step === 'payment' ? 'bg-brand-orange' : isDark ? 'bg-brand-dark-border' : 'bg-gray-200'}`} />}
                </React.Fragment>
              ))}
            </div>
          )}

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto">

            {/* ── STEP 1: Delivery Details ── */}
            {step === 'details' && (
              <div className="p-6 space-y-5">
                {/* Name */}
                <div>
                  <label className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <User size={12} /> Full Name *
                  </label>
                  <input
                    value={form.name}
                    onChange={e => update('name', e.target.value)}
                    placeholder="e.g. Adaeze Okafor"
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none neon-focus ${errors.name ? 'border-red-400' : isDark ? 'bg-black/30 border-brand-dark-border text-white placeholder-gray-600 focus:border-brand-orange' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-brand-orange'}`}
                  />
                  {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                </div>

                {/* Phone */}
                <div>
                  <label className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <Phone size={12} /> Phone Number *
                  </label>
                  <input
                    value={form.phone}
                    onChange={e => update('phone', e.target.value)}
                    placeholder="08012345678"
                    type="tel"
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none neon-focus ${errors.phone ? 'border-red-400' : isDark ? 'bg-black/30 border-brand-dark-border text-white placeholder-gray-600 focus:border-brand-orange' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-brand-orange'}`}
                  />
                  {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
                </div>

                {/* Email (auto-filled, display only) */}
                <div>
                  <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Email (from account)</label>
                  <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border ${isDark ? 'bg-black/20 border-brand-dark-border' : 'bg-gray-100 border-gray-200'}`}>
                    <span className={`text-sm flex-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{form.email || 'Sign in to auto-fill'}</span>
                    <span className="text-[10px] text-brand-orange font-bold">Order notifications</span>
                  </div>
                </div>

                {/* State */}
                <div>
                  <label className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <MapPin size={12} /> State *
                  </label>
                  <div className="relative">
                    <select
                      value={form.state}
                      onChange={e => update('state', e.target.value)}
                      className={`w-full appearance-none px-4 py-3 pr-9 rounded-xl border text-sm outline-none neon-focus ${errors.state ? 'border-red-400' : isDark ? 'bg-black/30 border-brand-dark-border text-white focus:border-brand-orange' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-brand-orange'}`}
                    >
                      <option value="">Select state...</option>
                      {ALL_NIGERIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                  </div>
                  {errors.state && <p className="text-red-400 text-xs mt-1">{errors.state}</p>}
                </div>

                {/* Address with autocomplete */}
                <div ref={addressRef} className="relative">
                  <label className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <MapPin size={12} /> Delivery Address *
                  </label>
                  <div className="relative">
                    <input
                      value={addressQuery || form.address}
                      onChange={e => {
                        update('address', e.target.value)
                        setAddressQuery(e.target.value)
                        setShowSuggestions(true)
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      placeholder="Start typing your address..."
                      className={`w-full px-4 py-3 pr-10 rounded-xl border text-sm outline-none neon-focus ${errors.address ? 'border-red-400' : isDark ? 'bg-black/30 border-brand-dark-border text-white placeholder-gray-600 focus:border-brand-orange' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-brand-orange'}`}
                    />
                    {suggestLoading && <Loader size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-orange animate-spin" />}
                    {!suggestLoading && <Search size={14} className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />}
                  </div>
                  {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}

                  {/* Suggestions dropdown */}
                  <AnimatePresence>
                    {showSuggestions && suggestions.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        className={`absolute top-full left-0 right-0 mt-1 rounded-xl border shadow-xl z-50 overflow-hidden ${isDark ? 'bg-brand-dark-card border-brand-dark-border' : 'bg-white border-gray-200'}`}
                      >
                        {suggestions.map((s, i) => (
                          <button
                            key={i}
                            onClick={() => handleAddressSelect(s)}
                            className={`w-full text-left px-4 py-3 text-xs flex items-start gap-2 transition-colors border-b last:border-b-0 ${isDark ? 'border-brand-dark-border hover:bg-white/5 text-gray-300' : 'border-gray-50 hover:bg-orange-50 text-gray-700'}`}
                          >
                            <MapPin size={12} className="text-brand-orange mt-0.5 shrink-0" />
                            <span className="line-clamp-2">{s}</span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* LGA */}
                <div>
                  <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>LGA / City</label>
                  <input
                    value={form.lga}
                    onChange={e => update('lga', e.target.value)}
                    placeholder="e.g. Ikeja, Surulere, Lekki..."
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none neon-focus ${isDark ? 'bg-black/30 border-brand-dark-border text-white placeholder-gray-600 focus:border-brand-orange' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-brand-orange'}`}
                  />
                </div>

                {/* Landmark */}
                <div>
                  <label className={`text-xs font-bold uppercase tracking-wider mb-2 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Nearest Landmark (optional)</label>
                  <input
                    value={form.landmark}
                    onChange={e => update('landmark', e.target.value)}
                    placeholder="e.g. Beside First Bank, Behind the church..."
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none neon-focus ${isDark ? 'bg-black/30 border-brand-dark-border text-white placeholder-gray-600 focus:border-brand-orange' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-brand-orange'}`}
                  />
                </div>

                {/* Delivery fee preview */}
                {form.state && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className={`rounded-xl p-4 border ${delivery.fee === 0 ? 'border-green-400/30 bg-green-400/5' : isDark ? 'border-brand-orange/20 bg-brand-orange/5' : 'border-orange-100 bg-orange-50/50'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-xs font-bold ${delivery.fee === 0 ? 'text-green-400' : 'text-brand-orange'}`}>{delivery.label}</p>
                        <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Estimated delivery: {delivery.eta}</p>
                      </div>
                      <p className={`font-bold text-lg ${delivery.fee === 0 ? 'text-green-400' : isDark ? 'text-white' : 'text-gray-900'}`}>
                        {delivery.fee === 0 ? 'FREE' : `₦${delivery.fee.toLocaleString()}`}
                      </p>
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* ── STEP 2: Payment Review ── */}
            {step === 'payment' && (
              <div className="p-6 space-y-5">
                {/* Delivery summary */}
                <div className={`rounded-xl p-4 border ${isDark ? 'bg-black/30 border-brand-dark-border' : 'bg-gray-50 border-gray-100'}`}>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Delivering to</p>
                  <div className="flex items-start gap-2">
                    <MapPin size={14} className="text-brand-orange mt-0.5 shrink-0" />
                    <div>
                      <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{form.name}</p>
                      <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{form.phone}</p>
                      <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {[form.address, form.lga, form.state].filter(Boolean).join(', ')}
                      </p>
                      {form.landmark && <p className={`text-xs mt-0.5 italic ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Near: {form.landmark}</p>}
                    </div>
                  </div>
                  <button onClick={() => setStep('details')} className="text-brand-orange text-xs hover:underline mt-2">Edit details →</button>
                </div>

                {/* Order items */}
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Order Items ({cart.length})</p>
                  <div className="space-y-2">
                    {cart.map(item => (
                      <div key={`${item.id}-${item.size}`} className="flex items-center gap-3">
                        <div className="w-12 h-14 rounded-xl overflow-hidden bg-gray-800 shrink-0">
                          <img src={item.image_url || getPlaceholder(item.category)} alt={item.name} className="w-full h-full object-cover object-top" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.name}</p>
                          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Size: {item.size} × {item.qty}</p>
                        </div>
                        <p className="text-brand-orange font-bold text-sm shrink-0">₦{(item.price * item.qty).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price breakdown */}
                <div className={`rounded-xl p-4 border space-y-2 ${isDark ? 'border-brand-dark-border' : 'border-gray-100'}`}>
                  <div className="flex justify-between text-sm">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Subtotal</span>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>₦{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Delivery ({delivery.label})</span>
                    <span className={delivery.fee === 0 ? 'text-green-400 font-semibold' : isDark ? 'text-white' : 'text-gray-900'}>
                      {delivery.fee === 0 ? 'FREE' : `₦${delivery.fee.toLocaleString()}`}
                    </span>
                  </div>
                  <div className={`flex justify-between font-bold text-lg pt-2 border-t ${isDark ? 'border-brand-dark-border' : 'border-gray-100'}`}>
                    <span className={isDark ? 'text-white' : 'text-gray-900'}>Total</span>
                    <span className="text-brand-orange">₦{totalWithDelivery.toLocaleString()}</span>
                  </div>
                  <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                    Est. delivery: {delivery.eta} · Confirmation email → {form.email}
                  </p>
                </div>

                {/* Payment method */}
                <div>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Payment Method</p>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      onClick={() => setPaymentMethod('opay')}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${paymentMethod === 'opay' ? 'border-brand-orange bg-brand-orange/5' : isDark ? 'border-brand-dark-border bg-black/20' : 'border-gray-200 bg-gray-50'}`}
                    >
                      <div className="w-9 h-9 bg-brand-orange rounded-xl flex items-center justify-center shrink-0">
                        <CreditCard size={18} className="text-white" />
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>OPay</p>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Pay securely via OPay wallet, card, or bank transfer</p>
                      </div>
                      <div className={`w-4 h-4 rounded-full border-2 ml-auto shrink-0 ${paymentMethod === 'opay' ? 'border-brand-orange bg-brand-orange' : isDark ? 'border-gray-600' : 'border-gray-300'}`} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── STEP: Processing ── */}
            {step === 'processing' && (
              <div className="p-12 text-center">
                <div className="w-16 h-16 border-4 border-brand-orange/20 border-t-brand-orange rounded-full animate-spin mx-auto mb-5" />
                <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Processing your payment...</p>
                <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Please don't close this window</p>
              </div>
            )}

            {/* ── STEP: Success ── */}
            {step === 'success' && (
              <div className="p-8 text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                  className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-5"
                >
                  <CheckCircle size={40} className="text-green-400" />
                </motion.div>
                <h3 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Order Confirmed! 🔥</h3>
                <p className={`text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Order ID: <span className="text-brand-orange font-mono font-bold">#{orderId?.slice(0, 8).toUpperCase()}</span>
                </p>
                <p className={`text-xs mb-6 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Confirmation & tracking updates sent to <strong className="text-brand-orange">{form.email}</strong>
                </p>
                <div className={`rounded-xl p-4 border text-left mb-6 ${isDark ? 'bg-black/30 border-brand-dark-border' : 'bg-gray-50 border-gray-100'}`}>
                  <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>What happens next</p>
                  {[
                    { icon: '📦', text: 'We\'ll pack your order within 24 hours' },
                    { icon: '🚚', text: `Delivery to ${form.state} in ${delivery.eta}` },
                    { icon: '📲', text: 'You\'ll receive SMS & email updates' },
                    { icon: '✅', text: 'Sign in to track your order anytime' },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-2 py-1">
                      <span>{s.icon}</span>
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{s.text}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => { onClose(); window.location.href = '/orders' }}
                    className={`flex-1 py-3 border rounded-xl text-sm font-medium transition-all btn-press flex items-center justify-center gap-2 ${isDark ? 'border-brand-dark-border text-gray-300 hover:border-brand-orange hover:text-brand-orange' : 'border-gray-200 text-gray-600 hover:border-brand-orange hover:text-brand-orange'}`}
                  >
                    <Package size={15} /> Track Order
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 bg-brand-orange text-white rounded-xl text-sm font-bold btn-press shadow-lg shadow-brand-orange/25"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sticky footer CTA */}
          {(step === 'details' || step === 'payment') && (
            <div className={`p-5 border-t shrink-0 ${isDark ? 'border-brand-dark-border' : 'border-gray-100'}`}>
              {step === 'details' && (
                <button
                  onClick={() => { if (validate()) setStep('payment') }}
                  className="w-full py-4 bg-brand-orange hover:bg-brand-orange-light text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all btn-press shadow-lg shadow-brand-orange/25"
                >
                  Continue to Payment <ArrowRight size={16} />
                </button>
              )}
              {step === 'payment' && (
                <button
                  onClick={handleOpayCheckout}
                  disabled={processing}
                  className="w-full py-4 bg-brand-orange hover:bg-brand-orange-light text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all btn-press shadow-lg shadow-brand-orange/25 disabled:opacity-60"
                >
                  {processing
                    ? <><Loader size={16} className="animate-spin" /> Processing...</>
                    : <><CreditCard size={16} /> Pay ₦{totalWithDelivery.toLocaleString()} with OPay</>
                  }
                </button>
              )}
              <p className={`text-xs text-center mt-2 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                🔒 Secure payment · Order ID generated upon confirmation
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
