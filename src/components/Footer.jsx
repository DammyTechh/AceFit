import React from 'react'
import { Link } from 'react-router-dom'
import { Instagram, Youtube, Mail, Phone, MapPin, ArrowRight, Heart } from 'lucide-react'
import { useStore } from '../lib/store'

const TikTokIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.28 8.28 0 004.83 1.54V6.78a4.85 4.85 0 01-1.06-.09z"/>
  </svg>
)

const WhatsAppIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
)

export default function Footer() {
  const { theme } = useStore()
  const isDark = theme === 'dark'

  return (
    <footer className={`border-t ${isDark ? 'bg-brand-black border-brand-dark-border' : 'bg-white border-gray-200'}`}>
      {/* Marquee */}
      <div className="bg-brand-orange py-3 overflow-hidden">
        <div className="marquee-content whitespace-nowrap">
          {Array(6).fill('🔥 FREE DELIVERY ON ORDERS ABOVE ₦15,000  •  PREMIUM FITNESS WEAR  •  NEW COLLECTION DROPPING SOON  •  SHOP NOW  •  ').map((t, i) => (
            <span key={i} className="text-white text-xs font-bold uppercase tracking-widest mx-4">{t}</span>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <img src="https://i.imgur.com/eDF88SE.png" alt="AceFit" className="h-12 w-auto mb-4" />
            <p className={`text-sm leading-relaxed mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Premium fitness wear for those who take their training seriously. Built for performance, designed for style.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://instagram.com/The_acefit" target="_blank" rel="noreferrer"
                className="w-10 h-10 bg-brand-orange/10 hover:bg-brand-orange rounded-xl flex items-center justify-center transition-all text-brand-orange hover:text-white btn-press">
                <Instagram size={18} />
              </a>
              <a href="https://tiktok.com/@The_acefit" target="_blank" rel="noreferrer"
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all btn-press ${isDark ? 'bg-brand-dark-border hover:bg-brand-orange text-gray-400 hover:text-white' : 'bg-gray-100 hover:bg-brand-orange text-gray-600 hover:text-white'}`}>
                <TikTokIcon />
              </a>
              <a href="https://wa.me/2347025692097" target="_blank" rel="noreferrer"
                className="w-10 h-10 bg-green-500/10 hover:bg-green-500 rounded-xl flex items-center justify-center transition-all text-green-500 hover:text-white btn-press">
                <WhatsAppIcon />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className={`font-bold text-sm uppercase tracking-widest mb-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>Shop</h4>
            <ul className="space-y-3">
              {['Men\'s Collection', 'Women\'s Collection', 'T-Shirts', 'Hoodies', 'Joggers', 'Accessories', 'New Arrivals', 'Sale'].map(item => (
                <li key={item}>
                  <Link to={`/?category=${item.toLowerCase().replace(' ', '-')}`}
                    className={`text-sm transition-colors flex items-center gap-1 group ${isDark ? 'text-gray-400 hover:text-brand-orange' : 'text-gray-500 hover:text-brand-orange'}`}>
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity -ml-4 group-hover:ml-0" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className={`font-bold text-sm uppercase tracking-widest mb-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>Help</h4>
            <ul className="space-y-3">
              {['Size Guide', 'Track Order', 'Returns & Exchanges', 'Shipping Info', 'FAQ', 'Privacy Policy', 'Terms & Conditions'].map(item => (
                <li key={item}>
                  <a href="#" className={`text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-brand-orange' : 'text-gray-500 hover:text-brand-orange'}`}>{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className={`font-bold text-sm uppercase tracking-widest mb-5 ${isDark ? 'text-white' : 'text-gray-900'}`}>Contact</h4>
            <ul className="space-y-4">
              <li>
                <a href="tel:07025692097" className={`flex items-start gap-3 text-sm transition-colors group ${isDark ? 'text-gray-400 hover:text-brand-orange' : 'text-gray-500 hover:text-brand-orange'}`}>
                  <Phone size={14} className="mt-0.5 shrink-0 text-brand-orange" />
                  <span>07025692097<br />09153040271</span>
                </a>
              </li>
              <li>
                <a href="mailto:Acefitandgainz@gmail.com" className={`flex items-start gap-3 text-sm transition-colors ${isDark ? 'text-gray-400 hover:text-brand-orange' : 'text-gray-500 hover:text-brand-orange'}`}>
                  <Mail size={14} className="mt-0.5 shrink-0 text-brand-orange" />
                  Acefitandgainz@gmail.com
                </a>
              </li>
              <li>
                <p className={`flex items-start gap-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <MapPin size={14} className="mt-0.5 shrink-0 text-brand-orange" />
                  Nigeria
                </p>
              </li>
            </ul>

            {/* Newsletter */}
            <div className="mt-6">
              <p className={`text-xs font-semibold uppercase tracking-wider mb-3 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Get updates</p>
              <div className={`flex gap-2 p-1 rounded-xl border ${isDark ? 'bg-black/30 border-brand-dark-border' : 'bg-gray-50 border-gray-200'}`}>
                <input
                  type="email"
                  placeholder="Your email..."
                  className={`flex-1 bg-transparent text-xs px-2 outline-none ${isDark ? 'text-white placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'}`}
                />
                <button className="px-3 py-2 bg-brand-orange text-white text-xs rounded-lg font-medium btn-press hover:bg-brand-orange-light transition-colors">
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className={`border-t py-5 ${isDark ? 'border-brand-dark-border' : 'border-gray-100'}`}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>
            © {new Date().getFullYear()} AceFit. All rights reserved.
          </p>
          
        </div>
      </div>
    </footer>
  )
}
