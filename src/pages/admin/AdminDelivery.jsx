import React, { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, X, Loader, Truck } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { clearZonesCache, ALL_NIGERIAN_STATES } from '../../lib/deliveryFee'
import toast from 'react-hot-toast'

const EMPTY = { name: '', states: [], fee: '', eta: '2-3 days', is_active: true, sort_order: 0 }
const inp = `w-full px-3 py-2.5 bg-[#0A0A0A] border border-[#2A2A2A] rounded-xl text-white text-sm outline-none focus:border-brand-orange placeholder-gray-600`

export default function AdminDelivery() {
  const [zones, setZones] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState(EMPTY)
  const [editing, setEditing] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('delivery_zones').select('*').order('sort_order')
    setZones(data || [])
    clearZonesCache()
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openNew  = () => { setForm(EMPTY); setEditing(null); setModalOpen(true) }
  const openEdit = (z) => { setForm({ ...z, states: z.states || [], fee: String(z.fee) }); setEditing(z.id); setModalOpen(true) }
  const close    = () => { setModalOpen(false); setEditing(null); setForm(EMPTY) }

  const toggleState = (state) => setForm(f => ({
    ...f, states: f.states.includes(state.toLowerCase()) ? f.states.filter(s => s !== state.toLowerCase()) : [...f.states, state.toLowerCase()]
  }))

  const handleSave = async () => {
    if (!form.name || !form.fee) return toast.error('Name and fee required')
    setSaving(true)
    try {
      const payload = { ...form, fee: Number(form.fee), sort_order: Number(form.sort_order) || 0 }
      if (editing) {
        await supabase.from('delivery_zones').update(payload).eq('id', editing)
        toast.success('Zone updated!')
      } else {
        await supabase.from('delivery_zones').insert([payload])
        toast.success('Zone created!')
      }
      clearZonesCache()
      close()
      load()
    } catch (err) { toast.error(err.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this zone?')) return
    await supabase.from('delivery_zones').delete().eq('id', id)
    clearZonesCache()
    toast.success('Deleted')
    load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-2xl font-bold">Delivery Zones</h1>
          <p className="text-gray-500 text-sm mt-1">Set delivery prices by location</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 px-4 py-2.5 bg-brand-orange text-white rounded-xl text-sm font-semibold hover:bg-orange-500 transition-all">
          <Plus size={16}/> Add Zone
        </button>
      </div>

      <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1A1A1A]">
                {['Zone Name','States Covered','Delivery Fee','ETA','Status','Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [1,2,3].map(i => (
                <tr key={i} className="border-b border-[#1A1A1A]">
                  {[1,2,3,4,5,6].map(j => <td key={j} className="px-4 py-4"><div className="h-4 bg-[#2A2A2A] rounded animate-pulse"/></td>)}
                </tr>
              )) : zones.map(z => (
                <tr key={z.id} className="border-b border-[#1A1A1A] hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-white text-sm font-medium">{z.name}</p>
                    <p className="text-gray-500 text-xs">Sort: {z.sort_order}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-[240px]">
                      {(z.states || []).slice(0, 4).map(s => (
                        <span key={s} className="px-2 py-0.5 bg-[#1A1A1A] text-gray-400 text-[10px] rounded capitalize">{s}</span>
                      ))}
                      {(z.states || []).length > 4 && <span className="px-2 py-0.5 bg-brand-orange/10 text-brand-orange text-[10px] rounded">+{z.states.length - 4} more</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white font-bold text-sm">₦{Number(z.fee).toLocaleString()}</td>
                  <td className="px-4 py-3 text-gray-400 text-sm">{z.eta}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${z.is_active ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'}`}>
                      {z.is_active ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(z)} className="p-2 text-gray-400 hover:text-brand-orange hover:bg-brand-orange/10 rounded-lg transition-all"><Pencil size={14}/></button>
                      <button onClick={() => handleDelete(z.id)} className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"><Trash2 size={14}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(4px)' }}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-[#141414] border border-[#2A2A2A] rounded-2xl w-full max-w-2xl max-h-[90dvh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-[#2A2A2A]">
                <h2 className="text-white font-bold text-lg">{editing ? 'Edit Zone' : 'New Delivery Zone'}</h2>
                <button onClick={close} className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5"><X size={18}/></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-1.5">Zone Name *</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Lagos (Same Day)" className={inp}/>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-1.5">Delivery Fee (₦) *</label>
                    <input type="number" value={form.fee} onChange={e => setForm(f => ({ ...f, fee: e.target.value }))} placeholder="e.g. 1500" className={inp}/>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-1.5">ETA</label>
                    <input value={form.eta} onChange={e => setForm(f => ({ ...f, eta: e.target.value }))} placeholder="e.g. 1–2 days" className={inp}/>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-1.5">Sort Order</label>
                    <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: e.target.value }))} className={inp}/>
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <input type="checkbox" id="zone_active" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="accent-brand-orange"/>
                    <label htmlFor="zone_active" className="text-gray-300 text-sm">Active</label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gray-400 uppercase font-bold tracking-wider mb-2">States in This Zone</label>
                  <p className="text-gray-600 text-xs mb-3">Click to toggle states. Selected states will use this delivery fee.</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-2">
                    {ALL_NIGERIAN_STATES.map(s => {
                      const key = s.toLowerCase().replace(/[–-]/g,' ').trim().split(' ')[0]
                      const active = (form.states || []).some(x => x.toLowerCase().includes(key) || key.includes(x.toLowerCase()))
                      return (
                        <button key={s} type="button" onClick={() => toggleState(s)}
                          className={`px-2 py-1.5 rounded-lg text-xs font-medium text-left transition-all ${active ? 'bg-brand-orange text-white' : 'bg-[#0A0A0A] border border-[#2A2A2A] text-gray-400 hover:border-brand-orange'}`}>
                          {s}
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-gray-600 text-xs mt-2">{(form.states || []).length} state(s) selected: {(form.states || []).join(', ')}</p>
                </div>
              </div>
              <div className="flex gap-3 p-6 border-t border-[#2A2A2A]">
                <button onClick={close} className="flex-1 py-3 border border-[#2A2A2A] text-gray-400 rounded-xl text-sm font-semibold hover:border-gray-500 transition-all">Cancel</button>
                <button onClick={handleSave} disabled={saving}
                  className="flex-1 py-3 bg-brand-orange text-white rounded-xl text-sm font-semibold hover:bg-orange-500 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                  {saving ? <><Loader size={14} className="animate-spin"/>Saving…</> : editing ? 'Update Zone' : 'Create Zone'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
