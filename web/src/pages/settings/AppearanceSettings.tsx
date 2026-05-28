import { Check, Moon, Sun } from 'lucide-react'
import { useTheme } from '../../lib/theme'

export function AppearanceSettings() {
  const [theme, setTheme] = useTheme()

  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-semibold mb-1">Appearance</h2>
      <p className="text-sm text-on-surface-variant mb-6">
        Choose how Zone looks. Pick whichever feels easier on your eyes.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <ThemeCard
          title="Dark"
          description="Easier on the eyes at night."
          icon={<Moon size={20} />}
          active={theme === 'dark'}
          onSelect={() => setTheme('dark')}
        />
        <ThemeCard
          title="Light"
          description="Warm cream with gray accents."
          icon={<Sun size={20} />}
          active={theme === 'light'}
          onSelect={() => setTheme('light')}
        />
      </div>
    </div>
  )
}

function ThemeCard({
  title,
  description,
  icon,
  active,
  onSelect,
}: {
  title: string
  description: string
  icon: React.ReactNode
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative text-left rounded-xl p-4 border transition ${
        active
          ? 'border-brand bg-surface'
          : 'border-divider bg-surface-low hover:bg-surface'
      }`}
      aria-pressed={active}
    >
      <div className="flex items-center gap-3 mb-2">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{
            backgroundColor: 'color-mix(in srgb, var(--color-brand) 18%, transparent)',
            color: 'var(--color-brand)',
          }}
        >
          {icon}
        </div>
        <div className="font-semibold">{title}</div>
        {active && (
          <span className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-brand text-on-brand">
            <Check size={12} />
          </span>
        )}
      </div>
      <p className="text-xs text-on-surface-variant">{description}</p>
    </button>
  )
}
