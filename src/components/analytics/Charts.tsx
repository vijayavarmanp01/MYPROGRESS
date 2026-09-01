import { useId } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card'
import { EmptyState } from '../ui/EmptyState'
import type { DailyChartData } from '../../lib/analytics'

/* ---------- Shared styling primitives ---------- */

const AXIS_PROPS = {
  axisLine: false,
  tickLine: false,
  tick: { fill: 'var(--color-ink-3)', fontSize: 11 },
} as const

const GRID_PROPS = {
  horizontal: true,
  vertical: false,
  stroke: 'var(--color-line)',
} as const

interface TooltipEntry {
  name?: string | number
  value?: number | string
  color?: string
  fill?: string
}

function ChartTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean
  payload?: TooltipEntry[]
  label?: string | number
  unit?: string
}) {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="glass-strong rounded-xl px-3 py-2 shadow-pop">
      <p className="text-[12px] font-semibold text-ink">{label}</p>
      <div className="mt-1 space-y-0.5">
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2 text-[12px] text-ink-2">
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: entry.color ?? entry.fill ?? 'var(--chart-1)' }}
            />
            <span className="capitalize">{entry.name}</span>
            <span className="ml-auto pl-3 font-semibold text-ink tabular">
              {entry.value}
              {unit}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

interface WeeklyChartProps {
  data: DailyChartData[]
}

export function WeeklyProblemsChart({ data }: WeeklyChartProps) {
  const gradientId = useId()
  const hasData = data.some(d => d.problems > 0)

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div>
          <CardTitle>Problems Solved</CardTitle>
          <CardDescription>Per day · last 7 days</CardDescription>
        </div>
      </CardHeader>
      {hasData ? (
        <ResponsiveContainer width="100%" height={230}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.45} />
              </linearGradient>
            </defs>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="label" {...AXIS_PROPS} />
            <YAxis allowDecimals={false} {...AXIS_PROPS} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--color-surface-2)', opacity: 0.6 }} />
            <Bar
              dataKey="problems"
              name="problems"
              fill={`url(#${gradientId})`}
              radius={[6, 6, 2, 2]}
              barSize={26}
            />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <EmptyState
          title="No problems logged yet"
          body="Solve problems or complete daily tasks to see your weekly trend here."
          className="py-8"
        />
      )}
    </Card>
  )
}

export function WeeklyHoursChart({ data }: WeeklyChartProps) {
  const gradientId = useId()
  const hasData = data.some(d => d.hours > 0)

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div>
          <CardTitle>Study Hours</CardTitle>
          <CardDescription>Per day · last 7 days</CardDescription>
        </div>
      </CardHeader>
      {hasData ? (
        <ResponsiveContainer width="100%" height={230}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-4)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--chart-4)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="label" {...AXIS_PROPS} />
            <YAxis {...AXIS_PROPS} />
            <Tooltip content={<ChartTooltip unit="h" />} cursor={{ stroke: 'var(--color-line-strong)' }} />
            <Area
              type="monotone"
              dataKey="hours"
              name="hours"
              stroke="var(--chart-4)"
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--color-surface)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <EmptyState
          title="No study time logged yet"
          body="Add time spent on today's tasks to build your focus history."
          className="py-8"
        />
      )}
    </Card>
  )
}

export function WeeklyTasksChart({ data }: WeeklyChartProps) {
  const hasData = data.some(d => d.tasksCompleted > 0)

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div>
          <CardTitle>Tasks Completed</CardTitle>
          <CardDescription>Per day · last 7 days</CardDescription>
        </div>
      </CardHeader>
      {hasData ? (
        <ResponsiveContainer width="100%" height={230}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -18, bottom: 0 }}>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="label" {...AXIS_PROPS} />
            <YAxis allowDecimals={false} {...AXIS_PROPS} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: 'var(--color-surface-2)', opacity: 0.6 }} />
            <Bar dataKey="tasksCompleted" name="tasks" fill="var(--chart-2)" radius={[6, 6, 2, 2]} barSize={26} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <EmptyState
          title="No tasks completed yet"
          body="Check off today's tasks to see your consistency take shape."
          className="py-8"
        />
      )}
    </Card>
  )
}

interface DistributionChartProps {
  data: { name: string; value?: number; count?: number; color?: string }[]
  title: string
}

const PIE_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
  'var(--color-sky)',
  'var(--color-lavender)',
]

