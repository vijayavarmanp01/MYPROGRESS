import { useEffect, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Search, ChevronLeft } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useApp } from '../../store/AppContext'
import { NAV_SECTIONS, SETTINGS_NAV } from './navConfig'

const COLLAPSE_KEY = 'myprogress.nav-collapsed'

interface SidebarProps {
  onOpenSearch: () => void
}

export function Sidebar({ onOpenSearch }: SidebarProps) {
  const { state } = useApp()
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

  const renderLink = (item: { id: string; label: string; path: string; icon: typeof Search }) => (
    <NavLink
      key={item.id}
      to={item.path}
      end={item.path === '/'}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          'group relative flex h-10 items-center gap-3 rounded-xl px-2.5 text-[13.5px] font-medium transition-colors duration-200',
          collapsed && 'justify-center px-0',
          isActive
            ? 'bg-accent/10 text-accent'
            : 'text-ink-2 hover:bg-surface-2 hover:text-ink'
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span
              aria-hidden
              className={cn(
                'absolute top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-accent',
                collapsed ? '-left-2' : '-left-2.5'
              )}
            />
          )}
          <item.icon size={17} className={cn('shrink-0', isActive ? 'text-accent' : 'text-ink-3 transition-colors group-hover:text-ink-2')} />
          {!collapsed && <span className="truncate">{item.label}</span>}
        </>
      )}
    </NavLink>
  )

  return (
    <aside
      className={cn(
        'sticky top-0 z-40 hidden h-screen shrink-0 flex-col border-r border-line bg-surface transition-[width] duration-300 lg:flex',
        collapsed ? 'w-[76px]' : 'w-[248px]'
      )}
    >
      {/* Brand */}
      <div className={cn('relative flex h-16 shrink-0 items-center gap-2.5 px-5', collapsed && 'justify-center px-0')}>
        <span className="logo-tile grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[12px] font-extrabold tracking-tight text-white shadow-[0_4px_14px_-4px_var(--color-accent)]">
          MP
        </span>
        {!collapsed && (
          <span className="min-w-0">
            <span className="block truncate text-[14.5px] font-bold tracking-[-0.02em] text-ink">MyProgress</span>
            <span className="block truncate text-[11px] text-ink-3">DSA Command Center</span>
          </span>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'absolute -right-3 top-1/2 z-10 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full border border-line bg-elevated text-ink-3 shadow-sm transition-all duration-200 hover:text-ink',
            collapsed && 'rotate-180'
          )}
        >
          <ChevronLeft size={13} />
        </button>
      </div>

      {/* Search trigger */}
      <div className={cn('px-4 pb-2 pt-3', collapsed && 'px-3')}>
        <button
          onClick={onOpenSearch}
          className={cn(
            'flex h-9 w-full items-center gap-2 rounded-control border border-line bg-surface-2 px-3 text-[13px] text-ink-3 transition-colors hover:border-line-strong hover:text-ink-2',
            collapsed && 'justify-center px-0'
          )}
        >
          <Search size={15} className="shrink-0" />
          {!collapsed && (
            <>
              <span>Search…</span>
              <span className="kbd ml-auto">⌘K</span>
            </>
          )}
        </button>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-3" aria-label="Primary">
        {NAV_SECTIONS.map(section => (
          <div key={section.title}>
            {!collapsed && (
              <p className="mb-1.5 px-2.5 text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-3">
                {section.title}
              </p>
            )}
            {collapsed && <div className="mx-auto mb-3 h-px w-8 bg-line" aria-hidden />}
            <div className="space-y-0.5">{section.items.map(renderLink)}</div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="space-y-1 border-t border-line p-4">
        {renderLink(SETTINGS_NAV)}
        <div className={cn('flex items-center gap-2.5 pt-2', collapsed && 'justify-center pt-1')}>
          <span className="logo-tile grid h-9 w-9 shrink-0 place-items-center rounded-full text-[12px] font-bold text-white">
            V
          </span>
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate text-[13px] font-semibold text-ink">Vijay</span>
              <span className="block truncate text-[11px] text-ink-3">
                {state.streak.current}-day streak
              </span>
            </span>
          )}
        </div>
      </div>
    </aside>
  )
}
