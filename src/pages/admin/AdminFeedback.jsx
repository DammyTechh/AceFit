import React, { useState, useEffect } from 'react'
import { Star, Trash2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

export default function AdminFeedback() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    setLoading(true)
    supabase.from('feedback').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setReviews(data || []); setLoading(false) })
  }
  useEffect(load, [])

  const togglePublish = async (r) => {
    await supabase.from('feedback').update({ is_published: !r.is_published }).eq('id', r.id)
    load()
  }
  const handleDelete = async (id) => {
    if (!confirm('Delete this review?')) return
    await supabase.from('feedback').delete().eq('id', id)
    toast.success('Deleted')
    load()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Reviews & Feedback</h1>
        <p className="text-gray-500 text-sm mt-1">{reviews.length} reviews</p>
      </div>
      <div className="grid gap-4">
        {loading ? [1,2].map(i => <div key={i} className="h-24 bg-[#141414] rounded-2xl animate-pulse"/>) :
        reviews.length === 0 ? <div className="text-center py-20 bg-[#141414] rounded-2xl border border-[#2A2A2A]"><Star size={32} className="text-gray-600 mx-auto mb-3"/><p className="text-gray-500">No reviews yet</p></div> :
        reviews.map(r => (
          <div key={r.id} className={`bg-[#141414] rounded-2xl border p-5 flex items-start gap-4 ${r.is_published ? 'border-[#2A2A2A]' : 'border-red-400/20 opacity-60'}`}>
            <div className="w-10 h-10 bg-brand-orange/10 rounded-full flex items-center justify-center text-brand-orange font-bold shrink-0">
              {(r.name || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <p className="text-white text-sm font-semibold">{r.name}</p>
                <div className="flex">{Array.from({ length: 5 }).map((_,i) => <Star key={i} size={12} className={i < r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}/>)}</div>
                <span className="text-gray-500 text-xs">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
              <p className="text-gray-300 text-sm">{r.message}</p>
              <p className="text-gray-500 text-xs mt-1">{r.email}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => togglePublish(r)} className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${r.is_published ? 'bg-green-500/15 text-green-400 hover:bg-green-500/25' : 'bg-gray-400/10 text-gray-400 hover:bg-gray-400/20'}`}>
                {r.is_published ? 'Published' : 'Hidden'}
              </button>
              <button onClick={() => handleDelete(r.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"><Trash2 size={14}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
