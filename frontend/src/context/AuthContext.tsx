import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getFirebase, type Auth } from '../lib/firebase'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  type User,
} from 'firebase/auth'
import { saveProfile } from '@/lib/api'

type AuthContextValue = {
  user: User | null
  loading: boolean
  signup: (email: string, password: string) => Promise<void>
  signupWithName: (email: string, password: string, displayName: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [auth, setAuth] = useState<Auth | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [initError, setInitError] = useState<string | null>(null)

  useEffect(() => {
    let unsub: (() => void) | undefined
    try {
      const { auth } = getFirebase()
      setAuth(auth)
      unsub = onAuthStateChanged(auth, (u: User | null) => {
        setUser(u)
        setLoading(false)
      })
    } catch (e: any) {
      console.error('Failed to initialize Firebase:', e)
      setInitError(e?.message || 'Failed to initialize Firebase')
      setLoading(false)
    }
    return () => {
      if (unsub) unsub()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      async signup(email, password) {
        if (!auth) throw new Error('Auth not initialized')
        await createUserWithEmailAndPassword(auth, email, password)
      },
      async signupWithName(email, password, displayName) {
        if (!auth) throw new Error('Auth not initialized')
        await createUserWithEmailAndPassword(auth, email, password)
        try {
          await saveProfile({ displayName })
        } catch (e) {
          // non-fatal
          console.warn('Failed to save displayName profile:', e)
        }
      },
      async login(email, password) {
        if (!auth) throw new Error('Auth not initialized')
        await signInWithEmailAndPassword(auth, email, password)
      },
      async loginWithGoogle() {
        if (!auth) throw new Error('Auth not initialized')
        const provider = new GoogleAuthProvider()
        const cred = await signInWithPopup(auth, provider)
        const dn = cred.user.displayName || undefined
        const photoURL = cred.user.photoURL || undefined
        try {
          await saveProfile({ displayName: dn, photoURL })
        } catch (e) {
          console.warn('Failed to upsert profile from Google login:', e)
        }
      },
      async logout() {
        if (!auth) throw new Error('Auth not initialized')
        await signOut(auth)
      },
    }),
    [auth, user, loading]
  )

  if (initError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-lg w-full border rounded-xl p-6 bg-white">
          <h1 className="text-xl font-semibold mb-2">Configuration error</h1>
          <p className="text-sm text-red-600 mb-4">{initError}</p>
          <p className="text-sm text-gray-600">
            Make sure your Vite environment variables are set in an <code>.env</code> file at <code>frontend/.env</code>:
          </p>
          <pre className="mt-3 text-xs bg-gray-50 p-3 rounded-md overflow-auto">
{`VITE_FIREBASE_API_KEY=...\nVITE_FIREBASE_AUTH_DOMAIN=...\nVITE_FIREBASE_PROJECT_ID=...\nVITE_FIREBASE_APP_ID=...`}
          </pre>
          <p className="text-xs text-gray-500 mt-3">Restart the dev server after changes.</p>
        </div>
      </div>
    )
  }

  // While initializing Firebase/auth state
  if (loading && !auth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent" />
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
