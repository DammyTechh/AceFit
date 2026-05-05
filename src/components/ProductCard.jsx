import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Heart, ShoppingBag, Eye, Star, Zap } from 'lucide-react'
import { useStore } from '../lib/store'
import { getPlaceholder } from '../lib/placeholders'
import toast from 'react-hot-toast'

const SIZE_OPTIONS = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

export default function ProductCard({ product, index = 0, onQuickView }) {
  const { theme, addToCart, toggleWishlist, isWishlisted, setAuthModalOpen, user } = useStore()
  const [selectedSize, setSelectedSize] = useState('')
  const [isHovered, setIsHovered] = useState(false)
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [showSizes, setShowSizes] = useState(false)
  const cardRef = useRef()
  const isDark = theme === 'dark'

  const handleMouseMove = (e) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientY - rect.top - rect.height / 2) / rect.height * -12
    const y = (e.clientX - rect.left - rect.width / 2) / rect.width * 12
    setRotation({ x, y })
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    setRotation({ x: 0, y: 0 })
    setShowSizes(false)
  }

  const handleAddToCart = (e) => {
    e.stopPropagation()
    if (!selectedSize) {
      setShowSizes(true)
      toast('Select a size first 👆', { icon: '📏' })
      return
    }
    addToCart(product, selectedSize)
    toast.success(`${product.name} added to cart!`)
    setShowSizes(false)
    setSelectedSize('')
  }

  const handleWishlist = (e) => {
    e.stopPropagation()
    toggleWishlist(product)
    toast(isWishlisted(product.id) ? 'Removed from wishlist' : 'Added to wishlist ❤️', {
      icon: isWishlisted(product.id) ? '💔' : '❤️'
    })
  }

  const wishlisted = isWishlisted(product.id)
  const discount = product.original_price
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : null

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05, ease: 'easeOut' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-2xl overflow-hidden cursor-pointer group ${
        isDark ? 'bg-brand-dark-card border border-brand-dark-border' : 'bg-white border border-gray-100'
      }`}
      style={{
        boxShadow: isHovered ? '0 30px 60px rgba(255,107,0,0.2), 0 0 0 1px rgba(255,107,0,0.15)' : isDark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.08)',
        transform: isHovered
          ? `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) translateY(-8px)`
          : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)',
        transition: isHovered ? 'transform 0.1s ease, box-shadow 0.3s ease' : 'transform 0.4s ease, box-shadow 0.3s ease',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Image */}
      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800">
        <img
          src={product.image_url || getPlaceholder(product.category)}
          alt={product.name}
          className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
          onError={e => { e.target.src = getPlaceholder(product.category) }}
        />

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.is_new && (
            <span className="px-2 py-0.5 bg-brand-orange text-white text-[10px] font-bold rounded-full uppercase tracking-wide">New</span>
          )}
          {discount && (
            <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">-{discount}%</span>
          )}
          {product.is_bestseller && (
            <span className="px-2 py-0.5 bg-yellow-500 text-black text-[10px] font-bold rounded-full flex items-center gap-0.5">
              <Zap size={8} /> Hot
            </span>
          )}
        </div>

        {/* Quick actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          <button
            onClick={handleWishlist}
            className={`w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all btn-press ${
              wishlisted ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-700 hover:bg-red-50 hover:text-red-500'
            }`}
          >
            <Heart size={14} fill={wishlisted ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onQuickView?.(product) }}
            className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-all btn-press"
          >
            <Eye size={14} className="text-gray-700" />
          </button>
        </div>

        {/* Size selector overlay */}
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: showSizes || isHovered ? '0%' : '100%' }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="absolute bottom-0 left-0 right-0 p-3 bg-black/80 backdrop-blur-sm"
        >
          <p className="text-white/60 text-[10px] uppercase tracking-wider mb-2">Select Size</p>
          <div className="flex flex-wrap gap-1.5">
            {(product.sizes || SIZE_OPTIONS).map(size => (
              <button
                key={size}
                onClick={(e) => { e.stopPropagation(); setSelectedSize(size) }}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all btn-press ${
                  selectedSize === size
                    ? 'bg-brand-orange text-white'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div>
            <p className={`text-[10px] uppercase tracking-widest font-medium mb-0.5 ${isDark ? 'text-brand-orange' : 'text-brand-orange'}`}>
              {product.category || 'Fitness Wear'}
            </p>
            <h3 className={`font-semibold text-sm leading-tight line-clamp-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {product.name}
            </h3>
          </div>
          {product.rating && (
            <div className="flex items-center gap-0.5 shrink-0">
              <Star size={11} className="text-yellow-400 fill-yellow-400" />
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{product.rating}</span>
            </div>
          )}
        </div>

        {product.description && (
          <p className={`text-xs leading-relaxed line-clamp-2 mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-brand-orange font-bold text-lg">
              ₦{Number(product.price).toLocaleString()}
            </span>
            {product.original_price && (
              <span className={`text-xs line-through ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                ₦{Number(product.original_price).toLocaleString()}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all btn-press ${
              selectedSize
                ? 'bg-brand-orange hover:bg-brand-orange-light text-white shadow-lg shadow-brand-orange/25'
                : isDark
                  ? 'bg-brand-dark-border text-gray-400 hover:bg-brand-orange hover:text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-brand-orange hover:text-white'
            }`}
          >
            <ShoppingBag size={13} />
            {selectedSize ? 'Add' : 'Cart'}
          </button>
        </div>

        {/* Stock indicator */}
        {product.stock !== undefined && product.stock <= 5 && product.stock > 0 && (
          <p className="text-[10px] text-orange-400 mt-2 font-medium">⚡ Only {product.stock} left!</p>
        )}
        {product.stock === 0 && (
          <p className="text-[10px] text-red-400 mt-2 font-medium">● Out of stock</p>
        )}
      </div>
    </motion.div>
  )
}
