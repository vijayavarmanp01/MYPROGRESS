import { cn } from '../../lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'accent' | 'sky'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11.5px] font-medium leading-[18px]',
        {
          'border-line bg-surface-2 text-ink-2': variant === 'default',
          'border-mint/20 bg-mint/10 text-mint': variant === 'success',
          'border-amber/25 bg-amber/10 text-amber': variant === 'warning',
          'border-rose/25 bg-rose/10 text-rose': variant === 'danger',
          'border-accent/20 bg-accent/10 text-accent': variant === 'accent',
          'border-sky/25 bg-sky/10 text-sky': variant === 'sky',
        },
        className
      )}
    >
      {children}
    </span>
  )
}
