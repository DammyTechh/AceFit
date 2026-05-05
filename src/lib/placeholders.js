// src/lib/placeholders.js
// Category-specific placeholder images shown until admin uploads product images
// These are real Unsplash fitness photos

export const CATEGORY_PLACEHOLDERS = {"tshirts": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80", "joggers": "https://images.unsplash.com/photo-1539185441755-769473a23570?w=400&q=80", "hoodies": "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=400&q=80", "shorts": "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&q=80", "leggings": "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400&q=80", "sports-bra": "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80", "tank-tops": "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&q=80", "tracksuits": "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80", "accessories": "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&q=80", "default": "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=80"}

export const getPlaceholder = (category) => 
  CATEGORY_PLACEHOLDERS[category] || CATEGORY_PLACEHOLDERS.default
