import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useStore } from '../lib/store'
import { supabase } from '../lib/supabase'

// Default cards — used until admin sets images in /admin/categories,
// and as a fallback if the site_categories table isn't reachable.
const DEFAULTS = [
  { id: 'men',         label: "Men's Wear",   sub: 'Tees, Joggers, Hoodies',    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=85', color: 'from-blue-900/60' },
  { id: 'women',       label: "Women's Wear", sub: 'Leggings, Sports Bra, Tops', image_url: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=600&q=85', color: 'from-pink-900/60' },
  { id: 'tracksuits',  label: 'Tracksuits',   sub: 'Full Sets & Matching',       image_url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&q=85', color: 'from-purple-900/60' },
  { id: 'accessories', label: 'Accessories',  sub: 'Bands, Gear & More',          image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=85', color: 'from-green-900/60' },
]
const COLOR_BY_ID = { men: 'from-blue-900/60', women: 'from-pink-900/60', tracksuits: 'from-purple-900/60', accessories: 'from-green-900/60' }

// Accept both prop names so it works regardless of caller.
export default function CategoriesSection({ onSelect, onCategorySelect }) {
  const { theme } = useStore()
  const isDark = theme === 'dark'
  const pick = onSelect || onCategorySelect
  const [cats, setCats] = useState(DEFAULTS)

  useEffect(() => {
    supabase.from('site_categories').select('*').eq('is_active', true).order('sort_order')
      .then(({ data }) => {
        if (data?.length) {
          setCats(data.map(c => ({ ...c, color: COLOR_BY_ID[c.id] || 'from-black/60' })))
        }
      })
      .catch(() => {})
  }, [])

  return (
    <section className={`py-20 ${isDark ? 'bg-[#0D0D0D]' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <p className="text-brand-orange text-xs font-bold uppercase tracking-widest mb-3">Shop By Category</p>
          <h2 className={`font-display text-5xl md:text-6xl leading-none ${isDark ? 'text-white' : 'text-gray-900'}`}>
            FIND YOUR<br /><span className="gradient-text">FIT.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cats.map((cat, i) => (
            <motion.button
              key={cat.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              onClick={() => pick?.(cat.id)}
              className="relative group rounded-2xl overflow-hidden aspect-[3/4] cursor-pointer btn-press"
              whileHover={{ y: -6 }}
            >
              <img
                src={cat.image_url}
                alt={cat.label}
                loading="lazy"
                className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} to-transparent opacity-70 group-hover:opacity-80 transition-opacity`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-4 text-left">
                <p className="text-white font-bold text-lg leading-tight">{cat.label}</p>
                <p className="text-white/60 text-xs mt-0.5">{cat.sub}</p>
                <div className="flex items-center gap-1.5 mt-3 text-brand-orange text-xs font-bold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  Shop Now <ArrowRight size={12} />
                </div>
              </div>

              <div className="absolute inset-0 rounded-2xl border-2 border-brand-orange/0 group-hover:border-brand-orange/40 transition-all duration-300" />
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  )
}
