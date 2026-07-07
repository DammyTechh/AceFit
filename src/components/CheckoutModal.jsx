import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MapPin, User, Phone, Mail, Loader, CheckCircle, ChevronDown, Package, ArrowRight, CreditCard, ShieldCheck } from 'lucide-react'
import { useStore } from '../lib/store'
import { supabase, sendEmail, verifyPaystackPayment } from '../lib/supabase'
import { getDeliveryFee, getDeliveryZones, ALL_NIGERIAN_STATES } from '../lib/deliveryFee'
import { FEZ_ENABLED, getFezQuote } from '../lib/fezDelivery'
import { emailTemplates } from '../lib/emailTemplates'
import { initPaystack, generateReference } from '../lib/paystack'
import toast from 'react-hot-toast'

const useAddressSuggestions = (query) => {
  const [suggestions, setSuggestions] = useState([])
  const [loading, setLoading] = useState(false)
  const debRef = useRef()
  useEffect(() => {
    if (!query || query.length < 4) { setSuggestions([]); return }
    clearTimeout(debRef.current)
    debRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=ng&limit=5&q=${encodeURIComponent(query)}`, { headers: { 'Accept-Language': 'en' } })
        const data = await res.json()
        setSuggestions(data.map(d => d.display_name))
      } catch { setSuggestions([]) }
      finally { setLoading(false) }
    }, 450)
    return () => clearTimeout(debRef.current)
  }, [query])
  return { suggestions, loading }
}

export default function CheckoutModal({ open, onClose }) {
  const { cart, cartTotal, clearCart, user, theme } = useStore()
  const isDark = theme === 'dark'
  const subtotal = cartTotal()

  const [step, setStep] = useState('details')
  const [form, setForm] = useState({
    name: user?.user_metadata?.name || '',
    phone: '', email: user?.email || '',
    address: '', state: '', lga: '', landmark: '',
  })
  const [addressQuery, setAddressQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [delivery, setDelivery] = useState({ fee: 0, eta: '', label: '', zone_id: null })
  const [zones, setZones] = useState([])
  const [processing, setProcessing] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [errors, setErrors] = useState({})
  const { suggestions, loading: suggestLoading } = useAddressSuggestions(addressQuery)

  useEffect(() => { getDeliveryZones().then(setZones) }, [])

  useEffect(() => {
    const fullAddr = [form.address, form.lga, form.state].filter(Boolean).join(', ')
    if (fullAddr.length <= 3) return
    // 1) Zone-based fee (always the baseline / fallback)
    const zoneFee = getDeliveryFee(fullAddr, subtotal, zones)
    setDelivery(zoneFee)

    // 2) Optional live quote from Fez (only if enabled and not already free)
    if (FEZ_ENABLED && form.state && zoneFee.fee > 0) {
      let cancelled = false
      getFezQuote({ state: form.state, address: fullAddr, valueOfItem: subtotal })
        .then(r => {
          if (!cancelled && r.ok) {
            setDelivery(d => ({ ...d, fee: r.fee, label: 'Delivery (live rate)' }))
          }
        })
      return () => { cancelled = true }
    }
  }, [form.address, form.state, form.lga, subtotal, zones])

  const total = subtotal + delivery.fee
  const field = (key, label, type = 'text', required = true) => (
    <div>
      <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}{required && ' *'}</label>
      <input type={type} required={required} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors ${errors[key] ? 'border-red-500' : ''} ${isDark ? 'bg-black/30 border-[#2A2A2A] text-white placeholder-gray-600 focus:border-brand-orange' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-brand-orange'}`}
        placeholder={label}/>
      {errors[key] && <p className="text-red-400 text-xs mt-1">{errors[key]}</p>}
    </div>
  )

  const validate = () => {
    const e = {}
    if (!form.name.trim())    e.name    = 'Required'
    if (!form.phone.trim())   e.phone   = 'Required'
    if (!form.email.trim())   e.email   = 'Required'
    if (!form.address.trim()) e.address = 'Required'
    if (!form.state)          e.state   = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const createOrder = async (payRef, payStatus) => {
    const orderPayload = {
      user_id: user?.id || null,
      customer_name: form.name, customer_email: form.email, customer_phone: form.phone,
      delivery_address: form.address, delivery_state: form.state,
      delivery_lga: form.lga, delivery_landmark: form.landmark,
      delivery_fee: delivery.fee, delivery_zone: delivery.zone,
      delivery_zone_id: delivery.zone_id, estimated_delivery: delivery.eta,
      items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.qty, size: i.size, color: i.color || '', image_url: i.image_url })),
      subtotal, total,
      payment_method: 'paystack',
      payment_status: payStatus,
      payment_reference: payRef,
      paystack_ref: payRef,
      status: payStatus === 'paid' ? 'processing' : 'pending',
    }
    const { data, error } = await supabase.from('orders').insert([orderPayload]).select().single()
    if (error) throw error
    return data
  }

  const handlePaystack = async () => {
    if (!validate()) return
    setProcessing(true)
    const reference = generateReference()
    try {
      await initPaystack({
        email: form.email,
        amount: total,
        reference,
        metadata: { customer_name: form.name, customer_phone: form.phone },
        onSuccess: async (response) => {
          try {
            // Verify on server
            const { ok, data: txData } = await verifyPaystackPayment(response.reference)
            const paid = ok && txData?.status === 'success'

            const order = await createOrder(response.reference, paid ? 'paid' : 'unpaid')
            setOrderId(order.id)

            // Log transaction
            await supabase.from('payment_transactions').insert([{
              order_id: order.id, reference: response.reference,
              amount: total, status: paid ? 'success' : 'failed',
              channel: txData?.channel, customer_email: form.email,
              paid_at: paid ? new Date().toISOString() : null,
            }])

            if (paid) {
              clearCart()
              setStep('success')
              // Send confirmation emails
              const confirmTpl = emailTemplates.orderConfirm({ order: { ...order, items: cart } })
              await sendEmail({ to: form.email, ...confirmTpl })
              const adminTpl = emailTemplates.adminNewOrder({ order: { ...order, items: cart } })
              await sendEmail({ to: 'acefitandgainz@gmail.com', ...adminTpl })
              toast.success('Order placed! 🎉')
            } else {
              const failTpl = emailTemplates.paymentFailed({ order, reference: response.reference })
              await sendEmail({ to: form.email, ...failTpl })
              toast.error('Payment could not be verified. Contact support.')
            }
          } catch (err) {
            toast.error('Error saving order: ' + err.message)
          } finally { setProcessing(false) }
        },
        onClose: () => { setProcessing(false); toast('Payment window closed') },
      })
    } catch (err) {
      setProcessing(false)
      if (err.message !== 'Payment cancelled') toast.error(err.message)
    }
  }

  if (!open) return null

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-end"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
        onClick={e => { if (e.target === e.currentTarget && step !== 'success') onClose() }}>

        <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className={`relative h-[100dvh] max-h-[100dvh] w-full max-w-lg flex flex-col ${isDark ? 'bg-[#0F0F0F]' : 'bg-white'}`}>

          {/* Header */}
          <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-[#2A2A2A]' : 'border-gray-200'}`}>
            <div>
              <h2 className={`font-display text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>CHECKOUT</h2>
              <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{cart.length} item{cart.length !== 1 ? 's' : ''} · ₦{total.toLocaleString()}</p>
            </div>
            {step !== 'success' && <button onClick={onClose} className="p-2 rounded-xl hover:bg-brand-orange/10 text-gray-400 hover:text-brand-orange transition-all"><X size={20}/></button>}
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6">

            {/* Success */}
            {step === 'success' && (
              <div className="text-center py-12">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                  <CheckCircle size={64} className="text-green-400 mx-auto mb-4"/>
                </motion.div>
                <h3 className={`font-display text-3xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>ORDER PLACED!</h3>
                <p className={`text-sm mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Order #{orderId?.slice(0,8).toUpperCase()}</p>
                <p className={`text-sm mb-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Confirmation sent to {form.email}</p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>ETA: {delivery.eta}</p>
                <button onClick={onClose} className="mt-8 px-8 py-3 bg-brand-orange text-white font-bold rounded-2xl hover:bg-brand-orange-light transition-all">
                  Continue Shopping
                </button>
              </div>
            )}

            {/* Details form */}
            {step === 'details' && (
              <div className="space-y-4">
                <h3 className={`font-semibold text-sm uppercase tracking-wider mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Delivery Information</h3>
                {field('name', 'Full Name')}
                <div className="grid grid-cols-2 gap-3">
                  {field('phone', 'Phone Number')}
                  {field('email', 'Email', 'email')}
                </div>

                {/* Address autocomplete */}
                <div className="relative">
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Delivery Address *</label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-orange"/>
                    <input value={addressQuery || form.address}
                      onChange={e => { setAddressQuery(e.target.value); setForm(f => ({ ...f, address: e.target.value })); setShowSuggestions(true) }}
                      placeholder="Start typing your address..."
                      className={`w-full pl-9 pr-4 py-3 rounded-xl border text-sm outline-none ${isDark ? 'bg-black/30 border-[#2A2A2A] text-white placeholder-gray-600 focus:border-brand-orange' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-brand-orange'}`}/>
                  </div>
                  {showSuggestions && suggestions.length > 0 && (
                    <div className={`absolute z-20 w-full mt-1 rounded-xl border shadow-xl overflow-hidden ${isDark ? 'bg-[#1A1A1A] border-[#2A2A2A]' : 'bg-white border-gray-200'}`}>
                      {suggestions.map((s, i) => (
                        <button key={i} onClick={() => { setForm(f => ({ ...f, address: s })); setAddressQuery(s); setShowSuggestions(false) }}
                          className={`w-full text-left px-4 py-2.5 text-xs transition-colors ${isDark ? 'text-gray-300 hover:bg-white/5' : 'text-gray-700 hover:bg-gray-50'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* State select */}
                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>State *</label>
                  <div className="relative">
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                    <select value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-xl border text-sm outline-none appearance-none ${errors.state ? 'border-red-500' : ''} ${isDark ? 'bg-black/30 border-[#2A2A2A] text-white focus:border-brand-orange' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-brand-orange'}`}>
                      <option value="">Select State</option>
                      {ALL_NIGERIAN_STATES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {field('lga', 'LGA / Area', 'text', false)}
                  {field('landmark', 'Landmark', 'text', false)}
                </div>

                {/* Delivery fee display */}
                {form.state && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-xl border ${isDark ? 'bg-black/20 border-[#2A2A2A]' : 'bg-gray-50 border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{delivery.label || 'Delivery'}</span>
                      <span className={`text-sm font-bold ${delivery.fee === 0 ? 'text-green-400' : isDark ? 'text-white' : 'text-gray-900'}`}>
                        {delivery.fee === 0 ? 'FREE 🎉' : `₦${delivery.fee.toLocaleString()}`}
                      </span>
                    </div>
                    {delivery.eta && <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>ETA: {delivery.eta}</p>}
                  </motion.div>
                )}

                {/* Order summary */}
                <div className={`rounded-xl border p-4 space-y-2 ${isDark ? 'border-[#2A2A2A]' : 'border-gray-200'}`}>
                  {cart.map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{item.name} × {item.qty}{item.size ? ` (${item.size})` : ''}</span>
                      <span className="text-brand-orange font-semibold">₦{(item.price * item.qty).toLocaleString()}</span>
                    </div>
                  ))}
                  <div className={`pt-2 border-t flex justify-between font-bold ${isDark ? 'border-[#2A2A2A] text-white' : 'border-gray-200 text-gray-900'}`}>
                    <span>Total</span>
                    <span className="text-brand-orange">₦{total.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer CTA */}
          {step === 'details' && (
            <div className={`p-6 border-t ${isDark ? 'border-[#2A2A2A]' : 'border-gray-200'}`}>
              <button onClick={handlePaystack} disabled={processing}
                className="w-full py-4 bg-brand-orange hover:bg-brand-orange-light text-white font-bold rounded-2xl flex items-center justify-center gap-3 transition-all shadow-lg shadow-brand-orange/25 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95">
                {processing
                  ? <><Loader size={18} className="animate-spin"/> Processing…</>
                  : <><CreditCard size={18}/> Pay ₦{total.toLocaleString()} with Paystack</>
                }
              </button>
              <p className={`flex items-center justify-center gap-1.5 text-center text-xs mt-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                <ShieldCheck size={13} className="text-green-500"/> Secured by Paystack · Card, Bank Transfer, USSD
              </p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
