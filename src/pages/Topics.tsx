import { useApp } from '../store/AppContext'
import { getOverallCompletion } from '../lib/analytics'
import { TopicProgressCard } from '../components/topics/TopicProgressCard'
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'
import { PageHeader } from '../components/ui/PageHeader'

export function TopicsPage() {
  const { state } = useApp()
  const overall = getOverallCompletion(state)
  const totalPlanned = state.categories.reduce((s, c) => s + c.totalProblemsPlanned, 0)
  const totalSolved = state.categories.reduce((s, c) => s + c.problemsSolved, 0)
  const enabledCount = state.categories.filter(c => c.enabled).length

  const sorted = [...state.categories].sort((a, b) => {
    const pctA = a.totalProblemsPlanned > 0 ? a.problemsSolved / a.totalProblemsPlanned : 0
    const pctB = b.totalProblemsPlanned > 0 ? b.problemsSolved / b.totalProblemsPlanned : 0
    return pctA - pctB
  })

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Mastery"
        title="Topic Progress"
        description="Long-term progress across all DSA topics"
      />

      {/* Overall progress hero card */}
      <Card className="aurora-card">
        <CardHeader>
          <div>
            <CardTitle>Overall Progress</CardTitle>
            <CardDescription>
              {enabledCount} active topic{enabledCount === 1 ? '' : 's'} ·{' '}
              <span className="font-semibold text-ink tabular">{totalSolved}</span> of{' '}
              <span className="font-semibold text-ink tabular">{totalPlanned}</span> problems solved
            </CardDescription>
          </div>
          <span className="text-[36px] font-extrabold tracking-[-0.04em] text-ink tabular">
            {overall}
            <span className="text-[22px] text-ink-3">%</span>
          </span>
        </CardHeader>
        <ProgressBar value={totalSolved} max={totalPlanned} size="lg" />
      </Card>

      {/* Topic grid */}
      <div className="stagger grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {sorted.map(category => (
          <TopicProgressCard key={category.id} category={category} />
        ))}
      </div>
    </div>
  )
}
