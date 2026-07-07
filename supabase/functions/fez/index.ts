// Supabase Edge Function: Fez Delivery proxy
// Keeps your Fez secret key on the server (never expose it in the browser).
//
// Deploy:
//   supabase functions deploy fez --no-verify-jwt
//   supabase secrets set FEZ_BASE_URL=https://apisandbox.fezdelivery.co/v1
//   supabase secrets set FEZ_SECRET_KEY=your_secret_key
//   # optional — only if you use live quotes; confirm the exact path in your
//   # Fez dashboard (Developers → API reference). Leave unset to disable quotes.
//   supabase secrets set FEZ_COST_PATH=/order-price
//
// Actions (POST body): { action: "quote" | "create-order", payload: {...} }
//
// NOTE: the /order endpoint and its `secret_key` header are documented and
// stable. The cost/quote endpoint path is account-specific — verify FEZ_COST_PATH
// against your own Fez developer docs before enabling live quotes in checkout.

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const BASE   = Deno.env.get('FEZ_BASE_URL')   || 'https://apisandbox.fezdelivery.co/v1'
const SECRET = Deno.env.get('FEZ_SECRET_KEY') || ''
const COST_PATH = Deno.env.get('FEZ_COST_PATH') || ''   // e.g. "/order-price"

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...cors, 'Content-Type': 'application/json' },
  })
}

async function fezFetch(path: string, method: string, body?: unknown) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', 'secret_key': SECRET },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let data: unknown
  try { data = JSON.parse(text) } catch { data = text }
  return { ok: res.ok, status: res.status, data }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  if (!SECRET) return json({ ok: false, error: 'FEZ_SECRET_KEY not configured' }, 500)

  try {
    const { action, payload } = await req.json()

    if (action === 'quote') {
      if (!COST_PATH) return json({ ok: false, error: 'quotes-disabled' }, 200)
      // payload: { recipientState, recipientAddress, weight, valueOfItem }
      const r = await fezFetch(COST_PATH, 'POST', payload)
      return json({ ok: r.ok, data: r.data }, r.ok ? 200 : 400)
    }

    if (action === 'create-order') {
      // payload: array of order objects (Fez accepts a batch array)
      const orders = Array.isArray(payload) ? payload : [payload]
      const r = await fezFetch('/order', 'POST', orders)
      return json({ ok: r.ok, data: r.data }, r.ok ? 200 : 400)
    }

    return json({ ok: false, error: 'unknown action' }, 400)
  } catch (err) {
    return json({ ok: false, error: String(err) }, 500)
  }
})
