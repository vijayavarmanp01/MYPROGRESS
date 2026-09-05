import { useId } from 'react'
import { cn } from '../../lib/utils'

interface CircularProgressProps {
  percentage: number
  size?: number
  strokeWidth?: number
  className?: string
  children?: React.ReactNode
  gradient?: boolean
  glow?: boolean
}

export function CircularProgress({
  percentage,
  size = 160,
  strokeWidth = 10,
  className,
  children,
  gradient = true,
  glow = false,
}: CircularProgressProps) {
  const gradientId = useId()
  const glowId = useId()
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const clamped = Math.min(100, Math.max(0, percentage))
  const offset = circumference - (clamped / 100) * circumference
  const center = size / 2

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        role="img"
        aria-label={`${Math.round(clamped)}% complete`}
      >
        <defs>
          {gradient && (
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--color-accent)" />
              <stop offset="100%" stopColor="var(--color-lavender)" />
            </linearGradient>
          )}
          {glow && (
            <filter id={glowId} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          )}
        </defs>

        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--color-surface-2)"
          strokeWidth={strokeWidth}
        />

        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={gradient ? `url(#${gradientId})` : 'var(--color-accent)'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          filter={glow ? `url(#${glowId})` : undefined}
          className="transition-all duration-700 [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  )
}
