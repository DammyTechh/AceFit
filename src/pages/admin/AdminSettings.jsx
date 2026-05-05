import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Save, Eye, EyeOff, Loader, CheckCircle, Globe, Bell, CreditCard, Shield, Mail, Phone } from 'lucide-react'
import { useStore } from '../../lib/store'
import toast from 'react-hot-toast'

export default function AdminSettings() {
  const { theme } = useStore()
  const isDark = theme === 'dark'
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showKeys, setShowKeys] = useState({})

  const [settings, setSettings] = useState({
    supabase_url: import.meta.env.VITE_SUPABASE_URL || '',
    supabase_key: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
    resend_api_key: '',
    opay_merchant_id: '',
    opay_public_key: '',
    whatsapp_primary: '2347025692097',
    whatsapp_secondary: '2349153040271',
    store_email: 'Acefitandgainz@gmail.com',
    store_instagram: 'The_acefit',
    store_tiktok: 'The_acefit',
    notification_new_order: true,
    notification_new_ticket: true,
    notification_low_stock: true,
    notification_new_customer: false,
    free_delivery_threshold: '15000',
    store_name: 'AceFit',
    store_tagline: 'Premium Fitness Wear',
    maintenance_mode: false,
  })

  const update = (key, val) => setSettings(s => ({ ...s, [key]: val }))

  const handleSave = async () => {
    setSaving(true)
    await new Promise(r => setTimeout(r, 1000))
    setSaving(false)
    setSaved(true)
    toast.success('Settings saved!')
    setTimeout(() => setSaved(false), 3000)
  }

  const sections = [
    {
      title: 'Store Information',
      icon: Globe,
      fields: [
        { key: 'store_name', label: 'Store Name', type: 'text' },
        { key: 'store_tagline', label: 'Tagline', type: 'text' },
        { key: 'store_email', label: 'Contact Email', type: 'email' },
        { key: 'free_delivery_threshold', label: 'Free Delivery Above (₦)', type: 'number' },
      ]
    },
    {
      title: 'Contact & Social',
      icon: Phone,
      fields: [
        { key: 'whatsapp_primary', label: 'WhatsApp Primary', type: 'text' },
        { key: 'whatsapp_secondary', label: 'WhatsApp Secondary', type: 'text' },
        { key: 'store_instagram', label: 'Instagram Handle', type: 'text' },
        { key: 'store_tiktok', label: 'TikTok Handle', type: 'text' },
      ]
    },
    {
      title: 'Supabase Configuration',
      icon: Shield,
      fields: [
        { key: 'supabase_url', label: 'Supabase URL', type: 'text', secret: false },
        { key: 'supabase_key', label: 'Supabase Anon Key', type: 'text', secret: true },
      ]
    },
    {
      title: 'Email (Resend)',
      icon: Mail,
      fields: [
        { key: 'resend_api_key', label: 'Resend API Key', type: 'text', secret: true, hint: 'Get from resend.com — no domain needed for onboarding emails' },
      ]
    },
    {
      title: 'OPay Payment',
      icon: CreditCard,
      fields: [
        { key: 'opay_merchant_id', label: 'OPay Merchant ID', type: 'text', secret: true },
        { key: 'opay_public_key', label: 'OPay Public Key', type: 'text', secret: true },
      ]
    },
  ]

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`font-display text-4xl ${isDark ? 'text-white' : 'text-gray-900'}`}>SETTINGS</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Configure your AceFit store</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-orange hover:bg-brand-orange-light text-white font-semibold rounded-xl transition-all btn-press shadow-lg shadow-brand-orange/25 disabled:opacity-60"
        >
          {saving ? <Loader size={15} className="animate-spin" /> : saved ? <CheckCircle size={15} /> : <Save size={15} />}
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      {/* Maintenance mode banner */}
      <div className={`flex items-center justify-between p-4 rounded-2xl border ${settings.maintenance_mode ? 'border-red-400/30 bg-red-400/5' : isDark ? 'bg-brand-dark-card border-brand-dark-border' : 'bg-white border-gray-200'}`}>
        <div>
          <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Maintenance Mode</p>
          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {settings.maintenance_mode ? '⚠️ Store is currently offline for customers' : 'Store is live and accepting orders'}
          </p>
        </div>
        <button
          onClick={() => update('maintenance_mode', !settings.maintenance_mode)}
          className={`w-12 h-6 rounded-full transition-all relative ${settings.maintenance_mode ? 'bg-red-500' : isDark ? 'bg-brand-dark-border' : 'bg-gray-200'}`}
        >
          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${settings.maintenance_mode ? 'left-6' : 'left-0.5'}`} />
        </button>
      </div>

      {/* Settings sections */}
      {sections.map((section, si) => (
        <motion.div
          key={section.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: si * 0.08 }}
          className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-brand-dark-card border-brand-dark-border' : 'bg-white border-gray-200'}`}
        >
          <div className={`flex items-center gap-3 px-5 py-4 border-b ${isDark ? 'border-brand-dark-border bg-black/20' : 'border-gray-100 bg-gray-50'}`}>
            <div className="w-8 h-8 bg-brand-orange/10 rounded-xl flex items-center justify-center">
              <section.icon size={16} className="text-brand-orange" />
            </div>
            <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{section.title}</h3>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {section.fields.map(field => (
              <div key={field.key} className={field.key.includes('url') || field.key.includes('tagline') ? 'sm:col-span-2' : ''}>
                <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {field.label}
                </label>
                <div className="relative">
                  <input
                    type={field.secret && !showKeys[field.key] ? 'password' : field.type || 'text'}
                    value={settings[field.key] || ''}
                    onChange={e => update(field.key, e.target.value)}
                    placeholder={field.hint || ''}
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none neon-focus ${field.secret ? 'pr-10' : ''} ${isDark ? 'bg-black/30 border-brand-dark-border text-white placeholder-gray-600 focus:border-brand-orange' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-brand-orange'}`}
                  />
                  {field.secret && (
                    <button
                      type="button"
                      onClick={() => setShowKeys(k => ({ ...k, [field.key]: !k[field.key] }))}
                      className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                      {showKeys[field.key] ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  )}
                </div>
                {field.hint && !field.secret && (
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{field.hint}</p>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Notifications */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-brand-dark-card border-brand-dark-border' : 'bg-white border-gray-200'}`}
      >
        <div className={`flex items-center gap-3 px-5 py-4 border-b ${isDark ? 'border-brand-dark-border bg-black/20' : 'border-gray-100 bg-gray-50'}`}>
          <div className="w-8 h-8 bg-brand-orange/10 rounded-xl flex items-center justify-center">
            <Bell size={16} className="text-brand-orange" />
          </div>
          <h3 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Admin Notifications</h3>
        </div>
        <div className="p-5 space-y-4">
          {[
            { key: 'notification_new_order', label: 'New order placed', sub: 'Get notified when a customer places an order' },
            { key: 'notification_new_ticket', label: 'New support ticket', sub: 'Get notified when a customer raises a ticket' },
            { key: 'notification_low_stock', label: 'Low stock alert', sub: 'Alert when product stock falls below 5 units' },
            { key: 'notification_new_customer', label: 'New customer signup', sub: 'Get notified when someone creates an account' },
          ].map(n => (
            <div key={n.key} className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{n.label}</p>
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{n.sub}</p>
              </div>
              <button
                onClick={() => update(n.key, !settings[n.key])}
                className={`w-11 h-6 rounded-full transition-all relative shrink-0 ${settings[n.key] ? 'bg-brand-orange' : isDark ? 'bg-brand-dark-border' : 'bg-gray-200'}`}
              >
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all ${settings[n.key] ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Setup Guide */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl p-5 border border-brand-orange/30 bg-brand-orange/5"
      >
        <h3 className="text-brand-orange font-bold mb-3 flex items-center gap-2">
          <span>🚀</span> Quick Setup Guide
        </h3>
        <div className="space-y-2 text-sm">
          {[
            { step: '1', text: 'Create a Supabase project at supabase.com → copy URL & anon key above' },
            { step: '2', text: 'Run the SQL schema in Supabase SQL editor (see README)' },
            { step: '3', text: 'Enable Supabase Auth (Email OTP) in Authentication settings' },
            { step: '4', text: 'Create storage bucket "product-images" with public access' },
            { step: '5', text: 'Get a Resend API key at resend.com (free tier works for onboarding)' },
            { step: '6', text: 'Add your OPay merchant credentials for payment processing' },
            { step: '7', text: 'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file' },
          ].map(s => (
            <div key={s.step} className="flex items-start gap-3">
              <span className="w-5 h-5 bg-brand-orange text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0 mt-0.5">{s.step}</span>
              <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{s.text}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
