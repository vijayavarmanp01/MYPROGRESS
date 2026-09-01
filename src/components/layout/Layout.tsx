import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Menu, Search, Sun, Moon, Flame } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { MobileNav, MobileDrawer } from './MobileNav'
import { CommandPalette } from '../command/CommandPalette'
import { formatDisplayDate } from '../../lib/utils'
import { useApp } from '../../store/AppContext'
import { cn } from '../../lib/utils'

function useResolvedDark() {
  const { state } = useApp()
  const theme = state.settings.theme
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia('(prefers-color-scheme: dark)').matches
  )

  useEffect(() => {
    if (theme !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [theme])

  return theme === 'dark' || (theme === 'system' && systemDark)
}

export function Layout() {
  const { today, state } = useApp()
  const location = useLocation()
  const isDark = useResolvedDark()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen(open => !open)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <div className="relative min-h-screen">
      <div aria-hidden className="bg-aurora" />

      <div className="relative z-[1] flex min-h-screen">
        <Sidebar onOpenSearch={() => setPaletteOpen(true)} />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="glass sticky top-0 z-30 border-b border-line">
            <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center gap-3">
                <button
                  onClick={() => setMenuOpen(true)}
                  aria-label="Open menu"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink lg:hidden"
                >
                  <Menu size={19} />
                </button>
                <div className="flex items-center gap-2.5 lg:hidden">
                  <span className="logo-tile grid h-8 w-8 place-items-center rounded-[10px] text-[11px] font-extrabold text-white">
                    MP
                  </span>
                  <span className="text-[14px] font-bold tracking-[-0.02em] text-ink">MyProgress</span>
                </div>
                <p className="hidden text-[13px] font-medium text-ink-3 lg:block">
                  {formatDisplayDate(today)}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <button
                  onClick={() => setPaletteOpen(true)}
                  aria-label="Search (Command K)"
                  className={cn(
                    'hidden h-9 items-center gap-2 rounded-control border border-line bg-surface-2 px-3',
                    'text-[13px] text-ink-3 transition-colors hover:border-line-strong hover:text-ink-2 sm:flex'
                  )}
                >
                  <Search size={14} />
                  <span>Search</span>
                  <span className="kbd ml-2">⌘K</span>
                </button>
                <button
                  onClick={() => setPaletteOpen(true)}
                  aria-label="Search"
                  className="grid h-9 w-9 place-items-center rounded-[10px] text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink sm:hidden"
                >
                  <Search size={18} />
                </button>

                <span
                  className="hidden h-9 items-center gap-1.5 rounded-full border border-amber/25 bg-amber/10 px-3 text-[12.5px] font-semibold text-amber sm:flex"
                  title="Current streak"
                >
                  <Flame size={13} />
                  {state.streak.current}
                </span>

                <ThemeToggleButton isDark={isDark} />

                <span
                  aria-hidden
                  className="logo-tile hidden h-9 w-9 place-items-center rounded-full text-[12px] font-bold text-white sm:grid"
                >
                  V
                </span>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8">
            <div key={location.pathname} className="mx-auto w-full max-w-[1180px] animate-fade-up">
              <Outlet />
            </div>
          </main>
        </div>
      </div>

      <MobileNav onOpenMenu={() => setMenuOpen(true)} />
      <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  )
}

function ThemeToggleButton({ isDark }: { isDark: boolean }) {
  const { dispatch } = useApp()
  return (
    <button
      onClick={() => dispatch({ type: 'UPDATE_SETTINGS', payload: { theme: isDark ? 'light' : 'dark' } })}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="grid h-9 w-9 place-items-center rounded-[10px] text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
    >
      {isDark ? <Moon size={17} /> : <Sun size={17} />}
    </button>
  )
}
