// Nigerian delivery fee calculator
// Fees are based on state/region proximity to Lagos (AceFit base)

export const DELIVERY_ZONES = {
  // Zone A – Lagos (same city)
  zone_a: {
    label: 'Lagos (Same Day / Next Day)',
    fee: 1500,
    eta: '1–2 days',
    states: ['lagos'],
  },
  // Zone B – Southwest
  zone_b: {
    label: 'Southwest Nigeria',
    fee: 2500,
    eta: '2–3 days',
    states: ['ogun', 'oyo', 'osun', 'ondo', 'ekiti'],
  },
  // Zone C – South-South / Southeast
  zone_c: {
    label: 'South-South / Southeast',
    fee: 3500,
    eta: '3–5 days',
    states: ['delta', 'edo', 'rivers', 'bayelsa', 'cross river', 'akwa ibom', 'anambra', 'imo', 'abia', 'enugu', 'ebonyi'],
  },
  // Zone D – North Central / FCT
  zone_d: {
    label: 'North Central / FCT',
    fee: 3000,
    eta: '3–4 days',
    states: ['abuja', 'fct', 'kogi', 'kwara', 'niger', 'benue', 'plateau', 'nassarawa'],
  },
  // Zone E – Northwest / Northeast
  zone_e: {
    label: 'Northwest / Northeast',
    fee: 4500,
    eta: '4–6 days',
    states: ['kano', 'kaduna', 'katsina', 'sokoto', 'kebbi', 'zamfara', 'jigawa', 'bauchi', 'gombe', 'yobe', 'borno', 'adamawa', 'taraba'],
  },
}

export const FREE_DELIVERY_THRESHOLD = 50000 // ₦50,000 gets free delivery

/**
 * Detect zone from address string
 * @param {string} address - Full address string
 * @returns {{ zone: string, fee: number, eta: string, label: string }}
 */
export function getDeliveryFee(address, subtotal = 0) {
  if (!address) return { zone: 'unknown', fee: 3000, eta: '3–5 days', label: 'Standard Delivery' }

  // Free delivery for large orders
  if (subtotal >= FREE_DELIVERY_THRESHOLD) {
    return { zone: 'free', fee: 0, eta: '2–5 days', label: 'FREE Delivery 🎉' }
  }

  const lower = address.toLowerCase()

  for (const [zoneKey, zone] of Object.entries(DELIVERY_ZONES)) {
    if (zone.states.some(state => lower.includes(state))) {
      return { zone: zoneKey, fee: zone.fee, eta: zone.eta, label: zone.label }
    }
  }

  // Default – unknown location
  return { zone: 'standard', fee: 3500, eta: '3–5 days', label: 'Standard Delivery' }
}

export const ALL_NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa',
  'Benue', 'Borno', 'Cross River', 'Delta', 'Ebonyi', 'Edo',
  'Ekiti', 'Enugu', 'FCT – Abuja', 'Gombe', 'Imo', 'Jigawa',
  'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nassarawa', 'Niger', 'Ogun', 'Ondo', 'Osun',
  'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
]
