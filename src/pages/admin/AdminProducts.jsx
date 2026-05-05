import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Edit2, Trash2, X, Upload, Loader, Package, Eye, EyeOff, ImageIcon } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useStore } from '../../lib/store'
import { getPlaceholder } from '../../lib/placeholders'
import toast from 'react-hot-toast'

const CATEGORIES = ['tshirts', 'joggers', 'hoodies', 'shorts', 'leggings', 'sports-bra', 'tank-tops', 'tracksuits', 'accessories']
const GENDERS = ['men', 'women', 'unisex']
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL']

const EMPTY_FORM = {
  name: '', category: 'tshirts', gender: 'unisex', price: '', original_price: '',
  description: '', image_url: '', sizes: ['S', 'M', 'L', 'XL'], stock: '',
  is_new: false, is_bestseller: false, is_active: true, rating: 4.5
}


export default function AdminProducts() {
  const { theme } = useStore()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [search, setSearch] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [uploadingImg, setUploadingImg] = useState(false)
  const isDark = theme === 'dark'

  useEffect(() => { loadProducts() }, [])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setProducts(data || [])
    } catch (err) {
      console.error('Load products failed:', err)
      toast.error(`Couldn't load products: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const openModal = (product = null) => {
    if (product) {
      setEditProduct(product)
      setForm({ ...EMPTY_FORM, ...product, sizes: product.sizes || ['S', 'M', 'L', 'XL'] })
      setImagePreview(product.image_url || '')
    } else {
      setEditProduct(null)
      setForm(EMPTY_FORM)
      setImagePreview('')
    }
    setShowModal(true)
  }

  const handleImageUpload = async (file) => {
    if (!file) return
    setUploadingImg(true)
    try {
      const ext = file.name.split('.').pop()
      const path = `products/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('product-images')
        .upload(path, file, { upsert: true })
      if (upErr) throw upErr

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(path)

      setForm(f => ({ ...f, image_url: publicUrl }))
      setImagePreview(publicUrl)
      toast.success('Image uploaded!')
    } catch (err) {
      console.error('Image upload failed:', err)
      toast.error(`Upload failed: ${err.message}. Check Storage bucket policies.`, { duration: 6000 })
    } finally {
      setUploadingImg(false)
    }
  }

  const handleSave = async () => {
    if (!form.name || !form.price) {
      toast.error('Name and price are required')
      return
    }
    setSaving(true)
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        original_price: form.original_price ? Number(form.original_price) : null,
        stock: Number(form.stock) || 0,
        rating: Number(form.rating) || 4.5,
      }

      if (editProduct) {
        const { data, error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editProduct.id)
          .select()
          .single()
        if (error) throw error
        setProducts(ps => ps.map(p => p.id === editProduct.id ? data : p))
        toast.success('Product updated!')
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert([payload])
          .select()
          .single()
        if (error) throw error
        setProducts(ps => [data, ...ps])
        toast.success('Product added!')
      }
      setShowModal(false)
    } catch (err) {
      console.error('Save product failed:', err)
      toast.error(`Save failed: ${err.message}`, { duration: 6000 })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product? This cannot be undone.')) return
    try {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) throw error
      setProducts(ps => ps.filter(p => p.id !== id))
      toast.success('Product deleted')
    } catch (err) {
      console.error('Delete failed:', err)
      toast.error(`Delete failed: ${err.message}`)
    }
  }

  const toggleActive = async (product) => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !product.is_active })
        .eq('id', product.id)
      if (error) throw error
      setProducts(ps => ps.map(p => p.id === product.id ? { ...p, is_active: !p.is_active } : p))
      toast.success(product.is_active ? 'Product hidden' : 'Product visible')
    } catch (err) {
      console.error('Toggle failed:', err)
      toast.error(`Toggle failed: ${err.message}`)
    }
  }

  const filtered = products.filter(p =>
    !search ||
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.includes(search.toLowerCase())
  )

  const toggleSize = (size) => {
    setForm(f => ({
      ...f,
      sizes: f.sizes.includes(size) ? f.sizes.filter(s => s !== size) : [...f.sizes, size]
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className={`font-display text-3xl md:text-4xl ${isDark ? 'text-white' : 'text-gray-900'}`}>PRODUCTS</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{products.length} products in inventory</p>
        </div>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-orange hover:bg-brand-orange-light text-white font-semibold rounded-xl transition-all btn-press shadow-lg shadow-brand-orange/25"
        >
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border max-w-md ${isDark ? 'bg-brand-dark-card border-brand-dark-border' : 'bg-white border-gray-200'}`}>
        <Search size={15} className="text-brand-orange" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          className={`flex-1 bg-transparent text-sm outline-none ${isDark ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'}`}
        />
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader size={20} className="animate-spin text-brand-orange" />
        </div>
      )}

      {/* Products — mobile cards + desktop table */}
      {!loading && (
        <div className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-brand-dark-card border-brand-dark-border' : 'bg-white border-gray-200'}`}>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-[#242424]">
            {filtered.length === 0 ? (
              <div className="py-12 text-center">
                <Package size={28} className={`mx-auto mb-2 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
                <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No products yet. Add your first product!</p>
              </div>
            ) : filtered.map((product) => (
              <div key={product.id} className={`flex items-center gap-3 p-4 ${isDark ? '' : 'border-gray-100'}`}>
                <div className="w-14 h-16 rounded-xl overflow-hidden bg-gray-800 shrink-0">
                  <img
                    src={product.image_url || getPlaceholder(product.category)}
                    alt={product.name}
                    className="w-full h-full object-cover object-top"
                    onError={e => { e.target.src = getPlaceholder(product.category) }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{product.name}</p>
                  <p className="text-brand-orange font-bold text-sm">₦{Number(product.price).toLocaleString()}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] capitalize ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{product.category}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${product.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {product.is_active ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <button onClick={() => openModal(product)} className={`p-1.5 rounded-lg ${isDark ? 'text-gray-400 hover:text-brand-orange' : 'text-gray-500 hover:text-brand-orange'}`}><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(product.id)} className={`p-1.5 rounded-lg ${isDark ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-500'}`}><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className={`text-xs uppercase tracking-wider border-b ${isDark ? 'bg-black/30 text-gray-500 border-brand-dark-border' : 'bg-gray-50 text-gray-400 border-gray-100'}`}>
                  <th className="px-5 py-3 text-left">Product</th>
                  <th className="px-5 py-3 text-left hidden md:table-cell">Category</th>
                  <th className="px-5 py-3 text-right">Price</th>
                  <th className="px-5 py-3 text-center hidden md:table-cell">Stock</th>
                  <th className="px-5 py-3 text-center">Status</th>
                  <th className="px-5 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product, i) => (
                  <motion.tr
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className={`border-t ${isDark ? 'border-brand-dark-border hover:bg-white/[0.02]' : 'border-gray-50 hover:bg-gray-50/50'}`}
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-14 rounded-xl overflow-hidden bg-gray-800 shrink-0">
                          <img
                            src={product.image_url || getPlaceholder(product.category)}
                            alt={product.name}
                            className="w-full h-full object-cover object-top"
                            onError={e => { e.target.src = getPlaceholder(product.category) }}
                          />
                        </div>
                        <div>
                          <p className={`font-semibold line-clamp-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>{product.name}</p>
                          <div className="flex gap-1 mt-0.5">
                            {product.is_new && <span className="badge-info text-[9px] px-1.5 py-0.5 rounded-full">NEW</span>}
                            {product.is_bestseller && <span className="badge-warning text-[9px] px-1.5 py-0.5 rounded-full">HOT</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className={`px-5 py-3 capitalize hidden md:table-cell ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{product.category}</td>
                    <td className={`px-5 py-3 text-right font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>₦{Number(product.price).toLocaleString()}</td>
                    <td className="px-5 py-3 text-center hidden md:table-cell">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        product.stock === 0 ? 'badge-danger' : product.stock <= 5 ? 'badge-warning' : 'badge-success'
                      }`}>
                        {product.stock === 0 ? 'Out' : product.stock}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button onClick={() => toggleActive(product)}>
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${product.is_active ? 'badge-success' : 'badge-danger'}`}>
                          {product.is_active ? 'Active' : 'Hidden'}
                        </span>
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-center gap-1.5">
                        <button onClick={() => openModal(product)} className={`p-2 rounded-lg transition-colors btn-press ${isDark ? 'text-gray-400 hover:text-brand-orange hover:bg-brand-orange/10' : 'text-gray-500 hover:text-brand-orange hover:bg-brand-orange/5'}`}>
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => toggleActive(product)} className={`p-2 rounded-lg transition-colors btn-press ${isDark ? 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10' : 'text-gray-500 hover:text-yellow-500 hover:bg-yellow-50'}`}>
                          {product.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                        <button onClick={() => handleDelete(product.id)} className={`p-2 rounded-lg transition-colors btn-press ${isDark ? 'text-gray-400 hover:text-red-400 hover:bg-red-400/10' : 'text-gray-500 hover:text-red-500 hover:bg-red-50'}`}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="py-16 text-center">
                <Package size={32} className={`mx-auto mb-3 ${isDark ? 'text-gray-700' : 'text-gray-300'}`} />
                <p className={isDark ? 'text-gray-500' : 'text-gray-400'}>No products found</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop"
            style={{ background: 'rgba(0,0,0,0.8)' }}
            onClick={e => e.target === e.currentTarget && setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-2xl rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto ${isDark ? 'bg-brand-dark-card border border-brand-dark-border' : 'bg-white border border-gray-200'}`}
            >
              <div className="h-1.5 bg-gradient-to-r from-brand-orange to-yellow-400" />
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {editProduct ? 'Edit Product' : 'Add New Product'}
                  </h2>
                  <button onClick={() => setShowModal(false)} className={`p-1.5 rounded-lg btn-press ${isDark ? 'text-gray-400 hover:text-white hover:bg-brand-dark-border' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}>
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Image upload */}
                  <div className="md:col-span-2">
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Product Image</label>
                    <div className="flex gap-4 items-start">
                      <div className={`w-24 h-28 rounded-xl overflow-hidden flex items-center justify-center border ${isDark ? 'bg-black/30 border-brand-dark-border' : 'bg-gray-50 border-gray-200'}`}>
                        {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="w-full h-full object-cover object-top" />
                        ) : (
                          <ImageIcon size={24} className={isDark ? 'text-gray-600' : 'text-gray-300'} />
                        )}
                      </div>
                      <div className="flex-1 space-y-2">
                        <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all btn-press ${isDark ? 'border-brand-dark-border text-gray-400 hover:border-brand-orange hover:text-brand-orange' : 'border-gray-200 text-gray-500 hover:border-brand-orange hover:text-brand-orange'}`}>
                          {uploadingImg ? <Loader size={14} className="animate-spin" /> : <Upload size={14} />}
                          <span className="text-sm">{uploadingImg ? 'Uploading...' : 'Upload Image'}</span>
                          <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e.target.files[0])} />
                        </label>
                        <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>or paste URL below</p>
                        <input
                          type="url"
                          placeholder="https://... image URL"
                          value={form.image_url}
                          onChange={e => { setForm(f => ({ ...f, image_url: e.target.value })); setImagePreview(e.target.value) }}
                          className={`w-full px-3 py-2 rounded-xl border text-xs outline-none ${isDark ? 'bg-black/30 border-brand-dark-border text-white placeholder-gray-600 focus:border-brand-orange' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-brand-orange'}`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Name */}
                  <div className="md:col-span-2">
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Product Name *</label>
                    <input
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. AceFit Pro Performance Tee"
                      className={`w-full px-4 py-3 rounded-xl border text-sm outline-none neon-focus ${isDark ? 'bg-black/30 border-brand-dark-border text-white placeholder-gray-600 focus:border-brand-orange' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-brand-orange'}`}
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Category</label>
                    <select
                      value={form.category}
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-xl border text-sm outline-none ${isDark ? 'bg-black/30 border-brand-dark-border text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1).replace('-', ' ')}</option>)}
                    </select>
                  </div>

                  {/* Gender */}
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Gender</label>
                    <select
                      value={form.gender}
                      onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-xl border text-sm outline-none ${isDark ? 'bg-black/30 border-brand-dark-border text-white' : 'bg-gray-50 border-gray-200 text-gray-900'}`}
                    >
                      {GENDERS.map(g => <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
                    </select>
                  </div>

                  {/* Price */}
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Price (₦) *</label>
                    <input
                      type="number"
                      value={form.price}
                      onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      placeholder="e.g. 8500"
                      className={`w-full px-4 py-3 rounded-xl border text-sm outline-none neon-focus ${isDark ? 'bg-black/30 border-brand-dark-border text-white placeholder-gray-600 focus:border-brand-orange' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-brand-orange'}`}
                    />
                  </div>

                  {/* Original price */}
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Original Price (optional)</label>
                    <input
                      type="number"
                      value={form.original_price}
                      onChange={e => setForm(f => ({ ...f, original_price: e.target.value }))}
                      placeholder="For discount display"
                      className={`w-full px-4 py-3 rounded-xl border text-sm outline-none neon-focus ${isDark ? 'bg-black/30 border-brand-dark-border text-white placeholder-gray-600 focus:border-brand-orange' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-brand-orange'}`}
                    />
                  </div>

                  {/* Stock */}
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Stock Quantity</label>
                    <input
                      type="number"
                      value={form.stock}
                      onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                      placeholder="e.g. 50"
                      className={`w-full px-4 py-3 rounded-xl border text-sm outline-none neon-focus ${isDark ? 'bg-black/30 border-brand-dark-border text-white placeholder-gray-600 focus:border-brand-orange' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-brand-orange'}`}
                    />
                  </div>

                  {/* Rating */}
                  <div>
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Rating (1–5)</label>
                    <input
                      type="number" min="1" max="5" step="0.1"
                      value={form.rating}
                      onChange={e => setForm(f => ({ ...f, rating: e.target.value }))}
                      className={`w-full px-4 py-3 rounded-xl border text-sm outline-none neon-focus ${isDark ? 'bg-black/30 border-brand-dark-border text-white focus:border-brand-orange' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-brand-orange'}`}
                    />
                  </div>

                  {/* Description */}
                  <div className="md:col-span-2">
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Description</label>
                    <textarea
                      value={form.description}
                      onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      placeholder="Product description..."
                      rows={3}
                      className={`w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none neon-focus ${isDark ? 'bg-black/30 border-brand-dark-border text-white placeholder-gray-600 focus:border-brand-orange' : 'bg-gray-50 border-gray-200 text-gray-900 focus:border-brand-orange'}`}
                    />
                  </div>

                  {/* Sizes */}
                  <div className="md:col-span-2">
                    <label className={`block text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Available Sizes</label>
                    <div className="flex flex-wrap gap-2">
                      {SIZES.map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleSize(s)}
                          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all btn-press ${
                            form.sizes?.includes(s)
                              ? 'bg-brand-orange text-white'
                              : isDark ? 'bg-brand-dark-border text-gray-400 hover:bg-brand-orange/20' : 'bg-gray-100 text-gray-600 hover:bg-brand-orange/10'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Flags */}
                  <div className="md:col-span-2 flex flex-wrap gap-4">
                    {[
                      { key: 'is_new', label: 'Mark as New' },
                      { key: 'is_bestseller', label: 'Bestseller' },
                      { key: 'is_active', label: 'Active / Visible' },
                    ].map(flag => (
                      <label key={flag.key} className="flex items-center gap-2.5 cursor-pointer">
                        <div
                          onClick={() => setForm(f => ({ ...f, [flag.key]: !f[flag.key] }))}
                          className={`w-10 h-5 rounded-full transition-all relative ${form[flag.key] ? 'bg-brand-orange' : isDark ? 'bg-brand-dark-border' : 'bg-gray-200'}`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${form[flag.key] ? 'left-5' : 'left-0.5'}`} />
                        </div>
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{flag.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 mt-7">
                  <button
                    onClick={() => setShowModal(false)}
                    className={`flex-1 py-3 rounded-xl border font-semibold text-sm transition-all btn-press ${isDark ? 'border-brand-dark-border text-gray-400' : 'border-gray-200 text-gray-500'}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 py-3 bg-brand-orange hover:bg-brand-orange-light text-white font-bold rounded-xl transition-all btn-press shadow-lg shadow-brand-orange/25 disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader size={16} className="animate-spin" /> : null}
                    {editProduct ? 'Save Changes' : 'Add Product'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}