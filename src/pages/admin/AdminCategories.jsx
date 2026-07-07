import React, { useState, useEffect, useRef } from 'react'
import { Loader, Upload, Save } from 'lucide-react'
import { supabase, uploadFile } from '../../lib/supabase'
import toast from 'react-hot-toast'

// The four category cards shown in the "FIND YOUR FIT" section on the homepage.
const DEFAULTS = [
  { id: 'men',         label: "Men's Wear",   sub: 'Tees, Joggers, Hoodies',    image_url: '', sort_order: 0, is_active: true },
  { id: 'women',       label: "Women's Wear", sub: 'Leggings, Sports Bra, Tops', image_url: '', sort_order: 1, is_active: true },
  { id: 'tracksuits',  label: 'Tracksuits',   sub: 'Full Sets & Matching',       image_url: '', sort_order: 2, is_active: true },
  { id: 'accessories', label: 'Accessories',  sub: 'Bands, Gear & More',          image_url: '', sort_order: 3, is_active: true },
]

export default function AdminCategories() {
  const [cats, setCats] = useState(DEFAULTS)
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState(null)
  const [uploadingId, setUploadingId] = useState(null)
  const fileRefs = useRef({})

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('site_categories').select('*').order('sort_order')
    if (data?.length) {
      // merge DB rows over defaults so all four always show
      const byId = Object.fromEntries(data.map(d => [d.id, d]))
      setCats(DEFAULTS.map(d => ({ ...d, ...(byId[d.id] || {}) })))
    }
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const update = (id, patch) => setCats(cs => cs.map(c => c.id === id ? { ...c, ...patch } : c))

  const handleUpload = async (id, file) => {
    if (!file) return
    setUploadingId(id)
    try {
      const url = await uploadFile(file, 'categories')
      update(id, { image_url: url })
      toast.success('Image uploaded — remember to Save')
    } catch (err) {
      toast.error('Upload failed: ' + err.message)
    } finally { setUploadingId(null) }
  }

  const handleSave = async (cat) => {
    setSavingId(cat.id)
    try {
      const payload = {
        id: cat.id, label: cat.label, sub: cat.sub,
        image_url: cat.image_url, sort_order: Number(cat.sort_order) || 0,
        is_active: cat.is_active !== false, updated_at: new Date().toISOString(),
      }
      // upsert on primary key id
      const { error } = await supabase.from('site_categories').upsert(payload, { onConflict: 'id' })
      if (error) throw error
      toast.success(`${cat.label} saved`)
    } catch (err) { toast.error(err.message) }
    finally { setSavingId(null) }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Category Cards</h1>
        <p className="text-gray-500 text-sm mt-1">The “Find Your Fit” cards on the homepage — upload an image for each, then Save.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-56 bg-[#141414] rounded-2xl animate-pulse"/>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {cats.map(cat => (
            <div key={cat.id} className="bg-[#141414] border border-[#2A2A2A] rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-white font-semibold capitalize">{cat.id}</span>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-400">
                  <input type="checkbox" checked={cat.is_active !== false}
                    onChange={e => update(cat.id, { is_active: e.target.checked })} className="accent-brand-orange"/>
                  Visible
                </label>
              </div>

              <div className={`relative border-2 border-dashed rounded-xl overflow-hidden cursor-pointer hover:border-brand-orange transition-all ${cat.image_url ? 'border-brand-orange/40' : 'border-[#2A2A2A]'}`}
                onClick={() => fileRefs.current[cat.id]?.click()}>
                {cat.image_url
                  ? <img src={cat.image_url} alt={cat.label} className="w-full h-40 object-cover"/>
                  : <div className="py-10 text-center"><Upload size={22} className="text-gray-600 mx-auto mb-2"/><p className="text-gray-500 text-sm">Click to upload image</p></div>}
                {uploadingId === cat.id && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><Loader size={20} className="animate-spin text-brand-orange"/></div>}
              </div>
              <input ref={el => (fileRefs.current[cat.id] = el)} type="file" accept="image/*" className="hidden"
                onChange={e => handleUpload(cat.id, e.target.files?.[0])}/>

              <div className="grid grid-cols-2 gap-2">
                <input value={cat.label} onChange={e => update(cat.id, { label: e.target.value })} placeholder="Label"
                  className="px-3 py-2 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white text-sm outline-none focus:border-brand-orange"/>
                <input value={cat.sub} onChange={e => update(cat.id, { sub: e.target.value })} placeholder="Subtitle"
                  className="px-3 py-2 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-white text-sm outline-none focus:border-brand-orange"/>
              </div>

              <button onClick={() => handleSave(cat)} disabled={savingId === cat.id}
                className="w-full py-2.5 bg-brand-orange text-white rounded-xl text-sm font-semibold hover:bg-orange-500 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                {savingId === cat.id ? <><Loader size={14} className="animate-spin"/>Saving…</> : <><Save size={14}/>Save</>}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
