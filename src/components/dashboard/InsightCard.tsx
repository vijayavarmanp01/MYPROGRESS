import { Link } from 'react-router-dom'
import { Sparkles, ArrowRight, Flame, Repeat, Crosshair, Shield, Sun } from 'lucide-react'
import type { Insight, InsightTone } from '../../lib/insights'
import { cn } from '../../lib/utils'
import { Card } from '../ui/Card'

const TONE_ICON: Record<InsightTone, typeof Flame> = {
  accent: Crosshair,
  mint: Sun,
  amber: Repeat,
  sky: Flame,
  rose: Shield,
}

const TONE_CHIP: Record<InsightTone, string> = {
  accent: 'border-accent/20 bg-accent/10 text-accent',
  mint: 'border-mint/20 bg-mint/10 text-mint',
  amber: 'border-amber/25 bg-amber/10 text-amber',
  sky: 'border-sky/20 bg-sky/10 text-sky',
  rose: 'border-rose/20 bg-rose/10 text-rose',
}

const KIND_LABEL: Record<Insight['kind'], string> = {
  done: 'Momentum',
  revision: 'Spaced repetition',
  momentum: 'Momentum',
  focus: 'Recommendation',
  streak: 'Streak',
  start: 'Getting started',
}

interface InsightCardProps {
  insight: Insight
  className?: string
}

export function InsightCard({ insight, className }: InsightCardProps) {
  const ToneIcon = TONE_ICON[insight.tone]

  return (
    <Card
      padded={false}
      className={cn(
        'aurora-card relative flex h-full flex-col overflow-hidden border-accent/20 p-5',
        className
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn('grid h-6 w-6 place-items-center rounded-lg border', TONE_CHIP[insight.tone])}>
          <Sparkles size={12} />
        </span>
        <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-3">
          Insight · {KIND_LABEL[insight.kind]}
        </span>
        <ToneIcon size={12} className={cn('ml-auto rounded border p-0.5', TONE_CHIP[insight.tone])} aria-hidden />
      </div>

      <h3 className="mt-3.5 text-[15px] font-semibold leading-snug tracking-[-0.01em] text-ink">
        {insight.title}
      </h3>
      <p className="mt-1.5 text-[13px] leading-relaxed text-ink-2">
        {insight.body}
      </p>

      <Link
        to={insight.ctaTo}
        className="group mt-auto inline-flex items-center gap-1.5 pt-4 text-[13px] font-semibold text-accent transition-all duration-200 hover:gap-2.5"
      >
        {insight.ctaLabel}
        <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-0.5" />
      </Link>
    </Card>
  )
}