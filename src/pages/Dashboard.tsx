import { useState, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Play, Flame, Trophy, Clock, Target, ChartColumn, ListChecks, Layers, ArrowUpRight } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { useAuth } from '../store/AuthContext'
import { getTodayStats, getOverallCompletion, getWeakTopics, getWeeklySummary } from '../lib/analytics'
import { getDailyInsight, getWeeklyDelta } from '../lib/insights'
import { getDaysInRange, formatDisplayDate, formatShortDate, formatMinutes, cn } from '../lib/utils'
import { CircularProgress } from '../components/ui/CircularProgress'
import { Card, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { ProgressBar } from '../components/ui/ProgressBar'
import { StatTile } from '../components/ui/StatTile'
import { Celebration } from '../components/dashboard/Celebration'
import { InsightCard } from '../components/dashboard/InsightCard'
import { TaskQuickItem } from '../components/tasks/TaskQuickItem'
import { ActivityChart } from '../components/analytics/Charts'
import type { ActivityPoint } from '../components/analytics/Charts'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 5)  return 'night'
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}

function getGreetingEmoji() {
  const hour = new Date().getHours()
  if (hour < 5)  return '🌙'
  if (hour < 12) return '☀️'
  if (hour < 17) return '⚡'
  return '🌆'
}

