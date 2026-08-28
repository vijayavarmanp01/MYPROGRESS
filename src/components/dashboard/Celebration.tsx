import { useEffect, useState } from 'react'
import { PartyPopper } from 'lucide-react'

interface CelebrationProps {
  show: boolean
  onDone: () => void
}

export function Celebration({ show, onDone }: CelebrationProps) {
  const [visible, setVisible] = useState(false)

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
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="animate-celebrate bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 shadow-2xl text-center">
        <PartyPopper className="w-12 h-12 text-[var(--color-accent)] mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
          All Tasks Complete! 🎉
        </h2>
        <p className="text-[var(--color-text-secondary)]">
          Outstanding work today. Keep the streak alive!
        </p>
      </div>
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            backgroundColor: ['#6366f1', '#22c55e', '#eab308', '#ef4444'][i % 4],
            animation: `confetti-fall ${2 + Math.random() * 2}s linear forwards`,
            animationDelay: `${Math.random() * 0.5}s`,
          }}
        />
      ))}
    </div>
  )
}
