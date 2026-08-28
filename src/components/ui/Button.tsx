import { cn } from '../../lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] shadow-sm': variant === 'primary',
          'bg-[var(--color-surface-hover)] text-[var(--color-text-primary)] hover:bg-[var(--color-border)]': variant === 'secondary',
          'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]': variant === 'ghost',
          'bg-red-500 text-white hover:bg-red-600': variant === 'danger',
          'px-3 py-1.5 text-sm': size === 'sm',
          'px-4 py-2 text-sm': size === 'md',
          'px-6 py-3 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
