import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, Star, Zap, Filter } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useStore } from '../lib/store'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import toast from 'react-hot-toast'

export default function GainzPage() {
  const { theme, addToCart, setCartOpen } = useStore()
  const isDark = theme === 'dark'
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [qty, setQty] = useState(1)

  useEffect(() => {
    supabase.from('products').select('*')
      .in('collection', ['supplements', 'gainz'])
      .eq('is_active', true)
      .order('sort_order')
      .then(({ data }) => { setProducts(data || []); setLoading(false) })
  }, [])

  const handleAdd = (product) => {
    addToCart(product, 'One Size', qty)
    toast.success(`${product.name} added to cart!`)
    setCartOpen(true)
    setSelected(null)
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0A0A0A] text-white' : 'bg-[#F5F5F0] text-gray-900'}`}>
      <Navbar />

      {/* Hero */}
      <section className={`pt-32 pb-20 text-center relative overflow-hidden ${isDark ? 'bg-[#0A0A0A]' : 'bg-[#F5F5F0]'}`}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-orange/5 rounded-full blur-3xl"/>
        </div>
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-3xl mx-auto px-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-orange/30 bg-brand-orange/10 mb-6">
            <Zap size={12} className="text-brand-orange fill-brand-orange" />
            <span className="text-brand-orange text-xs font-bold uppercase tracking-wider">Premium Supplements</span>
          </div>
          <h1 className="font-display text-7xl md:text-9xl leading-none mb-6">
            ACE<span className="gradient-text">GAINZ</span>
          </h1>
          <p className={`text-lg leading-relaxed max-w-xl mx-auto ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Fuel your workouts, accelerate recovery, and maximize gains with our premium supplement line. Engineered for serious athletes.
          </p>
        </motion.div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className={`rounded-2xl h-72 animate-pulse ${isDark ? 'bg-[#1A1A1A]' : 'bg-gray-200'}`}/>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-6xl mb-4">💊</p>
            <p className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Coming Soon</p>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>AceGainz supplements launching soon. Stay tuned!</p>
            <a href="https://wa.me/2347025692097" target="_blank" rel="noreferrer"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-brand-orange text-white rounded-xl font-semibold hover:bg-brand-orange-light transition-all">
              Get Notified on WhatsApp
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className={`group rounded-2xl overflow-hidden border transition-all cursor-pointer ${isDark ? 'bg-[#141414] border-[#2A2A2A] hover:border-brand-orange/40' : 'bg-white border-gray-200 hover:border-brand-orange/40'}`}
                onClick={() => { setSelected(p); setQty(1) }}>
                <div className="aspect-square overflow-hidden relative">
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                    : <div className="w-full h-full bg-brand-orange/10 flex items-center justify-center"><span className="text-5xl">💊</span></div>}
                  {p.is_new && <span className="absolute top-3 left-3 px-2 py-1 bg-brand-orange text-white text-[10px] font-bold rounded-lg">NEW</span>}
                  {p.stock === 0 && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="text-white text-sm font-bold">Out of Stock</span></div>}
                </div>
                <div className="p-4">
                  <h3 className={`font-bold text-sm mb-1 line-clamp-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{p.name}</h3>
                  <p className={`text-xs line-clamp-2 mb-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{p.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-brand-orange font-bold">₦{Number(p.price).toLocaleString()}</span>
                    <button onClick={e => { e.stopPropagation(); if (p.stock > 0) { addToCart(p, 'One Size'); toast.success('Added!'); setCartOpen(true) } }}
                      disabled={p.stock === 0}
                      className="p-2 bg-brand-orange/10 hover:bg-brand-orange text-brand-orange hover:text-white rounded-lg transition-all disabled:opacity-40">
                      <ShoppingBag size={14}/>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Product quick view modal */}
      {selected && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
          onClick={() => setSelected(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className={`max-w-md w-full rounded-2xl overflow-hidden ${isDark ? 'bg-[#141414]' : 'bg-white'}`}
            onClick={e => e.stopPropagation()}>
            {selected.image_url && <img src={selected.image_url} alt={selected.name} className="w-full h-56 object-cover"/>}
            <div className="p-6">
              <h2 className={`font-bold text-xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{selected.name}</h2>
              <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{selected.description}</p>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-brand-orange font-bold text-xl">₦{Number(selected.price).toLocaleString()}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-8 h-8 rounded-lg bg-brand-orange/10 text-brand-orange font-bold">-</button>
                  <span className={`w-8 text-center font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} className="w-8 h-8 rounded-lg bg-brand-orange/10 text-brand-orange font-bold">+</button>
                </div>
              </div>
              <button onClick={() => handleAdd(selected)}
                className="w-full py-3 bg-brand-orange text-white font-bold rounded-xl hover:bg-brand-orange-light transition-all flex items-center justify-center gap-2">
                <ShoppingBag size={16}/> Add to Cart
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  )
}
