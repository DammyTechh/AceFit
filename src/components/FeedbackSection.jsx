import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Send, Loader, CheckCircle } from 'lucide-react'
import { useStore } from '../lib/store'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function FeedbackSection() {
  const { theme, user } = useStore()
  const isDark = theme === 'dark'
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [form, setForm] = useState({ name: user?.user_metadata?.name || '', email: user?.email || '', message: '' })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!rating) { toast.error('Please give a star rating'); return }
    setLoading(true)
    try {
      await supabase.from('feedback').insert([{ ...form, rating, user_id: user?.id || null }])
      setSubmitted(true)
      toast.success('Thanks for your feedback! 🙏')
    } catch {
      setSubmitted(true)
      toast.success('Thanks for your feedback! 🙏')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className={`py-20 ${isDark ? 'bg-brand-black' : 'bg-[#F5F5F0]'}`}>
      <div className="max-w-2xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <p className="text-brand-orange text-xs font-bold uppercase tracking-widest mb-3">We Value You</p>
          <h2 className={`font-display text-5xl leading-none ${isDark ? 'text-white' : 'text-gray-900'}`}>
            SHARE YOUR<br /><span className="gradient-text">EXPERIENCE.</span>
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className={`rounded-2xl p-8 border ${isDark ? 'bg-brand-dark-card border-brand-dark-border' : 'bg-white border-gray-200'}`}
        >
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Thank You! 🙏</h3>
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Your feedback helps us improve for every customer.</p>
              <button onClick={() => { setSubmitted(false); setRating(0); setForm({ name: '', email: '', message: '' }) }} className="mt-4 text-brand-orange text-sm hover:underline">
                Leave another review
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Star rating */}
              <div className="text-center">
                <p className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>How was your experience?</p>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      onMouseEnter={() => setHover(s)}
                      onMouseLeave={() => setHover(0)}
                      className="transition-transform hover:scale-125 btn-press"
                    >
                      <Star
                        size={32}
                        className={`transition-colors ${s <= (hover || rating) ? 'text-yellow-400 fill-yellow-400' : isDark ? 'text-gray-700' : 'text-gray-300'}`}
                      />
                    </button>
                  ))}
                </div>
                {rating > 0 && (
                  <p className="text-xs text-brand-orange mt-1">
                    {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][rating]}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'name', placeholder: 'Your Name', type: 'text' },
                  { key: 'email', placeholder: 'Email Address', type: 'email' },
                ].map(f => (
                  <input
                    key={f.key}
                    type={f.type}
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    required
                    className={`px-4 py-3 rounded-xl border text-sm outline-none transition-colors neon-focus ${isDark ? 'bg-black/30 border-brand-dark-border text-white placeholder-gray-600 focus:border-brand-orange' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-brand-orange'}`}
                  />
                ))}
              </div>

              <textarea
                placeholder="Share your experience with AceFit products and service..."
                value={form.message}
                onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                required
                rows={4}
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none resize-none transition-colors neon-focus ${isDark ? 'bg-black/30 border-brand-dark-border text-white placeholder-gray-600 focus:border-brand-orange' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400 focus:border-brand-orange'}`}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-brand-orange hover:bg-brand-orange-light text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all btn-press shadow-lg shadow-brand-orange/25 disabled:opacity-60"
              >
                {loading ? <Loader size={16} className="animate-spin" /> : <><Send size={16} /> Submit Feedback</>}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  )
}
