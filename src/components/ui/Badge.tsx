import { cn } from '../../lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'accent'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      {
        'bg-[var(--color-surface-hover)] text-[var(--color-text-secondary)]': variant === 'default',
        'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400': variant === 'success',
        'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400': variant === 'warning',
        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400': variant === 'danger',
        'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400': variant === 'accent',
      },
      className
    )}>
      {children}
    </span>
  )
}
