import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { MobileNav, MobileMenu } from './MobileNav'
import { formatDisplayDate } from '../../lib/utils'
import { useApp } from '../../store/AppContext'

export function Layout() {
  const { today } = useApp()

  return (
    <div className="flex min-h-screen bg-[var(--color-surface-elevated)]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-surface)]/80 backdrop-blur-md">
          <div className="px-4 lg:px-8 py-4 flex items-center justify-between">
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)] flex items-center justify-center text-white font-bold text-xs">
                MP
              </div>
              <span className="font-bold text-[var(--color-text-primary)]">MyProgress</span>
            </div>
            <div className="hidden lg:block">
              <h2 className="text-sm font-medium text-[var(--color-text-secondary)]">
                {formatDisplayDate(today)}
              </h2>
            </div>
            <div className="lg:hidden text-xs text-[var(--color-text-secondary)]">
              {formatDisplayDate(today)}
            </div>
          </div>
          <MobileMenu />
        </header>

        <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8 overflow-y-auto">
          <Outlet />
        </main>

        <MobileNav />
      </div>
    </div>
  )
}
