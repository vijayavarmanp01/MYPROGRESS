import { useApp } from '../store/AppContext'
import { getOverallCompletion } from '../lib/analytics'
import { TopicProgressCard } from '../components/topics/TopicProgressCard'
import { Card, CardHeader, CardTitle } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'

export function TopicsPage() {
  const { state } = useApp()
  const overall = getOverallCompletion(state)
  const totalPlanned = state.categories.reduce((s, c) => s + c.totalProblemsPlanned, 0)
  const totalSolved = state.categories.reduce((s, c) => s + c.problemsSolved, 0)

  const sorted = [...state.categories].sort((a, b) => {
    const pctA = a.totalProblemsPlanned > 0 ? a.problemsSolved / a.totalProblemsPlanned : 0
    const pctB = b.totalProblemsPlanned > 0 ? b.problemsSolved / b.totalProblemsPlanned : 0
    return pctA - pctB
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Topic Progress</h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          Long-term progress across all DSA topics
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
        </CardHeader>
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-[var(--color-text-secondary)]">
                {totalSolved} / {totalPlanned} problems
              </span>
              <span className="text-sm font-bold text-[var(--color-accent)]">{overall}%</span>
            </div>
            <ProgressBar value={totalSolved} max={totalPlanned} size="lg" />
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {sorted.map(category => (
          <TopicProgressCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  )
}
