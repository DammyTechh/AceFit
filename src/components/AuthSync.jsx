import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useStore } from '../lib/store'

/**
 * AuthSync — mounts once in App, listens to Supabase auth state changes.
 * This ensures:
 *   - User stays logged in on page refresh
 *   - Sign-out clears local state immediately
 *   - OTP verification via magic link in URL auto-signs user in
 */
export default function AuthSync() {
  const { setUser, clearUser } = useStore()

  useEffect(() => {
    // Restore session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) setUser(session.user)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
      }
      if (event === 'SIGNED_OUT') {
        clearUser()
      }
      if (event === 'TOKEN_REFRESHED' && session?.user) {
        setUser(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return null
}
