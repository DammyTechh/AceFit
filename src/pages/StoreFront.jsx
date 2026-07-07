import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingBag, Heart, Star, Filter, X, Search, SlidersHorizontal, Check, ChevronDown } from 'lucide-react'
import { useStore } from '../lib/store'
import { supabase } from '../lib/supabase'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import Footer from '../components/Footer'
import CartSidebar from '../components/CartSidebar'
import CheckoutModal from '../components/CheckoutModal'
import AuthModal from '../components/AuthModal'
import SupportChatbot from '../components/SupportChatbot'
import FeedbackSection from '../components/FeedbackSection'
import CategoriesSection from '../components/CategoriesSection'
import BannerSection from '../components/BannerSection'
import { colorToHex, previewImageFor, tintOverlayStyle } from '../lib/colors'
import { FaWhatsapp, FaInstagram, FaEnvelope } from 'react-icons/fa'
import toast from 'react-hot-toast'

const COLLECTIONS = [
  { id: 'all',         label: 'All',           emoji: '🔥' },
  { id: 'men',         label: "Men's",         emoji: '👕' },
  { id: 'women',       label: "Women's",       emoji: '👚' },
  { id: 'tracksuits',  label: 'Tracksuits',    emoji: '🏃' },
  { id: 'accessories', label: 'Accessories',   emoji: '🎒' },
]

const SORT_OPTIONS = [
  { id: 'newest',    label: 'Newest' },
  { id: 'price-asc', label: 'Price: Low → High' },
  { id: 'price-desc',label: 'Price: High → Low' },
  { id: 'rating',    label: 'Top Rated' },
  { id: 'bestseller',label: 'Bestsellers' },
]

