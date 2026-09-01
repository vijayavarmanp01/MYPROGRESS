import { useId } from 'react'
import { cn } from '../../lib/utils'

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  stroke?: string
  className?: string
}

/** Minimal inline SVG trend line with a soft gradient fill. */
export function Sparkline({ data, width = 120, height = 40, stroke = 'var(--chart-1)', className }: SparklineProps) {
  const gradientId = useId()
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1
  const step = data.length > 1 ? width / (data.length - 1) : width

  const points = data.map((v, i) => {
    const x = i * step
    const y = height - 4 - ((v - min) / range) * (height - 8)
    return { x, y }
  })

  const line = points.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const area = points.length > 0
    ? `M0,${height} L${line.split(' ').join(' L')} L${width},${height} Z`
    : ''

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn('overflow-visible', className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.22" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {area && <path d={area} fill={`url(#${gradientId})`} />}
      <polyline
        points={line}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.length > 0 && (
        <circle
          cx={points[points.length - 1].x}
          cy={points[points.length - 1].y}
          r="3"
          fill={stroke}
          stroke="var(--color-surface)"
          strokeWidth="1.5"
        />
      )}
    </svg>
  )
}