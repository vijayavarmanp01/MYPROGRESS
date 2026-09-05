import { useEffect, useRef } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

type Tone = 'accent' | 'sky' | 'mint' | 'amber' | 'rose' | 'lavender'

const TONE_STYLES: Record<Tone, { icon: string; value: string }> = {
  accent:   { icon: 'border-accent/20 bg-accent/10 text-accent',     value: 'text-accent' },
  sky:      { icon: 'border-sky/20 bg-sky/10 text-sky',               value: 'text-sky' },
  mint:     { icon: 'border-mint/20 bg-mint/10 text-mint',             value: 'text-mint' },
  amber:    { icon: 'border-amber/25 bg-amber/10 text-amber',          value: 'text-amber' },
  rose:     { icon: 'border-rose/20 bg-rose/10 text-rose',             value: 'text-rose' },
  lavender: { icon: 'border-lavender/20 bg-lavender/10 text-lavender', value: 'text-lavender' },
}

interface StatTileProps {
  icon: LucideIcon
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  tone?: Tone
  className?: string
  animateValue?: boolean
}

export function StatTile({ icon: Icon, label, value, sub, tone = 'accent', className, animateValue = true }: StatTileProps) {
  const valueRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (!animateValue || !valueRef.current) return
    valueRef.current.classList.remove('animate-number-tick')
    // Trigger reflow to restart animation
    void valueRef.current.offsetWidth
    valueRef.current.classList.add('animate-number-tick')
  }, [value, animateValue])

  return (
    <div className={cn('card card-hover flex items-start gap-3.5 p-4 sm:p-5', className)}>
      <span
        className={cn(
          'grid h-10 w-10 shrink-0 place-items-center rounded-xl border',
          TONE_STYLES[tone].icon
        )}
      >
        <Icon size={17} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.07em] text-ink-3">
          {label}
        </p>
        <p
          ref={valueRef}
          className={cn(
            'mt-1 text-[22px] font-extrabold leading-none tracking-[-0.03em] tabular',
            TONE_STYLES[tone].value
          )}
        >
          {value}
        </p>
        {sub && <p className="mt-1 text-[12px] text-ink-3">{sub}</p>}
      </div>
    </div>
  )
}

export { TONE_STYLES }
export type { Tone }