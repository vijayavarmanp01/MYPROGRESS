import { useApp } from '../store/AppContext'
import {
  getWeeklyChartData,
  getTopicDistribution,
  getDifficultyDistribution,
  getWeeklySummary,
} from '../lib/analytics'
import {
  WeeklyProblemsChart,
  WeeklyHoursChart,
  WeeklyTasksChart,
  TopicDistributionChart,
  DifficultyDistributionChart,
  WeeklySummaryCard,
} from '../components/analytics/Charts'

export function AnalyticsPage() {
  const { state } = useApp()
  const chartData = getWeeklyChartData(state)
  const topicData = getTopicDistribution(state)
  const difficultyData = getDifficultyDistribution(state)
  const summary = getWeeklySummary(state)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Analytics</h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          Track your study patterns and progress over time
        </p>
      </div>

      <WeeklySummaryCard summary={summary} />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <WeeklyProblemsChart data={chartData} />
        <WeeklyHoursChart data={chartData} />
        <WeeklyTasksChart data={chartData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TopicDistributionChart data={topicData} title="Topic Distribution" />
        <DifficultyDistributionChart data={difficultyData} />
      </div>
    </div>
  )
}
