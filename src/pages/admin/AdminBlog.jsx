import React, { useState, useEffect, useRef } from 'react'
import { Plus, Pencil, Trash2, X, Loader, Upload, Eye, EyeOff } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase, uploadFile } from '../../lib/supabase'
import toast from 'react-hot-toast'

const CATS = ['fitness','nutrition','lifestyle','products','news']
const EMPTY = { title:'', slug:'', excerpt:'', content:'', cover_image:'', author:'AceFit Team', category:'fitness', tags:[], read_time:5, is_published:false, is_featured:false, seo_title:'', seo_desc:'' }
const inp = `w-full px-3 py-2.5 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-white text-sm outline-none focus:border-brand-orange placeholder-gray-600`

function slugify(text) { return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }

export default function AdminBlog() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const fileRef = useRef()

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('blog_posts').select('*').order('created_at', { ascending: false })
    setPosts(data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openNew = () => { setForm(EMPTY); setEditing(null); setModalOpen(true); setTagInput('') }
  const openEdit = (p) => { setForm({ ...EMPTY, ...p, tags: p.tags || [] }); setEditing(p.id); setModalOpen(true); setTagInput('') }
  const close = () => { setModalOpen(false); setEditing(null) }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const publicUrl = await uploadFile(file, 'blog')
      setForm(f => ({ ...f, cover_image: publicUrl }))
      toast.success('Image uploaded!')
    } catch (err) {
      toast.error('Upload failed: ' + err.message)
      console.error('Upload error:', err)
    } finally { setUploading(false) }
  }

  const addTag = () => {
    if (!tagInput.trim()) return
    setForm(f => ({ ...f, tags: [...(f.tags||[]), tagInput.trim()] }))
    setTagInput('')
  }

  const handleSave = async () => {
    if (!form.title || !form.content) return toast.error('Title and content required')
    setSaving(true)
    try {
      const slug = form.slug || slugify(form.title)
      const payload = {
        ...form, slug,
        seo_title: form.seo_title || form.title,
        seo_desc: form.seo_desc || form.excerpt,
        published_at: form.is_published && !editing ? new Date().toISOString() : (form.is_published ? form.published_at : null),
        updated_at: new Date().toISOString(),
      }
      if (editing) {
        const { error } = await supabase.from('blog_posts').update(payload).eq('id', editing)
        if (error) throw error
        toast.success('Post updated!')
      } else {
        const { error } = await supabase.from('blog_posts').insert([payload])
        if (error) throw error
        toast.success('Post created!')
      }
      close()
      load()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const togglePublish = async (p) => {
    await supabase.from('blog_posts').update({
      is_published: !p.is_published,
      published_at: !p.is_published ? new Date().toISOString() : null
    }).eq('id', p.id)
    load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this post?')) return
    await supabase.from('blog_posts').delete().eq('id', id)
    toast.success('Deleted')
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Blog</h1>
          <p className="text-gray-500 text-sm mt-1">{posts.length} posts</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-brand-orange text-white rounded-xl text-sm font-semibold hover:bg-orange-500 transition-all">
          <Plus size={16}/> New Post
        </button>
      </div>

      <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#1A1A1A]">
              {['Title','Category','Status','Views','Date','Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? [1,2].map(i => (
              <tr key={i} className="border-b border-[#1A1A1A]">
                {[1,2,3,4,5,6].map(j => <td key={j} className="px-4 py-4"><div className="h-4 bg-[#2A2A2A] rounded animate-pulse"/></td>)}
              </tr>
            )) : posts.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-gray-500 py-16">No blog posts yet</td></tr>
            ) : posts.map(p => (
              <tr key={p.id} className="border-b border-[#1A1A1A] hover:bg-white/2 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-white text-sm font-medium">{p.title}</p>
                  <p className="text-gray-500 text-xs">/blog/{p.slug}</p>
                </td>
                <td className="px-4 py-3 text-gray-400 text-sm capitalize">{p.category}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-lg text-xs font-bold ${p.is_published ? 'text-green-400 bg-green-400/10' : 'text-yellow-400 bg-yellow-400/10'}`}>
                    {p.is_published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-sm">{p.views || 0}</td>
                <td className="px-4 py-3 text-gray-400 text-xs">{new Date(p.created_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button onClick={() => togglePublish(p)} className="p-2 text-gray-400 hover:text-brand-orange hover:bg-brand-orange/10 rounded-lg transition-all" title={p.is_published ? 'Unpublish' : 'Publish'}>
                      {p.is_published ? <EyeOff size={14}/> : <Eye size={14}/>}
                    </button>
                    <button onClick={() => openEdit(p)} className="p-2 text-gray-400 hover:text-brand-orange hover:bg-brand-orange/10 rounded-lg transition-all"><Pencil size={14}/></button>
                    <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"><Trash2 size={14}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-[#141414] border border-[#2A2A2A] rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-[#2A2A2A]">
                <h2 className="text-white font-bold text-lg">{editing ? 'Edit Post' : 'New Blog Post'}</h2>
                <button onClick={close} className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5"><X size={18}/></button>
              </div>
              <div className="p-6 space-y-4">
                {/* Cover image */}
                <div>
                  <label className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Cover Image</label>
                  <div className={`relative border-2 border-dashed rounded-xl p-4 text-center cursor-pointer hover:border-brand-orange transition-all ${form.cover_image ? 'border-brand-orange/40' : 'border-[#2A2A2A]'}`}
                    onClick={() => fileRef.current?.click()}>
                    {form.cover_image
                      ? <img src={form.cover_image} alt="cover" className="h-32 object-cover mx-auto rounded-lg"/>
                      : <div className="py-6"><Upload size={24} className="text-gray-600 mx-auto mb-2"/><p className="text-gray-500 text-sm">Click to upload cover image</p></div>}
                    {uploading && <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center"><Loader size={20} className="animate-spin text-brand-orange"/></div>}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload}/>
                  <input value={form.cover_image} onChange={e => setForm(f => ({ ...f, cover_image: e.target.value }))} placeholder="Or paste image URL" className={`${inp} mt-2`}/>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-1.5">Title *</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value, slug: slugify(e.target.value) }))} placeholder="Post title" className={inp}/>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-1.5">Slug</label>
                    <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="auto-generated" className={inp}/>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-1.5">Category</label>
                    <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inp}>
                      {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-1.5">Read Time (min)</label>
                    <input type="number" value={form.read_time} onChange={e => setForm(f => ({ ...f, read_time: Number(e.target.value) }))} className={inp}/>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-1.5">Author</label>
                  <input value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} className={inp}/>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-1.5">Excerpt</label>
                  <textarea rows={2} value={form.excerpt} onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))} placeholder="Short description for previews" className={`${inp} resize-none`}/>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-1.5">Content * (HTML supported)</label>
                  <textarea rows={10} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Write your blog post content here. HTML tags like <strong>, <ul>, <h2> are supported." className={`${inp} resize-y font-mono text-xs`}/>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">Tags</label>
                  <div className="flex gap-2 mb-2">
                    <input value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} placeholder="Add tag…" className={`${inp} flex-1`}/>
                    <button type="button" onClick={addTag} className="px-4 py-2.5 bg-brand-orange text-white rounded-xl text-sm font-semibold hover:bg-orange-500">Add</button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(form.tags||[]).map(t => (
                      <span key={t} className="flex items-center gap-1 px-3 py-1 bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-xs text-gray-300">
                        {t} <button type="button" onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(x => x !== t) }))} className="text-gray-500 hover:text-red-400 ml-1"><X size={10}/></button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* SEO */}
                <div className="border border-[#2A2A2A] rounded-xl p-4 space-y-3">
                  <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">SEO</p>
                  <input value={form.seo_title} onChange={e => setForm(f => ({ ...f, seo_title: e.target.value }))} placeholder="SEO title (optional)" className={inp}/>
                  <input value={form.seo_desc} onChange={e => setForm(f => ({ ...f, seo_desc: e.target.value }))} placeholder="SEO description (optional)" className={inp}/>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_published} onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))} className="accent-brand-orange"/>
                    <span className="text-gray-300 text-sm">Publish now</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.is_featured} onChange={e => setForm(f => ({ ...f, is_featured: e.target.checked }))} className="accent-brand-orange"/>
                    <span className="text-gray-300 text-sm">Featured</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 p-6 border-t border-[#2A2A2A]">
                <button onClick={close} className="flex-1 py-3 border border-[#2A2A2A] text-gray-400 rounded-xl text-sm font-semibold hover:border-gray-500 transition-all">Cancel</button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 py-3 bg-brand-orange text-white rounded-xl text-sm font-semibold hover:bg-orange-500 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving ? <><Loader size={14} className="animate-spin"/>Saving…</> : editing ? 'Update Post' : 'Publish Post'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
