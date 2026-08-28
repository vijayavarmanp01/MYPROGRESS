import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from '../../data/defaults'
import { cn } from '../../lib/utils'

export function Sidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-64 min-h-screen border-r border-[var(--color-border)] bg-[var(--color-surface)]">
      <div className="p-6 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--color-accent)] flex items-center justify-center text-white font-bold text-sm">
            MP
          </div>
          <div>
            <h1 className="font-bold text-[var(--color-text-primary)]">MyProgress</h1>
            <p className="text-xs text-[var(--color-text-muted)]">DSA Command Center</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(item => (
          <NavLink
            key={item.id}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
              isActive
                ? 'bg-[var(--color-accent)]/10 text-[var(--color-accent)]'
                : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]'
            )}
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-[var(--color-border)]">
        <p className="text-xs text-[var(--color-text-muted)] text-center">
          Stay consistent. Stay sharp.
        </p>
      </div>
    </aside>
  )
}
