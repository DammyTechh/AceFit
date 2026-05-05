import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Heart, Star, Check, MessageCircle, Minus, Plus } from 'lucide-react'
import { useStore } from '../lib/store'
import { getPlaceholder } from '../lib/placeholders'
import toast from 'react-hot-toast'

export default function QuickViewModal({ product, onClose }) {
  const { theme, addToCart, toggleWishlist, isWishlisted } = useStore()
  const [selectedSize, setSelectedSize] = useState('')
  const [qty, setQty] = useState(1)
  const isDark = theme === 'dark'
  const wishlisted = isWishlisted(product.id)
  const sizes = product.sizes || ['XS','S','M','L','XL','XXL']

  const handleAddToCart = () => {
    if (!selectedSize) { toast('Please select a size 📏', { icon: '👆' }); return }
    addToCart(product, selectedSize, qty)
    toast.success(`${product.name} added to cart!`)
    onClose()
  }

  const handleWhatsApp = () => {
    const msg = encodeURIComponent(`Hi! I want to order:\n*${product.name}*\nSize: ${selectedSize || 'TBD'}\nQty: ${qty}\nPrice: ₦${Number(product.price).toLocaleString()}`)
    window.open(`https://wa.me/2347025692097?text=${msg}`, '_blank')
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[90] flex items-center justify-center p-4 modal-backdrop"
        style={{ background: 'rgba(0,0,0,0.8)' }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 22, stiffness: 300 }}
          className={`relative w-full max-w-3xl rounded-2xl overflow-hidden ${isDark ? 'bg-brand-dark-card border border-brand-dark-border' : 'bg-white'}`}
        >
          <button onClick={onClose} className={`absolute top-4 right-4 z-10 p-2 rounded-xl transition-colors btn-press ${isDark ? 'bg-brand-dark-border text-gray-400 hover:text-white' : 'bg-gray-100 text-gray-500 hover:text-gray-900'}`}>
            <X size={18} />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Image */}
            <div className="relative aspect-square bg-gray-900 overflow-hidden">
              <img
                src={product.image_url || getPlaceholder(product.category)}
                alt={product.name}
                className="w-full h-full object-cover object-top"
                onError={e => { e.target.src = getPlaceholder(product.category) }}
              />
              {product.is_new && (
                <span className="absolute top-4 left-4 px-3 py-1 bg-brand-orange text-white text-xs font-bold rounded-full">NEW</span>
              )}
            </div>

            {/* Info */}
            <div className="p-6 flex flex-col">
              <div className="flex-1">
                <p className="text-brand-orange text-xs font-bold uppercase tracking-widest mb-1">{product.category}</p>
                <h2 className={`text-xl font-bold leading-tight mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{product.name}</h2>

                {product.rating && (
                  <div className="flex items-center gap-1.5 mb-3">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={13} className={s <= Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : isDark ? 'text-gray-600' : 'text-gray-300'} />
                    ))}
                    <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{product.rating}</span>
                  </div>
                )}

                <p className={`text-sm leading-relaxed mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{product.description}</p>

                <div className="flex items-baseline gap-2 mb-5">
                  <span className="text-brand-orange font-bold text-2xl">₦{Number(product.price).toLocaleString()}</span>
                  {product.original_price && (
                    <span className={`text-sm line-through ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>₦{Number(product.original_price).toLocaleString()}</span>
                  )}
                </div>

                {/* Size selector */}
                <div className="mb-4">
                  <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Size</p>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map(s => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s)}
                        className={`w-12 h-10 rounded-xl text-sm font-semibold transition-all btn-press relative ${
                          selectedSize === s
                            ? 'bg-brand-orange text-white shadow-md'
                            : isDark ? 'bg-brand-dark-border text-gray-400 hover:bg-brand-orange/20 hover:text-white' : 'bg-gray-100 text-gray-600 hover:bg-brand-orange/10 hover:text-brand-orange'
                        }`}
                      >
                        {s}
                        {selectedSize === s && <Check size={8} className="absolute top-1 right-1" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Qty */}
                <div className="flex items-center gap-3 mb-5">
                  <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Qty</p>
                  <div className={`flex items-center gap-2 px-2 py-1 rounded-xl border ${isDark ? 'border-brand-dark-border' : 'border-gray-200'}`}>
                    <button onClick={() => setQty(q => Math.max(1, q - 1))} className={`p-1 rounded-lg btn-press ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}><Minus size={13} /></button>
                    <span className={`w-6 text-center text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{qty}</span>
                    <button onClick={() => setQty(q => q + 1)} className={`p-1 rounded-lg btn-press ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}><Plus size={13} /></button>
                  </div>
                  {product.stock !== undefined && product.stock > 0 && (
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{product.stock} in stock</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2.5">
                <button
                  onClick={handleAddToCart}
                  className="w-full py-3.5 bg-brand-orange hover:bg-brand-orange-light text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all btn-press shadow-lg shadow-brand-orange/25"
                >
                  <ShoppingBag size={16} /> Add to Cart
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleWhatsApp}
                    className="py-3 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl flex items-center justify-center gap-1.5 text-sm transition-all btn-press"
                  >
                    <MessageCircle size={14} /> WhatsApp
                  </button>
                  <button
                    onClick={() => { toggleWishlist(product); toast(wishlisted ? 'Removed from wishlist' : 'Added to wishlist ❤️') }}
                    className={`py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-1.5 transition-all btn-press border ${
                      wishlisted ? 'bg-red-500/10 border-red-500/30 text-red-400' : isDark ? 'border-brand-dark-border text-gray-400 hover:border-red-400 hover:text-red-400' : 'border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-400'
                    }`}
                  >
                    <Heart size={14} fill={wishlisted ? 'currentColor' : 'none'} /> Wishlist
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
