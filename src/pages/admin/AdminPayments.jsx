import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const STATUS_COLOR = { success:'text-green-400 bg-green-400/10', failed:'text-red-400 bg-red-400/10', pending:'text-yellow-400 bg-yellow-400/10', abandoned:'text-gray-400 bg-gray-400/10', refunded:'text-blue-400 bg-blue-400/10' }

export default function AdminPayments() {
  const [txns, setTxns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('payment_transactions').select('*').order('created_at', { ascending: false }).limit(200)
      .then(({ data }) => { setTxns(data || []); setLoading(false) })
  }, [])

  const total = txns.filter(t => t.status === 'success').reduce((s, t) => s + Number(t.amount), 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Payments</h1>
        <p className="text-gray-500 text-sm mt-1">Total collected: <span className="text-green-400 font-bold">₦{total.toLocaleString()}</span></p>
      </div>
      <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1A1A1A]">
                {['Reference','Amount','Status','Channel','Customer','Date'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [1,2,3].map(i => (
                <tr key={i} className="border-b border-[#1A1A1A]">{[1,2,3,4,5,6].map(j => <td key={j} className="px-4 py-4"><div className="h-4 bg-[#2A2A2A] rounded animate-pulse"/></td>)}</tr>
              )) : txns.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-gray-500 py-16">No transactions yet</td></tr>
              ) : txns.map(t => (
                <tr key={t.id} className="border-b border-[#1A1A1A] hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3 font-mono text-brand-orange text-xs">{t.reference}</td>
                  <td className="px-4 py-3 text-white font-semibold text-sm">₦{Number(t.amount).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold capitalize ${STATUS_COLOR[t.status]}`}>{t.status}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm capitalize">{t.channel || '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{t.customer_email || '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{new Date(t.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