export function TopicDistributionChart({ data, title }: DistributionChartProps) {
  const chartData = data
    .map(d => ({ name: d.name, value: d.count ?? d.value ?? 0 }))
    .filter(d => d.value > 0)
  const total = chartData.reduce((s, d) => s + d.value, 0)

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>Where your solved problems come from</CardDescription>
        </div>
      </CardHeader>
      {total === 0 ? (
        <EmptyState
          title="No distribution yet"
          body="Solve problems across topics to see your coverage breakdown."
          className="py-8"
        />
      ) : (
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="relative w-full sm:w-1/2">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius="64%"
                  outerRadius="88%"
                  paddingAngle={3}
                  cornerRadius={5}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[22px] font-bold leading-none text-ink tabular">{total}</span>
              <span className="mt-0.5 text-[11px] text-ink-3">solved</span>
            </div>
          </div>
          <div className="w-full space-y-2 sm:w-1/2">
            {chartData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2.5 text-[12.5px]">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                />
                <span className="min-w-0 flex-1 truncate text-ink-2">{d.name}</span>
                <span className="shrink-0 font-semibold text-ink tabular">{d.value}</span>
                <span className="w-9 shrink-0 text-right text-ink-3 tabular">
                  {Math.round((d.value / total) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

const DIFFICULTY_COLORS: Record<string, string> = {
  Easy: 'var(--color-mint)',
  Medium: 'var(--color-amber)',
  Hard: 'var(--color-rose)',
}

export function DifficultyDistributionChart({ data }: { data: { name: string; value: number; color: string }[] }) {
  const chartData = data.filter(d => d.value > 0)
  const total = chartData.reduce((s, d) => s + d.value, 0)

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Difficulty Mix</CardTitle>
          <CardDescription>Balance across easy, medium, and hard</CardDescription>
        </div>
      </CardHeader>
      {total === 0 ? (
        <EmptyState
          title="No difficulty data yet"
          body="Log the difficulty of solved problems to see your risk profile."
          className="py-8"
        />
      ) : (
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="relative w-full sm:w-1/2">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius="64%"
                  outerRadius="88%"
                  paddingAngle={3}
                  cornerRadius={5}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map(d => (
                    <Cell key={d.name} fill={DIFFICULTY_COLORS[d.name] ?? d.color} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-[22px] font-bold leading-none text-ink tabular">{total}</span>
              <span className="mt-0.5 text-[11px] text-ink-3">problems</span>
            </div>
          </div>
          <div className="w-full space-y-2 sm:w-1/2">
            {chartData.map(d => (
              <div key={d.name} className="flex items-center gap-2.5 text-[12.5px]">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: DIFFICULTY_COLORS[d.name] ?? d.color }}
                />
                <span className="min-w-0 flex-1 truncate text-ink-2">{d.name}</span>
                <span className="shrink-0 font-semibold text-ink tabular">{d.value}</span>
                <span className="w-9 shrink-0 text-right text-ink-3 tabular">
                  {Math.round((d.value / total) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>
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
    { icon: '🔥', label: 'Day Streak', value: summary.streak, tint: 'text-amber' },
    { icon: '💻', label: 'Problems Solved', value: summary.problemsSolved, tint: 'text-accent' },
    { icon: '⏱️', label: 'Hours Studied', value: summary.hoursStudied, tint: 'text-sky' },
    { icon: '✅', label: 'Task Completion', value: `${summary.taskCompletionRate}%`, tint: 'text-mint' },
    { icon: '🧠', label: 'Topics Practiced', value: summary.topicsPracticed, tint: 'text-lavender' },
  ]

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>This Week</CardTitle>
          <CardDescription>Rolling last 7 days</CardDescription>
        </div>
      </CardHeader>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map(s => (
          <div key={s.label} className="rounded-tile border border-line bg-surface-2 p-3.5">
            <span className={`text-[15px] ${s.tint}`} aria-hidden>{s.icon}</span>
            <p className="mt-2 text-lg font-bold leading-none tracking-[-0.02em] text-ink tabular">{s.value}</p>
            <p className="mt-1 text-[11.5px] font-medium text-ink-3">{s.label}</p>
          </div>
        ))}
      </div>
    </Card>
  )
}

/* ---------- 14-day activity area chart (dashboard) ---------- */

export interface ActivityPoint {
  label: string
  problems: number
  hours: number
}

export function ActivityChart({ data }: { data: ActivityPoint[] }) {
  const gradientId = useId()
  const hasData = data.some(d => d.problems > 0 || d.hours > 0)

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <div>
          <CardTitle>Activity</CardTitle>
          <CardDescription>Problems per day · last 14 days</CardDescription>
        </div>
        {hasData && (
          <span className="rounded-full border border-accent/20 bg-accent/10 px-2.5 py-0.5 text-[11.5px] font-semibold text-accent tabular">
            {data.reduce((s, d) => s + d.problems, 0)} total
          </span>
        )}
      </CardHeader>
      {hasData ? (
        <ResponsiveContainer width="100%" height={196}>
          <AreaChart data={data} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid {...GRID_PROPS} />
            <XAxis dataKey="label" {...AXIS_PROPS} interval={2} />
            <YAxis allowDecimals={false} {...AXIS_PROPS} />
            <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--color-line-strong)' }} />
            <Area
              type="monotone"
              dataKey="problems"
              name="problems"
              stroke="var(--chart-1)"
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 2, stroke: 'var(--color-surface)' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <EmptyState
          title="No activity yet"
          body="Your problem-solving rhythm will appear here once you start practicing."
          className="py-8"
        />
      )}
    </Card>
  )
}
