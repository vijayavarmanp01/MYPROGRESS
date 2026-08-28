import type { Category } from '../../types'
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

  return (
    <Card hover={false}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-[var(--color-text-primary)]">
            {category.icon} {category.name}
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            {category.problemsSolved} / {category.totalProblemsPlanned}
            <span className="text-[var(--color-text-muted)]"> · {remaining} remaining</span>
          </p>
        </div>
        <span className="text-lg font-bold text-[var(--color-accent)]">{percentage}%</span>
      </div>

      <ProgressBar value={category.problemsSolved} max={category.totalProblemsPlanned} size="md" />

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
