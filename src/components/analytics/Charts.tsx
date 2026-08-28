import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, LineChart, Line,
} from 'recharts'
import { Card, CardHeader, CardTitle } from '../ui/Card'
import type { DailyChartData } from '../../lib/analytics'

interface WeeklyChartProps {
  data: DailyChartData[]
}

export function WeeklyProblemsChart({ data }: WeeklyChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Problems Solved Per Day</CardTitle>
      </CardHeader>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="label" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
          <YAxis tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              color: 'var(--color-text-primary)',
            }}
          />
          <Bar dataKey="problems" fill="var(--color-accent)" radius={[4, 4, 0, 0]} name="Problems" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}

export function WeeklyHoursChart({ data }: WeeklyChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Study Hours Per Day</CardTitle>
      </CardHeader>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="label" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
          <YAxis tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              color: 'var(--color-text-primary)',
            }}
          />
          <Line type="monotone" dataKey="hours" stroke="var(--color-accent)" strokeWidth={2} dot={{ fill: 'var(--color-accent)' }} name="Hours" />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}

export function WeeklyTasksChart({ data }: WeeklyChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks Completed Per Day</CardTitle>
      </CardHeader>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
          <XAxis dataKey="label" tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
          <YAxis tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '8px',
              color: 'var(--color-text-primary)',
            }}
          />
          <Bar dataKey="tasksCompleted" fill="#22c55e" radius={[4, 4, 0, 0]} name="Tasks" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}

interface DistributionChartProps {
  data: { name: string; value?: number; count?: number; color?: string }[]
  title: string
}

export function TopicDistributionChart({ data, title }: DistributionChartProps) {
  const chartData = data.map(d => ({ name: d.name, value: d.value ?? d.count ?? 0 }))
  const COLORS = ['#6366f1', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899']

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      {chartData.length === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)] text-center py-8">No data yet. Start solving problems!</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                color: 'var(--color-text-primary)',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}

export function DifficultyDistributionChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Difficulty Distribution</CardTitle>
      </CardHeader>
      {total === 0 ? (
        <p className="text-sm text-[var(--color-text-muted)] text-center py-8">No data yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data.filter(d => d.value > 0)}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {data.filter(d => d.value > 0).map(d => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                color: 'var(--color-text-primary)',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </Card>
  )
}

interface WeeklySummaryCardProps {
  summary: {
    streak: number
    problemsSolved: number
    hoursStudied: number
    taskCompletionRate: number
    topicsPracticed: number
  }
}

export function WeeklySummaryCard({ summary }: WeeklySummaryCardProps) {
  const stats = [
    { icon: '🔥', label: 'Day Streak', value: summary.streak },
    { icon: '💻', label: 'Problems Solved', value: summary.problemsSolved },
    { icon: '⏱️', label: 'Hours Studied', value: summary.hoursStudied },
    { icon: '✅', label: 'Task Completion', value: `${summary.taskCompletionRate}%` },
    { icon: '🧠', label: 'Topics Practiced', value: summary.topicsPracticed },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>This Week</CardTitle>
      </CardHeader>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map(s => (
          <div key={s.label} className="text-center p-3 rounded-lg bg-[var(--color-surface-hover)]">
            <span className="text-2xl">{s.icon}</span>
            <p className="text-xl font-bold text-[var(--color-text-primary)] mt-1">{s.value}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{s.label}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}
