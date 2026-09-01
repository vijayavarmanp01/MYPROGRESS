import type { Category } from '../../types'
import { cn } from '../../lib/utils'
import { ProgressBar } from '../ui/ProgressBar'
import { Card } from '../ui/Card'
import { Badge } from '../ui/Badge'

interface TopicProgressCardProps {
  category: Category
  onClick?: () => void
}

export function TopicProgressCard({ category }: TopicProgressCardProps) {
  const remaining = category.totalProblemsPlanned - category.problemsSolved
  const percentage = category.totalProblemsPlanned > 0
    ? Math.round((category.problemsSolved / category.totalProblemsPlanned) * 100)
    : 0

  const isWeak = percentage < 30 && category.problemsSolved > 0
  const isVeryWeak = percentage < 15

  const pctTone = percentage >= 60 ? 'text-mint' : percentage < 15 ? 'text-rose' : 'text-ink'
  const barColor = percentage >= 60
    ? 'var(--color-mint)'
    : percentage < 15 && category.problemsSolved > 0
      ? 'var(--color-rose)'
      : undefined

  return (
    <Card hover={false} className="transition-shadow duration-300 hover:shadow-lift">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-line bg-surface-2 text-[17px]"
          >
            {category.icon}
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-[14.5px] font-semibold tracking-[-0.01em] text-ink">
              {category.name}
            </h3>
            <p className="mt-0.5 text-[12.5px] text-ink-3 tabular">
              {category.problemsSolved} / {category.totalProblemsPlanned}
              <span className="text-ink-3/70"> · {remaining} left</span>
            </p>
          </div>
        </div>
        <span className={cn('shrink-0 text-[17px] font-bold tabular tracking-[-0.02em]', pctTone)}>
          {percentage}%
        </span>
      </div>

      <ProgressBar className="mt-4" value={category.problemsSolved} max={category.totalProblemsPlanned} size="md" color={barColor} />

      {(isWeak || isVeryWeak) && (
        <div className="mt-3">
          <Badge variant={isVeryWeak ? 'danger' : 'warning'}>
            {isVeryWeak ? 'Needs focus' : 'Keep practicing'}
          </Badge>
        </div>
      )}
    </Card>
  )
}
