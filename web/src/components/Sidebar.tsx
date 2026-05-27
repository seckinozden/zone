import { NavLink } from 'react-router'
import { CheckCircle2, LineChart, CalendarDays, BarChart3, Settings, HelpCircle, Plus, LogOut, Tag } from 'lucide-react'
import { useCategories } from '../api/hooks'
import { categoryColor } from '../lib/categories'
import { useAuth } from '../auth/AuthProvider'

type Props = {
  onCreateTask: () => void
}

export function Sidebar({ onCreateTask }: Props) {
  const { data: categories } = useCategories()
  const { user, signOut } = useAuth()

  return (
    <aside className="w-72 shrink-0 bg-surface-low/40 flex flex-col h-full">
      <div className="px-6 pt-6">
        <div className="text-lg font-semibold">Focus</div>
        <div className="text-xs text-on-surface-variant">Productivity Suite</div>
      </div>

      <div className="px-4 mt-5">
        <button
          onClick={onCreateTask}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-brand text-on-brand font-semibold"
        >
          <Plus size={16} /> Create Task
        </button>
      </div>

      <nav className="px-3 mt-6 flex flex-col gap-1">
        <NavRouterItem to="/app/tasks" icon={<CheckCircle2 size={18} />} label="Tasks" />
        <DisabledNavItem icon={<LineChart size={18} />} label="Timeline" />
        <NavRouterItem to="/app/calendar" icon={<CalendarDays size={18} />} label="Calendar" />
        <DisabledNavItem icon={<BarChart3 size={18} />} label="Insights" />
      </nav>

      <div className="px-3 mt-6">
        <div className="label-caps px-3 mb-2">Workspace</div>
        <NavRouterItem to="/app/labels" icon={<Tag size={18} />} label="Labels" />
      </div>

      <div className="px-6 mt-6">
        <div className="label-caps mb-3">Categories</div>
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
        <div className="flex items-center gap-3 py-4 border-t border-white/5">
          <div className="w-9 h-9 rounded-full bg-surface-high flex items-center justify-center text-sm font-semibold">
            {user?.name?.[0] ?? '?'}
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">{user?.name}</div>
            <div className="text-xs text-on-surface-variant">Pro Member</div>
          </div>
        </div>
        <NavLink
          to="/app/settings"
          className={({ isActive }) =>
            `flex items-center gap-2 text-sm py-1 ${isActive ? 'text-on-surface' : 'text-on-surface-variant'}`
          }
        >
          <Settings size={16} /> Settings
        </NavLink>
        <button type="button" className="flex items-center gap-2 text-sm py-1 text-on-surface-variant opacity-60 cursor-not-allowed">
          <HelpCircle size={16} /> Support
        </button>
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

function DisabledNavItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-on-surface-variant opacity-50 cursor-not-allowed select-none"
      title="Coming soon"
    >
      {icon}
      {label}
    </span>
  )
}
