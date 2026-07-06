import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Package, ShoppingBag, MessageSquare, Users,
  Star, Settings, BookOpen, Truck, CreditCard, Image, Menu, X,
  LogOut, ChevronRight, Bell, Pill
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

const NAV = [
  { to: '/admin',           label: 'Dashboard',    icon: LayoutDashboard, end: true },
  { to: '/admin/products',  label: 'Products',     icon: Package },
  { to: '/admin/orders',    label: 'Orders',       icon: ShoppingBag },
  { to: '/admin/payments',  label: 'Payments',     icon: CreditCard },
  { to: '/admin/customers', label: 'Customers',    icon: Users },
  { to: '/admin/tickets',   label: 'Support',      icon: MessageSquare },
  { to: '/admin/feedback',  label: 'Reviews',      icon: Star },
  { to: '/admin/blog',      label: 'Blog',         icon: BookOpen },
  { to: '/admin/hero',      label: 'Hero Slides',  icon: Image },
  { to: '/admin/delivery',  label: 'Delivery Zones', icon: Truck },
  { to: '/admin/settings',  label: 'Settings',     icon: Settings },
]

const ADMIN_EMAIL    = import.meta.env.VITE_ADMIN_EMAIL    || 'admin@acefit.com'
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'AceFit@2026!'

export default function AdminLayout() {
  const [authed, setAuthed] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [loginError, setLoginError] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [badgeCounts, setBadgeCounts] = useState({ orders: 0, tickets: 0 })
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const ok = sessionStorage.getItem('acefit_admin') === 'true'
    setAuthed(ok)
  }, [])

  useEffect(() => {
    if (!authed) return
    // Load badge counts
    Promise.all([
      supabase.from('orders').select('id', { count: 'exact' }).eq('status', 'pending'),
      supabase.from('support_tickets').select('id', { count: 'exact' }).eq('status', 'open'),
    ]).then(([{ count: orders }, { count: tickets }]) => {
      setBadgeCounts({ orders: orders || 0, tickets: tickets || 0 })
    })
  }, [authed, location.pathname])

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoginError('')
    // Check against env vars first, then DB
    const emailMatch    = loginForm.email === ADMIN_EMAIL
    const passwordMatch = loginForm.password === ADMIN_PASSWORD
    if (emailMatch && passwordMatch) {
      sessionStorage.setItem('acefit_admin', 'true')
      setAuthed(true)
      return
    }
    // Try DB verification
    try {
      const { data, error } = await supabase.rpc('verify_admin', {
        p_email: loginForm.email, p_password: loginForm.password
      })
      if (!error && data === true) {
        sessionStorage.setItem('acefit_admin', 'true')
        setAuthed(true)
      } else {
        setLoginError('Invalid email or password')
      }
    } catch {
      setLoginError('Invalid email or password')
    }
  }

  const handleLogout = () => {
    sessionStorage.removeItem('acefit_admin')
    setAuthed(false)
    navigate('/admin')
  }

  if (!authed) return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-[#141414] rounded-2xl border border-[#2A2A2A] overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-brand-orange to-orange-400"/>
        <div className="p-8">
          <img src="https://i.imgur.com/eDF88SE.png" alt="AceFit" className="h-12 mb-8"/>
          <h1 className="text-white font-bold text-xl mb-1">Admin Panel</h1>
          <p className="text-gray-500 text-sm mb-8">Sign in to manage AceFit</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="email" required placeholder="Admin email" value={loginForm.email}
              onChange={e => setLoginForm(f => ({ ...f, email: e.target.value }))}
              className="w-full px-4 py-3 bg-black/40 border border-[#2A2A2A] rounded-xl text-white text-sm outline-none focus:border-brand-orange placeholder-gray-600"/>
            <input type="password" required placeholder="Password" value={loginForm.password}
              onChange={e => setLoginForm(f => ({ ...f, password: e.target.value }))}
              className="w-full px-4 py-3 bg-black/40 border border-[#2A2A2A] rounded-xl text-white text-sm outline-none focus:border-brand-orange placeholder-gray-600"/>
            {loginError && <p className="text-red-400 text-xs">{loginError}</p>}
            <button type="submit" className="w-full py-3 bg-brand-orange text-white font-bold rounded-xl hover:bg-orange-500 transition-all">
              Sign In
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setSidebarOpen(false)}/>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-30 w-60 bg-[#0F0F0F] border-r border-[#1A1A1A] flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 border-b border-[#1A1A1A] flex items-center justify-between">
          <img src="https://i.imgur.com/eDF88SE.png" alt="AceFit" className="h-9"/>
          <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(false)}><X size={18}/></button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium mb-0.5 transition-all group ${
                  isActive ? 'bg-brand-orange/15 text-brand-orange' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
              <Icon size={16} className="shrink-0"/>
              <span className="flex-1">{label}</span>
              {label === 'Orders' && badgeCounts.orders > 0 && (
                <span className="px-1.5 py-0.5 bg-brand-orange text-white text-[10px] font-bold rounded-full">{badgeCounts.orders}</span>
              )}
              {label === 'Support' && badgeCounts.tickets > 0 && (
                <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">{badgeCounts.tickets}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[#1A1A1A]">
          <button onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2.5 text-sm text-red-400 hover:bg-red-400/10 rounded-xl transition-all">
            <LogOut size={15}/> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-[#0F0F0F] border-b border-[#1A1A1A] px-6 py-4 flex items-center justify-between sticky top-0 z-10">
          <button className="lg:hidden text-gray-400 hover:text-white" onClick={() => setSidebarOpen(true)}>
            <Menu size={20}/>
          </button>
          <div className="hidden lg:block">
            <nav className="flex items-center gap-2 text-xs text-gray-500">
              <span>Admin</span>
              <ChevronRight size={10}/>
              <span className="text-white capitalize">{location.pathname.split('/').pop() || 'Dashboard'}</span>
            </nav>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <a href="/" target="_blank" className="text-xs text-gray-500 hover:text-brand-orange transition-colors">View Store ↗</a>
            <div className="w-8 h-8 bg-brand-orange rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet/>
        </main>
      </div>
    </div>
  )
}
