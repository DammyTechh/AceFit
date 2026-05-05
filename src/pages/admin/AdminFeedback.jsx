import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Star, Search } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useStore } from '../../lib/store'


export default function AdminFeedback() {
  const { theme } = useStore()
  const [feedback, setFeedback] = useState([])
  const [search, setSearch] = useState('')
  const [ratingFilter, setRatingFilter] = useState(0)
  const isDark = theme === 'dark'

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await supabase.from('feedback').select('*').order('created_at', { ascending: false })
        if (data?.length) setFeedback(data)
      } catch {}
    }
    load()
  }, [])

  const avgRating = (feedback.reduce((t, f) => t + (f.rating || 0), 0) / feedback.length).toFixed(1)
  const filtered = feedback.filter(f => {
    const matchSearch = !search || f.name?.toLowerCase().includes(search.toLowerCase()) || f.message?.toLowerCase().includes(search.toLowerCase())
    const matchRating = !ratingFilter || f.rating === ratingFilter
    return matchSearch && matchRating
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`font-display text-3xl md:text-4xl ${isDark ? 'text-white' : 'text-gray-900'}`}>FEEDBACK</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{feedback.length} reviews · Avg: {avgRating} ⭐</p>
      </div>

      {/* Rating summary */}
      <div className="grid grid-cols-5 gap-3">
        {[5,4,3,2,1].map(r => {
          const count = feedback.filter(f => f.rating === r).length
          const pct = Math.round((count / feedback.length) * 100) || 0
          return (
            <button key={r} onClick={() => setRatingFilter(ratingFilter === r ? 0 : r)}
              className={`p-3 rounded-2xl border text-center transition-all btn-press ${ratingFilter === r ? 'border-brand-orange bg-brand-orange/10' : isDark ? 'bg-brand-dark-card border-brand-dark-border hover:border-brand-orange/40' : 'bg-white border-gray-200 hover:border-brand-orange/40'}`}>
              <div className="flex justify-center mb-1">{'⭐'.repeat(r)}</div>
              <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{count}</p>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{pct}%</p>
            </button>
          )
        })}
      </div>

      <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border max-w-md ${isDark ? 'bg-brand-dark-card border-brand-dark-border' : 'bg-white border-gray-200'}`}>
        <Search size={15} className="text-brand-orange" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search feedback..." className={`flex-1 bg-transparent text-sm outline-none ${isDark ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'}`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item, i) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className={`p-5 rounded-2xl border ${isDark ? 'bg-brand-dark-card border-brand-dark-border' : 'bg-white border-gray-200'}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-brand-orange rounded-full flex items-center justify-center text-white text-sm font-bold">{item.name?.charAt(0)}</div>
                <div>
                  <p className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>{item.name}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{item.email}</p>
                </div>
              </div>
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(s => <Star key={s} size={12} className={s <= item.rating ? 'text-yellow-400 fill-yellow-400' : isDark ? 'text-gray-700' : 'text-gray-200'} />)}
              </div>
            </div>
            <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>"{item.message}"</p>
            <p className={`text-xs mt-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>{new Date(item.created_at).toLocaleDateString()}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
