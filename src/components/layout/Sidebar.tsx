import { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Search, ChevronLeft, Flame, LogOut } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useApp } from '../../store/AppContext'
import { useAuth } from '../../store/AuthContext'
import { NAV_SECTIONS, SETTINGS_NAV, LANDING_NAV } from './navConfig'

const COLLAPSE_KEY = 'myprogress.nav-collapsed'

interface SidebarProps {
  onOpenSearch: () => void
}

export function Sidebar({ onOpenSearch }: SidebarProps) {
  const { state } = useApp()
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0')
    } catch {
      /* private mode */
    }
  }, [collapsed])

  // Collapse effect

  const renderLink = (item: { id: string; label: string; path: string; icon: typeof Search }) => (
    <NavLink
      key={item.id}
      to={item.path}
      end={item.path === '/dashboard'}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          'group relative flex h-10 items-center gap-3 rounded-xl px-3 text-[13.5px] font-medium transition-all duration-200',
          collapsed && 'justify-center px-0',
          isActive
            ? 'bg-accent/12 text-accent'
            : 'text-ink-2 hover:bg-surface-2/80 hover:text-ink'
        )
      }
    >
      {({ isActive }) => (
        <>
          {/* Active indicator pill */}
          {isActive && (
            <span
              aria-hidden
              className={cn(
                'absolute top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-accent transition-all duration-300',
                collapsed ? '-left-1.5' : '-left-2.5'
              )}
            />
          )}

          <item.icon
            size={17}
            className={cn(
              'shrink-0 transition-colors',
              isActive ? 'text-accent' : 'text-ink-3 group-hover:text-ink-2'
            )}
          />
          {!collapsed && (
            <span className="truncate leading-none">{item.label}</span>
          )}
        </>
      )}
    </NavLink>
  )

  return (
    <aside
      className={cn(
        'sticky top-0 z-40 hidden h-screen shrink-0 flex-col border-r border-line bg-surface/95',
        'transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:flex',
        // Subtle glass on dark
        'backdrop-blur-[2px]',
        collapsed ? 'w-[72px]' : 'w-[252px]'
      )}
    >
      {/* Brand header */}
      <div
        className={cn(
          'relative flex h-16 shrink-0 items-center gap-3 border-b border-line px-4',
          collapsed && 'justify-center px-0'
        )}
      >
        <NavLink
          to="/dashboard"
          className="flex items-center gap-3 overflow-hidden"
          title="Go to Dashboard"
        >
          <span className="logo-tile grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[12px] font-extrabold tracking-tight text-white">
            MP
          </span>

          {!collapsed && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14.5px] font-bold tracking-[-0.02em] text-ink">
                MyProgress
              </span>
              <span className="block truncate text-[11px] font-medium text-ink-3">
                DSA Command Center
              </span>
            </span>
          )}
        </NavLink>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(c => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'absolute -right-3 top-1/2 z-10 grid h-6 w-6 -translate-y-1/2 place-items-center',
            'rounded-full border border-line bg-elevated text-ink-3 shadow-sm',
            'transition-all duration-300 hover:border-line-strong hover:text-ink',
            collapsed && 'rotate-180'
          )}
        >
          <ChevronLeft size={12} />
        </button>
      </div>

      {/* Search trigger */}
      <div className={cn('px-3 pb-2 pt-3', collapsed && 'px-2')}>
        <button
          onClick={onOpenSearch}
          className={cn(
            'flex h-9 w-full items-center gap-2 rounded-control border border-line bg-surface-2 px-3',
            'text-[13px] text-ink-3 transition-all hover:border-line-strong hover:text-ink-2',
            collapsed && 'justify-center px-0'
          )}
          aria-label="Search"
        >
          <Search size={14} className="shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">Search…</span>
              <span className="kbd">⌘K</span>
            </>
          )}
        </button>
      </div>

      {/* Navigation groups */}
      <nav
        className="flex-1 space-y-5 overflow-y-auto px-3 py-3"
        aria-label="Primary navigation"
      >
        {NAV_SECTIONS.map(section => (
          <div key={section.title}>
            {!collapsed && (
              <p className="mb-1.5 px-3 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-ink-3">
                {section.title}
              </p>
            )}
            {collapsed && (
              <div className="mx-auto mb-3 h-px w-8 rounded-full bg-line" aria-hidden />
            )}
            <div className="space-y-0.5">
              {section.items.map(renderLink)}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer: overview + settings + user */}
      <div className="shrink-0 space-y-1 border-t border-line p-3">
        {renderLink(LANDING_NAV)}
        {renderLink(SETTINGS_NAV)}

        <div
          className={cn(
            'flex items-center gap-2.5 rounded-xl px-2 py-2 hover:bg-surface-2/60 transition-colors',
            collapsed && 'justify-center px-0'
          )}
        >
          <NavLink
            to="/profile"
            aria-label="View Profile"
            className={cn(
              'logo-tile grid h-9 w-9 shrink-0 place-items-center rounded-full text-[12px] font-bold text-white',
              'transition-transform hover:scale-105',
              collapsed && 'cursor-pointer'
            )}
            title={collapsed ? `${user?.name ?? 'Developer'} — Profile` : undefined}
          >
            {user?.avatarInitial ?? (user?.name ? user.name[0].toUpperCase() : 'U')}
          </NavLink>
          {!collapsed && (
            <NavLink to="/profile" className="min-w-0 flex-1 group">
              <span className="block truncate text-[13px] font-semibold text-ink group-hover:text-accent transition-colors">
                {user?.name ?? 'Developer'}
              </span>
              <span className="flex items-center gap-1 truncate text-[11px] text-ink-3">
                <Flame size={10} className="text-amber" />
                {state.streak.current}-day streak
              </span>
            </NavLink>
          )}
          {!collapsed && (
            <button
              onClick={handleSignOut}
              aria-label="Sign out"
              title="Sign out"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-[8px] text-ink-3 transition-colors hover:bg-rose/10 hover:text-rose"
            >
              <LogOut size={13} />
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
