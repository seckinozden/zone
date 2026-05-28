import { NavLink, Outlet } from 'react-router'
import { HeartPulse, Palette, User } from 'lucide-react'
import type { ReactNode } from 'react'

export function SettingsLayout() {
  return (
    <div className="flex h-full min-h-0 gap-8">
      <aside className="w-56 flex-shrink-0 pt-2">
        <h1 className="text-3xl font-semibold tracking-tight mb-6">Settings</h1>
        <nav className="space-y-1">
          <SettingsNavLink to="/app/settings/account" icon={<User size={16} />}>
            Account
          </SettingsNavLink>
          <SettingsNavLink to="/app/settings/appearance" icon={<Palette size={16} />}>
            Appearance
          </SettingsNavLink>
          <SettingsNavLink to="/app/settings/wellness" icon={<HeartPulse size={16} />}>
            Wellness
          </SettingsNavLink>
        </nav>
      </aside>

      <div className="flex-1 min-w-0 overflow-y-auto pt-2">
        <Outlet />
      </div>
    </div>
  )
}

function SettingsNavLink({
  to,
  icon,
  children,
}: {
  to: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `flex items-center gap-2 pl-3 py-2 pr-3 rounded-r-lg text-sm border-l-2 transition-colors ${
          isActive
            ? 'border-brand bg-surface text-on-surface'
            : 'border-transparent text-on-surface-variant hover:bg-surface/50 hover:text-on-surface'
        }`
      }
    >
      {icon}
      {children}
    </NavLink>
  )
}
