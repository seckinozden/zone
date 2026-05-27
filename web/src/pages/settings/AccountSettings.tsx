import { LogOut } from 'lucide-react'
import { useAuth } from '../../auth/AuthProvider'

export function AccountSettings() {
  const { user, signOut } = useAuth()

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-semibold mb-1">Account</h2>
      <p className="text-sm text-on-surface-variant mb-6">
        Your account details. Auth is currently in stub mode — real auth will land later.
      </p>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 rounded-full bg-surface-high flex items-center justify-center text-xl font-semibold">
          {user?.name?.[0] ?? '?'}
        </div>
        <div>
          <div className="text-lg font-semibold">{user?.name}</div>
          <div className="text-sm text-on-surface-variant">Pro Member</div>
        </div>
      </div>

      <Field label="Name" value={user?.name ?? ''} />
      <Field label="Email" value={user?.email ?? ''} />

      <div className="mt-8 pt-6 border-t border-divider">
        <h3 className="text-sm font-semibold mb-3">Session</h3>
        <button
          onClick={signOut}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-stroke text-sm hover:bg-surface/60"
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </div>
  )
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-4">
      <div className="label-caps mb-1">{label}</div>
      <input
        readOnly
        value={value}
        className="w-full bg-surface-lowest border border-divider rounded-lg p-3 text-on-surface-variant outline-none"
      />
    </div>
  )
}
