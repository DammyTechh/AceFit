import React, { useState, useRef } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Instagram, Phone, Mail, MapPin, MessageCircle } from 'lucide-react'
import Navbar from '../components/Navbar'
import Hero from '../components/Hero'
import CategoriesSection from '../components/CategoriesSection'
import ProductGrid from '../components/ProductGrid'
import FeedbackSection from '../components/FeedbackSection'
import Footer from '../components/Footer'
import CartSidebar from '../components/CartSidebar'
import AuthModal from '../components/AuthModal'
import SupportChatbot from '../components/SupportChatbot'
import ConsentModal from '../components/ConsentModal'
import AuthSync from '../components/AuthSync'
import { useStore } from '../lib/store'
import OrdersPage from './OrdersPage'

/* ──────────────────────────────────────────────
   ABOUT SECTION
────────────────────────────────────────────── */
function AboutSection({ isDark }) {
  return (
    <section
      id="about"
      className={`py-24 ${isDark ? 'bg-[#0D0D0D]' : 'bg-white'}`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Images */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden aspect-[3/4] mt-8">
                <img src="https://i.imgur.com/YmQ8fjQ.png" alt="AceFit wear" className="w-full h-full object-cover object-top" />
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl overflow-hidden aspect-square">
                <img src="https://i.imgur.com/ZuwUZkF.png" alt="AceFit collection" className="w-full h-full object-cover object-top" />
              </div>
              <div className={`rounded-2xl p-5 border ${isDark ? 'bg-brand-dark-card border-brand-dark-border' : 'bg-gray-50 border-gray-200'}`}>
                <p className="text-brand-orange font-display text-3xl">2K+</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Happy athletes across Nigeria</p>
              </div>
            </div>
          </div>
          {/* Floating badge */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -bottom-4 -left-4 bg-brand-orange text-white px-4 py-3 rounded-2xl shadow-xl shadow-brand-orange/30"
          >
            <p className="text-xs font-bold">🔥 Premium Quality</p>
            <p className="text-[10px] opacity-80">Built to perform</p>
          </motion.div>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.1 }}
        >
          <p className="text-brand-orange text-xs font-bold uppercase tracking-widest mb-3">Our Story</p>
          <h2 className={`font-display text-5xl md:text-6xl leading-none mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            BUILT FOR<br /><span className="gradient-text">CHAMPIONS.</span>
          </h2>
          <div className={`space-y-4 text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <p>
              AceFit was born from a simple belief — that what you wear to the gym should be as serious as your training. We design premium fitness wear that moves with you, breathes with you, and looks incredible doing it.
            </p>
            <p>
              Every piece in our collection is crafted with performance-grade fabrics — moisture-wicking, 4-way stretch, and built to last through thousands of reps. From intense HIIT sessions to casual streetwear looks, AceFit has you covered.
            </p>
            <p>
              Proudly Nigerian. Globally inspired. We ship nationwide and are growing our community of elite athletes every day.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 mt-8 pt-8" style={{ borderTop: '1px solid rgba(255,107,0,0.15)' }}>
            {[
              { value: '2K+', label: 'Customers' },
              { value: '50+', label: 'Products' },
              { value: '5⭐', label: 'Avg Rating' },
            ].map(s => (
              <div key={s.label}>
                <p className="text-brand-orange font-display text-3xl">{s.value}</p>
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────
   CONTACT SECTION
────────────────────────────────────────────── */
function ContactSection({ isDark }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // Build WhatsApp message as fallback
    const msg = encodeURIComponent(
      `*New Contact Form Submission*\n\nName: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\n\nMessage:\n${form.message}`
    )
    window.open(`https://wa.me/2347025692097?text=${msg}`, '_blank')
    setSent(true)
  }

  return (
    <section
      id="contact"
      className={`py-24 ${isDark ? 'bg-brand-black' : 'bg-[#F5F5F0]'}`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-brand-orange text-xs font-bold uppercase tracking-widest mb-3">Get In Touch</p>
          <h2 className={`font-display text-5xl md:text-6xl leading-none ${isDark ? 'text-white' : 'text-gray-900'}`}>
            CONTACT<br /><span className="gradient-text">US.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <p className={`text-base leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Have a question about sizing, an order, or just want to say hi? We love hearing from our community. Reach us through any channel below — we respond fast!
            </p>

            {[
              {
                icon: Phone,
                label: 'Call / WhatsApp',
                lines: ['07025692097', '09153040271'],
                action: () => window.open('https://wa.me/2347025692097', '_blank'),
                color: 'bg-green-500/10 text-green-400',
              },
              {
                icon: Mail,
                label: 'Email Us',
                lines: ['Acefitandgainz@gmail.com'],
                action: () => window.open('mailto:Acefitandgainz@gmail.com'),
                color: 'bg-brand-orange/10 text-brand-orange',
              },
              {
                icon: Instagram,
                label: 'Instagram & TikTok',
                lines: ['@The_acefit (IG)', '@The_acefit (TikTok)'],
                action: () => window.open('https://instagram.com/The_acefit', '_blank'),
                color: 'bg-pink-500/10 text-pink-400',
              },
            ].map(item => (
              <motion.button
                key={item.label}
                whileHover={{ x: 4 }}
                onClick={item.action}
                className={`w-full flex items-start gap-4 p-4 rounded-2xl border text-left transition-all ${isDark ? 'bg-brand-dark-card border-brand-dark-border hover:border-brand-orange/40' : 'bg-white border-gray-200 hover:border-brand-orange/40'}`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                  <item.icon size={18} />
                </div>
                <div>
                  <p className={`font-semibold text-sm mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.label}</p>
                  {item.lines.map(l => (
                    <p key={l} className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{l}</p>
                  ))}
                </div>
              </motion.button>
            ))}
          </motion.div>

          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className={`rounded-2xl p-8 border ${isDark ? 'bg-brand-dark-card border-brand-dark-border' : 'bg-white border-gray-200'}`}
          >
            {sent ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">✅</div>
                <h3 className={`font-bold text-xl mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Message Sent!</h3>
                <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>We'll get back to you within 24 hours via WhatsApp or email.</p>
                <button onClick={() => setSent(false)} className="mt-6 px-6 py-2.5 bg-brand-orange text-white rounded-xl text-sm font-semibold btn-press">
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h3 className={`font-bold text-lg mb-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>Send Us a Message</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Full Name</label>
                    <input
                      required
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Your name"
                      className={`w-full px-4 py-3 rounded-xl border text-sm outline-none neon-focus ${isDark ? 'bg-black/30 border-brand-dark-border text-white placeholder-gray-600 focus:border-brand-orange' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-brand-orange'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Phone</label>
                    <input
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="08012345678"
                      className={`w-full px-4 py-3 rounded-xl border text-sm outline-none neon-focus ${isDark ? 'bg-black/30 border-brand-dark-border text-white placeholder-gray-600 focus:border-brand-orange' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-brand-orange'}`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="you@example.com"
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none neon-focus ${isDark ? 'bg-black/30 border-brand-dark-border text-white placeholder-gray-600 focus:border-brand-orange' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-brand-orange'}`}
                  />
                </div>

                <div>
                  <label className={`block text-xs font-bold uppercase tracking-wider mb-1.5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Message</label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    placeholder="How can we help you?"
                    className={`w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none neon-focus ${isDark ? 'bg-black/30 border-brand-dark-border text-white placeholder-gray-600 focus:border-brand-orange' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-brand-orange'}`}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-brand-orange hover:bg-brand-orange-light text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all btn-press shadow-lg shadow-brand-orange/25"
                >
                  <MessageCircle size={16} /> Send via WhatsApp
                </button>
                <p className={`text-xs text-center ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                  Messages are forwarded directly to our WhatsApp for fastest response
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ──────────────────────────────────────────────
   STOREFRONT
────────────────────────────────────────────── */
export default function StoreFront() {
  const [searchQuery, setSearchQuery] = useState('')
  const productsRef = useRef()
  const { theme, setActiveCategory } = useStore()
  const isDark = theme === 'dark'

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Called from navbar shop dropdown
  const handleScrollToCategory = (catId) => {
    setActiveCategory(catId === 'all' ? 'all' : catId)
    setTimeout(() => {
      productsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }

  return (
    <div className={isDark ? 'bg-brand-black text-white' : 'bg-[#F5F5F0] text-gray-900'}>
      <Navbar
        onSearch={q => { setSearchQuery(q); scrollToProducts() }}
        onScrollTo={handleScrollToCategory}
      />
      <AuthSync />
      <CartSidebar />
      <AuthModal />
      <ConsentModal />
      <SupportChatbot />

      <Routes>
        <Route path="/" element={
          <MainPage
            isDark={isDark}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            productsRef={productsRef}
            scrollToProducts={scrollToProducts}
            handleScrollToCategory={handleScrollToCategory}
          />
        } />
        <Route path="/wishlist" element={<WishlistPage />} />
        <Route path="/orders"   element={<OrdersPage />} />
      </Routes>
    </div>
  )
}

function MainPage({ isDark, searchQuery, productsRef, scrollToProducts, handleScrollToCategory }) {
  return (
    <>
      <Hero onShopNow={scrollToProducts} />
      <CategoriesSection onCategorySelect={handleScrollToCategory} />

      {/* Features strip */}
      <section className={`py-12 border-y ${isDark ? 'bg-[#0D0D0D] border-brand-dark-border' : 'bg-white border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: '🚚', title: 'Fast Delivery', sub: 'Lagos & Nationwide' },
              { icon: '🔄', title: '7-Day Returns', sub: 'Hassle-free returns' },
              { icon: '🔒', title: 'Secure Payment', sub: 'OPay & WhatsApp' },
              { icon: '💪', title: 'Premium Quality', sub: 'Built to perform' },
            ].map(f => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-3"
              >
                <span className="text-2xl">{f.icon}</span>
                <div>
                  <p className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{f.title}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{f.sub}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Products */}
      <div ref={productsRef}>
        <ProductGrid searchQuery={searchQuery} />
      </div>

      {/* About section */}
      <AboutSection isDark={isDark} />

      {/* Social proof */}
      <section className={`py-20 ${isDark ? 'bg-[#0D0D0D]' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-brand-orange text-xs font-bold uppercase tracking-widest mb-3">Social</p>
            <h2 className={`font-display text-5xl ${isDark ? 'text-white' : 'text-gray-900'}`}>
              FOLLOW THE<br /><span className="gradient-text">MOVEMENT.</span>
            </h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              'https://i.imgur.com/YmQ8fjQ.png',
              'https://i.imgur.com/ZuwUZkF.png',
              'https://i.imgur.com/YmQ8fjQ.png',
              'https://i.imgur.com/ZuwUZkF.png',
            ].map((img, i) => (
              <motion.a
                key={i}
                href="https://instagram.com/The_acefit"
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="relative group aspect-square rounded-2xl overflow-hidden"
              >
                <img src={img} alt="AceFit social" className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                  <Instagram size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </motion.a>
            ))}
          </div>
          <div className="text-center mt-6">
            <a href="https://instagram.com/The_acefit" target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 border border-brand-orange/30 text-brand-orange hover:bg-brand-orange hover:text-white rounded-xl text-sm font-medium transition-all btn-press">
              <Instagram size={16} /> @The_acefit
            </a>
          </div>
        </div>
      </section>

      {/* Promo Banner */}
      <section className="relative overflow-hidden py-20">
        <div className="absolute inset-0 bg-brand-orange" />
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)' }} />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-5xl md:text-7xl text-white leading-none mb-4">
              ORDER NOW.<br />PAY ON WHATSAPP.
            </h2>
            <p className="text-white/80 text-lg mb-8">It's that simple. Choose your gear, place your order, we handle the rest.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="https://wa.me/2347025692097" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-8 py-4 bg-white text-brand-orange font-bold rounded-2xl hover:bg-gray-100 transition-all btn-press shadow-lg">
                <Phone size={18} /> 07025692097
              </a>
              <a href="https://wa.me/2349153040271" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-bold rounded-2xl hover:bg-white/20 transition-all btn-press border border-white/30">
                <Phone size={18} /> 09153040271
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feedback */}
      <FeedbackSection />

      {/* Contact section */}
      <ContactSection isDark={isDark} />

      <Footer />
    </>
  )
}

/* ──────────────────────────────────────────────
   WISHLIST PAGE
────────────────────────────────────────────── */
function WishlistPage() {
  const { wishlist, theme, toggleWishlist, addToCart, setCartOpen } = useStore()
  const isDark = theme === 'dark'
  return (
    <div className={`min-h-screen pt-24 pb-20 ${isDark ? 'bg-brand-black' : 'bg-[#F5F5F0]'}`}>
      <div className="max-w-7xl mx-auto px-6">
        <h1 className={`font-display text-5xl mb-10 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          YOUR <span className="gradient-text">WISHLIST.</span>
        </h1>
        {wishlist.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">🤍</p>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Your wishlist is empty</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {wishlist.map(p => (
              <div key={p.id} className={`rounded-2xl overflow-hidden border ${isDark ? 'bg-brand-dark-card border-brand-dark-border' : 'bg-white border-gray-200'}`}>
                <div className="aspect-[3/4] overflow-hidden">
                  <img src={p.image_url || 'https://i.imgur.com/YmQ8fjQ.png'} alt={p.name} className="w-full h-full object-cover object-top" />
                </div>
                <div className="p-4">
                  <p className={`font-semibold text-sm mb-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{p.name}</p>
                  <p className="text-brand-orange font-bold mb-3">₦{Number(p.price).toLocaleString()}</p>
                  <div className="flex gap-2">
                    <button onClick={() => { addToCart(p, 'M', 1); setCartOpen(true) }} className="flex-1 py-2 bg-brand-orange text-white text-xs font-semibold rounded-xl btn-press">Add to Cart</button>
                    <button onClick={() => toggleWishlist(p)} className="p-2 rounded-xl border border-red-400/30 text-red-400 btn-press text-xs">✕</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}


