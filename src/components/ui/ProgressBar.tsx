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
        <div className="mb-1.5 flex justify-between text-[13px]">
          <span className="font-semibold text-ink tabular">{Math.round(percentage)}%</span>
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={Math.round(percentage)}
        aria-valuemin={0}
        aria-valuemax={100}
        className={cn(
          'w-full overflow-hidden rounded-full bg-surface-2',
          size === 'sm' && 'h-1.5',
          size === 'md' && 'h-2',
          size === 'lg' && 'h-2.5',
        )}
      >
        <div
          className="h-full rounded-full transition-all duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
          style={{
            width: `${percentage}%`,
            background: color ?? 'linear-gradient(90deg, var(--color-accent), color-mix(in srgb, var(--color-accent) 55%, var(--color-lavender)))',
          }}
        />
      </div>
    </div>
  )
}
