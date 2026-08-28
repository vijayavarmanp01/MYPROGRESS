import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '../../data/defaults'
import { cn } from '../../lib/utils'

export function MobileNav() {
  const mainItems = NAV_ITEMS.slice(0, 5)

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--color-border)] bg-[var(--color-surface)] safe-area-pb">
      <div className="flex items-center justify-around py-2">
        {mainItems.map(item => (
          <NavLink
            key={item.id}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => cn(
              'flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg text-xs transition-colors min-w-[56px]',
              isActive
                ? 'text-[var(--color-accent)]'
                : 'text-[var(--color-text-muted)]'
            )}
          >
            <span className="text-lg">{item.icon}</span>
            <span className="truncate max-w-[56px]">{item.label.split(' ')[0]}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

export function MobileMenu() {
  const extraItems = NAV_ITEMS.slice(5)

  return (
    <div className="lg:hidden flex flex-wrap gap-2 px-4 py-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
      {extraItems.map(item => (
        <NavLink
          key={item.id}
          to={item.path}
          className={({ isActive }) => cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors',
            isActive
              ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
              : 'bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]'
          )}
        >
          <span>{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </div>
  )
}
