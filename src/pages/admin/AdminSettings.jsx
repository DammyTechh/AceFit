import React, { useState } from 'react'
import { Save, Loader, Eye, EyeOff, RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const inp = `w-full px-3 py-2.5 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-white text-sm outline-none focus:border-brand-orange placeholder-gray-600`

export default function AdminSettings() {
  const [saving, setSaving] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' })
  const [changingPw, setChangingPw] = useState(false)

  const handleChangePw = async () => {
    if (pwForm.newPw !== pwForm.confirm) return toast.error('Passwords do not match')
    if (pwForm.newPw.length < 8) return toast.error('Password must be at least 8 characters')
    setChangingPw(true)
    try {
      const { error } = await supabase.rpc('update_admin_password', {
        p_email: import.meta.env.VITE_ADMIN_EMAIL || 'admin@acefit.com',
        p_old_password: pwForm.current,
        p_new_password: pwForm.newPw,
      })
      if (error) throw error
      toast.success('Password updated!')
      setPwForm({ current: '', newPw: '', confirm: '' })
    } catch (err) {
      toast.error('Failed: ' + err.message)
    } finally { setChangingPw(false) }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-white text-2xl font-bold">Settings</h1>
        <p className="text-gray-500 text-sm mt-1">Configure your AceFit store</p>
      </div>

      {/* Store Info */}
      <section className="bg-[#141414] rounded-2xl border border-[#2A2A2A] p-6">
        <h2 className="text-white font-semibold mb-5">Store Information</h2>
        <div className="space-y-4">
          {[
            ['Store Name', 'AceFit', 'text'],
            ['Contact Email', 'acefitandgainz@gmail.com', 'email'],
            ['WhatsApp Number', '07025692097', 'text'],
            ['WhatsApp Number 2', '09153040271', 'text'],
            ['Instagram Handle', '@acefit.shop', 'text'],
            ['TikTok Handle', '@the_acefit', 'text'],
            ['Snapchat Handle', '@acefit_official', 'text'],
          ].map(([label, placeholder, type]) => (
            <div key={label}>
              <label className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-1.5">{label}</label>
              <input type={type} placeholder={placeholder} className={inp}/>
            </div>
          ))}
          <button className="flex items-center gap-2 px-5 py-2.5 bg-brand-orange text-white rounded-xl text-sm font-semibold hover:bg-orange-500 transition-all">
            <Save size={14}/> Save Info
          </button>
        </div>
      </section>

      {/* Environment Variables Guide */}
      <section className="bg-[#141414] rounded-2xl border border-[#2A2A2A] p-6">
        <h2 className="text-white font-semibold mb-2">Environment Variables</h2>
        <p className="text-gray-500 text-xs mb-5">Set these in Netlify → Site Settings → Environment Variables (or .env for local dev)</p>
        <div className="space-y-3">
          {[
            ['VITE_SUPABASE_URL', 'https://xxx.supabase.co', 'Your Supabase project URL'],
            ['VITE_SUPABASE_ANON_KEY', 'eyJ...', 'Supabase anon/public key'],
            ['VITE_PAYSTACK_PUBLIC_KEY', 'pk_live_...', 'Paystack live public key'],
            ['VITE_ADMIN_EMAIL', 'admin@acefit.com', 'Admin login email'],
            ['VITE_ADMIN_PASSWORD', 'AceFit@2026!', 'Admin login password'],
            ['VITE_APP_URL', 'https://acefit.netlify.app', 'Your live site URL'],
          ].map(([key, val, desc]) => (
            <div key={key} className="bg-[#0A0A0A] rounded-xl p-3 font-mono">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-brand-orange text-xs font-bold">{key}</p>
                  <p className="text-gray-500 text-[10px] mt-0.5 font-sans">{desc}</p>
                </div>
                <code className="text-gray-400 text-[10px] mt-0.5 shrink-0">{val}</code>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Supabase Edge Function Secrets */}
      <section className="bg-[#141414] rounded-2xl border border-[#2A2A2A] p-6">
        <h2 className="text-white font-semibold mb-2">Supabase Edge Function Secrets</h2>
        <p className="text-gray-500 text-xs mb-5">Run these in your terminal after installing Supabase CLI</p>
        <div className="bg-[#0A0A0A] rounded-xl p-4 font-mono text-xs space-y-1.5 text-gray-300">
          <p className="text-gray-500"># Install CLI: npm install -g supabase</p>
          <p className="text-gray-500"># Login: supabase login</p>
          <p className="text-gray-500"># Link project: supabase link --project-ref YOUR_REF</p>
          <p className="text-brand-orange">supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx</p>
          <p className="text-brand-orange">supabase secrets set PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxx</p>
          <p className="text-brand-orange">supabase functions deploy send-email --no-verify-jwt</p>
        </div>
        <div className="mt-4 p-3 bg-yellow-400/5 border border-yellow-400/20 rounded-xl">
          <p className="text-yellow-400 text-xs font-bold mb-1">📧 Resend Domain Note</p>
          <p className="text-gray-400 text-xs">Until you verify a domain in Resend (resend.com/domains), emails will be sent from <code className="text-brand-orange">onboarding@resend.dev</code>. Once verified, update <code className="text-brand-orange">FROM_EMAIL</code> in the edge function to <code className="text-brand-orange">AceFit &lt;noreply@yourdomain.com&gt;</code></p>
        </div>
      </section>

      {/* Storage Setup */}
      <section className="bg-[#141414] rounded-2xl border border-[#2A2A2A] p-6">
        <h2 className="text-white font-semibold mb-2">Storage Setup</h2>
        <p className="text-gray-500 text-xs mb-4">Create this bucket in Supabase → Storage</p>
        <div className="bg-[#0A0A0A] rounded-xl p-4 space-y-2">
          {[
            ['Bucket Name', 'acefit-media'],
            ['Public', 'Yes (toggle ON)'],
            ['File size limit', '10MB'],
            ['Allowed types', 'image/jpeg, image/png, image/webp, image/gif'],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between text-xs">
              <span className="text-gray-500">{k}</span>
              <code className="text-brand-orange">{v}</code>
            </div>
          ))}
        </div>
      </section>

      {/* Change Admin Password */}
      <section className="bg-[#141414] rounded-2xl border border-[#2A2A2A] p-6">
        <h2 className="text-white font-semibold mb-5">Change Admin Password</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-1.5">Current Password</label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} value={pwForm.current} onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))} className={inp + ' pr-10'}/>
              <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white">
                {showPass ? <EyeOff size={14}/> : <Eye size={14}/>}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-1.5">New Password</label>
            <input type="password" value={pwForm.newPw} onChange={e => setPwForm(f => ({ ...f, newPw: e.target.value }))} className={inp}/>
          </div>
          <div>
            <label className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-1.5">Confirm New Password</label>
            <input type="password" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} className={inp}/>
          </div>
          <button onClick={handleChangePw} disabled={changingPw}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-orange text-white rounded-xl text-sm font-semibold hover:bg-orange-500 transition-all disabled:opacity-60">
            {changingPw ? <><Loader size={14} className="animate-spin"/>Changing…</> : <><RefreshCw size={14}/> Change Password</>}
          </button>
        </div>
      </section>

      {/* Deployment Checklist */}
      <section className="bg-[#141414] rounded-2xl border border-[#2A2A2A] p-6">
        <h2 className="text-white font-semibold mb-4">🚀 Deployment Checklist</h2>
        <div className="space-y-2">
          {[
            'Run acefit-migration-FINAL-v5.sql in Supabase SQL Editor',
            'Create storage bucket: acefit-media (public)',
            'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Netlify',
            'Set VITE_PAYSTACK_PUBLIC_KEY (live key from Paystack dashboard)',
            'Set VITE_ADMIN_EMAIL and VITE_ADMIN_PASSWORD in Netlify',
            'Deploy edge function: supabase functions deploy send-email --no-verify-jwt',
            'Set RESEND_API_KEY and PAYSTACK_SECRET_KEY as Supabase secrets',
            'Enable Email OTP in Supabase → Auth → Providers → Email',
            'Set your live domain in Supabase → Auth → URL Configuration',
            'Add netlify.toml for SPA routing (already included)',
            'Test a checkout end-to-end with Paystack test keys first',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <span className="w-5 h-5 bg-brand-orange/10 text-brand-orange text-xs font-bold rounded flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
              <span className="text-gray-300">{item}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
