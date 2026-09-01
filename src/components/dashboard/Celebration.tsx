import { useEffect, useState } from 'react'
import { PartyPopper } from 'lucide-react'
import { cn } from '../../lib/utils'

interface CelebrationProps {
  show: boolean
  onDone: () => void
}

const CONFETTI_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
]

interface ConfettiPiece {
  left: number
  color: string
  duration: number
  delay: number
  round: boolean
}

/** Generated once per mount so the render stays pure. */
function makeConfetti(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    left: Math.random() * 100,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    duration: 2 + Math.random() * 2,
    delay: Math.random() * 0.5,
    round: Math.random() > 0.5,
  }))
}

export function Celebration({ show, onDone }: CelebrationProps) {
  const [visible, setVisible] = useState(false)
  const [confetti] = useState(() => makeConfetti(24))

  useEffect(() => {
    if (show) {
      setVisible(true)
      const timer = setTimeout(() => {
        setVisible(false)
        onDone()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [show, onDone])

  if (!visible) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="animate-scale-in glass-strong rounded-3xl p-8 text-center shadow-pop">
        <span className="logo-tile mx-auto grid h-14 w-14 place-items-center rounded-2xl text-white shadow-[0_8px_24px_-8px_var(--color-accent)]">
          <PartyPopper size={24} />
        </span>
        <h2 className="mt-4 text-xl font-bold tracking-[-0.02em] text-ink">
          All tasks complete
        </h2>
        <p className="mt-1.5 text-[13.5px] text-ink-2">
          Outstanding work today. Your streak is safe.
        </p>
      </div>
      {confetti.map((piece, i) => (
        <div
          key={i}
          aria-hidden
          className={cn('absolute top-[-10px] h-2 w-2', piece.round ? 'rounded-full' : 'rounded-[3px]')}
          style={{
            left: `${piece.left}%`,
            backgroundColor: piece.color,
            animation: `confetti-fall ${piece.duration}s linear forwards`,
            animationDelay: `${piece.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
