import { ContributionCalendar } from '../components/calendar/ContributionCalendar'
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { useApp } from '../store/AppContext'
import { formatShortDate } from '../lib/utils'
import { CalendarDays, Zap, Trophy } from 'lucide-react'

export function CalendarPage() {
  const { state } = useApp()
  const year = new Date().getFullYear()

  const records = Object.values(state.dayRecords)
  const activeDays   = records.filter(r => r.tasks.some(t => t.completed)).length
  const totalProblems = records.reduce((s, r) => s + r.totalProblems, 0)
  const bestDay = records.reduce(
    (best, r) => (r.totalProblems > (best?.totalProblems ?? -1) ? r : best),
    undefined as (typeof records)[number] | undefined
  )

  const stats = [
    {
      icon: CalendarDays,
      label: 'Active days',
      value: activeDays,
      color: 'text-accent',
      chipClass: 'chip-accent',
    },
    {
      icon: Zap,
      label: 'Problems solved',
      value: totalProblems,
      color: 'text-mint',
      chipClass: 'chip-mint',
    },
    {
      icon: Trophy,
      label: 'Best day',
      value: bestDay && bestDay.totalProblems > 0 ? formatShortDate(bestDay.date) : '—',
      color: 'text-amber',
      chipClass: 'chip-amber',
    },
  ]

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Consistency"
        title="Study Calendar"
        description="Your consistency at a glance — each square is a day of activity"
      />

      {/* Stat row */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map(s => (
          <Card key={s.label} className="p-4 sm:p-5">
            <div className={`mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg ${s.chipClass}`}>
              <s.icon size={15} />
            </div>
            <p className="text-[11.5px] font-semibold uppercase tracking-[0.07em] text-ink-3">
              {s.label}
            </p>
            <p className={`mt-1 text-[22px] font-extrabold leading-none tracking-[-0.03em] tabular ${s.color}`}>
              {s.value}
            </p>
          </Card>
        ))}
      </div>

      {/* Calendar heat map */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>{year} Activity</CardTitle>
            <CardDescription>
              Each square is a day — brighter means more tasks completed
            </CardDescription>
          </div>
        </CardHeader>
        <ContributionCalendar year={year} />
      </Card>
    </div>
  )
}
