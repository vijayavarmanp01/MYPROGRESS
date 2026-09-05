import { cn } from '../../lib/utils'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
  padded?: boolean
  glass?: boolean
  glow?: 'accent' | 'mint' | 'amber' | 'lavender' | 'sky' | 'rose'
}

export function Card({ children, className, hover, padded = true, glass, glow, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        glass ? 'glass-card' : 'card',
        padded && 'p-5 sm:p-6',
        hover && 'card-hover',
        glow && `glow-${glow}`,
        className
      )}
      {...rest}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('mb-4 flex items-start justify-between gap-3', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-[15px] font-semibold tracking-[-0.015em] text-ink', className)}>
      {children}
    </h3>
  )
}

export function CardDescription({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn('mt-0.5 text-[13px] leading-relaxed text-ink-3', className)}>{children}</p>
}
