import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type User = { name: string; email: string }

type AuthContextValue = {
  user: User | null
  signIn: (email: string, password: string) => { ok: true } | { ok: false; error: string }
  register: (name: string, email: string, password: string) => { ok: true } | { ok: false; error: string }
  signOut: () => void
}

const STORAGE_KEY = 'zone.session.v1'
const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as User) : null
  })

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else localStorage.removeItem(STORAGE_KEY)
  }, [user])

  const signIn: AuthContextValue['signIn'] = (email, password) => {
    if (email.trim().toLowerCase() === 'admin' && password === 'admin') {
      setUser({ name: 'Alex River', email: 'admin' })
      return { ok: true }
    }
    return { ok: false, error: 'Use admin / admin for now.' }
  }

  const register: AuthContextValue['register'] = (name, email, _password) => {
    setUser({ name: name || 'New Member', email })
    return { ok: true }
  }

  const signOut = () => setUser(null)

  return (
    <AuthContext.Provider value={{ user, signIn, register, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
