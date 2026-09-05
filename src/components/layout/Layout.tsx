import { useEffect, useState, useRef } from 'react'
import { Outlet, useLocation, Link, useNavigate } from 'react-router-dom'
import { Menu, Search, Sun, Moon, Flame, LogOut, User, Compass, Settings } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { MobileNav, MobileDrawer } from './MobileNav'
import { CommandPalette } from '../command/CommandPalette'
import { formatDisplayDate } from '../../lib/utils'
import { useApp } from '../../store/AppContext'
import { useAuth } from '../../store/AuthContext'
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
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const isDark = useResolvedDark()
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

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
      {/* Aurora ambient background */}
      <div aria-hidden className="bg-aurora" />

      <div className="relative z-[1] flex min-h-screen">
        <Sidebar onOpenSearch={() => setPaletteOpen(true)} />

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Top header */}
          <header className="glass sticky top-0 z-30 border-b border-line">
            <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
              {/* Left: mobile menu + logo or date */}
              <div className="flex min-w-0 items-center gap-3">
                <button
                  onClick={() => setMenuOpen(true)}
                  aria-label="Open menu"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink lg:hidden"
                >
                  <Menu size={19} />
                </button>

                {/* Mobile logo */}
                <Link to="/dashboard" className="flex items-center gap-2.5 lg:hidden">
                  <span className="logo-tile grid h-8 w-8 place-items-center rounded-[10px] text-[11px] font-extrabold text-white">
                    MP
                  </span>
                  <span className="text-[14px] font-bold tracking-[-0.02em] text-ink">
                    MyProgress
                  </span>
                </Link>

                {/* Desktop date */}
                <p className="hidden text-[13px] font-medium text-ink-3 lg:block">
                  {formatDisplayDate(today)}
                </p>
              </div>

              {/* Right: search + streak + theme + avatar */}
              <div className="flex shrink-0 items-center gap-2">
                {/* Search button — desktop */}
                <button
                  onClick={() => setPaletteOpen(true)}
                  aria-label="Search (Command K)"
                  className={cn(
                    'hidden h-9 items-center gap-2 rounded-control border border-line bg-surface-2 px-3',
                    'text-[13px] text-ink-3 transition-all hover:border-line-strong hover:text-ink-2 sm:flex'
                  )}
                >
                  <Search size={14} />
                  <span>Search</span>
                  <span className="kbd ml-2">⌘K</span>
                </button>

                {/* Search icon — mobile */}
                <button
                  onClick={() => setPaletteOpen(true)}
                  aria-label="Search"
                  className="grid h-9 w-9 place-items-center rounded-[10px] text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink sm:hidden"
                >
                  <Search size={18} />
                </button>

                {/* Streak badge */}
                <span
                  className="hidden h-9 items-center gap-1.5 rounded-full border border-amber/25 bg-amber/10 px-3 text-[12.5px] font-semibold text-amber sm:flex"
                  title={`${state.streak.current}-day streak`}
                >
                  <Flame size={13} />
                  {state.streak.current}
                </span>

                <ThemeToggleButton isDark={isDark} />

                {/* Avatar with sign-out */}
                <AvatarMenu user={user} onSignOut={handleSignOut} />
              </div>
            </div>
          </header>

          {/* Main content */}
          <main className="flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-12 lg:pt-8">
            <div
              key={location.pathname}
              className="mx-auto w-full max-w-[1200px] animate-fade-up"
            >
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
      onClick={() =>
        dispatch({ type: 'UPDATE_SETTINGS', payload: { theme: isDark ? 'light' : 'dark' } })
      }
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      className="grid h-9 w-9 place-items-center rounded-[10px] text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
    >
      {isDark ? <Moon size={17} /> : <Sun size={17} />}
    </button>
  )
}

function AvatarMenu({
  user,
  onSignOut,
}: {
  user: import('../../store/AuthContext').AuthUser | null
  onSignOut: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const name = user?.name ?? 'Developer'
  const initial = user?.avatarInitial ?? (user?.name ? user.name[0].toUpperCase() : 'U')
  const email = user?.email ?? ''

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className="relative block">
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Profile menu"
        aria-expanded={open}
        className="logo-tile grid h-9 w-9 place-items-center rounded-full text-[12px] font-bold text-white transition-opacity hover:opacity-85 cursor-pointer"
        title={`${name} — Profile menu`}
      >
        {initial}
      </button>

      {open && (
        <div
          className="animate-fade-down absolute right-0 top-11 z-50 min-w-[210px] rounded-xl border border-line bg-elevated p-1.5 shadow-pop text-left"
          role="menu"
        >
          <div className="px-3 py-2 border-b border-line mb-1">
            <p className="truncate text-[13px] font-semibold text-ink">{name}</p>
            <p className="truncate text-[11px] text-ink-3">@{user?.username || (email ? email.split('@')[0] : 'developer')}</p>
          </div>

          {/* 1. Profile Option */}
          <Link
            to="/profile"
            onClick={() => setOpen(false)}
            role="menuitem"
            className="flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2 text-[13px] font-medium text-ink-2 hover:bg-surface-2 hover:text-ink transition-colors"
          >
            <User size={14} className="text-accent" />
            <span>Profile</span>
          </Link>

          {/* 2. Settings Option */}
          <Link
            to="/settings"
            onClick={() => setOpen(false)}
            role="menuitem"
            className="flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2 text-[13px] font-medium text-ink-2 hover:bg-surface-2 hover:text-ink transition-colors"
          >
            <Settings size={14} className="text-ink-3" />
            <span>Settings</span>
          </Link>

          {/* 3. Product Overview / Landing Page Option */}
          <Link
            to="/landing"
            onClick={() => setOpen(false)}
            role="menuitem"
            className="flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2 text-[13px] font-medium text-ink-2 hover:bg-surface-2 hover:text-ink transition-colors"
          >
            <Compass size={14} className="text-ink-3" />
            <span>Product Overview</span>
          </Link>

          {/* 3. Logout Option */}
          <button
            onClick={() => {
              setOpen(false)
              onSignOut()
            }}
            role="menuitem"
            className="flex w-full items-center gap-2.5 rounded-[10px] px-3 py-2 text-[13px] font-medium text-rose hover:bg-rose/10 transition-colors"
          >
            <LogOut size={14} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  )
}
