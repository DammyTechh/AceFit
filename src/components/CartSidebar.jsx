import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react'
import { useStore } from '../lib/store'

export default function CartSidebar({ open, onClose, onCheckout }) {
  const { cart, removeFromCart, updateQty, cartTotal, theme } = useStore()
  const isDark = theme === 'dark'
  const total = cartTotal()

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" onClick={onClose}/>

          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`fixed top-0 right-0 h-full w-full max-w-sm z-[110] flex flex-col ${isDark ? 'bg-[#0F0F0F]' : 'bg-white'}`}>

            {/* Header */}
            <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-[#2A2A2A]' : 'border-gray-200'}`}>
              <div>
                <h2 className={`font-display text-2xl ${isDark ? 'text-white' : 'text-gray-900'}`}>YOUR BAG</h2>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{cart.reduce((t, i) => t + i.qty, 0)} item{cart.reduce((t, i) => t + i.qty, 0) !== 1 ? 's' : ''}</p>
              </div>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-brand-orange/10 text-gray-400 hover:text-brand-orange transition-all"><X size={20}/></button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag size={48} className="text-brand-orange/30 mb-4"/>
                  <p className={`font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Your bag is empty</p>
                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>Add something fire to get started</p>
                  <button onClick={onClose} className="mt-6 px-6 py-2.5 bg-brand-orange text-white text-sm font-bold rounded-xl hover:bg-brand-orange-light transition-all">
                    Shop Now
                  </button>
                </div>
              ) : cart.map((item, i) => (
                <motion.div key={`${item.id}-${item.size}-${item.color}`} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  className={`flex gap-3 p-3 rounded-2xl ${isDark ? 'bg-[#141414]' : 'bg-gray-50'}`}>
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#1A1A1A]">
                    {item.image_url
                      ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover"/>
                      : <div className="w-full h-full flex items-center justify-center"><ShoppingBag size={16} className="text-gray-600"/></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold line-clamp-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.name}</p>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {item.size}{item.color ? ` · ${item.color}` : ''}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-brand-orange text-sm font-bold">₦{(item.price * item.qty).toLocaleString()}</span>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => item.qty === 1 ? removeFromCart(item.id, item.size, item.color) : updateQty(item.id, item.size, item.qty - 1, item.color)}
                          className="w-6 h-6 rounded-lg bg-brand-orange/10 text-brand-orange flex items-center justify-center hover:bg-brand-orange hover:text-white transition-all">
                          {item.qty === 1 ? <Trash2 size={10}/> : <Minus size={10}/>}
                        </button>
                        <span className={`w-5 text-center text-xs font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, item.size, item.qty + 1, item.color)}
                          className="w-6 h-6 rounded-lg bg-brand-orange/10 text-brand-orange flex items-center justify-center hover:bg-brand-orange hover:text-white transition-all">
                          <Plus size={10}/>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className={`p-6 border-t ${isDark ? 'border-[#2A2A2A]' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between mb-5">
                  <span className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Subtotal</span>
                  <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>₦{total.toLocaleString()}</span>
                </div>
                <p className={`text-xs mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                  + delivery fee calculated at checkout based on your location
                </p>
                <button onClick={onCheckout}
                  className="w-full py-4 bg-brand-orange hover:bg-brand-orange-light text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-brand-orange/25 active:scale-95">
                  Checkout <ArrowRight size={16}/>
                </button>
                <button onClick={onClose}
                  className={`w-full mt-3 py-3 text-sm font-medium rounded-xl transition-all ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
