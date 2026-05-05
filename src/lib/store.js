import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set, get) => ({
      // Theme
      theme: 'dark',
      toggleTheme: () => set(s => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),

      // Auth
      user: null,
      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),

      // Cart
      cart: [],
      addToCart: (product, size, qty = 1) => {
        const cart = get().cart
        const existing = cart.find(i => i.id === product.id && i.size === size)
        if (existing) {
          set({ cart: cart.map(i => i.id === product.id && i.size === size ? { ...i, qty: i.qty + qty } : i) })
        } else {
          set({ cart: [...cart, { ...product, size, qty }] })
        }
      },
      removeFromCart: (id, size) => set(s => ({ cart: s.cart.filter(i => !(i.id === id && i.size === size)) })),
      updateQty: (id, size, qty) => set(s => ({
        cart: s.cart.map(i => i.id === id && i.size === size ? { ...i, qty } : i)
      })),
      clearCart: () => set({ cart: [] }),
      cartTotal: () => get().cart.reduce((t, i) => t + i.price * i.qty, 0),
      cartCount: () => get().cart.reduce((t, i) => t + i.qty, 0),

      // Wishlist
      wishlist: [],
      toggleWishlist: (product) => {
        const wl = get().wishlist
        const exists = wl.find(i => i.id === product.id)
        set({ wishlist: exists ? wl.filter(i => i.id !== product.id) : [...wl, product] })
      },
      isWishlisted: (id) => get().wishlist.some(i => i.id === id),

      // UI
      cartOpen: false,
      setCartOpen: (v) => set({ cartOpen: v }),
      authModalOpen: false,
      setAuthModalOpen: (v) => set({ authModalOpen: v }),
      supportOpen: false,
      setSupportOpen: (v) => set({ supportOpen: v }),

      // Search
      searchQuery: '',
      setSearchQuery: (q) => set({ searchQuery: q }),

      // Filters
      activeCategory: 'all',
      setActiveCategory: (c) => set({ activeCategory: c }),
      activeGender: 'all',
      setActiveGender: (g) => set({ activeGender: g }),
      priceRange: [0, 100000],
      setPriceRange: (r) => set({ priceRange: r }),
      sortBy: 'newest',
      setSortBy: (s) => set({ sortBy: s }),

      // Location consent
      locationConsent: false,
      setLocationConsent: (v) => set({ locationConsent: v }),
      termsAccepted: false,
      setTermsAccepted: (v) => set({ termsAccepted: v }),
    }),
    {
      name: 'acefit-store',
      partialize: (state) => ({
        theme: state.theme,
        cart: state.cart,
        wishlist: state.wishlist,
        locationConsent: state.locationConsent,
        termsAccepted: state.termsAccepted,
      })
    }
  )
)
