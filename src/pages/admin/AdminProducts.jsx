import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Search, Upload, X, Loader, Image as ImageIcon, ToggleLeft, ToggleRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const CATEGORIES = ['tshirts','joggers','hoodies','shorts','leggings','sports-bra','tank-tops','tracksuits','accessories','supplements','gainz']
const COLLECTIONS = ['men','women','accessories','tracksuits','supplements','gainz','general']
const GENDERS     = ['men','women','unisex']
const SIZES_DEFAULT = ['XS','S','M','L','XL','XXL']

const EMPTY = { name:'', description:'', price:'', original_price:'', category:'tshirts', gender:'unisex', collection:'general', sizes:['S','M','L','XL'], colors:[], image_url:'', stock:'', is_new:false, is_bestseller:false, is_active:true, is_featured:false, sort_order:0 }

const inp = `w-full px-3 py-2.5 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-white text-sm outline-none focus:border-brand-orange placeholder-gray-600`

export default function AdminProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('all')
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [colorInput, setColorInput] = useState('')
  const fileRef = useRef()

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('products').select('*').order('sort_order').order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name?.toLowerCase().includes(search.toLowerCase())
    const matchCat = catFilter === 'all' || p.category === catFilter
    return matchSearch && matchCat
  })

  const openNew = () => { setForm(EMPTY); setEditing(null); setModalOpen(true); setColorInput('') }
  const openEdit = (p) => { setForm({ ...EMPTY, ...p, sizes: p.sizes || [], colors: p.colors || [] }); setEditing(p.id); setModalOpen(true); setColorInput('') }
  const closeModal = () => { setModalOpen(false); setEditing(null); setForm(EMPTY) }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const ext  = file.name.split('.').pop()
      const path = `products/${Date.now()}.${ext}`
      const { error } = await supabase.storage.from('acefit-media').upload(path, file, { upsert: true })
      if (error) throw error
      const { data: { publicUrl } } = supabase.storage.from('acefit-media').getPublicUrl(path)
      setForm(f => ({ ...f, image_url: publicUrl }))
      toast.success('Image uploaded!')
    } catch (err) { toast.error('Upload failed: ' + err.message) }
    finally { setUploading(false) }
  }

  const toggleSize = (s) => setForm(f => ({
    ...f, sizes: f.sizes.includes(s) ? f.sizes.filter(x => x !== s) : [...f.sizes, s]
  }))

  const addColor = () => {
    if (!colorInput.trim()) return
    setForm(f => ({ ...f, colors: [...(f.colors||[]), colorInput.trim()] }))
    setColorInput('')
  }
  const removeColor = (c) => setForm(f => ({ ...f, colors: f.colors.filter(x => x !== c) }))

  const handleSave = async () => {
    if (!form.name || !form.price) return toast.error('Name and price are required')
    setSaving(true)
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        original_price: form.original_price ? Number(form.original_price) : null,
        stock: Number(form.stock) || 0,
        sort_order: Number(form.sort_order) || 0,
      }
      if (editing) {
        const { error } = await supabase.from('products').update(payload).eq('id', editing)
        if (error) throw error
        toast.success('Product updated!')
      } else {
        const { error } = await supabase.from('products').insert([payload])
        if (error) throw error
        toast.success('Product created!')
      }
      closeModal()
      load()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) return toast.error(error.message)
    toast.success('Deleted')
    load()
  }

  const toggleActive = async (p) => {
    await supabase.from('products').update({ is_active: !p.is_active }).eq('id', p.id)
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Products</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} items</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-brand-orange text-white rounded-xl text-sm font-semibold hover:bg-orange-500 transition-all">
          <Plus size={16}/> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"/>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2.5 bg-[#141414] border border-[#2A2A2A] rounded-xl text-white text-sm outline-none focus:border-brand-orange placeholder-gray-600"/>
        </div>
        <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
          className="px-3 py-2.5 bg-[#141414] border border-[#2A2A2A] rounded-xl text-gray-300 text-sm outline-none focus:border-brand-orange">
          <option value="all">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1A1A1A]">
                {['Product','Category','Price','Stock','Status','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [1,2,3].map(i => (
                <tr key={i} className="border-b border-[#1A1A1A]">
                  {[1,2,3,4,5,6].map(j => <td key={j} className="px-4 py-4"><div className="h-4 bg-[#2A2A2A] rounded animate-pulse"/></td>)}
                </tr>
              )) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-gray-500 py-16">No products found</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} className="border-b border-[#1A1A1A] hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#0A0A0A] flex items-center justify-center shrink-0">
                        {p.image_url ? <img src={p.image_url} alt={p.name} className="w-full h-full object-cover"/> : <ImageIcon size={14} className="text-gray-600"/>}
                      </div>
                      <div>
                        <p className="text-white text-sm font-medium">{p.name}</p>
                        <p className="text-gray-500 text-xs">{p.collection}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-sm capitalize">{p.category}</td>
                  <td className="px-4 py-3 text-white text-sm font-semibold">₦{Number(p.price).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-bold ${p.stock === 0 ? 'text-red-400' : p.stock < 5 ? 'text-yellow-400' : 'text-green-400'}`}>{p.stock}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActive(p)} className="transition-all">
                      {p.is_active
                        ? <span className="px-2 py-1 bg-green-500/15 text-green-400 text-xs font-bold rounded-lg">Active</span>
                        : <span className="px-2 py-1 bg-red-500/15 text-red-400 text-xs font-bold rounded-lg">Hidden</span>}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(p)} className="p-2 text-gray-400 hover:text-brand-orange hover:bg-brand-orange/10 rounded-lg transition-all"><Pencil size={14}/></button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#141414] border border-[#2A2A2A] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-[#2A2A2A]">
                <h2 className="text-white font-bold text-lg">{editing ? 'Edit Product' : 'New Product'}</h2>
                <button onClick={closeModal} className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition-all"><X size={18}/></button>
              </div>
              <div className="p-6 space-y-4">
                {/* Image upload */}
                <div>
                  <label className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Product Image</label>
                  <div className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all hover:border-brand-orange ${form.image_url ? 'border-brand-orange/40' : 'border-[#2A2A2A]'}`}
                    onClick={() => fileRef.current?.click()}>
                    {form.image_url
                      ? <img src={form.image_url} alt="preview" className="h-32 object-contain mx-auto rounded-lg"/>
                      : <div className="py-6"><Upload size={24} className="text-gray-600 mx-auto mb-2"/><p className="text-gray-500 text-sm">Click to upload image</p></div>}
                    {uploading && <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center"><Loader size={20} className="animate-spin text-brand-orange"/></div>}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload}/>
                  <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} placeholder="Or paste image URL"
                    className={`${inp} mt-2`}/>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-1.5">Name *</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Product name" className={inp}/>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-1.5">Price (₦) *</label>
                    <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="e.g. 25000" className={inp}/>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-1.5">Original Price (₦)</label>
                    <input type="number" value={form.original_price} onChange={e => setForm(f => ({ ...f, original_price: e.target.value }))} placeholder="Leave blank if no discount" className={inp}/>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-1.5">Stock</label>
                    <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} className={inp}/>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-1.5">Description</label>
                  <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Product description" className={`${inp} resize-none`}/>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-1.5">Category</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inp}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-1.5">Collection</label>
                    <select value={form.collection} onChange={e => setForm(f => ({ ...f, collection: e.target.value }))} className={inp}>
                      {COLLECTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-1.5">Gender</label>
                    <select value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))} className={inp}>
                      {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                  </div>
                </div>

                {/* Sizes */}
                <div>
                  <label className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Sizes</label>
                  <div className="flex flex-wrap gap-2">
                    {SIZES_DEFAULT.map(s => (
                      <button key={s} type="button" onClick={() => toggleSize(s)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${form.sizes?.includes(s) ? 'bg-brand-orange text-white' : 'bg-[#0A0A0A] border border-[#2A2A2A] text-gray-400 hover:border-brand-orange'}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div>
                  <label className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Colors</label>
                  <div className="flex gap-2 mb-2">
                    <input value={colorInput} onChange={e => setColorInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addColor())}
                      placeholder="e.g. Black, Red…" className={`${inp} flex-1`}/>
                    <button type="button" onClick={addColor} className="px-4 py-2.5 bg-brand-orange text-white rounded-xl text-sm font-semibold hover:bg-orange-500">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(form.colors || []).map(c => (
                      <span key={c} className="flex items-center gap-1 px-3 py-1.5 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-xs text-gray-300">
                        {c} <button type="button" onClick={() => removeColor(c)} className="text-gray-500 hover:text-red-400 ml-1"><X size={10}/></button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Flags */}
                <div className="flex flex-wrap gap-4">
                  {[['is_new','New Badge'],['is_bestseller','Bestseller'],['is_featured','Featured in Hero'],['is_active','Active / Visible']].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={!!form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))} className="accent-brand-orange"/>
                      <span className="text-gray-300 text-sm">{label}</span>
                    </label>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-1.5">Sort Order</label>
                    <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} className={inp}/>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 p-6 border-t border-[#2A2A2A]">
                <button onClick={closeModal} className="flex-1 py-3 border border-[#2A2A2A] text-gray-400 rounded-xl text-sm font-semibold hover:border-gray-500 transition-all">Cancel</button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 py-3 bg-brand-orange text-white rounded-xl text-sm font-semibold hover:bg-orange-500 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving ? <><Loader size={14} className="animate-spin"/>Saving…</> : editing ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
