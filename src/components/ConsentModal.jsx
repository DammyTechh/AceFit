import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Shield, CheckCircle, X } from 'lucide-react'
import { useStore } from '../lib/store'

export default function ConsentModal() {
  const { termsAccepted, setTermsAccepted, locationConsent, setLocationConsent, theme } = useStore()
  const [dismissed, setDismissed] = useState(false)
  const [locationGranted, setLocationGranted] = useState(false)
  const isDark = theme === 'dark'

  const show = !termsAccepted && !dismissed

  const handleAccept = () => {
    setTermsAccepted(true)
    if (locationGranted) setLocationConsent(true)
    // Request actual location
    if (locationGranted && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setLocationConsent(true),
        () => {}
      )
    }
    setDismissed(true)
  }

  const handleDecline = () => {
    setTermsAccepted(true)
    setDismissed(true)
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-4 modal-backdrop"
          style={{ background: 'rgba(0,0,0,0.85)' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`w-full max-w-sm rounded-2xl overflow-hidden ${isDark ? 'bg-brand-dark-card border border-brand-dark-border' : 'bg-white border border-gray-200'}`}
          >
            <div className="h-1.5 bg-gradient-to-r from-brand-orange via-orange-400 to-yellow-400" />

            <div className="p-6">
              <div className="flex items-center gap-3 mb-5">
                <img src="https://i.imgur.com/eDF88SE.png" alt="AceFit" className="h-9 w-auto" />
                <div>
                  <h2 className={`font-bold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>Welcome to AceFit</h2>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Quick setup to personalize your experience</p>
                </div>
              </div>

              {/* Terms */}
              <div className={`flex items-start gap-3 p-3.5 rounded-xl mb-3 ${isDark ? 'bg-black/30 border border-brand-dark-border' : 'bg-gray-50 border border-gray-100'}`}>
                <Shield size={16} className="text-brand-orange mt-0.5 shrink-0" />
                <div>
                  <p className={`text-xs font-semibold mb-0.5 ${isDark ? 'text-white' : 'text-gray-900'}`}>Terms & Privacy</p>
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    By using AceFit, you agree to our{' '}
                    <button className="text-brand-orange hover:underline">Terms of Service</button>{' '}
                    and{' '}
                    <button className="text-brand-orange hover:underline">Privacy Policy</button>.
                    We handle your data responsibly.
                  </p>
                </div>
              </div>

              {/* Location */}
              <div
                onClick={() => setLocationGranted(s => !s)}
                className={`flex items-start gap-3 p-3.5 rounded-xl mb-5 cursor-pointer transition-all border ${
                  locationGranted
                    ? 'border-brand-orange bg-brand-orange/5'
                    : isDark ? 'bg-black/30 border-brand-dark-border hover:border-brand-orange/40' : 'bg-gray-50 border-gray-100 hover:border-brand-orange/40'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${locationGranted ? 'bg-brand-orange border-brand-orange' : isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                  {locationGranted && <CheckCircle size={12} className="text-white" />}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-brand-orange" />
                    <p className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Enable Location (Optional)</p>
                  </div>
                  <p className={`text-xs mt-0.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Helps us show nearby delivery options and promotions in your area.
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleDecline}
                  className={`px-4 py-2.5 text-xs rounded-xl border transition-all btn-press ${isDark ? 'border-brand-dark-border text-gray-400 hover:text-white' : 'border-gray-200 text-gray-500'}`}
                >
                  Skip
                </button>
                <button
                  onClick={handleAccept}
                  className="flex-1 py-2.5 bg-brand-orange hover:bg-brand-orange-light text-white text-xs font-bold rounded-xl transition-all btn-press shadow-lg shadow-brand-orange/25"
                >
                  Accept & Continue 🔥
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
