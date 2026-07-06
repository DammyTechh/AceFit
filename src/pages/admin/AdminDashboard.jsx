import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ShoppingBag, Users, TrendingUp, Package, Clock, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { Link } from 'react-router-dom'

const StatCard = ({ icon: Icon, label, value, sub, color = 'orange', loading }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    className="bg-[#141414] rounded-2xl border border-[#2A2A2A] p-5">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color === 'orange' ? 'bg-brand-orange/15' : color === 'green' ? 'bg-green-500/15' : color === 'blue' ? 'bg-blue-500/15' : 'bg-purple-500/15'}`}>
        <Icon size={18} className={color === 'orange' ? 'text-brand-orange' : color === 'green' ? 'text-green-400' : color === 'blue' ? 'text-blue-400' : 'text-purple-400'}/>
      </div>
    </div>
    {loading ? <div className="h-7 w-20 bg-[#2A2A2A] rounded animate-pulse"/> : <p className="text-white text-2xl font-bold mb-0.5">{value}</p>}
    <p className="text-gray-500 text-xs">{label}</p>
    {sub && <p className={`text-xs mt-1 ${color === 'green' ? 'text-green-400' : 'text-brand-orange'}`}>{sub}</p>}
  </motion.div>
)

const STATUS_COLOR = {
  pending: 'text-yellow-400 bg-yellow-400/10',
  processing: 'text-blue-400 bg-blue-400/10',
  packed: 'text-purple-400 bg-purple-400/10',
  shipped: 'text-cyan-400 bg-cyan-400/10',
  out_for_delivery: 'text-orange-400 bg-orange-400/10',
  delivered: 'text-green-400 bg-green-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [ordersRes, customersRes, pendingRes, recentRes, revenueRes] = await Promise.all([
        supabase.from('orders').select('id', { count: 'exact' }),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('orders').select('id', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('orders').select('id,customer_name,total,status,created_at').order('created_at', { ascending: false }).limit(8),
        supabase.from('orders').select('total').eq('payment_status', 'paid'),
      ])
      const revenue = revenueRes.data?.reduce((s, o) => s + Number(o.total), 0) || 0
      setStats({
        orders: ordersRes.count || 0,
        customers: customersRes.count || 0,
        pending: pendingRes.count || 0,
        revenue,
      })
      setRecentOrders(recentRes.data || [])
      setLoading(false)
    }
    load()
  }, [])

  // Simple bar chart data — last 7 days
  const [chartData, setChartData] = useState([])
  useEffect(() => {
    const since = new Date(); since.setDate(since.getDate() - 6)
    supabase.from('orders').select('total,created_at').gte('created_at', since.toISOString()).eq('payment_status', 'paid')
      .then(({ data }) => {
        const days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(); d.setDate(d.getDate() - (6 - i))
          return { label: d.toLocaleDateString('en', { weekday: 'short' }), total: 0 }
        })
        data?.forEach(o => {
          const d = new Date(o.created_at).toLocaleDateString('en', { weekday: 'short' })
          const slot = days.find(x => x.label === d)
          if (slot) slot.total += Number(o.total)
        })
        setChartData(days)
      })
  }, [])

  const maxRevenue = Math.max(...chartData.map(d => d.total), 1)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back, Admin 👋</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={TrendingUp}  label="Total Revenue"   value={`₦${((stats?.revenue||0)/1000).toFixed(0)}K`} sub="Paid orders" color="orange" loading={loading}/>
        <StatCard icon={ShoppingBag} label="Total Orders"    value={stats?.orders||0}   sub={`${stats?.pending||0} pending`} color="blue"   loading={loading}/>
        <StatCard icon={Users}       label="Customers"       value={stats?.customers||0} color="green" loading={loading}/>
        <StatCard icon={Clock}       label="Pending Orders"  value={stats?.pending||0} color={stats?.pending > 0 ? 'orange' : 'green'} loading={loading}/>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 bg-[#141414] rounded-2xl border border-[#2A2A2A] p-6">
          <h2 className="text-white font-semibold mb-6">Revenue (Last 7 Days)</h2>
          <div className="flex items-end gap-3 h-40">
            {chartData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full bg-[#1A1A1A] rounded-t-lg overflow-hidden" style={{ height: '120px' }}>
                  <motion.div initial={{ height: 0 }} animate={{ height: `${(d.total / maxRevenue) * 100}%` }}
                    transition={{ duration: 0.8, delay: i * 0.08 }}
                    className="w-full bg-gradient-to-t from-brand-orange to-orange-400 rounded-t-lg mt-auto"
                    style={{ marginTop: 'auto', display: 'flex', alignItems: 'flex-end' }}/>
                </div>
                <span className="text-[10px] text-gray-500">{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] p-6">
          <h2 className="text-white font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { to: '/admin/products', label: 'Add Product',  icon: '➕' },
              { to: '/admin/orders',   label: 'View Orders',  icon: '📦' },
              { to: '/admin/tickets',  label: 'Support Tickets', icon: '🎫' },
              { to: '/admin/blog',     label: 'Write Blog Post', icon: '✍️' },
              { to: '/admin/hero',     label: 'Update Hero',  icon: '🖼️' },
              { to: '/admin/delivery', label: 'Set Delivery Prices', icon: '🚚' },
            ].map(q => (
              <Link key={q.to} to={q.to}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#1A1A1A] hover:bg-brand-orange/10 hover:text-brand-orange text-gray-300 text-sm transition-all group">
                <span>{q.icon}</span> {q.label}
                <span className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="bg-[#141414] rounded-2xl border border-[#2A2A2A] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-[#2A2A2A]">
          <h2 className="text-white font-semibold">Recent Orders</h2>
          <Link to="/admin/orders" className="text-xs text-brand-orange hover:underline">View all →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1A1A1A]">
                {['Order ID','Customer','Amount','Status','Date'].map(h => (
                  <th key={h} className="text-left px-6 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1,2,3].map(i => (
                  <tr key={i} className="border-b border-[#1A1A1A]">
                    {[1,2,3,4,5].map(j => <td key={j} className="px-6 py-4"><div className="h-4 bg-[#2A2A2A] rounded animate-pulse"/></td>)}
                  </tr>
                ))
              ) : recentOrders.length === 0 ? (
                <tr><td colSpan={5} className="text-center text-gray-500 py-12">No orders yet</td></tr>
              ) : recentOrders.map(o => (
                <tr key={o.id} className="border-b border-[#1A1A1A] hover:bg-white/2 transition-colors">
                  <td className="px-6 py-4 text-brand-orange text-sm font-mono">#{o.id.slice(0,8).toUpperCase()}</td>
                  <td className="px-6 py-4 text-white text-sm">{o.customer_name}</td>
                  <td className="px-6 py-4 text-white text-sm font-semibold">₦{Number(o.total).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold capitalize ${STATUS_COLOR[o.status] || 'text-gray-400 bg-gray-400/10'}`}>
                      {o.status?.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
