import React, { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Package, ShoppingCart, MessageSquare,
  Users, Star, Settings, Menu, X, LogOut, Sun, Moon,
  ChevronRight, Shield, AlertCircle, Eye, EyeOff
} from 'lucide-react'
import { useStore } from '../../lib/store'
import toast from 'react-hot-toast'

const NAV_ITEMS = [
  { path: '/admin',           icon: LayoutDashboard, label: 'Dashboard',        end: true },
  { path: '/admin/products',  icon: Package,         label: 'Products' },
  { path: '/admin/orders',    icon: ShoppingCart,    label: 'Orders' },
  { path: '/admin/tickets',   icon: MessageSquare,   label: 'Tickets' },
  { path: '/admin/customers', icon: Users,           label: 'Customers' },
  { path: '/admin/feedback',  icon: Star,            label: 'Feedback' },
  { path: '/admin/settings',  icon: Settings,        label: 'Settings' },
]

const ADMIN_EMAIL    = 'Admin@acefit.com'
const ADMIN_PASSWORD = 'Acefit@2026!'

export default function AdminLayout() {
  const { theme, toggleTheme } = useStore()
  const [authenticated, setAuthenticated] = useState(false)
  const [loginEmail,    setLoginEmail]    = useState('')
  const [loginPass,     setLoginPass]     = useState('')
  const [showPass,      setShowPass]      = useState(false)
  const [authLoading,   setAuthLoading]   = useState(false)
  const [authError,     setAuthError]     = useState('')
  const [sidebarOpen,   setSidebarOpen]   = useState(true)
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const isDark = theme === 'dark'
  const location = useLocation()

  // Close mobile sidebar on route change
  useEffect(() => { setMobileSidebarOpen(false) }, [location.pathname])

  useEffect(() => {
    if (sessionStorage.getItem('acefit_admin_v2') === 'true') setAuthenticated(true)
  }, [])

  const handleLogin = (e) => {
    e.preventDefault()
    setAuthError('')
    setAuthLoading(true)
    setTimeout(() => {
      if (
        loginEmail.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
        loginPass === ADMIN_PASSWORD
      ) {
        sessionStorage.setItem('acefit_admin_v2', 'true')
        setAuthenticated(true)
        toast.success('Welcome, Admin! 🔥')
      } else {
        setAuthError('Incorrect email or password.')
      }
      setAuthLoading(false)
    }, 500)
  }

  const handleLogout = () => {
    sessionStorage.removeItem('acefit_admin_v2')
    setAuthenticated(false)
    setLoginEmail('')
    setLoginPass('')
    toast.success('Logged out')
  }

  // ── Login screen ────────────────────────────────────────
  if (!authenticated) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-brand-black' : 'bg-gray-50'}`}>
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className={`w-full max-w-sm rounded-2xl overflow-hidden border ${isDark ? 'bg-[#141414] border-[#242424]' : 'bg-white border-gray-200 shadow-xl'}`}
        >
          <div className="h-1 bg-gradient-to-r from-brand-orange via-orange-400 to-yellow-400" />
          <div className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-brand-orange/10 rounded-xl flex items-center justify-center">
                <Shield size={20} className="text-brand-orange" />
              </div>
              <div>
                <img src="https://i.imgur.com/eDF88SE.png" alt="AceFit" className="h-7 w-auto mb-0.5" />
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Admin Panel</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Email</label>
                <input type="email" value={loginEmail}
                  onChange={e => { setLoginEmail(e.target.value); setAuthError('') }}
                  required autoFocus placeholder="Admin@acefit.com"
                  className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-colors ${isDark ? 'bg-black/40 border-[#2a2a2a] text-white placeholder-gray-600 focus:border-brand-orange' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-brand-orange'}`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Password</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} value={loginPass}
                    onChange={e => { setLoginPass(e.target.value); setAuthError('') }}
                    required placeholder="••••••••••"
                    className={`w-full px-4 py-3 pr-11 rounded-xl border text-sm outline-none transition-colors ${isDark ? 'bg-black/40 border-[#2a2a2a] text-white placeholder-gray-600 focus:border-brand-orange' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-brand-orange'}`}
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}>
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {authError && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-red-400/10 border border-red-400/20">
                  <AlertCircle size={13} className="text-red-400 shrink-0" />
                  <p className="text-red-400 text-xs">{authError}</p>
                </div>
              )}

              <button type="submit" disabled={authLoading}
                className="w-full py-3.5 bg-brand-orange hover:bg-brand-orange-light text-white font-bold rounded-xl transition-all btn-press shadow-lg shadow-brand-orange/25 disabled:opacity-60">
                {authLoading ? 'Signing in…' : 'Access Admin Panel'}
              </button>
            </form>

            <div className={`mt-5 p-3 rounded-xl border text-xs ${isDark ? 'border-[#242424] bg-black/20' : 'border-gray-100 bg-gray-50'}`}>
              <p className={`font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Credentials</p>
              <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>📧 Admin@acefit.com</p>
              <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>🔑 Acefit@2026!</p>
            </div>
          </div>
        </motion.div>
      </div>
    )
  }

  // ── Sidebar content (shared desktop + mobile) ──────────
  const SidebarContent = () => (
    <>
      <div className={`flex items-center justify-between p-4 border-b ${isDark ? 'border-[#1e1e1e]' : 'border-gray-100'}`}>
        <div>
          <img src="https://i.imgur.com/eDF88SE.png" alt="AceFit" className="h-7 w-auto" />
          <p className={`text-[10px] mt-0.5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Management Panel</p>
        </div>
        {/* Close button — mobile only */}
        <button onClick={() => setMobileSidebarOpen(false)}
          className={`lg:hidden p-1.5 rounded-lg ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(item => (
          <NavLink key={item.path} to={item.path} end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? 'bg-brand-orange/12 text-brand-orange'
                  : isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`
            }>
            <item.icon size={16} className="shrink-0" />
            <span>{item.label}</span>
            <ChevronRight size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </NavLink>
        ))}
      </nav>

      <div className={`p-3 border-t ${isDark ? 'border-[#1e1e1e]' : 'border-gray-100'}`}>
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-1 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
          <div className="w-7 h-7 bg-brand-orange rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">A</div>
          <div className="min-w-0">
            <p className={`text-xs font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>AceFit Admin</p>
            <p className={`text-[10px] truncate ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Admin@acefit.com</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${isDark ? 'text-gray-600 hover:text-red-400 hover:bg-red-400/8' : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}`}>
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </>
  )

  // ── Admin shell ─────────────────────────────────────────
  return (
    <div className={`flex min-h-screen ${isDark ? 'bg-brand-black' : 'bg-gray-50'}`}>

      {/* ── Desktop sidebar ── */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            className={`hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-56 z-40 border-r ${isDark ? 'bg-[#0D0D0D] border-[#1e1e1e]' : 'bg-white border-gray-200'}`}
          >
            <SidebarContent />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Mobile sidebar overlay ── */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setMobileSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'spring', damping: 26, stiffness: 300 }}
              className={`fixed left-0 top-0 bottom-0 w-56 z-50 flex flex-col border-r lg:hidden ${isDark ? 'bg-[#0D0D0D] border-[#1e1e1e]' : 'bg-white border-gray-200'}`}
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content ── */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${sidebarOpen ? 'lg:ml-56' : ''}`}>

        {/* Top bar */}
        <header className={`sticky top-0 z-30 flex items-center justify-between px-4 border-b glass ${isDark ? 'bg-brand-black/95 border-[#1e1e1e]' : 'bg-white/95 border-gray-200'}`}
          style={{ height: '52px' }}>

          {/* Left: hamburger */}
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button onClick={() => setMobileSidebarOpen(true)}
              className={`lg:hidden p-2 rounded-lg transition-colors btn-press ${isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
              <Menu size={18} />
            </button>
            {/* Desktop sidebar toggle */}
            <button onClick={() => setSidebarOpen(s => !s)}
              className={`hidden lg:flex p-2 rounded-lg transition-colors btn-press ${isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
              <Menu size={18} />
            </button>

            {/* Mobile: current page label */}
            <span className={`lg:hidden text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {NAV_ITEMS.find(n => n.end ? location.pathname === n.path : location.pathname.startsWith(n.path))?.label || 'Admin'}
            </span>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            <button onClick={toggleTheme}
              className={`p-2 rounded-lg transition-colors btn-press ${isDark ? 'text-gray-400 hover:text-white hover:bg-white/5' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
              {isDark ? <Sun size={15} /> : <Moon size={15} />}
            </button>
            <div className="w-7 h-7 bg-brand-orange rounded-full flex items-center justify-center text-white text-xs font-bold">A</div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 md:p-5 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
