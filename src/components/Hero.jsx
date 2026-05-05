import React, { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, Star, TrendingUp } from 'lucide-react'
import { useStore } from '../lib/store'

const STATS = [
  { label: 'Happy Customers', value: '2K+', icon: Star },
  { label: 'Products', value: '50+', icon: Zap },
  { label: 'Collections', value: '10+', icon: TrendingUp },
]

const FLOATING_IMAGES = [
  { src: 'https://i.imgur.com/YmQ8fjQ.png', delay: 0, x: -20, y: 0 },
  { src: 'https://i.imgur.com/ZuwUZkF.png', delay: 0.5, x: 20, y: 30 },
]

export default function Hero({ onShopNow }) {
  const { theme, setCartOpen } = useStore()
  const isDark = theme === 'dark'

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.12 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } }
  }

  return (
    <section className={`relative min-h-screen flex items-center overflow-hidden pt-20 ${isDark ? 'bg-brand-black' : 'bg-[#F5F5F0]'}`}>
      {/* Background elements */}
      <div className="absolute inset-0 mesh-bg pointer-events-none" />
      <div className={`absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-3xl pointer-events-none ${isDark ? 'bg-brand-orange/5' : 'bg-brand-orange/8'}`} style={{ transform: 'translate(30%, -30%)' }} />
      <div className={`absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-3xl pointer-events-none ${isDark ? 'bg-brand-orange/3' : 'bg-brand-orange/5'}`} style={{ transform: 'translate(-30%, 30%)' }} />

      {/* Grid overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: `linear-gradient(rgba(255,107,0,0.5) 1px, transparent 1px), linear-gradient(to right, rgba(255,107,0,0.5) 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Left – Text */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          {/* Badge */}
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-orange/30 bg-brand-orange/10 mb-8">
            <span className="w-2 h-2 bg-brand-orange rounded-full animate-pulse" />
            <span className="text-brand-orange text-xs font-bold uppercase tracking-wider">New Collection 2025</span>
          </motion.div>

          {/* Headline */}
          <motion.div variants={itemVariants}>
            <h1 className="font-display leading-none mb-2" style={{ fontSize: 'clamp(60px, 9vw, 120px)' }}>
              <span className={`block ${isDark ? 'text-white' : 'text-gray-900'}`}>TRAIN</span>
              <span className="block gradient-text">HARDER.</span>
              <span className={`block ${isDark ? 'text-white' : 'text-gray-900'}`}>LOOK</span>
              <span className="block gradient-text">BETTER.</span>
            </h1>
          </motion.div>

          <motion.p variants={itemVariants} className={`text-base md:text-lg leading-relaxed mt-6 mb-10 max-w-md ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Premium fitness wear engineered for peak performance. Every rep, every set — dressed to dominate.
          </motion.p>

          {/* CTAs */}
          <motion.div variants={itemVariants} className="flex flex-wrap gap-4 mb-14">
            <button
              onClick={onShopNow}
              className="group flex items-center gap-2.5 px-8 py-4 bg-brand-orange hover:bg-brand-orange-light text-white font-bold rounded-2xl transition-all btn-press shadow-xl shadow-brand-orange/30 text-sm"
            >
              Shop Now
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
            <a
              href="https://wa.me/2347025692097"
              target="_blank"
              rel="noreferrer"
              className={`flex items-center gap-2.5 px-8 py-4 border-2 font-bold rounded-2xl transition-all btn-press text-sm ${isDark ? 'border-brand-dark-border text-gray-300 hover:border-brand-orange hover:text-brand-orange' : 'border-gray-300 text-gray-700 hover:border-brand-orange hover:text-brand-orange'}`}
            >
              WhatsApp Order
            </a>
          </motion.div>

          {/* Stats */}
          <motion.div variants={itemVariants} className="flex gap-8">
            {STATS.map(stat => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-brand-orange mb-0.5">{stat.value}</div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Right – Product images 3D */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
          className="relative h-[500px] lg:h-[600px] hidden lg:block"
        >
          {/* Main large image */}
          <motion.div
            animate={{ y: [0, -16, 0], rotateY: [0, 4, 0], rotateX: [0, -2, 0] }}
            transition={{ duration: 5, ease: 'easeInOut', repeat: Infinity }}
            className="absolute top-8 right-0 w-72 rounded-3xl overflow-hidden shadow-2xl shadow-black/50"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <img
              src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&q=85"
              alt="AceFit Fitness Wear"
              className="w-full h-96 object-cover object-top"
            />
            {/* Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
              <span className="text-white/60 text-xs">Performance Tee</span>
              <p className="text-white font-bold">AceFit Pro Series</p>
              <p className="text-brand-orange font-bold">₦8,500</p>
            </div>
          </motion.div>

          {/* Second image - offset */}
          <motion.div
            animate={{ y: [0, -12, 0], rotateY: [0, -3, 0], rotateX: [0, 3, 0] }}
            transition={{ duration: 4.5, ease: 'easeInOut', repeat: Infinity, delay: 1.5 }}
            className="absolute bottom-20 left-0 w-60 rounded-3xl overflow-hidden shadow-xl shadow-black/40"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <img
              src="https://images.unsplash.com/photo-1518310383802-640c2de311b2?w=500&q=85"
              alt="AceFit Wear"
              className="w-full h-72 object-cover object-top"
            />
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
              <span className="text-white/60 text-xs">Unisex Collection</span>
              <p className="text-white font-bold text-sm">Men & Women</p>
            </div>
          </motion.div>

          {/* Floating tag */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, ease: 'easeInOut', repeat: Infinity, delay: 0.5 }}
            className="absolute top-24 left-10 bg-brand-orange text-white px-4 py-3 rounded-2xl shadow-xl shadow-brand-orange/30"
          >
            <div className="flex items-center gap-2">
              <Zap size={14} className="fill-white" />
              <span className="text-sm font-bold">Bestseller</span>
            </div>
          </motion.div>

          {/* Rating badge */}
          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.5, ease: 'easeInOut', repeat: Infinity, delay: 1 }}
            className={`absolute bottom-36 right-4 px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 ${isDark ? 'bg-brand-dark-card border border-brand-dark-border' : 'bg-white border border-gray-100'}`}
          >
            <div className="flex">
              {[1,2,3,4,5].map(s => (
                <Star key={s} size={12} className="text-yellow-400 fill-yellow-400" />
              ))}
            </div>
            <span className={`text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>4.9 Rating</span>
          </motion.div>

          {/* Decorative rings */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-64 h-64 rounded-full border border-brand-orange/10 animate-spin-slow" />
            <div className="absolute inset-4 rounded-full border border-brand-orange/5 animate-spin-slow" style={{ animationDirection: 'reverse' }} />
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <div className={`w-6 h-10 rounded-full border-2 flex items-start justify-center p-1.5 ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1 h-2 bg-brand-orange rounded-full"
          />
        </div>
      </motion.div>
    </section>
  )
}