function ProductCard({ product, onAddToCart, onQuickView }) {
  const { toggleWishlist, isWishlisted, theme } = useStore()
  const wishlisted = isWishlisted(product.id)
  const isDark = theme === 'dark'
  const discount = product.original_price ? Math.round((1 - product.price / product.original_price) * 100) : 0
  const [activeColor, setActiveColor] = useState(null)
  const cardImg = previewImageFor(product, activeColor)
  const cardTint = tintOverlayStyle(product, activeColor)

  return (
    <motion.div layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
      className={`group relative rounded-2xl overflow-hidden border transition-all cursor-pointer tilt-card glow-orange ${isDark ? 'bg-[#141414] border-[#2A2A2A] hover:border-brand-orange/40' : 'bg-white border-gray-200 hover:border-brand-orange/40'}`}
      onClick={() => onQuickView(product)}>

      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden">
        {cardImg
          ? <>
              <img src={cardImg} alt={product.name} className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500" loading="lazy"/>
              {cardTint && <div className="absolute inset-0" style={cardTint}/>}
            </>
          : <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-[#1A1A1A]' : 'bg-gray-100'}`}><ShoppingBag size={40} className="text-brand-orange/40"/></div>}

        {/* Overlay actions */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
          <button
            onClick={e => { e.stopPropagation(); onAddToCart(product) }}
            className="flex-1 py-2.5 bg-brand-orange text-white text-xs font-bold rounded-xl hover:bg-brand-orange-light transition-all flex items-center justify-center gap-1.5">
            <ShoppingBag size={13}/> Add to Cart
          </button>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.is_new && <span className="px-2 py-1 bg-brand-orange text-white text-[10px] font-bold rounded-lg">NEW</span>}
          {product.is_bestseller && <span className="px-2 py-1 bg-yellow-500 text-white text-[10px] font-bold rounded-lg">🔥 HOT</span>}
          {discount > 0 && <span className="px-2 py-1 bg-green-500 text-white text-[10px] font-bold rounded-lg">-{discount}%</span>}
          {product.stock === 0 && <span className="px-2 py-1 bg-red-500/80 text-white text-[10px] font-bold rounded-lg">Sold Out</span>}
        </div>

        {/* Wishlist */}
        <button
          onClick={e => { e.stopPropagation(); toggleWishlist(product); toast(wishlisted ? 'Removed from wishlist' : '❤️ Added to wishlist') }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${wishlisted ? 'bg-brand-orange text-white' : isDark ? 'bg-black/60 text-gray-400 hover:bg-brand-orange hover:text-white' : 'bg-white/80 text-gray-400 hover:bg-brand-orange hover:text-white'}`}>
          <Heart size={14} className={wishlisted ? 'fill-white' : ''}/>
        </button>
      </div>

      {/* Info */}
      <div className="p-4">
        <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{product.collection}</p>
        <h3 className={`font-semibold text-sm mb-2 line-clamp-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{product.name}</h3>

        {/* Colors — tap a swatch to preview that color on the item */}
        {product.colors?.length > 0 && (
          <div className="flex items-center gap-1.5 mb-2">
            {product.colors.slice(0, 5).map(c => (
              <button key={c} type="button" title={c} aria-label={`Preview ${c}`}
                onClick={e => { e.stopPropagation(); setActiveColor(prev => prev === c ? null : c) }}
                className={`w-5 h-5 rounded-full border-2 shadow-sm transition-all ${activeColor === c ? 'border-brand-orange scale-110' : 'border-white/20 hover:scale-110'}`}
                style={{ backgroundColor: colorToHex(c) }}/>
            ))}
            {product.colors.length > 5 && <span className="text-[10px] text-gray-400">+{product.colors.length - 5}</span>}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <span className="text-brand-orange font-bold text-sm">₦{Number(product.price).toLocaleString()}</span>
            {product.original_price && (
              <span className={`text-xs line-through ml-1.5 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>₦{Number(product.original_price).toLocaleString()}</span>
            )}
          </div>
          {product.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star size={10} className="text-yellow-400 fill-yellow-400"/>
              <span className={`text-[10px] font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{product.rating}</span>
            </div>
          )}
        </div>

        {/* Sizes */}
        {product.sizes?.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {product.sizes.map(s => (
              <span key={s} className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${isDark ? 'bg-[#1A1A1A] text-gray-500' : 'bg-gray-100 text-gray-400'}`}>{s}</span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}

function QuickViewModal({ product, open, onClose }) {
  const { addToCart, setCartOpen, theme } = useStore()
  const isDark = theme === 'dark'
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [qty, setQty] = useState(1)

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes?.[0] || '')
      setSelectedColor(product.colors?.[0] || '')
      setQty(1)
    }
  }, [product])

  if (!open || !product) return null

  const handleAdd = () => {
    if (product.sizes?.length > 0 && !selectedSize) return toast.error('Please select a size')
    addToCart(product, selectedSize || 'One Size', qty, selectedColor)
    toast.success(`${product.name} added to cart! 🛒`)
    setCartOpen(true)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className={`max-w-2xl w-full max-h-[90dvh] overflow-y-auto rounded-2xl ${isDark ? 'bg-[#141414]' : 'bg-white'}`}>
        <div className="grid md:grid-cols-2">
          {/* Image — reflects the selected color */}
          <div className="aspect-[4/3] md:aspect-square overflow-hidden relative">
            {previewImageFor(product, selectedColor)
              ? <>
                  <img src={previewImageFor(product, selectedColor)} alt={product.name} className="w-full h-full object-cover"/>
                  {tintOverlayStyle(product, selectedColor) && <div className="absolute inset-0" style={tintOverlayStyle(product, selectedColor)}/>}
                </>
              : <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-[#1A1A1A]' : 'bg-gray-100'}`}><ShoppingBag size={48} className="text-brand-orange/30"/></div>}
            {product.is_new && <span className="absolute top-3 left-3 px-2 py-1 bg-brand-orange text-white text-[10px] font-bold rounded-lg">NEW</span>}
          </div>

          {/* Details */}
          <div className="p-6 flex flex-col">
            <button onClick={onClose} className="self-end p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition-all mb-4"><X size={18}/></button>
            <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{product.collection}</p>
            <h2 className={`font-bold text-xl mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>{product.name}</h2>
            <p className={`text-sm leading-relaxed mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{product.description}</p>

            <div className="flex items-center gap-3 mb-5">
              <span className="text-brand-orange font-bold text-2xl">₦{Number(product.price).toLocaleString()}</span>
              {product.original_price && <span className={`text-sm line-through ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>₦{Number(product.original_price).toLocaleString()}</span>}
            </div>

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div className="mb-4">
                <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Color: <span className="text-brand-orange">{selectedColor}</span></p>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map(c => (
                    <button key={c} onClick={() => setSelectedColor(c)} title={c} aria-label={`Select ${c}`}
                      className={`w-7 h-7 rounded-full border-2 transition-all ${selectedColor === c ? 'border-brand-orange scale-110 shadow-lg shadow-brand-orange/30' : 'border-transparent hover:border-gray-400'}`}
                      style={{ backgroundColor: colorToHex(c) }}/>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div className="mb-5">
                <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Size: <span className="text-brand-orange">{selectedSize}</span></p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(s => (
                    <button key={s} onClick={() => setSelectedSize(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selectedSize === s ? 'bg-brand-orange text-white' : isDark ? 'bg-[#1A1A1A] border border-[#2A2A2A] text-gray-300 hover:border-brand-orange' : 'bg-gray-100 border border-gray-200 text-gray-600 hover:border-brand-orange'}`}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty */}
            <div className="flex items-center gap-3 mb-5">
              <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Qty</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-8 h-8 rounded-xl bg-brand-orange/10 text-brand-orange font-bold hover:bg-brand-orange hover:text-white transition-all">−</button>
                <span className={`w-8 text-center font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="w-8 h-8 rounded-xl bg-brand-orange/10 text-brand-orange font-bold hover:bg-brand-orange hover:text-white transition-all">+</button>
              </div>
            </div>

            <button onClick={handleAdd} disabled={product.stock === 0}
              className="mt-auto py-3.5 bg-brand-orange hover:bg-brand-orange-light text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-orange/25 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95">
              {product.stock === 0 ? 'Out of Stock' : <><ShoppingBag size={16}/> Add to Cart — ₦{(product.price * qty).toLocaleString()}</>}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function StoreFront() {
  const {
    theme, cart, cartOpen, setCartOpen, checkoutOpen, setCheckoutOpen,
    authModalOpen, setAuthModalOpen, user, setUser, searchQuery, setSearchQuery,
  } = useStore()
  const isDark = theme === 'dark'

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [collection, setCollection] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [priceRange, setPriceRange] = useState([0, 300000])
  const [showFilters, setShowFilters] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const shopRef = useRef(null)

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user || null))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user || null))
    return () => subscription.unsubscribe()
  }, [])

  // Load products
  useEffect(() => {
    supabase.from('products').select('*').eq('is_active', true).not('collection', 'in', '(supplements,gainz)').order('sort_order').order('created_at', { ascending: false })
      .then(({ data }) => { setProducts(data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const scrollToShop = useCallback((collId) => {
    if (collId) setCollection(collId)
    shopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  const handleAddToCart = (product) => {
    if (product.sizes?.length > 0) {
      setQuickViewProduct(product)
    } else {
      const { addToCart, setCartOpen } = useStore.getState()
      addToCart(product, 'One Size')
      toast.success(`${product.name} added!`)
      setCartOpen(true)
    }
  }

  // Filter + sort
  const filtered = products.filter(p => {
    const matchCollection = collection === 'all' || p.collection === collection
    const matchSearch = !searchQuery || p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchPrice = p.price >= priceRange[0] && p.price <= priceRange[1]
    return matchCollection && matchSearch && matchPrice
  }).sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price
    if (sortBy === 'price-desc') return b.price - a.price
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
    if (sortBy === 'bestseller') return (b.is_bestseller ? 1 : 0) - (a.is_bestseller ? 1 : 0)
    return new Date(b.created_at) - new Date(a.created_at)
  })

  return (
    <div className={isDark ? 'bg-[#0A0A0A] text-white min-h-screen' : 'bg-[#F5F5F0] text-gray-900 min-h-screen'}>
      <Navbar onSearch={q => { setSearchQuery(q); shopRef.current?.scrollIntoView({ behavior: 'smooth' }) }} onScrollTo={scrollToShop}/>

      <Hero onShopNow={() => scrollToShop()} />

      {/* Shop Section */}
      <section ref={shopRef} id="shop" className="py-20 max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-brand-orange text-xs font-bold uppercase tracking-widest mb-2">Our Collection</p>
            <h2 className="font-display text-5xl md:text-6xl leading-none">
              {isDark ? <><span className="text-white">SHOP</span> <span className="gradient-text">NOW</span></> : <><span className="text-gray-900">SHOP</span> <span className="gradient-text">NOW</span></>}
            </h2>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Sort */}
            <div className="relative">
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className={`appearance-none pl-4 pr-8 py-2.5 rounded-xl border text-sm outline-none transition-colors cursor-pointer ${isDark ? 'bg-[#141414] border-[#2A2A2A] text-gray-300 focus:border-brand-orange' : 'bg-white border-gray-200 text-gray-700 focus:border-brand-orange'}`}>
                {SORT_OPTIONS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
            </div>
            <button onClick={() => setShowFilters(s => !s)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${showFilters ? 'bg-brand-orange border-brand-orange text-white' : isDark ? 'bg-[#141414] border-[#2A2A2A] text-gray-300 hover:border-brand-orange' : 'bg-white border-gray-200 text-gray-600 hover:border-brand-orange'}`}>
              <SlidersHorizontal size={15}/> Filters
            </button>
            <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{filtered.length} items</span>
          </div>
        </div>

        {/* Collection tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          {COLLECTIONS.map(c => (
            <button key={c.id} onClick={() => setCollection(c.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all shrink-0 ${collection === c.id ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/25' : isDark ? 'bg-[#141414] border border-[#2A2A2A] text-gray-300 hover:border-brand-orange hover:text-brand-orange' : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-orange hover:text-brand-orange'}`}>
              {c.emoji} {c.label}
            </button>
          ))}
        </div>

        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
              className={`overflow-hidden rounded-2xl border mb-8 ${isDark ? 'bg-[#141414] border-[#2A2A2A]' : 'bg-white border-gray-200'}`}>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`text-xs font-bold uppercase tracking-wider mb-3 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Price Range: ₦{priceRange[0].toLocaleString()} – ₦{priceRange[1].toLocaleString()}
                    </label>
                    <input type="range" min={0} max={300000} step={1000} value={priceRange[1]}
                      onChange={e => setPriceRange([0, Number(e.target.value)])}
                      className="w-full accent-brand-orange"/>
                  </div>
                  <div>
                    <label className={`text-xs font-bold uppercase tracking-wider mb-3 block ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Search</label>
                    <div className="relative">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                      <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search products…"
                        className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none ${isDark ? 'bg-black/30 border-[#2A2A2A] text-white placeholder-gray-600 focus:border-brand-orange' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-brand-orange'}`}/>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className={`rounded-2xl overflow-hidden ${isDark ? 'bg-[#141414]' : 'bg-gray-200'}`}>
                <div className="aspect-[3/4] animate-pulse bg-current opacity-10"/>
                <div className="p-4 space-y-2">
                  <div className={`h-3 rounded animate-pulse ${isDark ? 'bg-[#2A2A2A]' : 'bg-gray-300'}`}/>
                  <div className={`h-3 w-2/3 rounded animate-pulse ${isDark ? 'bg-[#2A2A2A]' : 'bg-gray-300'}`}/>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">🔍</p>
            <p className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>No products found</p>
            <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>Try adjusting your filters</p>
            <button onClick={() => { setCollection('all'); setSearchQuery(''); setPriceRange([0, 300000]) }}
              className="mt-6 px-6 py-3 bg-brand-orange text-white rounded-xl text-sm font-semibold hover:bg-brand-orange-light transition-all">
              Clear Filters
            </button>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            <AnimatePresence>
              {filtered.map(product => (
                <ProductCard key={product.id} product={product}
                  onAddToCart={handleAddToCart}
                  onQuickView={setQuickViewProduct}/>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </section>

      {/* Promo banners — managed by admin (/admin/banners) */}
      <BannerSection/>

      {/* Categories */}
      <CategoriesSection onSelect={scrollToShop}/>

      {/* Feedback */}
      <FeedbackSection/>

      {/* About section */}
      <section id="about" className={`py-20 border-t ${isDark ? 'border-[#1A1A1A]' : 'border-gray-200'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-brand-orange text-xs font-bold uppercase tracking-widest mb-4">Our Story</p>
              <h2 className="font-display text-6xl leading-none mb-6">
                BUILT FOR <span className="gradient-text">CHAMPIONS</span>
              </h2>
              <p className={`text-base leading-relaxed mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                AceFit was born from a passion for performance and style. We believe fitness wear should do more than just look good — it should make you feel unstoppable, push your limits, and represent the champion within.
              </p>
              <p className={`text-base leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                From Lagos to every corner of Nigeria, we deliver premium quality fitness wear with fast, reliable shipping. Whether you're hitting the gym, the track, or the streets — AceFit has you covered.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[['2K+', 'Happy Customers'], ['50+', 'Products'], ['5.0', 'Average Rating'], ['36', 'States Covered']].map(([v, l]) => (
                <div key={l} className={`p-6 rounded-2xl border text-center ${isDark ? 'bg-[#141414] border-[#2A2A2A]' : 'bg-white border-gray-200'}`}>
                  <p className="text-3xl font-bold text-brand-orange mb-1">{v}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact section */}
      <section id="contact" className={`py-20 border-t ${isDark ? 'border-[#1A1A1A]' : 'border-gray-200'}`}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-brand-orange text-xs font-bold uppercase tracking-widest mb-4">Get In Touch</p>
          <h2 className="font-display text-6xl leading-none mb-8">LET'S <span className="gradient-text">TALK</span></h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <a href="https://wa.me/2347025692097" target="_blank" rel="noreferrer"
              className="flex flex-col items-center gap-2 p-6 bg-green-500/10 border border-green-500/20 rounded-2xl hover:bg-green-500/20 transition-all">
              <FaWhatsapp className="text-4xl text-[#25D366]"/>
              <span className="text-green-400 font-bold text-sm">WhatsApp</span>
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>07025692097</span>
            </a>
            <a href="mailto:acefitandgainz@gmail.com"
              className={`flex flex-col items-center gap-2 p-6 rounded-2xl border hover:bg-brand-orange/5 transition-all ${isDark ? 'bg-[#141414] border-[#2A2A2A]' : 'bg-white border-gray-200'}`}>
              <FaEnvelope className="text-4xl text-brand-orange"/>
              <span className="text-brand-orange font-bold text-sm">Email</span>
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} break-all`}>acefitandgainz@gmail.com</span>
            </a>
            <a href="https://instagram.com/acefit.shop" target="_blank" rel="noreferrer"
              className={`flex flex-col items-center gap-2 p-6 rounded-2xl border hover:bg-pink-500/5 transition-all ${isDark ? 'bg-[#141414] border-[#2A2A2A]' : 'bg-white border-gray-200'}`}>
              <FaInstagram className="text-4xl" style={{ color: '#DD2A7B' }}/>
              <span className="text-pink-400 font-bold text-sm">Instagram</span>
              <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>@acefit.shop</span>
            </a>
          </div>
        </div>
      </section>

      <Footer/>

      {/* Quick View Modal */}
      <AnimatePresence>
        {quickViewProduct && (
          <QuickViewModal product={quickViewProduct} open={!!quickViewProduct} onClose={() => setQuickViewProduct(null)}/>
        )}
      </AnimatePresence>

      {/* Cart, Checkout, Auth */}
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true) }}/>
      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)}/>
      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)}/>
      <SupportChatbot/>
    </div>
  )
}
