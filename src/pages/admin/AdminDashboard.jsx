import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, ShoppingCart, Users, Package, Star, MessageSquare, ArrowUpRight, RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useStore } from '../../lib/store'

const STATUS_BADGE = {
  delivered:  'badge-success',
  processing: 'badge-info',
  shipped:    'badge-warning',
  pending:    'badge-warning',
  cancelled:  'badge-danger',
}

export default function AdminDashboard() {
  const { theme } = useStore()
  const isDark = theme === 'dark'
  const [stats, setStats]           = useState({ revenue: 0, orders: 0, customers: 0, products: 0, tickets: 0, avgRating: '—' })
  const [recentOrders, setRecentOrders] = useState([])
  const [barData, setBarData]       = useState(Array(7).fill(0))
  const [loading, setLoading]       = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => { loadStats() }, [])

  const loadStats = async (silent = false) => {
    if (!silent) setLoading(true); else setRefreshing(true)
    try {
      const [
        { count: ordersCount   },
        { count: customersCount },
        { count: productsCount  },
        { count: ticketsCount   },
      ] = await Promise.all([
        supabase.from('orders').select('*',           { count: 'exact', head: true }),
        supabase.from('profiles').select('*',         { count: 'exact', head: true }),
        supabase.from('products').select('*',         { count: 'exact', head: true }),
        supabase.from('support_tickets').select('*',  { count: 'exact', head: true }).eq('status','open'),
      ])

      const { data: paidOrders } = await supabase
        .from('orders').select('total,created_at').eq('payment_status','paid')
      const revenue = paidOrders?.reduce((t,o) => t + (Number(o.total)||0), 0) || 0

      // 7-day bar
      const dayTotals = Array.from({length:7}, (_,i) => {
        const d = new Date(); d.setDate(d.getDate()-(6-i))
        const key = d.toISOString().slice(0,10)
        return paidOrders?.filter(o=>o.created_at?.slice(0,10)===key).reduce((t,o)=>t+(Number(o.total)||0),0) || 0
      })
      const maxVal = Math.max(...dayTotals, 1)
      setBarData(dayTotals.map(v => Math.round((v/maxVal)*100)))

      const { data: fb } = await supabase.from('feedback').select('rating')
      const avgRating = fb?.length ? (fb.reduce((t,f)=>t+(f.rating||0),0)/fb.length).toFixed(1) : '—'

      const { data: orders } = await supabase
        .from('orders').select('id,customer_name,total,status,created_at')
        .order('created_at',{ascending:false}).limit(5)

      setStats({ revenue, orders: ordersCount||0, customers: customersCount||0, products: productsCount||0, tickets: ticketsCount||0, avgRating })
      setRecentOrders(orders||[])
    } catch(e){ console.warn('Dashboard:', e.message) }
    finally { setLoading(false); setRefreshing(false) }
  }

  const statCards = [
    { label:'Revenue',  value:`₦${Number(stats.revenue).toLocaleString()}`, icon:TrendingUp,   color:'text-green-400',  bg:'bg-green-400/10' },
    { label:'Orders',   value:stats.orders,                                  icon:ShoppingCart, color:'text-blue-400',   bg:'bg-blue-400/10' },
    { label:'Customers',value:stats.customers,                               icon:Users,        color:'text-purple-400', bg:'bg-purple-400/10' },
    { label:'Products', value:stats.products,                                icon:Package,      color:'text-brand-orange',bg:'bg-brand-orange/10' },
    { label:'Tickets',  value:stats.tickets,                                 icon:MessageSquare,color:'text-yellow-400', bg:'bg-yellow-400/10' },
    { label:'Rating',   value:stats.avgRating,                               icon:Star,         color:'text-yellow-400', bg:'bg-yellow-400/10' },
  ]

  const weekDays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`font-display text-3xl md:text-4xl ${isDark?'text-white':'text-gray-900'}`}>DASHBOARD</h1>
          <p className={`text-xs mt-1 ${isDark?'text-gray-500':'text-gray-400'}`}>Live store overview</p>
        </div>
        <button onClick={()=>loadStats(true)} disabled={refreshing}
          className={`p-2.5 rounded-xl border transition-all btn-press ${isDark?'border-[#242424] text-gray-400 hover:text-white':'border-gray-200 text-gray-500 hover:text-gray-900'}`}>
          <RefreshCw size={14} className={refreshing?'animate-spin text-brand-orange':''} />
        </button>
      </div>

      {/* Stats grid — 2 cols mobile, 3 tablet, 6 desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        {statCards.map((s,i) => (
          <motion.div key={s.label}
            initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{delay:i*0.06}}
            className={`p-4 rounded-2xl border ${isDark?'bg-[#141414] border-[#242424]':'bg-white border-gray-200'}`}>
            <div className={`w-8 h-8 ${s.bg} rounded-xl flex items-center justify-center mb-2.5`}>
              <s.icon size={14} className={s.color} />
            </div>
            <p className={`text-xl font-bold leading-none ${isDark?'text-white':'text-gray-900'}`}>{loading?'—':s.value}</p>
            <p className={`text-[11px] mt-1 ${isDark?'text-gray-500':'text-gray-400'}`}>{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row — stacked on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue bar chart */}
        <div className={`lg:col-span-2 p-5 rounded-2xl border ${isDark?'bg-[#141414] border-[#242424]':'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className={`font-bold text-sm ${isDark?'text-white':'text-gray-900'}`}>Revenue – Last 7 Days</h3>
              <p className={`text-xs ${isDark?'text-gray-500':'text-gray-400'}`}>Paid orders only</p>
            </div>
            <span className="text-brand-orange font-bold text-sm">₦{Number(stats.revenue).toLocaleString()}</span>
          </div>
          {loading ? (
            <div className="h-24 skeleton rounded-xl" />
          ) : (
            <>
              <div className="flex items-end gap-1.5 h-24">
                {barData.map((h,i) => (
                  <motion.div key={i}
                    initial={{height:0}} animate={{height:`${Math.max(h,2)}%`}}
                    transition={{delay:i*0.07,duration:0.6,ease:'easeOut'}}
                    className={`flex-1 rounded-t-lg ${i===5?'bg-brand-orange':isDark?'bg-[#2a2a2a]':'bg-gray-100'}`}
                    style={{minHeight:'3px'}}
                  />
                ))}
              </div>
              <div className="flex justify-between mt-1.5">
                {weekDays.map(d=>(
                  <span key={d} className={`text-[9px] flex-1 text-center ${isDark?'text-gray-600':'text-gray-400'}`}>{d}</span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Order status */}
        <div className={`p-5 rounded-2xl border ${isDark?'bg-[#141414] border-[#242424]':'bg-white border-gray-200'}`}>
          <h3 className={`font-bold text-sm mb-4 ${isDark?'text-white':'text-gray-900'}`}>Order Status</h3>
          {['delivered','processing','shipped','pending','cancelled'].map((s,i) => {
            const count = recentOrders.filter(o=>o.status===s).length
            const pct   = recentOrders.length ? Math.round((count/Math.max(recentOrders.length,1))*100) : 0
            const clr   = {delivered:'bg-green-400',processing:'bg-blue-400',shipped:'bg-brand-orange',pending:'bg-yellow-400',cancelled:'bg-red-400'}
            return (
              <div key={s} className="mb-3 last:mb-0">
                <div className="flex justify-between text-xs mb-1">
                  <span className={`capitalize ${isDark?'text-gray-400':'text-gray-600'}`}>{s}</span>
                  <span className={`font-semibold ${isDark?'text-white':'text-gray-900'}`}>{count}</span>
                </div>
                <div className={`h-1.5 rounded-full ${isDark?'bg-[#242424]':'bg-gray-100'}`}>
                  <motion.div initial={{width:0}} animate={{width:`${pct}%`}}
                    transition={{duration:0.7,delay:i*0.1}}
                    className={`h-full rounded-full ${clr[s]}`}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent orders — card layout on mobile, table on desktop */}
      <div className={`rounded-2xl border overflow-hidden ${isDark?'bg-[#141414] border-[#242424]':'bg-white border-gray-200'}`}>
        <div className={`flex items-center justify-between p-4 border-b ${isDark?'border-[#242424]':'border-gray-100'}`}>
          <h3 className={`font-bold text-sm ${isDark?'text-white':'text-gray-900'}`}>Recent Orders</h3>
          <a href="/admin/orders" className="text-brand-orange text-xs hover:underline flex items-center gap-1">
            View all <ArrowUpRight size={11}/>
          </a>
        </div>

        {loading ? (
          <div className="p-4 space-y-2">{[1,2,3].map(i=><div key={i} className="h-14 skeleton rounded-xl"/>)}</div>
        ) : recentOrders.length === 0 ? (
          <div className="py-14 text-center">
            <ShoppingCart size={28} className={`mx-auto mb-2 ${isDark?'text-gray-700':'text-gray-300'}`}/>
            <p className={`text-sm ${isDark?'text-gray-500':'text-gray-400'}`}>No orders yet</p>
          </div>
        ) : (
          <>
            {/* Mobile: cards */}
            <div className="md:hidden divide-y divide-[#242424]">
              {recentOrders.map(order => (
                <div key={order.id} className={`p-4 ${isDark?'':'divide-gray-100'}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs text-brand-orange font-bold">#{order.id?.slice(0,8).toUpperCase()}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_BADGE[order.status]||'badge-info'}`}>{order.status}</span>
                  </div>
                  <p className={`text-sm font-medium ${isDark?'text-gray-300':'text-gray-700'}`}>{order.customer_name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-xs ${isDark?'text-gray-500':'text-gray-400'}`}>{new Date(order.created_at).toLocaleDateString('en-NG',{day:'numeric',month:'short'})}</span>
                    <span className="text-brand-orange font-bold text-sm">₦{Number(order.total||0).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`text-xs uppercase tracking-wider border-b ${isDark?'bg-black/20 text-gray-500 border-[#242424]':'bg-gray-50 text-gray-400 border-gray-100'}`}>
                    <th className="px-5 py-3 text-left">Order</th>
                    <th className="px-5 py-3 text-left">Customer</th>
                    <th className="px-5 py-3 text-right">Total</th>
                    <th className="px-5 py-3 text-center">Status</th>
                    <th className="px-5 py-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id} className={`border-t ${isDark?'border-[#242424] hover:bg-white/[0.02]':'border-gray-50 hover:bg-gray-50'}`}>
                      <td className="px-5 py-3 font-mono text-xs text-brand-orange font-bold">#{order.id?.slice(0,8).toUpperCase()}</td>
                      <td className={`px-5 py-3 text-sm ${isDark?'text-gray-300':'text-gray-700'}`}>{order.customer_name}</td>
                      <td className={`px-5 py-3 text-right font-bold ${isDark?'text-white':'text-gray-900'}`}>₦{Number(order.total||0).toLocaleString()}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-[10px] px-2 py-1 rounded-full font-medium capitalize ${STATUS_BADGE[order.status]||'badge-info'}`}>{order.status}</span>
                      </td>
                      <td className={`px-5 py-3 text-right text-xs ${isDark?'text-gray-500':'text-gray-400'}`}>
                        {new Date(order.created_at).toLocaleDateString('en-NG',{day:'numeric',month:'short'})}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
