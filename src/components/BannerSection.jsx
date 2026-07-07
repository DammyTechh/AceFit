import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../lib/store'
import { supabase } from '../lib/supabase'

// Admin-managed promo banners shown directly below the product grid.
// Manage at /admin/banners. Hidden entirely if there are no active banners.
export default function BannerSection() {
  const { theme } = useStore()
  const isDark = theme === 'dark'
  const [banners, setBanners] = useState([])

  useEffect(() => {
    supabase.from('banners').select('*').eq('is_active', true).order('sort_order')
      .then(({ data }) => setBanners(data || []))
      .catch(() => {})
  }, [])

  if (!banners.length) return null

  const Wrapper = ({ banner, children }) =>
    banner.link
      ? <a href={banner.link} target="_blank" rel="noreferrer" className="block group">{children}</a>
      : <div className="group">{children}</div>

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14">
      <div className={`grid gap-4 md:gap-6 ${banners.length > 1 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
        {banners.map((b, i) => (
          <motion.div key={b.id}
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.5, delay: i * 0.08 }}>
            <Wrapper banner={b}>
              <div className={`relative overflow-hidden rounded-2xl md:rounded-3xl border ${isDark ? 'border-[#2A2A2A]' : 'border-gray-200'}`}>
                <img src={b.image_url} alt={b.title || 'Banner'} loading="lazy"
                  className="w-full h-40 sm:h-52 md:h-64 object-cover transition-transform duration-700 group-hover:scale-105"/>
                {(b.title || b.subtitle) && (
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent flex flex-col justify-end p-5 sm:p-6 md:p-8">
                    {b.title && <h3 className="text-white font-display text-2xl sm:text-3xl md:text-4xl leading-none">{b.title}</h3>}
                    {b.subtitle && <p className="text-gray-200 text-xs sm:text-sm mt-1.5 max-w-md">{b.subtitle}</p>}
                  </div>
                )}
              </div>
            </Wrapper>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
