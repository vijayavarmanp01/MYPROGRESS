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
import { PageHeader } from '../components/ui/PageHeader'

export function AnalyticsPage() {
  const { state } = useApp()
  const chartData = getWeeklyChartData(state)
  const topicData = getTopicDistribution(state)
  const difficultyData = getDifficultyDistribution(state)
  const summary = getWeeklySummary(state)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Insights"
        title="Analytics"
        description="Track your study patterns and progress over time"
      />

      <WeeklySummaryCard summary={summary} />

      <div className="stagger grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3 xl:gap-5">
        <WeeklyProblemsChart data={chartData} />
        <WeeklyHoursChart data={chartData} />
        <WeeklyTasksChart data={chartData} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:gap-5">
        <TopicDistributionChart data={topicData} title="Topic Distribution" />
        <DifficultyDistributionChart data={difficultyData} />
      </div>
    </div>
  )
}
