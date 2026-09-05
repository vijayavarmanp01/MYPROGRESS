import { cn } from '../../lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'glow'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-control font-medium',
        'transition-all duration-200 active:scale-[0.97]',
        'disabled:pointer-events-none disabled:opacity-40',
        {
          // Primary — accent with inner highlight + drop shadow
          'bg-accent text-accent-contrast shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_4px_16px_-6px_var(--color-accent)] hover:bg-accent-hover hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_6px_24px_-8px_var(--color-accent)]':
            variant === 'primary',

          // Secondary — bordered surface
          'border border-line bg-surface-2 text-ink hover:border-line-strong hover:bg-elevated':
            variant === 'secondary',

          // Ghost — label only
          'text-ink-2 hover:bg-surface-2 hover:text-ink':
            variant === 'ghost',

          // Danger — rose tint
          'border border-rose/20 bg-rose/10 text-rose hover:bg-rose/18':
            variant === 'danger',

          // Glow — accent with animated glow pulse
          'bg-accent text-accent-contrast animate-pulse-glow hover:bg-accent-hover':
            variant === 'glow',

          // Sizes
          'h-8 rounded-[10px] px-3 text-[12.5px]': size === 'sm',
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
