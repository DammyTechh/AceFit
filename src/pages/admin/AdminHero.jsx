import React, { useState, useEffect, useRef } from 'react'
import { Plus, Pencil, Trash2, X, Loader, Upload, GripVertical } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const EMPTY = { title:'', subtitle:'', badge:'New Collection', image_url:'', cta_text:'Shop Now', cta_link:'/', tagline:'', sort_order:0, is_active:true, product_id:null }
const inp = `w-full px-3 py-2.5 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-white text-sm outline-none focus:border-brand-orange placeholder-gray-600`

export default function AdminHero() {
  const [slides, setSlides] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('hero_slides').select('*').order('sort_order')
    setSlides(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openNew = () => { setForm(EMPTY); setEditing(null); setModalOpen(true) }
  const openEdit = (s) => { setForm({ ...EMPTY, ...s }); setEditing(s.id); setModalOpen(true) }
  const close = () => { setModalOpen(false); setEditing(null) }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const path = `hero/${Date.now()}.${file.name.split('.').pop()}`
      await supabase.storage.from('acefit-media').upload(path, file, { upsert: true })
      const { data: { publicUrl } } = supabase.storage.from('acefit-media').getPublicUrl(path)
      setForm(f => ({ ...f, image_url: publicUrl }))
      toast.success('Image uploaded!')
    } catch (err) { toast.error('Upload failed: ' + err.message) }
    finally { setUploading(false) }
  }

  const handleSave = async () => {
    if (!form.image_url) return toast.error('Image is required')
    setSaving(true)
    try {
      const payload = { ...form, sort_order: Number(form.sort_order) || 0 }
      if (editing) {
        await supabase.from('hero_slides').update(payload).eq('id', editing)
        toast.success('Slide updated!')
      } else {
        await supabase.from('hero_slides').insert([payload])
        toast.success('Slide created!')
      }
      close()
      load()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this slide?')) return
    await supabase.from('hero_slides').delete().eq('id', id)
    toast.success('Deleted')
    load()
  }

  const toggleActive = async (s) => {
    await supabase.from('hero_slides').update({ is_active: !s.is_active }).eq('id', s.id)
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Hero Slides</h1>
          <p className="text-gray-500 text-sm mt-1">Manage homepage carousel — changes appear immediately</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-brand-orange text-white rounded-xl text-sm font-semibold hover:bg-orange-500 transition-all">
          <Plus size={16}/> Add Slide
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1,2].map(i => <div key={i} className="h-48 bg-[#141414] rounded-2xl animate-pulse"/>)}
        </div>
      ) : slides.length === 0 ? (
        <div className="text-center py-24 bg-[#141414] rounded-2xl border border-[#2A2A2A]">
          <p className="text-gray-500 text-sm">No slides yet. Add your first hero slide!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {slides.map(s => (
            <div key={s.id} className={`relative rounded-2xl overflow-hidden border transition-all ${s.is_active ? 'border-brand-orange/30' : 'border-[#2A2A2A] opacity-50'}`}>
              <img src={s.image_url} alt={s.title} className="w-full h-48 object-cover"/>
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-4 flex flex-col justify-end">
                {s.badge && <span className="text-brand-orange text-xs font-bold uppercase tracking-wider mb-1">{s.badge}</span>}
                <h3 className="text-white font-bold text-lg leading-tight">{s.title} {s.subtitle}</h3>
                <p className="text-gray-300 text-xs mt-1">Sort: {s.sort_order} · {s.is_active ? '✅ Active' : '🔴 Hidden'}</p>
              </div>
              <div className="absolute top-3 right-3 flex gap-2">
                <button onClick={() => toggleActive(s)}
                  className={`px-2 py-1 rounded-lg text-xs font-bold ${s.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {s.is_active ? 'Live' : 'Hidden'}
                </button>
                <button onClick={() => openEdit(s)} className="p-1.5 bg-black/60 text-white rounded-lg hover:bg-brand-orange transition-all"><Pencil size={12}/></button>
                <button onClick={() => handleDelete(s.id)} className="p-1.5 bg-black/60 text-white rounded-lg hover:bg-red-500 transition-all"><Trash2 size={12}/></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-[#141414] border border-[#2A2A2A] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-[#2A2A2A]">
                <h2 className="text-white font-bold text-lg">{editing ? 'Edit Slide' : 'New Hero Slide'}</h2>
                <button onClick={close} className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5"><X size={18}/></button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Slide Image *</label>
                  <div className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:border-brand-orange transition-all ${form.image_url ? 'border-brand-orange/40' : 'border-[#2A2A2A]'}`}
                    onClick={() => fileRef.current?.click()}>
                    {form.image_url
                      ? <img src={form.image_url} alt="preview" className="h-32 w-full object-cover rounded-lg"/>
                      : <div className="py-8"><Upload size={24} className="text-gray-600 mx-auto mb-2"/><p className="text-gray-500 text-sm">Click to upload slide image</p></div>}
                    {uploading && <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center"><Loader size={20} className="animate-spin text-brand-orange"/></div>}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload}/>
                  <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="Or paste image URL" className={`${inp} mt-2`}/>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-1.5">Headline</label>
                    <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="TRAIN" className={inp}/></div>
                  <div><label className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-1.5">Sub-headline</label>
                    <input value={form.subtitle} onChange={e => setForm(f => ({ ...f, subtitle: e.target.value }))} placeholder="HARDER." className={inp}/></div>
                  <div><label className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-1.5">Badge Text</label>
                    <input value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))} placeholder="New Collection" className={inp}/></div>
                  <div><label className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-1.5">CTA Button</label>
                    <input value={form.cta_text} onChange={e => setForm(f => ({ ...f, cta_text: e.target.value }))} placeholder="Shop Now" className={inp}/></div>
                  <div><label className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-1.5">Sort Order</label>
                    <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} className={inp}/></div>
                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="accent-brand-orange"/>
                      <span className="text-gray-300 text-sm">Active / Visible</span>
                    </label>
                  </div>
                </div>

                <div><label className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-1.5">Tagline / Description</label>
                  <textarea rows={2} value={form.tagline} onChange={e => setForm(f => ({ ...f, tagline: e.target.value }))} placeholder="Brief description shown on slide" className={`${inp} resize-none`}/></div>
              </div>
              <div className="flex gap-3 p-6 border-t border-[#2A2A2A]">
                <button onClick={close} className="flex-1 py-3 border border-[#2A2A2A] text-gray-400 rounded-xl text-sm font-semibold hover:border-gray-500 transition-all">Cancel</button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 py-3 bg-brand-orange text-white rounded-xl text-sm font-semibold hover:bg-orange-500 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving ? <><Loader size={14} className="animate-spin"/>Saving…</> : editing ? 'Update Slide' : 'Create Slide'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
