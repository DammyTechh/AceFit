// Shared color helpers used by the storefront (product cards + quick view)
// and admin (per-color image uploads).

// Map common color names to a representative hex value.
export const COLOR_HEX = {
  black: '#111111', white: '#f5f5f5', red: '#ef4444', blue: '#3b82f6',
  green: '#22c55e', yellow: '#eab308', orange: '#f97316', purple: '#a855f7',
  pink: '#ec4899', gray: '#6b7280', grey: '#6b7280', brown: '#92400e',
  navy: '#1e3a8a', teal: '#14b8a6', maroon: '#7f1d1d', beige: '#e7d8b1',
  gold: '#d4af37', silver: '#c0c0c0', cream: '#f5f0e1', khaki: '#a3925f',
}

// Best-effort hex for an arbitrary color name (falls back to a neutral).
export function colorToHex(name = '') {
  const key = String(name).trim().toLowerCase()
  return COLOR_HEX[key] || '#888888'
}

// Per-color preview image, if the admin uploaded one for this color.
// products.color_images is a map { "<Color Name>": "<image url>" }.
export function getColorImage(product, color) {
  if (!product || !color) return null
  const map = product.color_images || {}
  // case-insensitive match against whatever key casing was stored
  const hit = Object.keys(map).find(k => k.toLowerCase() === String(color).toLowerCase())
  return hit ? map[hit] : null
}

// The image to show for a given selected color:
// 1) a dedicated per-color image if it exists, else 2) the main image.
export function previewImageFor(product, color) {
  return getColorImage(product, color) || product?.image_url || ''
}

// When there is NO dedicated per-color image, we tint the base image toward
// the chosen color using a blended overlay. Returns the overlay style, or null
// when a real per-color image exists (no tint needed).
export function tintOverlayStyle(product, color) {
  if (!color) return null
  if (getColorImage(product, color)) return null   // real photo — don't tint
  return {
    backgroundColor: colorToHex(color),
    mixBlendMode: 'color',
    opacity: 0.55,
    pointerEvents: 'none',
  }
}
