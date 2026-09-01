import { cn } from '../../lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-control font-medium',
        'transition-all duration-200 active:scale-[0.98]',
        'disabled:pointer-events-none disabled:opacity-50',
        {
          'bg-accent text-accent-contrast shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_4px_14px_-6px_var(--color-accent)] hover:bg-accent-hover':
            variant === 'primary',
          'border border-line bg-surface-2 text-ink hover:border-line-strong hover:bg-elevated':
            variant === 'secondary',
          'text-ink-2 hover:bg-surface-2 hover:text-ink':
            variant === 'ghost',
          'border border-rose/20 bg-rose/10 text-rose hover:bg-rose/15':
            variant === 'danger',
          'h-8 rounded-[10px] px-3 text-[13px]': size === 'sm',
          'h-10 px-4 text-sm': size === 'md',
          'h-11 px-5 text-[15px]': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}
