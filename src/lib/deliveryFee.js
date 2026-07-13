// Delivery fee calculator — zones loaded from DB (with local fallback)
import { supabase } from './supabase'

// Local fallback (used if DB zones not available)
export const FALLBACK_ZONES = [
  { id: 'zone-a', name: 'Lagos (Same Day / Next Day)', states: ['lagos'], fee: 1500, eta: '1–2 days' },
  { id: 'zone-b', name: 'Southwest Nigeria',           states: ['ogun','oyo','osun','ondo','ekiti'], fee: 2500, eta: '2–3 days' },
  { id: 'zone-c', name: 'North Central / FCT',         states: ['abuja','fct','kogi','kwara','niger','benue','plateau','nassarawa'], fee: 3000, eta: '3–4 days' },
  { id: 'zone-d', name: 'South-South / Southeast',     states: ['delta','edo','rivers','bayelsa','cross river','akwa ibom','anambra','imo','abia','enugu','ebonyi'], fee: 3500, eta: '3–5 days' },
  { id: 'zone-e', name: 'Northwest / Northeast',       states: ['kano','kaduna','katsina','sokoto','kebbi','zamfara','jigawa','bauchi','gombe','yobe','borno','adamawa','taraba'], fee: 4500, eta: '4–6 days' },
]

export const FREE_DELIVERY_THRESHOLD = 999999999

let _cachedZones = null

export async function getDeliveryZones() {
  if (_cachedZones) return _cachedZones
  try {
    const { data } = await supabase.from('delivery_zones').select('*').eq('is_active', true).order('sort_order')
    _cachedZones = data?.length ? data : FALLBACK_ZONES
  } catch {
    _cachedZones = FALLBACK_ZONES
  }
  return _cachedZones
}

export function clearZonesCache() { _cachedZones = null }

export function getDeliveryFee(address, subtotal = 0, zones = FALLBACK_ZONES) {
  if (!address) return { zone: 'standard', fee: 3500, eta: '3–5 days', label: 'Standard Delivery', zone_id: null }
  if (subtotal >= FREE_DELIVERY_THRESHOLD)
    return { zone: 'free', fee: 0, eta: '2–5 days', label: 'FREE Delivery 🎉', zone_id: null }

  const lower = address.toLowerCase()
  for (const z of zones) {
    const states = Array.isArray(z.states) ? z.states : []
    if (states.some(s => lower.includes(s.toLowerCase()))) {
      return { zone: z.name, fee: Number(z.fee), eta: z.eta, label: z.name, zone_id: z.id }
    }
  }
  return { zone: 'standard', fee: 3500, eta: '3–5 days', label: 'Standard Delivery', zone_id: null }
}

export const ALL_NIGERIAN_STATES = [
  'Abia','Adamawa','Akwa Ibom','Anambra','Bauchi','Bayelsa',
  'Benue','Borno','Cross River','Delta','Ebonyi','Edo',
  'Ekiti','Enugu','FCT – Abuja','Gombe','Imo','Jigawa',
  'Kaduna','Kano','Katsina','Kebbi','Kogi','Kwara',
  'Lagos','Nassarawa','Niger','Ogun','Ondo','Osun',
  'Oyo','Plateau','Rivers','Sokoto','Taraba','Yobe','Zamfara',
]
