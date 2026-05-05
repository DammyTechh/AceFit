import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Mail, Phone, ShoppingBag } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useStore } from '../../lib/store'


export default function AdminCustomers() {
  const { theme } = useStore()
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const isDark = theme === 'dark'

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
        if (data?.length) setCustomers(data)
      } catch {}
    }
    load()
  }, [])

  const filtered = customers.filter(c =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`font-display text-3xl md:text-4xl ${isDark ? 'text-white' : 'text-gray-900'}`}>CUSTOMERS</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{customers.length} registered customers</p>
      </div>

      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border max-w-md ${isDark ? 'bg-brand-dark-card border-brand-dark-border' : 'bg-white border-gray-200'}`}>
        <Search size={15} className="text-brand-orange" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." className={`flex-1 bg-transparent text-sm outline-none ${isDark ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'}`} />
      </div>

      <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-brand-dark-card border-brand-dark-border' : 'bg-white border-gray-200'}`}>
        <div className="overflow-x-auto -mx-0">
          <table className="w-full text-sm">
            <thead>
              <tr className={`text-xs uppercase tracking-wider border-b ${isDark ? 'bg-black/30 text-gray-500 border-brand-dark-border' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                <th className="px-5 py-3 text-left">Customer</th>
                <th className="px-5 py-3 text-center">Orders</th>
                <th className="px-5 py-3 text-right">Total Spent</th>
                <th className="px-5 py-3 text-center hidden md:table-cell">Joined</th>
                <th className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((customer, i) => (
                <motion.tr key={customer.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                  className={`border-t ${isDark ? 'border-brand-dark-border hover:bg-white/[0.02]' : 'border-gray-50 hover:bg-gray-50'}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-brand-orange rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {customer.name?.charAt(0) || customer.email?.charAt(0)}
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{customer.name || 'Anonymous'}</p>
                        <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{customer.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <ShoppingBag size={13} className="text-brand-orange" />
                      <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{customer.orders}</span>
                    </div>
                  </td>
                  <td className={`px-5 py-4 text-right font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    <span className="text-brand-orange">₦{Number(customer.total_spent || 0).toLocaleString()}</span>
                  </td>
                  <td className={`px-5 py-4 text-center text-xs hidden md:table-cell ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{customer.joined || new Date(customer.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-4 text-center">
                    <a href={`mailto:${customer.email}`} className={`p-2 rounded-lg inline-flex transition-colors btn-press ${isDark ? 'text-gray-400 hover:text-brand-orange hover:bg-brand-orange/10' : 'text-gray-500 hover:text-brand-orange hover:bg-brand-orange/5'}`}>
                      <Mail size={14} />
                    </a>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
