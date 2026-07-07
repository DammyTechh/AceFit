import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Zap, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore } from '../lib/store'
import { supabase } from '../lib/supabase'

const DEFAULT_SLIDES = [
  {
    id: 'default-1',
    badge: 'New Collection 2025',
    title: 'TRAIN HARDER.',
    subtitle: 'LOOK BETTER.',
    tagline: 'Premium fitness wear engineered for peak performance. Every rep, every set — dressed to dominate.',
    image_url: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=85',
    cta_text: 'Shop Now',
  },
  {
    id: 'default-2',
    badge: 'AceGainz Supplements',
    title: 'FUEL YOUR',
    subtitle: 'GAINS.',
    tagline: 'Premium supplements to fuel your workouts and accelerate your results.',
    image_url: 'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=600&q=85',
    cta_text: 'Shop Gainz',
  },
]

export default function Hero({ onShopNow }) {
  const { theme } = useStore()
  const isDark = theme === 'dark'
  const [slides, setSlides] = useState(DEFAULT_SLIDES)
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    // Build the carousel from two sources:
    //  1) manual hero_slides (curated by admin)
    //  2) products flagged "Featured in Hero" (is_featured) or new (is_new)
    // so newly uploaded products show up in the hero automatically.
    const load = async () => {
      const [{ data: manual }, { data: prods }] = await Promise.all([
        supabase.from('hero_slides').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('products').select('*')
          .eq('is_active', true)
          .or('is_featured.eq.true,is_new.eq.true')
          .not('collection', 'in', '(supplements,gainz)')
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(6),
      ])

      const productSlides = (prods || [])
        .filter(p => p.image_url)
        .map(p => ({
          id: `product-${p.id}`,
          badge: p.is_new ? 'New Arrival' : 'Featured',
          title: p.name,
          subtitle: '',
          tagline: p.description || 'Just dropped — shop the latest AceFit gear.',
          image_url: p.image_url,
          cta_text: 'Shop Now',
          product_price: p.price,
        }))

      const merged = [...(manual || []), ...productSlides]
      if (merged.length) setSlides(merged)
    }
    load().catch(() => {})
  }, [])

  // Auto-advance
  useEffect(() => {
    if (slides.length <= 1) return
    const t = setInterval(() => setCurrent(c => (c + 1) % slides.length), 5000)
    return () => clearInterval(t)
  }, [slides.length])

  const slide = slides[current] || DEFAULT_SLIDES[0]

  const prev = () => setCurrent(c => (c - 1 + slides.length) % slides.length)
  const next = () => setCurrent(c => (c + 1) % slides.length)

  const containerVariants = { hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }
  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } }
  }

  return (
    <section className={`relative min-h-screen flex items-center overflow-hidden pt-20 ${isDark ? 'bg-[#0A0A0A]' : 'bg-[#F5F5F0]'}`}>
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl ${isDark ? 'bg-brand-orange/5' : 'bg-brand-orange/8'}`} style={{ transform: 'translate(30%, -30%)' }}/>
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `linear-gradient(rgba(255,107,0,0.5) 1px, transparent 1px), linear-gradient(to right, rgba(255,107,0,0.5) 1px, transparent 1px)`, backgroundSize: '60px 60px' }}/>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">
        {/* Left – Text */}
        <AnimatePresence mode="wait">
          <motion.div key={slide.id} variants={containerVariants} initial="hidden" animate="visible" exit={{ opacity: 0, x: -20 }}>
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-orange/30 bg-brand-orange/10 mb-8">
              <span className="w-2 h-2 bg-brand-orange rounded-full animate-pulse"/>
              <span className="text-brand-orange text-xs font-bold uppercase tracking-wider">{slide.badge || 'New Collection'}</span>
            </motion.div>

            <motion.div variants={itemVariants}>
              <h1 className="font-display leading-none mb-2" style={{ fontSize: 'clamp(56px, 9vw, 110px)' }}>
                <span className={`block ${isDark ? 'text-white' : 'text-gray-900'}`}>{slide.title || 'TRAIN'}</span>
                <span className="block gradient-text">{slide.subtitle || 'HARDER.'}</span>
              </h1>
            </motion.div>

            <motion.p variants={itemVariants} className={`text-base md:text-lg leading-relaxed mt-6 mb-10 max-w-md ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {slide.tagline || 'Premium fitness wear engineered for peak performance.'}
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap gap-4 mb-14">
              <button onClick={onShopNow}
                className="group flex items-center gap-2.5 px-8 py-4 bg-brand-orange hover:bg-brand-orange-light text-white font-bold rounded-2xl transition-all shadow-xl shadow-brand-orange/30 text-sm active:scale-95">
                {slide.cta_text || 'Shop Now'} <ArrowRight size={16} className="transition-transform group-hover:translate-x-1"/>
              </button>
              <a href="https://wa.me/2347025692097" target="_blank" rel="noreferrer"
                className={`flex items-center gap-2.5 px-8 py-4 border-2 font-bold rounded-2xl transition-all text-sm active:scale-95 ${isDark ? 'border-[#2A2A2A] text-gray-300 hover:border-brand-orange hover:text-brand-orange' : 'border-gray-300 text-gray-700 hover:border-brand-orange hover:text-brand-orange'}`}>
                WhatsApp Order
              </a>
            </motion.div>

            <motion.div variants={itemVariants} className="flex gap-8">
              {[{ v: '2K+', l: 'Customers' }, { v: '50+', l: 'Products' }, { v: '5⭐', l: 'Avg Rating' }].map(s => (
                <div key={s.l}>
                  <div className="text-2xl font-bold text-brand-orange mb-0.5">{s.v}</div>
                  <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{s.l}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Mobile – Product Image (desktop version is the decorated block below) */}
        {slide.image_url && (
          <div className="lg:hidden mt-8">
            <AnimatePresence mode="wait">
              <motion.div key={slide.id + '-mobile'}
                initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-xs mx-auto rounded-3xl overflow-hidden shadow-2xl shadow-black/40">
                <img src={slide.image_url} alt="AceFit" className="w-full h-72 sm:h-80 object-cover object-top"/>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-white font-bold">{slide.title} {slide.subtitle}</p>
                  {slide.product_price && <p className="text-brand-orange font-bold">₦{Number(slide.product_price).toLocaleString()}</p>}
                </div>
              </motion.div>
            </AnimatePresence>
            {slides.length > 1 && (
              <div className="flex items-center justify-center gap-2 mt-5">
                <button onClick={prev} aria-label="Previous slide" className="p-1.5 rounded-full bg-brand-orange/20 hover:bg-brand-orange/40 text-brand-orange transition-all"><ChevronLeft size={14}/></button>
                {slides.map((_, i) => (
                  <button key={i} onClick={() => setCurrent(i)} aria-label={`Go to slide ${i + 1}`}
                    className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-brand-orange scale-125' : 'bg-brand-orange/30'}`}/>
                ))}
                <button onClick={next} aria-label="Next slide" className="p-1.5 rounded-full bg-brand-orange/20 hover:bg-brand-orange/40 text-brand-orange transition-all"><ChevronRight size={14}/></button>
              </div>
            )}
          </div>
        )}

        {/* Right – Product Image */}
        <motion.div initial={{ opacity: 0, x: 60 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
          className="relative h-[500px] lg:h-[580px] hidden lg:block">
          <AnimatePresence mode="wait">
            <motion.div key={slide.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5 }}
              className="absolute top-8 right-0 w-72 rounded-3xl overflow-hidden shadow-2xl shadow-black/50">
              <img src={slide.image_url} alt="AceFit" className="w-full h-96 object-cover object-top"/>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white font-bold">{slide.title} {slide.subtitle}</p>
                {slide.product_price && <p className="text-brand-orange font-bold">₦{Number(slide.product_price).toLocaleString()}</p>}
              </div>
            </motion.div>
          </AnimatePresence>

          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity }}
            className="absolute top-24 left-10 bg-brand-orange text-white px-4 py-3 rounded-2xl shadow-xl shadow-brand-orange/30">
            <div className="flex items-center gap-2"><Zap size={14} className="fill-white"/><span className="text-sm font-bold">Bestseller</span></div>
          </motion.div>

          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3.5, repeat: Infinity, delay: 1 }}
            className={`absolute bottom-36 right-4 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 ${isDark ? 'bg-[#1A1A1A] border border-[#2A2A2A]' : 'bg-white border border-gray-100'}`}>
            <div className="flex">{[1,2,3,4,5].map(s => <Star key={s} size={12} className="text-yellow-400 fill-yellow-400"/>)}</div>
            <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>4.9 Rating</span>
          </motion.div>

          {/* Slide navigation dots */}
          {slides.length > 1 && (
            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
              <button onClick={prev} className="p-1.5 rounded-full bg-brand-orange/20 hover:bg-brand-orange/40 text-brand-orange transition-all"><ChevronLeft size={14}/></button>
              {slides.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-brand-orange scale-125' : 'bg-brand-orange/30'}`}/>
              ))}
              <button onClick={next} className="p-1.5 rounded-full bg-brand-orange/20 hover:bg-brand-orange/40 text-brand-orange transition-all"><ChevronRight size={14}/></button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
        <div className={`w-6 h-10 rounded-full border-2 flex items-start justify-center p-1.5 ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
          <motion.div animate={{ y: [0, 12, 0] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-1 h-2 bg-brand-orange rounded-full"/>
        </div>
      </motion.div>
    </section>
  )
}
