import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

type Tone = 'accent' | 'sky' | 'mint' | 'amber' | 'rose' | 'lavender'

const TONE_STYLES: Record<Tone, string> = {
  accent: 'border-accent/15 bg-accent/10 text-accent',
  sky: 'border-sky/20 bg-sky/10 text-sky',
  mint: 'border-mint/20 bg-mint/10 text-mint',
  amber: 'border-amber/25 bg-amber/10 text-amber',
  rose: 'border-rose/20 bg-rose/10 text-rose',
  lavender: 'border-lavender/20 bg-lavender/10 text-lavender',
}

interface StatTileProps {
  icon: LucideIcon
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  tone?: Tone
  className?: string
}

export function StatTile({ icon: Icon, label, value, sub, tone = 'accent', className }: StatTileProps) {
  return (
    <div className={cn('card card-hover flex items-start gap-3 p-4', className)}>
      <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-xl border', TONE_STYLES[tone])}>
        <Icon size={16} />
      </span>
      <div className="min-w-0">
        <p className="text-[12px] font-medium text-ink-3">{label}</p>
        <p className="mt-0.5 text-xl font-bold leading-tight tracking-[-0.02em] text-ink tabular">{value}</p>
        {sub && <p className="mt-0.5 text-[12px] text-ink-3">{sub}</p>}
      </div>
    </div>
  )
}

export { TONE_STYLES }