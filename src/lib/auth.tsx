// ============================================
// Auth Context — Supabase Auth with Role Management
// ============================================

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

export type AppRole = 'admin' | 'user'

interface AuthContextValue {
  user: User | null
  session: Session | null
  role: AppRole | null
  loading: boolean
  isAdmin: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: string | null }>
  updatePassword: (newPassword: string) => Promise<{ error: string | null }>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [role, setRole] = useState<AppRole | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch the user's role from user_roles table
  const fetchRole = useCallback(async (userId: string): Promise<AppRole> => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('id', userId)
        .single()

      if (error) {
        console.warn('Failed to fetch role:', error.message)
        return 'user'
      }
      return (data?.role as AppRole) || 'user'
    } catch {
      return 'user'
    }
  }, [])

  // Initialize session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession()
        setSession(currentSession)
        setUser(currentSession?.user ?? null)

        if (currentSession?.user) {
          const userRole = await fetchRole(currentSession.user.id)
          setRole(userRole)
        }
      } catch (err) {
        console.error('Auth init error:', err)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession)
        setUser(newSession?.user ?? null)

        if (newSession?.user) {
          const userRole = await fetchRole(newSession.user.id)
          setRole(userRole)
        } else {
          setRole(null)
        }

        if (event === 'SIGNED_OUT') {
          setRole(null)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [fetchRole])

  const signUp = async (
    email: string,
    password: string,
    fullName: string
  ): Promise<{ error: string | null }> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      })

      if (error) return { error: error.message }

      // If auto-confirm is off, user needs to verify email
      if (data.user && !data.session) {
        return { error: null } // Will need email confirmation
      }

      // Auto-confirm is on — user is signed in
      if (data.user && data.session) {
        // Create a profile entry
        const { error: profErr } = await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: fullName,
          phone_number: null,
          role: 'Driver', // Default profile role
        })
        if (profErr) {
          console.warn('Profile creation note during signup:', profErr.message)
        }
      }

      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Sign up failed' }
    }
  }

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { error: error.message }
      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Sign in failed' }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setRole(null)
  }

  const resetPassword = async (email: string): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) return { error: error.message }
      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Password reset failed' }
    }
  }

  const updatePassword = async (newPassword: string): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) return { error: error.message }
      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Password update failed' }
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        loading,
        isAdmin: role === 'admin',
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
