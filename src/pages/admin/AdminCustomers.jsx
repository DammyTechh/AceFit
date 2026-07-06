import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase.from('profiles').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setCustomers(data || []); setLoading(false) })
  }, [])

  const filtered = customers.filter(c => !search || c.email?.toLowerCase().includes(search.toLowerCase()) || c.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Customers</h1>
        <p className="text-gray-500 text-sm mt-1">{customers.length} registered customers</p>
      </div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers…"
        className="w-full max-w-sm px-4 py-2.5 bg-[#141414] border border-[#2A2A2A] rounded-xl text-white text-sm outline-none focus:border-brand-orange placeholder-gray-600"/>
      <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1A1A1A]">
              {['Customer','Email','Phone','Orders','Spent','Joined'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? [1,2,3].map(i => (
              <tr key={i} className="border-b border-[#1A1A1A]">{[1,2,3,4,5,6].map(j => <td key={j} className="px-4 py-4"><div className="h-4 bg-[#2A2A2A] rounded animate-pulse"/></td>)}</tr>
            )) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-gray-500 py-16">No customers yet</td></tr>
            ) : filtered.map(c => (
              <tr key={c.id} className="border-b border-[#1A1A1A] hover:bg-white/2 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-brand-orange rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {(c.name || c.email || 'A').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-white text-sm">{c.name || 'Anonymous'}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-400 text-sm">{c.email}</td>
                <td className="px-4 py-3 text-gray-400 text-sm">{c.phone || '—'}</td>
                <td className="px-4 py-3 text-white text-sm">{c.total_orders || 0}</td>
                <td className="px-4 py-3 text-brand-orange text-sm font-semibold">₦{Number(c.total_spent || 0).toLocaleString()}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{new Date(c.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
