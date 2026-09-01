import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { Ellipsis, X, Sun, Moon } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useApp } from '../../store/AppContext'
import { MOBILE_TABS, NAV_SECTIONS, SETTINGS_NAV } from './navConfig'

interface MobileNavProps {
  onOpenMenu: () => void
}

export function MobileNav({ onOpenMenu }: MobileNavProps) {
  return (
    <nav
      aria-label="Primary mobile"
      className="glass fixed inset-x-0 bottom-0 z-40 border-t border-line lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch justify-around px-2 py-1.5">
        {MOBILE_TABS.map(item => (
          <NavLink
            key={item.id}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              cn(
                'flex min-w-[56px] flex-1 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10.5px] font-medium transition-colors',
                isActive ? 'text-accent' : 'text-ink-3'
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{item.short}</span>
              </>
            )}
          </NavLink>
        ))}
        <button
          onClick={onOpenMenu}
          aria-label="Open menu"
          className="flex min-w-[56px] flex-1 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10.5px] font-medium text-ink-3 transition-colors"
        >
          <Ellipsis size={20} strokeWidth={1.8} />
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
    <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="animate-fade-in absolute inset-0 bg-[#05060a]/60 backdrop-blur-sm" onClick={onClose} />
      <div className="animate-slide-in-left absolute inset-y-0 left-0 flex w-[286px] flex-col border-r border-line bg-surface shadow-pop">
        <div className="flex h-16 shrink-0 items-center justify-between px-5">
          <div className="flex items-center gap-2.5">
            <span className="logo-tile grid h-9 w-9 place-items-center rounded-xl text-[12px] font-extrabold text-white">
              MP
            </span>
            <span>
              <span className="block text-[14.5px] font-bold tracking-[-0.02em] text-ink">MyProgress</span>
              <span className="block text-[11px] text-ink-3">DSA Command Center</span>
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="grid h-9 w-9 place-items-center rounded-[10px] text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <X size={18} />
          </button>
        </div>
        <DrawerNav onClose={onClose} isDark={isDark} onToggleTheme={() =>
          dispatch({ type: 'UPDATE_SETTINGS', payload: { theme: isDark ? 'light' : 'dark' } })
        } />
      </div>
    </div>
  )
}

function DrawerNav({ onClose, isDark, onToggleTheme }: { onClose: () => void; isDark: boolean; onToggleTheme: () => void }) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex h-10 items-center gap-3 rounded-xl px-2.5 text-[13.5px] font-medium transition-colors',
      isActive ? 'bg-accent/10 text-accent' : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
    )

  return (
    <>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-3" aria-label="Menu">
        {NAV_SECTIONS.map(section => (
          <div key={section.title}>
            <p className="mb-1.5 px-2.5 text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-3">
              {section.title}
            </p>
            <div className="space-y-0.5">
              {section.items.map(item => (
                <NavLink key={item.id} to={item.path} end={item.path === '/'} onClick={onClose} className={linkClass}>
                  {({ isActive }) => (
                    <>
                      <item.icon size={17} className={isActive ? 'text-accent' : 'text-ink-3'} />
                      {item.label}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}

        <div>
          <p className="mb-1.5 px-2.5 text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-3">
            Preferences
          </p>
          <button
            onClick={onToggleTheme}
            className="flex h-10 w-full items-center gap-3 rounded-xl px-2.5 text-[13.5px] font-medium text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink"
          >
            {isDark ? <Moon size={17} className="text-ink-3" /> : <Sun size={17} className="text-ink-3" />}
            {isDark ? 'Switch to light' : 'Switch to dark'}
          </button>
        </div>
      </nav>

      <div className="space-y-0.5 border-t border-line p-3">
        <NavLink to={SETTINGS_NAV.path} onClick={onClose} className={linkClass}>
          {({ isActive }) => (
            <>
              <SETTINGS_NAV.icon size={17} className={isActive ? 'text-accent' : 'text-ink-3'} />
              Settings
            </>
          )}
        </NavLink>
        <p className="px-2.5 pb-1 pt-2 text-center text-[11px] text-ink-3">Stay consistent. Stay sharp.</p>
      </div>
    </>
  )
}
