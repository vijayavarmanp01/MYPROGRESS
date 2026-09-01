import { ContributionCalendar } from '../components/calendar/ContributionCalendar'
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { useApp } from '../store/AppContext'
import { formatShortDate } from '../lib/utils'

export function CalendarPage() {
  const { state } = useApp()
  const year = new Date().getFullYear()

  const records = Object.values(state.dayRecords)
  const activeDays = records.filter(r => r.tasks.some(t => t.completed)).length
  const totalProblems = records.reduce((s, r) => s + r.totalProblems, 0)
  const bestDay = records.reduce(
    (best, r) => (r.totalProblems > (best?.totalProblems ?? -1) ? r : best),
    undefined as (typeof records)[number] | undefined
  )

  const stats = [
    { label: 'Active days', value: activeDays },
    { label: 'Problems solved', value: totalProblems },
    { label: 'Best day', value: bestDay && bestDay.totalProblems > 0 ? formatShortDate(bestDay.date) : '—' },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Consistency"
        title="Study Calendar"
        description="Your consistency at a glance — click any day for details"
      />

      <div className="grid grid-cols-3 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="p-4 sm:p-5">
            <p className="text-[12px] font-medium text-ink-3">{s.label}</p>
            <p className="mt-1 text-xl font-bold tracking-[-0.02em] text-ink tabular sm:text-2xl">{s.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>{year} Activity</CardTitle>
            <CardDescription>Each square is a day — brighter means more tasks completed</CardDescription>
          </div>
        </CardHeader>
        <ContributionCalendar year={year} />
      </Card>
    </div>
  )
}
