import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, MessageCircle, CreditCard, Package } from 'lucide-react'
import { useStore } from '../lib/store'
import { getPlaceholder } from '../lib/placeholders'
import CheckoutModal from './CheckoutModal'
import toast from 'react-hot-toast'

const WHATSAPP = '2347025692097'

export default function CartSidebar() {
  const { cartOpen, setCartOpen, cart, removeFromCart, updateQty, clearCart, cartTotal, theme, user, setAuthModalOpen } = useStore()
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const isDark = theme === 'dark'
  const total = cartTotal()

  const buildWhatsAppMessage = () => {
    const items = cart.map(i =>
      `• ${i.name} (Size: ${i.size}) × ${i.qty} = ₦${(i.price * i.qty).toLocaleString()}`
    ).join('\n')
    return encodeURIComponent(
      `🛒 *AceFit Order*\n\n${items}\n\n*Subtotal: ₦${total.toLocaleString()}*\n\n_Please reply with your delivery address to complete the order._`
    )
  }

  const handleWhatsApp = () => {
    if (!cart.length) return
    window.open(`https://wa.me/${WHATSAPP}?text=${buildWhatsAppMessage()}`, '_blank')
    toast.success('Redirecting to WhatsApp...')
  }

  const handleOpay = () => {
    if (!user) {
      setAuthModalOpen(true)
      toast('Please sign in to checkout with OPay', { icon: '🔐' })
      return
    }
    setCartOpen(false)
    setTimeout(() => setCheckoutOpen(true), 200)
  }

  return (
    <>
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] bg-black/70 modal-backdrop"
              onClick={() => setCartOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`fixed right-0 top-0 bottom-0 w-full max-w-md z-[90] flex flex-col ${isDark ? 'bg-brand-dark-card' : 'bg-white'}`}
            >
              {/* Header */}
              <div className={`flex items-center justify-between p-5 border-b shrink-0 ${isDark ? 'border-brand-dark-border' : 'border-gray-100'}`}>
                <div className="flex items-center gap-2">
                  <ShoppingBag size={20} className="text-brand-orange" />
                  <h2 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Cart</h2>
                  {cart.length > 0 && (
                    <span className="bg-brand-orange text-white text-xs px-2 py-0.5 rounded-full font-bold">{cart.length}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {cart.length > 0 && (
                    <button onClick={clearCart} className={`text-xs transition-colors hover:text-red-400 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      Clear all
                    </button>
                  )}
                  <button
                    onClick={() => setCartOpen(false)}
                    className={`p-1.5 rounded-lg btn-press ${isDark ? 'text-gray-400 hover:bg-brand-dark-border' : 'text-gray-500 hover:bg-gray-100'}`}
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 gap-4">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center ${isDark ? 'bg-brand-dark-border' : 'bg-gray-100'}`}>
                      <Package size={32} className={isDark ? 'text-gray-600' : 'text-gray-400'} />
                    </div>
                    <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>Your cart is empty</p>
                    <button
                      onClick={() => setCartOpen(false)}
                      className="px-6 py-2.5 bg-brand-orange text-white rounded-xl text-sm font-medium btn-press"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  cart.map((item, i) => (
                    <motion.div
                      key={`${item.id}-${item.size}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex gap-3 p-3 rounded-xl ${isDark ? 'bg-black/30 border border-brand-dark-border' : 'bg-gray-50 border border-gray-100'}`}
                    >
                      <div className="w-16 h-20 rounded-xl overflow-hidden bg-gray-800 shrink-0">
                        <img
                          src={item.image_url || getPlaceholder(item.category)}
                          alt={item.name}
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.name}</h4>
                        <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Size: {item.size}</p>
                        <p className="text-brand-orange font-bold text-sm mt-1">₦{Number(item.price).toLocaleString()}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => item.qty > 1 ? updateQty(item.id, item.size, item.qty - 1) : removeFromCart(item.id, item.size)}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors btn-press ${isDark ? 'bg-brand-dark-border hover:bg-brand-orange hover:text-white text-gray-400' : 'bg-gray-200 hover:bg-brand-orange hover:text-white text-gray-600'}`}
                          >
                            <Minus size={12} />
                          </button>
                          <span className={`text-sm font-bold w-6 text-center ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.qty}</span>
                          <button
                            onClick={() => updateQty(item.id, item.size, item.qty + 1)}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors btn-press ${isDark ? 'bg-brand-dark-border hover:bg-brand-orange hover:text-white text-gray-400' : 'bg-gray-200 hover:bg-brand-orange hover:text-white text-gray-600'}`}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id, item.size)}
                        className="text-gray-500 hover:text-red-400 transition-colors p-1 self-start btn-press"
                      >
                        <Trash2 size={14} />
                      </button>
                    </motion.div>
                  ))
                )}
              </div>

              {/* Footer */}
              {cart.length > 0 && (
                <div className={`p-5 border-t space-y-4 shrink-0 ${isDark ? 'border-brand-dark-border' : 'border-gray-100'}`}>
                  {/* Summary */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Subtotal ({cart.reduce((t,i) => t + i.qty, 0)} items)</span>
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>₦{total.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Delivery fee</span>
                      <span className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Calculated at checkout</span>
                    </div>
                    <div className={`flex justify-between font-bold text-lg pt-2 border-t ${isDark ? 'border-brand-dark-border' : 'border-gray-100'}`}>
                      <span className={isDark ? 'text-white' : 'text-gray-900'}>Subtotal</span>
                      <span className="text-brand-orange">₦{total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Checkout options */}
                  <div className="space-y-2.5">
                    {/* OPay – Full checkout with address */}
                    <button
                      onClick={handleOpay}
                      className="w-full flex items-center justify-center gap-2.5 py-4 bg-brand-orange hover:bg-brand-orange-light text-white font-bold rounded-xl transition-all btn-press shadow-lg shadow-brand-orange/30"
                    >
                      <CreditCard size={18} />
                      Checkout with OPay
                    </button>

                    {/* WhatsApp – quick order */}
                    <button
                      onClick={handleWhatsApp}
                      className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-xl transition-all btn-press shadow-lg shadow-green-900/30"
                    >
                      <MessageCircle size={18} />
                      Order via WhatsApp
                    </button>
                  </div>

                  <p className={`text-[10px] text-center ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
                    OPay: full delivery tracking • WhatsApp: quick order via chat
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Checkout Modal */}
      <CheckoutModal open={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </>
  )
}
