// Client-side helper for Fez Delivery, via the `fez` Supabase edge function.
// The secret key lives on the server; the browser only calls the function.
//
// Live quotes are OFF unless VITE_FEZ_ENABLED === 'true'. When off (default),
// checkout keeps using your delivery_zones table exactly as before.
import { supabase } from './supabase'

export const FEZ_ENABLED = import.meta.env.VITE_FEZ_ENABLED === 'true'

// Ask Fez for a live delivery price. Returns { ok, fee } or { ok:false }.
// Falls back silently so the caller can use zone pricing instead.
export async function getFezQuote({ state, address, weightKg = 1, valueOfItem = 0 }) {
  if (!FEZ_ENABLED) return { ok: false }
  try {
    const { data, error } = await supabase.functions.invoke('fez', {
      body: {
        action: 'quote',
        payload: {
          recipientState: state,
          recipientAddress: address || state,
          weight: weightKg,
          valueOfItem: String(valueOfItem || 0),
        },
      },
    })
    if (error || !data?.ok) return { ok: false }
    // Fez responses vary; try common shapes for the amount.
    const fee = Number(
      data.data?.cost ?? data.data?.amount ?? data.data?.price ??
      data.data?.data?.cost ?? data.data?.deliveryCost ?? NaN
    )
    return Number.isFinite(fee) ? { ok: true, fee } : { ok: false }
  } catch {
    return { ok: false }
  }
}

// Book the actual delivery after payment succeeds. Call from your order flow
// (ideally server-side). Returns { ok, data }.
export async function createFezOrder(order) {
  try {
    const { data, error } = await supabase.functions.invoke('fez', {
      body: { action: 'create-order', payload: order },
    })
    if (error) return { ok: false, error: error.message }
    return { ok: !!data?.ok, data: data?.data }
  } catch (err) {
    return { ok: false, error: String(err) }
  }
}
