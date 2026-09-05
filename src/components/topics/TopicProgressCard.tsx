import type { Category } from '../../types'
import { cn } from '../../lib/utils'
import { ProgressBar } from '../ui/ProgressBar'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'

interface TopicProgressCardProps {
  category: Category
}

export function TopicProgressCard({ category }: TopicProgressCardProps) {
  const remaining = category.totalProblemsPlanned - category.problemsSolved
  const percentage = category.totalProblemsPlanned > 0
    ? Math.round((category.problemsSolved / category.totalProblemsPlanned) * 100)
    : 0

  const isDisabled = !category.enabled
  const isVeryWeak = percentage < 15 && category.problemsSolved > 0
  const isWeak     = percentage >= 15 && percentage < 30 && category.problemsSolved > 0
  const isStrong   = percentage >= 60

  const pctTone = isDisabled
    ? 'text-ink-3'
    : isStrong
    ? 'text-mint'
    : isVeryWeak
    ? 'text-rose'
    : 'text-ink'

  const barColor = isStrong
    ? 'var(--color-mint)'
    : isVeryWeak && category.problemsSolved > 0
    ? 'var(--color-rose)'
    : undefined

  return (
    <Card
      hover={!isDisabled}
      className={cn(
        'transition-all duration-300',
        isDisabled && 'opacity-50'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-surface-2 text-[17px]"
          >
            {category.icon}
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-[14px] font-semibold tracking-[-0.01em] text-ink">
              {category.name}
            </h3>
            <p className="mt-0.5 text-[12px] text-ink-3 tabular">
              {category.problemsSolved}
              <span className="text-ink-3/60"> / {category.totalProblemsPlanned}</span>
              <span className="text-ink-3/60"> · {remaining} left</span>
            </p>
          </div>
        </div>
        <span className={cn('shrink-0 text-[18px] font-extrabold tabular tracking-[-0.02em]', pctTone)}>
          {percentage}%
        </span>
      </div>

      <ProgressBar
        className="mt-4"
        value={category.problemsSolved}
        max={category.totalProblemsPlanned}
        size="md"
        color={barColor}
      />

      {(isWeak || isVeryWeak || isDisabled) && (
        <div className="mt-3">
          {isDisabled ? (
            <Badge variant="default">Disabled</Badge>
          ) : isVeryWeak ? (
            <Badge variant="danger">Needs focus</Badge>
          ) : (
            <Badge variant="warning">Keep practicing</Badge>
          )}
        </div>
      )}
    </Card>
  )
}
