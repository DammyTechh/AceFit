import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, Grid3X3, List, X, ChevronDown } from 'lucide-react'
import { useStore } from '../lib/store'
import { supabase } from '../lib/supabase'
import ProductCard from './ProductCard'
import { getPlaceholder } from '../lib/placeholders'
import QuickViewModal from './QuickViewModal'

const CATEGORIES = [
  { id: 'all', label: 'All' },
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

const GENDERS = [
  { id: 'all', label: 'All' },
  { id: 'men', label: 'Men' },
  { id: 'women', label: 'Women' },
  { id: 'unisex', label: 'Unisex' },
]

const SORT_OPTIONS = [
  { id: 'newest', label: 'Newest First' },
  { id: 'price-asc', label: 'Price: Low to High' },
  { id: 'price-desc', label: 'Price: High to Low' },
  { id: 'popular', label: 'Most Popular' },
  { id: 'rating', label: 'Top Rated' },
]


export default function ProductGrid({ searchQuery }) {
  const { theme, activeCategory, setActiveCategory, activeGender, setActiveGender, sortBy, setSortBy } = useStore()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [quickViewProduct, setQuickViewProduct] = useState(null)
  const [localSearch, setLocalSearch] = useState(searchQuery || '')
  const [priceRange, setPriceRange] = useState([0, 50000])
  const isDark = theme === 'dark'

  useEffect(() => { setLocalSearch(searchQuery || '') }, [searchQuery])

  useEffect(() => {
    fetchProducts()
  }, [activeCategory, activeGender, sortBy])

  const fetchProducts = async () => {
    setLoading(true)
    try {
      let query = supabase.from('products').select('*').eq('is_active', true)
      if (activeCategory !== 'all') query = query.eq('category', activeCategory)
      if (activeGender !== 'all') query = query.eq('gender', activeGender)
      if (sortBy === 'price-asc') query = query.order('price', { ascending: true })
      else if (sortBy === 'price-desc') query = query.order('price', { ascending: false })
      else if (sortBy === 'rating') query = query.order('rating', { ascending: false })
      else query = query.order('created_at', { ascending: false })

      const { data, error } = await query
      if (error || !data?.length) throw new Error('fallback')
      setProducts(data)
    } catch (err) {
      console.warn('Products fetch error:', err.message)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const filtered = products.filter(p => {
    const q = localSearch.toLowerCase()
    const matchSearch = !q || p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
    const matchPrice = p.price >= priceRange[0] && p.price <= priceRange[1]
    return matchSearch && matchPrice
  })

  return (
    <section id="products" className={`py-20 ${isDark ? 'bg-brand-black' : 'bg-[#F5F5F0]'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12"
        >
          <div>
            <p className="text-brand-orange text-xs font-bold uppercase tracking-widest mb-2">Shop Collection</p>
            <h2 className={`font-display text-5xl md:text-6xl leading-none ${isDark ? 'text-white' : 'text-gray-900'}`}>
              PREMIUM<br /><span className="gradient-text">GEAR.</span>
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border ${isDark ? 'bg-brand-dark-card border-brand-dark-border' : 'bg-white border-gray-200'}`}>
              <Search size={15} className="text-brand-orange shrink-0" />
              <input
                value={localSearch}
                onChange={e => setLocalSearch(e.target.value)}
                placeholder="Search products..."
                className={`w-40 bg-transparent text-sm outline-none ${isDark ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'}`}
              />
              {localSearch && <button onClick={() => setLocalSearch('')}><X size={13} className={isDark ? 'text-gray-500' : 'text-gray-400'} /></button>}
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(s => !s)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all btn-press ${showFilters ? 'bg-brand-orange border-brand-orange text-white' : isDark ? 'bg-brand-dark-card border-brand-dark-border text-gray-400 hover:text-white' : 'bg-white border-gray-200 text-gray-600 hover:text-gray-900'}`}
            >
              <SlidersHorizontal size={15} />
              <span className="text-sm font-medium hidden sm:block">Filters</span>
            </button>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className={`appearance-none pl-3 pr-8 py-2.5 rounded-xl border text-sm outline-none cursor-pointer btn-press ${isDark ? 'bg-brand-dark-card border-brand-dark-border text-white' : 'bg-white border-gray-200 text-gray-700'}`}
              >
                {SORT_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
              <ChevronDown size={12} className={`absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
            </div>
          </div>
        </motion.div>

        {/* Filters panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className={`overflow-hidden mb-8 rounded-2xl border ${isDark ? 'bg-brand-dark-card border-brand-dark-border' : 'bg-white border-gray-200'}`}
            >
              <div className="p-6 space-y-6">
                {/* Category filter */}
                <div>
                  <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Category</p>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setActiveCategory(cat.id)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all btn-press ${
                          activeCategory === cat.id
                            ? 'bg-brand-orange text-white shadow-md shadow-brand-orange/25'
                            : isDark ? 'bg-brand-dark-border text-gray-400 hover:text-white hover:bg-brand-orange/20' : 'bg-gray-100 text-gray-600 hover:bg-brand-orange/10 hover:text-brand-orange'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gender filter */}
                <div>
                  <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Gender</p>
                  <div className="flex gap-2">
                    {GENDERS.map(g => (
                      <button
                        key={g.id}
                        onClick={() => setActiveGender(g.id)}
                        className={`px-5 py-2 rounded-xl text-sm font-medium transition-all btn-press ${
                          activeGender === g.id
                            ? 'bg-brand-orange text-white'
                            : isDark ? 'bg-brand-dark-border text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price range */}
                <div>
                  <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Price Range: ₦{priceRange[0].toLocaleString()} – ₦{priceRange[1].toLocaleString()}
                  </p>
                  <input
                    type="range"
                    min={0}
                    max={50000}
                    step={500}
                    value={priceRange[1]}
                    onChange={e => setPriceRange([0, Number(e.target.value)])}
                    className="w-full max-w-xs accent-brand-orange"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category pills (mobile-friendly) */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mb-8">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all btn-press ${
                activeCategory === cat.id
                  ? 'bg-brand-orange text-white shadow-md shadow-brand-orange/20'
                  : isDark ? 'bg-brand-dark-card border border-brand-dark-border text-gray-400 hover:text-brand-orange hover:border-brand-orange/40' : 'bg-white border border-gray-200 text-gray-600 hover:border-brand-orange hover:text-brand-orange'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Result count */}
        <div className={`flex items-center justify-between mb-6 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          <p className="text-sm">{filtered.length} products</p>
          {(localSearch || activeCategory !== 'all' || activeGender !== 'all') && (
            <button
              onClick={() => { setLocalSearch(''); setActiveCategory('all'); setActiveGender('all') }}
              className="text-sm text-brand-orange hover:underline flex items-center gap-1"
            >
              <X size={13} /> Clear filters
            </button>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className={`rounded-2xl overflow-hidden ${isDark ? 'bg-brand-dark-card' : 'bg-white'}`}>
                <div className="skeleton aspect-[3/4]" />
                <div className="p-4 space-y-2">
                  <div className="skeleton h-3 w-20 rounded" />
                  <div className="skeleton h-4 w-full rounded" />
                  <div className="skeleton h-4 w-3/4 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl ${isDark ? 'bg-brand-dark-card' : 'bg-gray-100'}`}>🔍</div>
            <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>No products found</p>
            <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>Try different filters or search terms</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6"
          >
            <AnimatePresence>
              {filtered.map((product, i) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  index={i}
                  onQuickView={setQuickViewProduct}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {quickViewProduct && (
        <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} />
      )}
    </section>
  )
}
