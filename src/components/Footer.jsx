import React from 'react'
import { Link } from 'react-router-dom'
import { FaInstagram, FaTiktok, FaSnapchatGhost, FaWhatsapp } from 'react-icons/fa'
import { ShieldCheck, Truck } from 'lucide-react'
import { useStore } from '../lib/store'

export default function Footer() {
  const { theme } = useStore()
  const isDark = theme === 'dark'

  return (
    <footer className={`border-t ${isDark ? 'bg-[#0A0A0A] border-[#1A1A1A]' : 'bg-gray-50 border-gray-200'}`}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <img src="https://i.imgur.com/eDF88SE.png" alt="AceFit" className="h-12 mb-4"/>
            <p className={`text-sm leading-relaxed mb-6 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              Premium fitness wear engineered for peak performance. Train harder, look better.
            </p>
            <div className="flex gap-3">
              <a href="https://instagram.com/acefit.shop" target="_blank" rel="noreferrer" aria-label="Instagram"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white transition-transform hover:scale-110"
                style={{ background: 'linear-gradient(45deg,#F58529,#DD2A7B,#8134AF)' }}>
                <FaInstagram size={18}/>
              </a>
              <a href="https://tiktok.com/@the_acefit" target="_blank" rel="noreferrer" aria-label="TikTok"
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-black text-white transition-transform hover:scale-110 border border-white/10">
                <FaTiktok size={16}/>
              </a>
              <a href="https://snapchat.com/add/acefit_official" target="_blank" rel="noreferrer" aria-label="Snapchat"
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#FFFC00] text-black transition-transform hover:scale-110">
                <FaSnapchatGhost size={18}/>
              </a>
              <a href="https://wa.me/2347025692097" target="_blank" rel="noreferrer" aria-label="WhatsApp"
                className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#25D366] text-white transition-transform hover:scale-110">
                <FaWhatsapp size={18}/>
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-widest mb-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Shop</h4>
            <ul className="space-y-3">
              {[["Men's Collection", '/?collection=men'], ["Women's Collection", '/?collection=women'], ['Tracksuits', '/?collection=tracksuits'], ['Accessories', '/?collection=accessories'], ['AceGainz Supplements', '/gainz']].map(([l, h]) => (
                <li key={l}><Link to={h} className={`text-sm transition-colors hover:text-brand-orange ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-widest mb-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Info</h4>
            <ul className="space-y-3">
              {[['Blog', '/blog'], ['About Us', '/#about'], ['Contact', '/#contact'], ['Track Order', '/orders'], ['Size Guide', '/#sizing']].map(([l, h]) => (
                <li key={l}><Link to={h} className={`text-sm transition-colors hover:text-brand-orange ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{l}</Link></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className={`text-xs font-bold uppercase tracking-widest mb-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Contact</h4>
            <ul className={`space-y-3 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              <li><a href="mailto:acefitandgainz@gmail.com" className="hover:text-brand-orange transition-colors">acefitandgainz@gmail.com</a></li>
              <li><a href="tel:+2347025692097" className="hover:text-brand-orange transition-colors">+234 702 569 2097</a></li>
              <li><a href="tel:+2349153040271" className="hover:text-brand-orange transition-colors">+234 915 304 0271</a></li>
              <li className="pt-2">
                <a href="https://wa.me/2347025692097" target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white text-xs font-bold rounded-xl hover:bg-green-400 transition-all">
                  <FaWhatsapp size={14}/> WhatsApp Order
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className={`pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${isDark ? 'border-[#1A1A1A]' : 'border-gray-200'}`}>
          <p className={`text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>© {new Date().getFullYear()} AceFit. All rights reserved. Premium Fitness Wear Nigeria.</p>
          <div className="flex items-center gap-4">
            <span className={`inline-flex items-center gap-1.5 text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}><ShieldCheck size={14} className="text-green-500"/> Secured by Paystack</span>
            <span className={`inline-flex items-center gap-1.5 text-xs ${isDark ? 'text-gray-600' : 'text-gray-400'}`}><Truck size={14} className="text-brand-orange"/> Nationwide Delivery</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
