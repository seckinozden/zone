import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { Check, AtSign, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '../auth/AuthProvider'

export function LoginPage() {
  const { signIn } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('admin')
  const [password, setPassword] = useState('admin')
  const [show, setShow] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const r = signIn(email, password)
    if (r.ok) {
      nav('/app')
      return
    }
    setError('error' in r ? r.error : null)
  }

  return (
    <div className="min-h-full flex items-center justify-center px-6">
      <form
        onSubmit={submit}
        className="w-full max-w-md bg-surface rounded-2xl p-8 border border-divider"
      >
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl bg-brand-strong flex items-center justify-center">
            <Check size={22} className="text-white" />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Zone</h1>
          <p className="text-on-surface-variant text-sm">Your quiet productivity companion.</p>
        </div>

        <label className="label-caps block mb-2">Email Address</label>
        <div className="flex items-center bg-surface-lowest rounded-lg px-3 mb-5 border border-divider">
          <AtSign size={18} className="text-on-surface-variant" />
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@company.com"
            className="bg-transparent w-full p-3 outline-none text-on-surface"
            autoComplete="username"
          />
        </div>

        <div className="flex items-center justify-between mb-2">
          <label className="label-caps">Password</label>
          <button type="button" className="text-xs text-brand">Forgot Password?</button>
        </div>
        <div className="flex items-center bg-surface-lowest rounded-lg px-3 mb-5 border border-divider">
          <Lock size={18} className="text-on-surface-variant" />
          <input
            type={show ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-transparent w-full p-3 outline-none text-on-surface"
            autoComplete="current-password"
          />
          <button type="button" onClick={() => setShow((s) => !s)} className="text-on-surface-variant">
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        <label className="flex items-center gap-2 text-sm mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="accent-brand"
          />
          Keep me signed in for 30 days
        </label>

        {error && (
          <div className="text-sm text-red-300 bg-red-900/20 border border-red-900/40 rounded-md p-2 mb-4">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full py-3 rounded-lg bg-brand text-on-brand font-semibold hover:opacity-95 transition"
        >
          Sign In
        </button>

        <div className="text-center mt-8 text-sm text-on-surface-variant">
          New to Zone Productivity?
        </div>
        <Link
          to="/register"
          className="mt-2 flex items-center justify-center gap-2 text-on-surface font-medium"
        >
          Create an Account <ArrowRight size={16} />
        </Link>
      </form>
    </div>
  )
}
