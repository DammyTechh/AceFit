import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Search, Sun, Moon, Menu, X, Heart, User, ChevronDown } from 'lucide-react'
import { useStore } from '../lib/store'

const CATEGORIES = [
  { id: 'all', label: 'All Products' },
  { id: 'tshirts', label: 'T-Shirts' },
  { id: 'joggers', label: 'Joggers' },
  { id: 'hoodies', label: 'Hoodies' },
  { id: 'shorts', label: 'Shorts' },
  { id: 'leggings', label: 'Leggings' },
  { id: 'sports-bra', label: 'Sports Bra' },
  { id: 'tank-tops', label: 'Tank Tops' },
  { id: 'tracksuits', label: 'Tracksuits' },
  { id: 'accessories', label: 'Accessories' },
]

export default function Navbar({ onSearch, onScrollTo }) {
  const { theme, toggleTheme, cartCount, setCartOpen, setAuthModalOpen, user, clearUser, wishlist } = useStore()
  const count = cartCount()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchVal, setSearchVal] = useState('')
  const [scrolled, setScrolled] = useState(false)
  const [catOpen, setCatOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const searchRef = useRef()
  const navigate = useNavigate()
  const location = useLocation()
  const isDark = theme === 'dark'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  // Handle hash/section scrolling after navigation
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const section = params.get('section')
    if (section) {
      setTimeout(() => {
        const el = document.getElementById(section)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 300)
    }
  }, [location.search])

  const bg = scrolled
    ? isDark ? 'bg-brand-black/95 shadow-lg shadow-black/30' : 'bg-white/95 shadow-lg shadow-black/10'
    : 'bg-transparent'

  const handleSearch = (e) => {
    e.preventDefault()
    onSearch?.(searchVal)
    navigate('/')
    setSearchOpen(false)
  }

  const handleNavLink = (section) => {
    setMobileOpen(false)
    if (location.pathname !== '/') {
      navigate(`/?section=${section}`)
    } else {
      const el = document.getElementById(section)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleShopCategory = (catId) => {
    setCatOpen(false)
    setMobileOpen(false)
    navigate('/')
    setTimeout(() => {
      onScrollTo?.(catId)
    }, 100)
  }

  const textColor = isDark ? 'text-gray-300' : 'text-gray-700'
  const hoverColor = 'hover:text-brand-orange'

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 glass ${bg}`}
        style={{ borderBottom: scrolled ? '1px solid rgba(255,107,0,0.1)' : 'none' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group" onClick={() => setMobileOpen(false)}>
              <img src="https://i.imgur.com/eDF88SE.png" alt="AceFit" className="h-10 md:h-12 w-auto object-contain" />
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              <Link to="/" className={`text-sm font-medium transition-colors ${textColor} ${hoverColor}`}>Home</Link>

              {/* Shop dropdown */}
              <div className="relative" onMouseEnter={() => setCatOpen(true)} onMouseLeave={() => setCatOpen(false)}>
                <button className={`flex items-center gap-1 text-sm font-medium transition-colors ${hoverColor} ${textColor}`}>
                  Shop <ChevronDown size={14} className={`transition-transform duration-200 ${catOpen ? 'rotate-180' : ''}`} />
                </button>
                <AnimatePresence>
                  {catOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className={`absolute top-full left-0 mt-2 w-52 rounded-xl shadow-2xl border py-2 z-50 ${isDark ? 'bg-brand-dark-card border-brand-dark-border' : 'bg-white border-gray-100'}`}
                    >
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => handleShopCategory(cat.id)}
                          className={`w-full text-left block px-4 py-2.5 text-sm transition-colors ${hoverColor} ${isDark ? 'text-gray-300 hover:bg-white/5' : 'text-gray-700 hover:bg-gray-50'}`}
                        >
                          {cat.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => handleNavLink('about')}
                className={`text-sm font-medium transition-colors ${textColor} ${hoverColor}`}
              >
                About
              </button>
              <button
                onClick={() => handleNavLink('contact')}
                className={`text-sm font-medium transition-colors ${textColor} ${hoverColor}`}
              >
                Contact
              </button>
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-1 md:gap-2">

              {/* Search */}
              <AnimatePresence>
                {searchOpen && (
                  <motion.form
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 200, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onSubmit={handleSearch}
                    className="overflow-hidden"
                  >
                    <input
                      ref={searchRef}
                      value={searchVal}
                      onChange={e => setSearchVal(e.target.value)}
                      placeholder="Search products..."
                      className={`w-full px-3 py-1.5 text-sm rounded-lg border outline-none ${isDark ? 'bg-brand-dark-card border-brand-dark-border text-white placeholder-gray-500' : 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-400'}`}
                      onBlur={() => !searchVal && setSearchOpen(false)}
                    />
                  </motion.form>
                )}
              </AnimatePresence>

              <button
                onClick={() => setSearchOpen(s => !s)}
                className={`p-2 rounded-lg transition-all btn-press ${isDark ? 'text-gray-400 hover:bg-brand-dark-card hover:text-brand-orange' : 'text-gray-600 hover:bg-gray-100 hover:text-brand-orange'}`}
              >
                {searchOpen ? <X size={18} /> : <Search size={18} />}
              </button>

              {/* Theme */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-all btn-press ${isDark ? 'text-gray-400 hover:bg-brand-dark-card hover:text-brand-orange' : 'text-gray-600 hover:bg-gray-100 hover:text-brand-orange'}`}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className={`relative p-2 rounded-lg transition-all btn-press hidden sm:flex ${isDark ? 'text-gray-400 hover:bg-brand-dark-card hover:text-brand-orange' : 'text-gray-600 hover:bg-gray-100 hover:text-brand-orange'}`}
              >
                <Heart size={18} />
                {wishlist.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-brand-orange text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {wishlist.length}
                  </span>
                )}
              </Link>

              {/* User — shows avatar when logged in, Sign In button when not */}
              {user ? (
                <div className="relative hidden sm:block">
                  <button onClick={() => setUserMenuOpen(s => !s)}
                    className="w-8 h-8 bg-brand-orange hover:bg-brand-orange-light rounded-full flex items-center justify-center text-white text-sm font-bold transition-all btn-press ring-2 ring-brand-orange/30"
                    title={user.email}>
                    {(user.email || 'A').charAt(0).toUpperCase()}
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} exit={{opacity:0,y:8}}
                        className={`absolute right-0 top-full mt-2 w-52 rounded-xl shadow-2xl border py-2 z-50 ${isDark?'bg-[#141414] border-[#242424]':'bg-white border-gray-100'}`}>
                        <div className={`px-4 py-2.5 border-b mb-1 ${isDark?'border-[#242424]':'border-gray-100'}`}>
                          <p className={`text-xs font-semibold truncate ${isDark?'text-white':'text-gray-900'}`}>{user.email}</p>
                          <p className="text-[10px] text-green-400 mt-0.5 font-medium">● Signed in</p>
                        </div>
                        <Link to="/orders" onClick={() => setUserMenuOpen(false)}
                          className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors hover:text-brand-orange ${isDark?'text-gray-300':'text-gray-700'}`}>
                          📦 My Orders
                        </Link>
                        <button onClick={() => { clearUser(); setUserMenuOpen(false); }}
                          className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm text-red-400 hover:text-red-300 transition-colors">
                          ← Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button onClick={() => setAuthModalOpen(true)}
                  className="hidden sm:flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-brand-orange hover:bg-brand-orange-light rounded-lg transition-all btn-press">
                  Sign In
                </button>
              )}

              {/* Cart */}
              <button
                onClick={() => setCartOpen(true)}
                className="relative p-2 rounded-lg transition-all btn-press text-brand-orange hover:bg-brand-orange/10"
              >
                <ShoppingBag size={20} />
                <AnimatePresence>
                  {count > 0 && (
                    <motion.span
                      key={count}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-0.5 -right-0.5 bg-brand-orange text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold"
                    >
                      {count > 9 ? '9+' : count}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(s => !s)}
                className={`md:hidden p-2 rounded-lg transition-all btn-press ${isDark ? 'text-gray-400 hover:bg-brand-dark-card' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`md:hidden border-t overflow-hidden ${isDark ? 'bg-brand-black border-brand-dark-border' : 'bg-white border-gray-200'}`}
            >
              <div className="px-4 py-4 space-y-1">
                <Link to="/" onClick={() => setMobileOpen(false)}
                  className={`block py-3 text-sm font-medium border-b transition-colors ${hoverColor} ${isDark ? 'text-gray-300 border-brand-dark-border' : 'text-gray-700 border-gray-100'}`}>
                  Home
                </Link>
                {CATEGORIES.slice(1).map(cat => (
                  <button key={cat.id} onClick={() => handleShopCategory(cat.id)}
                    className={`block w-full text-left py-2.5 text-sm transition-colors ${hoverColor} ${isDark ? 'text-gray-400' : 'text-gray-500'} pl-3`}>
                    — {cat.label}
                  </button>
                ))}
                <button onClick={() => handleNavLink('about')}
                  className={`block w-full text-left py-3 text-sm font-medium border-t transition-colors ${hoverColor} ${isDark ? 'text-gray-300 border-brand-dark-border' : 'text-gray-700 border-gray-100'}`}>
                  About
                </button>
                <button onClick={() => handleNavLink('contact')}
                  className={`block w-full text-left py-3 text-sm font-medium border-t transition-colors ${hoverColor} ${isDark ? 'text-gray-300 border-brand-dark-border' : 'text-gray-700 border-gray-100'}`}>
                  Contact
                </button>
                {!user && (
                  <button
                    onClick={() => { setAuthModalOpen(true); setMobileOpen(false) }}
                    className="w-full mt-3 py-3 bg-brand-orange text-white rounded-xl text-sm font-semibold"
                  >
                    Sign In / Sign Up
                  </button>
                )}
                {user && (
                  <button onClick={() => { clearUser(); setMobileOpen(false) }}
                    className="w-full mt-2 py-3 border border-red-400/30 text-red-400 rounded-xl text-sm font-medium">
                    Sign Out
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  )
}
