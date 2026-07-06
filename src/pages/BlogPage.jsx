import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Tag, ArrowRight, Search } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useStore } from '../lib/store'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

const CATS = ['All', 'Fitness', 'Nutrition', 'Lifestyle', 'Products', 'News']

export default function BlogPage() {
  const { theme } = useStore()
  const isDark = theme === 'dark'
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('All')

  useEffect(() => {
    supabase.from('blog_posts').select('id,slug,title,excerpt,cover_image,author,tags,category,read_time,published_at,views')
      .eq('is_published', true).order('published_at', { ascending: false })
      .then(({ data }) => { setPosts(data || []); setLoading(false) })
  }, [])

  const filtered = posts.filter(p => {
    const matchCat = cat === 'All' || p.category?.toLowerCase() === cat.toLowerCase()
    const matchSearch = !search || p.title?.toLowerCase().includes(search.toLowerCase()) || p.excerpt?.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  const featured = filtered[0]
  const rest = filtered.slice(1)

  return (
    <div className={isDark ? 'bg-[#0A0A0A] text-white min-h-screen' : 'bg-[#F5F5F0] text-gray-900 min-h-screen'}>
      <Navbar/>
      <div className="pt-24 pb-20 max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <p className="text-brand-orange text-xs font-bold uppercase tracking-widest mb-3">AceFit Blog</p>
          <h1 className="font-display text-6xl md:text-8xl leading-none">TRAIN SMART.<br/><span className="gradient-text">LIVE BETTER.</span></h1>
        </motion.div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10">
          <div className={`relative flex-1 max-w-sm ${isDark ? '' : ''}`}>
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles..."
              className={`w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none ${isDark ? 'bg-[#1A1A1A] border-[#2A2A2A] text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'}`}/>
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATS.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${cat === c ? 'bg-brand-orange text-white' : isDark ? 'bg-[#1A1A1A] text-gray-400 hover:text-white' : 'bg-white text-gray-500 hover:text-gray-900'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className={`h-64 rounded-2xl animate-pulse ${isDark ? 'bg-[#1A1A1A]' : 'bg-gray-200'}`}/>)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-5xl mb-4">📝</p>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No articles yet. Check back soon!</p>
          </div>
        ) : (
          <>
            {/* Featured */}
            {featured && (
              <Link to={`/blog/${featured.slug}`} className="block mb-10 group">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  className={`grid md:grid-cols-2 rounded-2xl overflow-hidden border ${isDark ? 'bg-[#141414] border-[#2A2A2A] hover:border-brand-orange/40' : 'bg-white border-gray-200 hover:border-brand-orange/40'} transition-all`}>
                  <div className="aspect-video md:aspect-auto overflow-hidden">
                    {featured.cover_image
                      ? <img src={featured.cover_image} alt={featured.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                      : <div className="w-full h-full bg-brand-orange/10 flex items-center justify-center"><span className="text-6xl">📰</span></div>}
                  </div>
                  <div className="p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-3 py-1 bg-brand-orange/10 text-brand-orange text-xs font-bold rounded-full uppercase">{featured.category || 'Fitness'}</span>
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Featured</span>
                    </div>
                    <h2 className={`font-display text-3xl mb-3 leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{featured.title}</h2>
                    <p className={`text-sm leading-relaxed mb-6 line-clamp-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{featured.excerpt}</p>
                    <div className={`flex items-center gap-4 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      <span className="flex items-center gap-1"><Clock size={12}/> {featured.read_time || 5} min read</span>
                      <span>{featured.author || 'AceFit Team'}</span>
                      <span className="flex items-center gap-1 text-brand-orange group-hover:gap-2 transition-all">Read <ArrowRight size={12}/></span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rest.map((post, i) => (
                <Link key={post.id} to={`/blog/${post.slug}`}>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    className={`rounded-2xl overflow-hidden border group transition-all ${isDark ? 'bg-[#141414] border-[#2A2A2A] hover:border-brand-orange/40' : 'bg-white border-gray-200 hover:border-brand-orange/40'}`}>
                    <div className="aspect-video overflow-hidden">
                      {post.cover_image
                        ? <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
                        : <div className="w-full h-full bg-brand-orange/10 flex items-center justify-center"><span className="text-4xl">📰</span></div>}
                    </div>
                    <div className="p-5">
                      <span className="px-2 py-1 bg-brand-orange/10 text-brand-orange text-[10px] font-bold rounded-full uppercase">{post.category || 'Fitness'}</span>
                      <h3 className={`font-bold text-base mt-3 mb-2 line-clamp-2 group-hover:text-brand-orange transition-colors ${isDark ? 'text-white' : 'text-gray-900'}`}>{post.title}</h3>
                      <p className={`text-xs leading-relaxed line-clamp-2 mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{post.excerpt}</p>
                      <div className={`flex items-center gap-3 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        <span className="flex items-center gap-1"><Clock size={11}/> {post.read_time || 5} min</span>
                        <span>{post.author || 'AceFit Team'}</span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
      <Footer/>
    </div>
  )
}