export function DashboardPage() {
  const { state, today, toggleTask } = useApp()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrated, setCelebrated] = useState(false)

  const firstName = user?.name?.trim() ? user.name.trim().split(' ')[0] : 'Developer'
  const stats = getTodayStats(state, today)
  const overallCompletion = getOverallCompletion(state)
  const weakTopics = getWeakTopics(state, 3)
  const record = stats.record
  const insight = useMemo(() => getDailyInsight(state, today), [state, today])
  const summary = useMemo(() => getWeeklySummary(state), [state])
  const delta = useMemo(() => getWeeklyDelta(state), [state])

  const activityData = useMemo<ActivityPoint[]>(() => {
    const start = new Date()
    start.setDate(start.getDate() - 13)
    return getDaysInRange(start, new Date()).map(date => {
      const rec = state.dayRecords[date]
      return {
        label: formatShortDate(date),
        problems: rec?.totalProblems ?? 0,
        hours: rec ? Math.round((rec.totalTimeMinutes / 60) * 10) / 10 : 0,
      }
    })
  }, [state.dayRecords])

  const last7 = useMemo(() => {
    const start = new Date()
    start.setDate(start.getDate() - 6)
    return getDaysInRange(start, new Date())
  }, [])

  const handleToggle = useCallback((categoryId: string) => {
    toggleTask(today, categoryId)
    const task = record?.tasks.find(t => t.categoryId === categoryId)
    if (task && !task.completed) {
      const willComplete = stats.completed + 1
      if (willComplete === stats.total && !celebrated) {
        setShowCelebration(true)
        setCelebrated(true)
      }
    }
  }, [toggleTask, today, record, stats, celebrated])

  const deltaChip = (value: number) =>
    value === 0 ? (
      <span className="text-ink-3">—</span>
    ) : (
      <span className={cn('font-semibold tabular', value > 0 ? 'text-mint' : 'text-rose')}>
        {value > 0 ? '↑' : '↓'} {Math.abs(value)}%
      </span>
    )

  return (
    <div className="space-y-6">

      {/* ── Greeting banner ────────────────────────────────────── */}
      <div className="hero-gradient relative overflow-hidden rounded-2xl border border-line p-6 sm:p-8">
        {/* Decorative orbs */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-12 -left-12 h-48 w-48 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, var(--color-lavender) 0%, transparent 70%)',
          }}
        />

        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[12.5px] font-medium text-ink-3">{formatDisplayDate(today)}</p>
            <h1 className="mt-1.5 text-[28px] font-extrabold tracking-[-0.03em] text-ink sm:text-[32px]">
              {getGreetingEmoji()} Good {getGreeting()}, {firstName}
            </h1>
            <p className="mt-1 text-sm text-ink-2">Ready to level up your DSA today?</p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button variant="secondary" onClick={() => navigate('/analytics')}>
              <ChartColumn size={15} />
              Analytics
            </Button>
            <Button onClick={() => navigate('/tasks')}>
              <Play size={14} />
              Start Practice
            </Button>
          </div>
        </div>
      </div>

      {/* ── Bento grid ─────────────────────────────────────────── */}
      <div className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-12 xl:gap-5">

        {/* 1 — Today hero */}
        <Card className="flex flex-col sm:col-span-2 xl:col-span-7 xl:row-span-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-3">
            Today's progress
          </p>
          <div className="mt-4 flex flex-1 flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex min-w-0 flex-1 flex-col self-stretch">
              <div className="flex items-end gap-1.5">
                <span className="gradient-text text-[68px] font-extrabold leading-none tracking-[-0.04em] tabular">
                  {stats.percentage}
                </span>
                <span className="pb-2 text-[28px] font-bold leading-none text-ink-3">%</span>
              </div>
              <p className="mt-3 text-sm text-ink-2">
                <span className="font-semibold text-ink tabular">{stats.completed}</span>
                {' of '}
                <span className="font-semibold text-ink tabular">{stats.total}</span> tasks complete
                {stats.remaining > 0 && (
                  <span className="text-ink-3"> · {stats.remaining} to go</span>
                )}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="chip-sky inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium tabular">
                  <Clock size={11} />
                  {formatMinutes(record?.totalTimeMinutes ?? 0)}
                </span>
                <span className="chip-mint inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium tabular">
                  <Target size={11} />
                  {record?.totalProblems ?? 0} problems
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-3 py-1 text-[12px] font-medium text-ink-2 tabular">
                  Goal · {state.settings.problemsPerDayGoal}/day
                </span>
              </div>

              <div className="mt-auto pt-7">
                <div className="flex items-center justify-between text-[12.5px]">
                  <span className="text-ink-3">Overall mastery</span>
                  <span className="font-semibold text-ink tabular">{overallCompletion}%</span>
                </div>
                <ProgressBar className="mt-2" value={overallCompletion} max={100} size="sm" />
              </div>
            </div>

            <div className="shrink-0 self-center">
              <CircularProgress
                percentage={stats.percentage}
                size={176}
                strokeWidth={13}
                glow={stats.percentage > 0}
              >
                <span className="text-xl font-bold leading-none text-ink tabular">
                  {record?.totalProblems ?? 0}
                </span>
                <span className="mt-1 text-[11px] text-ink-3">problems</span>
              </CircularProgress>
            </div>
          </div>
        </Card>

        {/* 2 — Streak */}
        <Card className="flex flex-col xl:col-span-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-ink-2">
              <Flame size={15} className="text-amber" />
              Current streak
            </div>
            <span className="flex items-center gap-1.5 text-[12px] font-medium text-ink-3 tabular">
              <Trophy size={13} className="text-amber/80" />
              Best {state.streak.longest}
            </span>
          </div>
          <div className="mt-3 flex items-end gap-2">
            <span className="text-[52px] font-extrabold leading-none tracking-[-0.03em] text-amber tabular">
              {state.streak.current}
            </span>
            <span className="pb-2 text-[14px] font-semibold text-ink-3">
              {state.streak.current === 1 ? 'day' : 'days'}
            </span>
          </div>

          <div className="mt-auto pt-5">
            <p className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.09em] text-ink-3">
              Last 7 days
            </p>
            <div className="flex gap-1.5" aria-label="Last 7 days activity">
              {last7.map(date => {
                const rec = state.dayRecords[date]
                const productive = rec?.tasks.some(t => t.completed) ?? false
                const isToday = date === today
                return (
                  <span
                    key={date}
                    title={formatDisplayDate(date)}
                    className={cn(
                      'h-2.5 flex-1 rounded-full transition-all duration-300',
                      productive
                        ? 'bg-accent'
                        : isToday
                        ? 'border border-accent/40 bg-accent/10'
                        : 'border border-line bg-surface-2'
                    )}
                  />
                )
              })}
            </div>
          </div>
        </Card>

        {/* 3 — AI Insight */}
        <InsightCard insight={insight} className="sm:col-span-2 xl:col-span-5" />

        {/* 4 — This week stats */}
        <div className="grid grid-cols-2 gap-4 sm:col-span-2 lg:grid-cols-4 xl:col-span-12 xl:gap-5">
          <StatTile
            icon={Target}
            tone="accent"
            label="Problems solved"
            value={summary.problemsSolved}
            sub={<span>vs last week · {deltaChip(delta.problemsDelta)}</span>}
          />
          <StatTile
            icon={Clock}
            tone="sky"
            label="Hours studied"
            value={summary.hoursStudied}
            sub={<span>vs last week · {deltaChip(delta.minutesDelta)}</span>}
          />
          <StatTile
            icon={ListChecks}
            tone="mint"
            label="Task completion"
            value={`${summary.taskCompletionRate}%`}
            sub={<span>vs last week · {deltaChip(delta.completionDelta)}</span>}
          />
          <StatTile
            icon={Layers}
            tone="lavender"
            label="Topics practiced"
            value={summary.topicsPracticed}
            sub="rolling 7 days"
          />
        </div>

        {/* 5 — Activity chart */}
        <div className="sm:col-span-2 xl:col-span-7">
          <ActivityChart data={activityData} />
        </div>

        {/* 6 — Focus areas */}
        <Card className="flex flex-col sm:col-span-2 xl:col-span-5">
          <CardHeader>
            <div>
              <CardTitle>Focus areas</CardTitle>
              <p className="mt-0.5 text-[13px] text-ink-3">Least-explored topics</p>
            </div>
            <Link
              to="/topics"
              className="inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-accent transition-colors hover:text-accent-hover"
            >
              All topics
              <ArrowUpRight size={13} />
            </Link>
          </CardHeader>
          <div className="space-y-4">
            {weakTopics.map(topic => (
              <div key={topic.name} className="flex items-center gap-3">
                <span
                  aria-hidden
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border border-line bg-surface-2 text-[15px]"
                >
                  {topic.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[13px] font-medium text-ink">{topic.name}</p>
                    <span className="shrink-0 text-[12px] font-semibold text-ink-3 tabular">
                      {topic.percentage}%
                    </span>
                  </div>
                  <ProgressBar className="mt-1.5" value={topic.percentage} max={100} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* 7 — Today's tasks quick list */}
        <Card className="sm:col-span-2 xl:col-span-12">
          <CardHeader>
            <div>
              <CardTitle>Today's tasks</CardTitle>
              <p className="mt-0.5 text-[13px] text-ink-3 tabular">
                {stats.completed} of {stats.total} complete · {stats.percentage}%
              </p>
            </div>
            <Link
              to="/tasks"
              className="inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-accent transition-colors hover:text-accent-hover"
            >
              View all
              <ArrowUpRight size={13} />
            </Link>
          </CardHeader>
          <div className="grid gap-1 sm:grid-cols-2 xl:grid-cols-3">
            {record?.tasks.slice(0, 9).map(task => {
              const cat = state.categories.find(c => c.id === task.categoryId)
              if (!cat) return null
              return (
                <TaskQuickItem
                  key={task.categoryId}
                  icon={cat.icon}
                  name={cat.name}
                  task={task}
                  onToggle={() => handleToggle(task.categoryId)}
                />
              )
            })}
          </div>
        </Card>

      </div>

      <Celebration show={showCelebration} onDone={() => setShowCelebration(false)} />
    </div>
  )
}
