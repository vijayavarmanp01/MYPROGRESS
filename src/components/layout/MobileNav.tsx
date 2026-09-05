import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { Ellipsis, X, Sun, Moon, Flame } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useApp } from '../../store/AppContext'
import { MOBILE_TABS, NAV_SECTIONS, SETTINGS_NAV } from './navConfig'

interface MobileNavProps {
  onOpenMenu: () => void
}

export function MobileNav({ onOpenMenu }: MobileNavProps) {
  return (
    <nav
      aria-label="Primary mobile navigation"
      className="glass fixed inset-x-0 bottom-0 z-40 border-t border-line lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch justify-around px-1 py-1">
        {MOBILE_TABS.map(item => (
          <NavLink
            key={item.id}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) =>
              cn(
                'relative flex min-w-[60px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-2',
                'text-[10px] font-semibold tracking-wide transition-all duration-200',
                isActive ? 'text-accent' : 'text-ink-3 hover:text-ink-2'
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* Active bg pill */}
                {isActive && (
                  <span
                    aria-hidden
                    className="absolute inset-x-2 inset-y-1 rounded-xl bg-accent/10"
                  />
                )}
                <item.icon
                  size={21}
                  strokeWidth={isActive ? 2.3 : 1.8}
                  className="relative z-[1] transition-transform duration-200"
                  style={{ transform: isActive ? 'scale(1.08)' : 'scale(1)' }}
                />
                <span className="relative z-[1] uppercase">{item.short}</span>
              </>
            )}
          </NavLink>
        ))}

        <button
          onClick={onOpenMenu}
          aria-label="Open menu"
          className="flex min-w-[60px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-2 text-[10px] font-semibold uppercase tracking-wide text-ink-3 transition-colors hover:text-ink-2"
        >
          <Ellipsis size={21} strokeWidth={1.8} />
          <span>More</span>
        </button>
      </div>
    </nav>
  )
}

interface DrawerProps {
  open: boolean
  onClose: () => void
}

export function MobileDrawer({ open, onClose }: DrawerProps) {
  const { state, dispatch } = useApp()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  const isDark =
    state.settings.theme === 'dark' ||
    (state.settings.theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)

  return (
    <div
      className="fixed inset-0 z-[60] lg:hidden"
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
    >
      <div
        className="animate-fade-in absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="animate-slide-in-left absolute inset-y-0 left-0 flex w-[288px] flex-col border-r border-line bg-surface shadow-pop">
        {/* Drawer header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-4">
          <NavLink
            to="/dashboard"
            onClick={onClose}
            className="flex items-center gap-2.5"
            title="Go to Dashboard"
          >
            <span className="logo-tile grid h-9 w-9 place-items-center rounded-xl text-[12px] font-extrabold text-white">
              MP
            </span>
            <span>
              <span className="block text-[14.5px] font-bold tracking-[-0.02em] text-ink">
                MyProgress
              </span>
              <span className="block text-[11px] text-ink-3">DSA Command Center</span>
            </span>
          </NavLink>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="grid h-9 w-9 place-items-center rounded-[10px] text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav + footer */}
        <DrawerNav
          onClose={onClose}
          isDark={isDark}
          streak={state.streak.current}
          onToggleTheme={() =>
            dispatch({
              type: 'UPDATE_SETTINGS',
              payload: { theme: isDark ? 'light' : 'dark' },
            })
          }
        />
      </div>
    </div>
  )
}

function DrawerNav({
  onClose,
  isDark,
  streak,
  onToggleTheme,
}: {
  onClose: () => void
  isDark: boolean
  streak: number
  onToggleTheme: () => void
}) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex h-10 items-center gap-3 rounded-xl px-3 text-[13.5px] font-medium transition-colors',
      isActive
        ? 'bg-accent/10 text-accent'
        : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
    )

  return (
    <>
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4" aria-label="Navigation menu">
        {NAV_SECTIONS.map(section => (
          <div key={section.title}>
            <p className="mb-1.5 px-3 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-ink-3">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map(item => (
                <NavLink
                  key={item.id}
                  to={item.path}
                  end={item.path === '/dashboard'}
                  onClick={onClose}
                  className={linkClass}
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        size={17}
                        className={isActive ? 'text-accent' : 'text-ink-3'}
                      />
                      {item.label}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}

        {/* Theme toggle */}
        <div>
          <p className="mb-1.5 px-3 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-ink-3">
            Preferences
          </p>
          <button
            onClick={onToggleTheme}
            className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-[13.5px] font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
          >
            {isDark ? (
              <Moon size={17} className="text-ink-3" />
            ) : (
              <Sun size={17} className="text-ink-3" />
            )}
            {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          </button>
        </div>
      </nav>

      {/* Footer */}
      <div className="shrink-0 space-y-1 border-t border-line p-3">
        <NavLink to={SETTINGS_NAV.path} onClick={onClose} className={linkClass}>
          {({ isActive }) => (
            <>
              <SETTINGS_NAV.icon
                size={17}
                className={isActive ? 'text-accent' : 'text-ink-3'}
              />
              Settings
            </>
          )}
        </NavLink>

        {/* Streak callout */}
        <div className="mx-1 mt-2 flex items-center gap-2 rounded-xl bg-amber/10 px-3 py-2.5">
          <Flame size={15} className="shrink-0 text-amber" />
          <span className="text-[12.5px] font-semibold text-amber">
            {streak} day{streak !== 1 ? 's' : ''} streak — keep it up!
          </span>
        </div>
      </div>
    </>
  )
}
