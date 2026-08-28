import { cn } from '../../lib/utils'

interface ProgressBarProps {
  value: number
  max?: number
  className?: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

export function ProgressBar({ value, max = 100, className, showLabel, size = 'md', color }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, max > 0 ? (value / max) * 100 : 0))

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between mb-1.5 text-sm">
          <span className="text-[var(--color-text-secondary)]">{Math.round(percentage)}%</span>
        </div>
      )}
      <div className={cn(
        'w-full rounded-full bg-[var(--color-surface-hover)] overflow-hidden',
        size === 'sm' && 'h-1.5',
        size === 'md' && 'h-2.5',
        size === 'lg' && 'h-4',
      )}>
        <div
          className="h-full rounded-full transition-all duration-500 ease-out"
          style={{
            width: `${percentage}%`,
            backgroundColor: color ?? 'var(--color-accent)',
          }}
        />
      </div>
    </div>
  )
}
