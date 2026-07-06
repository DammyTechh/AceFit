import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Search, Sun, Moon, Menu, X, Heart, ChevronDown, Dumbbell, Pill } from 'lucide-react'
import { useStore } from '../lib/store'

const COLLECTIONS = [
  { id: 'men',        label: "Men's Collection",    icon: '👕' },
  { id: 'women',      label: "Women's Collection",  icon: '👚' },
  { id: 'tracksuits', label: 'Tracksuits',           icon: '🏃' },
  { id: 'accessories',label: 'Accessories',          icon: '🎒' },
]

export default function Navbar({ onSearch, onScrollTo }) {
  const { theme, toggleTheme, cartCount, setCartOpen, setAuthModalOpen, user, clearUser, wishlist } = useStore()
  const count = cartCount()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchVal,  setSearchVal]  = useState('')
  const [scrolled,   setScrolled]   = useState(false)
  const [shopOpen,   setShopOpen]   = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const searchRef = useRef()
  const navigate  = useNavigate()
  const location  = useLocation()
  const isDark    = theme === 'dark'

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => { if (searchOpen) searchRef.current?.focus() }, [searchOpen])

  useEffect(() => {
    const params  = new URLSearchParams(location.search)
    const section = params.get('section')
    if (section) {
      setTimeout(() => document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' }), 300)
    }
  }, [location.search])

  const navBg = scrolled
    ? isDark ? 'bg-[#0A0A0A]/95 shadow-lg shadow-black/30 backdrop-blur-xl' : 'bg-white/95 shadow-lg shadow-black/10 backdrop-blur-xl'
    : 'bg-transparent backdrop-blur-sm'

  const handleSearch = (e) => {
    e.preventDefault()
    onSearch?.(searchVal)
    navigate('/')
    setSearchOpen(false)
  }

  const handleNavLink = (section) => {
    setMobileOpen(false)
    if (location.pathname !== '/') navigate(`/?section=${section}`)
    else document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleCollection = (colId) => {
    setShopOpen(false)
    setMobileOpen(false)
    navigate('/')
    setTimeout(() => onScrollTo?.(colId), 100)
  }

  const text  = isDark ? 'text-gray-300' : 'text-gray-700'
  const hover = 'hover:text-brand-orange transition-colors'

  return (
    <>
      <motion.nav
        initial={{ y: -80 }} animate={{ y: 0 }} transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}
        style={{ borderBottom: scrolled ? '1px solid rgba(255,107,0,0.1)' : 'none' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
              <img src="https://i.imgur.com/eDF88SE.png" alt="AceFit" className="h-10 md:h-12 w-auto object-contain"/>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-7">
              <Link to="/" className={`text-sm font-medium ${text} ${hover}`}>Home</Link>

              {/* Shop dropdown */}
              <div className="relative" onMouseEnter={() => setShopOpen(true)} onMouseLeave={() => setShopOpen(false)}>
                <button className={`flex items-center gap-1 text-sm font-medium ${text} ${hover}`}>
                  Shop <ChevronDown size={14} className={`transition-transform ${shopOpen ? 'rotate-180' : ''}`}/>
                </button>
                <AnimatePresence>
                  {shopOpen && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className={`absolute top-full left-0 mt-2 w-56 rounded-2xl shadow-2xl border py-2 z-50 ${isDark ? 'bg-[#141414] border-[#2A2A2A]' : 'bg-white border-gray-100'}`}>
                      {COLLECTIONS.map(c => (
                        <button key={c.id} onClick={() => handleCollection(c.id)}
                          className={`w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm ${text} ${hover} ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                          <span>{c.icon}</span> {c.label}
                        </button>
                      ))}
                      <div className={`mx-3 my-1 border-t ${isDark ? 'border-[#2A2A2A]' : 'border-gray-100'}`}/>
                      <Link to="/gainz" onClick={() => setShopOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm ${text} ${hover} ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                        <Pill size={14}/> AceGainz Supplements
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <Link to="/blog" className={`text-sm font-medium ${text} ${hover}`}>Blog</Link>
              <Link to="/gainz" className={`text-sm font-medium ${text} ${hover} flex items-center gap-1`}>
                <Pill size={14}/> Gainz
              </Link>
              <button onClick={() => handleNavLink('about')} className={`text-sm font-medium ${text} ${hover}`}>About</button>
              <button onClick={() => handleNavLink('contact')} className={`text-sm font-medium ${text} ${hover}`}>Contact</button>
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-1 md:gap-2">
              {/* Search */}
              <AnimatePresence>
                {searchOpen && (
                  <motion.form initial={{ width: 0, opacity: 0 }} animate={{ width: 200, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }} transition={{ duration: 0.2 }} onSubmit={handleSearch} className="overflow-hidden">
                    <input ref={searchRef} value={searchVal} onChange={e => setSearchVal(e.target.value)}
                      placeholder="Search..." onBlur={() => !searchVal && setSearchOpen(false)}
                      className={`w-full px-3 py-1.5 text-sm rounded-lg border outline-none ${isDark ? 'bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder-gray-500' : 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-400'}`}/>
                  </motion.form>
                )}
              </AnimatePresence>

              <button onClick={() => setSearchOpen(s => !s)}
                className={`p-2 rounded-lg transition-all ${isDark ? 'text-gray-400 hover:text-brand-orange hover:bg-[#1A1A1A]' : 'text-gray-600 hover:text-brand-orange hover:bg-gray-100'}`}>
                {searchOpen ? <X size={18}/> : <Search size={18}/>}
              </button>

              <button onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all ${isDark ? 'text-gray-400 hover:text-brand-orange hover:bg-[#1A1A1A]' : 'text-gray-600 hover:text-brand-orange hover:bg-gray-100'}`}>
                {isDark ? <Sun size={18}/> : <Moon size={18}/>}
              </button>

              <Link to="/wishlist"
                className={`relative p-2 rounded-lg transition-all hidden sm:flex ${isDark ? 'text-gray-400 hover:text-brand-orange hover:bg-[#1A1A1A]' : 'text-gray-600 hover:text-brand-orange hover:bg-gray-100'}`}>
                <Heart size={18}/>
                {wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-brand-orange text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* User menu */}
              {user ? (
                <div className="relative hidden sm:block">
                  <button onClick={() => setUserMenuOpen(s => !s)}
                    className="w-8 h-8 bg-brand-orange hover:bg-brand-orange-light rounded-full flex items-center justify-center text-white text-sm font-bold ring-2 ring-brand-orange/30 transition-all">
                    {(user.email || 'A').charAt(0).toUpperCase()}
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
                        className={`absolute right-0 top-full mt-2 w-52 rounded-xl shadow-2xl border py-2 z-50 ${isDark ? 'bg-[#141414] border-[#242424]' : 'bg-white border-gray-100'}`}>
                        <div className={`px-4 py-2.5 border-b mb-1 ${isDark ? 'border-[#242424]' : 'border-gray-100'}`}>
                          <p className={`text-xs font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.email}</p>
                          <p className="text-[10px] text-green-400 mt-0.5 font-medium">● Signed in</p>
                        </div>
                        <Link to="/orders" onClick={() => setUserMenuOpen(false)}
                          className={`flex items-center gap-2.5 px-4 py-2.5 text-sm ${text} hover:text-brand-orange transition-colors`}>
                          📦 My Orders
                        </Link>
                        <button onClick={() => { clearUser(); setUserMenuOpen(false) }}
                          className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm text-red-400 hover:text-red-300 transition-colors">
                          ← Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button onClick={() => setAuthModalOpen(true)}
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-brand-orange hover:bg-brand-orange-light rounded-lg transition-all">
                  Sign In
                </button>
              )}

              {/* Cart */}
              <button onClick={() => setCartOpen(true)}
                className="relative p-2 rounded-lg transition-all text-brand-orange hover:bg-brand-orange/10">
                <ShoppingBag size={20}/>
                <AnimatePresence>
                  {count > 0 && (
                    <motion.span key={count} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 bg-brand-orange text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                      {count > 9 ? '9+' : count}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Mobile menu */}
              <button onClick={() => setMobileOpen(s => !s)}
                className={`md:hidden p-2 rounded-lg transition-all ${isDark ? 'text-gray-400 hover:bg-[#1A1A1A]' : 'text-gray-600 hover:bg-gray-100'}`}>
                {mobileOpen ? <X size={20}/> : <Menu size={20}/>}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`md:hidden border-t overflow-hidden ${isDark ? 'bg-[#0A0A0A] border-[#2A2A2A]' : 'bg-white border-gray-200'}`}>
              <div className="px-4 py-4 space-y-1">
                <Link to="/" onClick={() => setMobileOpen(false)} className={`block py-3 text-sm font-medium border-b ${text} ${hover} ${isDark ? 'border-[#2A2A2A]' : 'border-gray-100'}`}>Home</Link>
                {COLLECTIONS.map(c => (
                  <button key={c.id} onClick={() => handleCollection(c.id)}
                    className={`block w-full text-left py-2.5 text-sm pl-3 ${text} ${hover}`}>
                    {c.icon} {c.label}
                  </button>
                ))}
                <Link to="/gainz" onClick={() => setMobileOpen(false)} className={`block py-2.5 text-sm pl-3 ${text} ${hover}`}>💊 AceGainz Supplements</Link>
                <Link to="/blog"  onClick={() => setMobileOpen(false)} className={`block py-3 text-sm font-medium border-t ${text} ${hover} ${isDark ? 'border-[#2A2A2A]' : 'border-gray-100'}`}>Blog</Link>
                <button onClick={() => handleNavLink('about')}   className={`block w-full text-left py-3 text-sm font-medium border-t ${text} ${hover} ${isDark ? 'border-[#2A2A2A]' : 'border-gray-100'}`}>About</button>
                <button onClick={() => handleNavLink('contact')} className={`block w-full text-left py-3 text-sm font-medium border-t ${text} ${hover} ${isDark ? 'border-[#2A2A2A]' : 'border-gray-100'}`}>Contact</button>
                {!user && (
                  <button onClick={() => { setAuthModalOpen(true); setMobileOpen(false) }}
                    className="w-full mt-3 py-3 bg-brand-orange text-white rounded-xl text-sm font-semibold">Sign In / Sign Up</button>
                )}
                {user && (
                  <button onClick={() => { clearUser(); setMobileOpen(false) }}
                    className="w-full mt-2 py-3 border border-red-400/30 text-red-400 rounded-xl text-sm font-medium">Sign Out</button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  )
}
