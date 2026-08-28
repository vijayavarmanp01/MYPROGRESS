import { ContributionCalendar } from '../components/calendar/ContributionCalendar'
import { Card, CardHeader, CardTitle } from '../components/ui/Card'

export function CalendarPage() {
  const year = new Date().getFullYear()

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Study Calendar</h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          Your consistency at a glance — click any day for details
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{year} Activity</CardTitle>
        </CardHeader>
        <ContributionCalendar year={year} />
      </Card>
    </div>
  )
}
