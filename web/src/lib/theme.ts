import { useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'

const KEY = 'zone.theme'

export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'dark'
  const stored = localStorage.getItem(KEY)
  return stored === 'light' ? 'light' : 'dark'
}

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute('data-theme', theme)
}

export function setTheme(theme: Theme) {
  localStorage.setItem(KEY, theme)
  applyTheme(theme)
  // Notify listeners in the same window — `storage` events only fire across windows.
  window.dispatchEvent(new CustomEvent('zone:theme', { detail: theme }))
}

export function useTheme(): [Theme, (t: Theme) => void] {
  const [theme, setLocal] = useState<Theme>(() => getStoredTheme())

  useEffect(() => {
    function onChange(e: Event) {
      const next = (e as CustomEvent).detail as Theme
      setLocal(next)
    }
    window.addEventListener('zone:theme', onChange)
    return () => window.removeEventListener('zone:theme', onChange)
  }, [])

  return [theme, setTheme]
}
