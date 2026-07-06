import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, ArrowLeft, Tag, Eye } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useStore } from '../lib/store'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function BlogPostPage() {
  const { slug } = useParams()
  const { theme } = useStore()
  const isDark = theme === 'dark'
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('blog_posts').select('*').eq('slug', slug).eq('is_published', true).single()
      .then(({ data }) => {
        setPost(data)
        setLoading(false)
        // Increment views
        if (data) supabase.from('blog_posts').update({ views: (data.views || 0) + 1 }).eq('id', data.id).then(() => {})
      })
  }, [slug])

  if (loading) return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0A0A0A]' : 'bg-[#F5F5F0]'}`}>
      <Navbar/>
      <div className="pt-32 flex justify-center"><div className="w-8 h-8 border-2 border-brand-orange border-t-transparent rounded-full animate-spin"/></div>
    </div>
  )

  if (!post) return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0A0A0A] text-white' : 'bg-[#F5F5F0] text-gray-900'}`}>
      <Navbar/>
      <div className="pt-32 text-center"><p className="text-xl">Post not found.</p><Link to="/blog" className="text-brand-orange mt-4 inline-block">← Back to Blog</Link></div>
    </div>
  )

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0A0A0A] text-white' : 'bg-[#F5F5F0] text-gray-900'}`}>
      <Navbar/>
      <div className="pt-24 pb-20 max-w-3xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/blog" className={`inline-flex items-center gap-2 text-sm mb-8 hover:text-brand-orange transition-colors ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            <ArrowLeft size={14}/> Back to Blog
          </Link>

          {post.cover_image && (
            <div className="aspect-video rounded-2xl overflow-hidden mb-8">
              <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover"/>
            </div>
          )}

          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-brand-orange/10 text-brand-orange text-xs font-bold rounded-full uppercase">{post.category}</span>
            {post.tags?.map(t => <span key={t} className={`px-2 py-1 rounded-full text-xs ${isDark ? 'bg-[#1A1A1A] text-gray-400' : 'bg-gray-100 text-gray-500'}`}>{t}</span>)}
          </div>

          <h1 className="font-display text-5xl md:text-6xl leading-none mb-6">{post.title}</h1>

          <div className={`flex items-center gap-6 text-xs mb-10 pb-8 border-b ${isDark ? 'text-gray-500 border-[#2A2A2A]' : 'text-gray-400 border-gray-200'}`}>
            <span>By <strong className={isDark ? 'text-gray-300' : 'text-gray-700'}>{post.author || 'AceFit Team'}</strong></span>
            <span className="flex items-center gap-1"><Clock size={12}/> {post.read_time || 5} min read</span>
            <span className="flex items-center gap-1"><Eye size={12}/> {post.views || 0} views</span>
          </div>

          {/* Content rendered as HTML */}
          <div className={`prose prose-sm max-w-none leading-relaxed space-y-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            dangerouslySetInnerHTML={{ __html: post.content?.replace(/\n/g, '<br/>') || '' }}/>
        </motion.div>
      </div>
      <Footer/>
    </div>
  )
}
