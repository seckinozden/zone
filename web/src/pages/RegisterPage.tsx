import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '../auth/AuthProvider'

export function RegisterPage() {
  const { register } = useAuth()
  const nav = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agree, setAgree] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) return setError('Passwords do not match.')
    if (!agree) return setError('Please accept the terms.')
    const r = register(name, email, password)
    if (r.ok) nav('/app')
  }

  return (
    <div className="min-h-full grid md:grid-cols-2">
      <aside className="hidden md:flex flex-col justify-between p-12 bg-surface-low">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Focus</h1>
          <p className="mt-3 text-on-surface-variant max-w-xs">
            Join the productivity suite designed for cognitive clarity.
            Minimalism meets high-performance task management.
          </p>
        </div>
        <div className="rounded-xl border border-white/5 bg-surface p-4">
          <div className="label-caps mb-2 text-brand">Active Focus</div>
          <div className="text-sm">Deep Work Session: "Interface Architecture"</div>
        </div>
        <div className="text-xs text-on-surface-variant">© 2026 JANUARY PRODUCTIVITY INC.</div>
      </aside>

      <main className="flex items-center justify-center p-8">
        <form onSubmit={submit} className="w-full max-w-md">
          <h2 className="text-2xl font-semibold mb-1">Get Started</h2>
          <p className="text-on-surface-variant text-sm mb-6">
            Create your Focus account to sync tasks across all devices.
          </p>

          <Field label="Full Name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="bg-surface-lowest border border-white/5 rounded-lg w-full p-3 outline-none focus:border-brand"
            />
          </Field>
          <Field label="Email Address">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="bg-surface-lowest border border-white/5 rounded-lg w-full p-3 outline-none focus:border-brand"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Password">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-surface-lowest border border-white/5 rounded-lg w-full p-3 outline-none focus:border-brand"
              />
            </Field>
            <Field label="Confirm">
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="bg-surface-lowest border border-white/5 rounded-lg w-full p-3 outline-none focus:border-brand"
              />
            </Field>
          </div>

          <label className="flex items-center gap-2 text-sm mt-2 mb-5 cursor-pointer">
            <input
              type="checkbox"
              checked={agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="accent-brand"
            />
            I agree to the Terms of Service and Privacy Policy.
          </label>

          {error && (
            <div className="text-sm text-red-300 bg-red-900/20 border border-red-900/40 rounded-md p-2 mb-4">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-brand-strong text-white font-semibold hover:opacity-95 transition"
          >
            Get Started
          </button>

          <div className="text-center mt-5 text-sm text-on-surface-variant">
            Already have an account?{' '}
            <Link to="/login" className="text-on-surface font-medium">Back to Login</Link>
          </div>
        </form>
      </main>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <div className="label-caps mb-1">{label}</div>
      {children}
    </div>
  )
}
