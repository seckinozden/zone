import { Link, NavLink } from 'react-router'
import { CheckCircle2, CalendarDays, Settings, LogOut, Pencil, Moon } from 'lucide-react'
import { useCategories } from '../api/hooks'
import { categoryColor } from '../lib/categories'
import { useAuth } from '../auth/AuthProvider'

export function Sidebar() {
  const { data: categories } = useCategories()
  const { user, signOut } = useAuth()

  return (
    <aside className="w-72 shrink-0 bg-surface-low/40 flex flex-col h-full">
      <div className="px-6 pt-6">
        <div className="text-lg font-semibold">Focus</div>
        <div className="text-xs text-on-surface-variant">Productivity Suite</div>
      </div>

      <nav className="px-3 mt-6 flex flex-col gap-1">
        <NavRouterItem to="/app/tasks" icon={<CheckCircle2 size={18} />} label="Tasks" />
        <NavRouterItem to="/app/calendar" icon={<CalendarDays size={18} />} label="Calendar" />
      </nav>

      <div className="px-3 mt-6">
        <div className="label-caps px-3 mb-2">Wellness</div>
        <NavRouterItem to="/app/sleep" icon={<Moon size={18} />} label="Sleep" />
      </div>

      <div className="px-6 mt-6">
        <div className="flex items-center justify-between mb-3">
          <span className="label-caps">Labels</span>
          <Link
            to="/app/labels"
            aria-label="Manage labels"
            title="Manage labels"
            className="text-on-surface-variant hover:text-on-surface"
          >
            <Pencil size={14} />
          </Link>
        </div>
        <ul className="space-y-2">
          {categories?.map((c) => (
            <li key={c.id} className="flex items-center gap-2 text-sm">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: categoryColor(c) }}
              />
              {c.name}
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto px-6 pb-6">
        <NavLink
          to="/app/settings/account"
          className={({ isActive }) =>
            `flex items-center gap-3 py-4 border-t border-divider rounded-md -mx-2 px-2 hover:bg-surface/40 ${
              isActive ? 'text-on-surface' : ''
            }`
          }
        >
          <div className="w-9 h-9 rounded-full bg-surface-high flex items-center justify-center text-sm font-semibold">
            {user?.name?.[0] ?? '?'}
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">{user?.name}</div>
            <div className="text-xs text-on-surface-variant">Pro Member</div>
          </div>
        </NavLink>
        <NavLink
          to="/app/settings"
          className={({ isActive }) =>
            `flex items-center gap-2 text-sm py-1 ${isActive ? 'text-on-surface' : 'text-on-surface-variant'}`
          }
        >
          <Settings size={16} /> Settings
        </NavLink>
        <button
          onClick={signOut}
          className="flex items-center gap-2 text-sm py-1 text-on-surface-variant"
        >
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </aside>
  )
}

function NavRouterItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
          isActive ? 'bg-surface text-on-surface' : 'text-on-surface-variant hover:bg-surface/60'
        }`
      }
    >
      {icon}
      {label}
    </NavLink>
  )
}
