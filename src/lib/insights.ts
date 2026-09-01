import type { AppState } from '../types'
import { getTodayStats, getRevisionDueProblems } from './analytics'
import { getWeekDates } from './utils'

/**
 * Local intelligence layer — derives guidance from the user's own data.
 * No external AI calls; every insight is honest and explainable.
 */

export type InsightTone = 'accent' | 'mint' | 'amber' | 'rose' | 'sky'

export interface Insight {
  id: string
  kind: 'done' | 'revision' | 'momentum' | 'focus' | 'streak' | 'start'
  title: string
  body: string
  ctaLabel: string
  ctaTo: string
  tone: InsightTone
}

export interface WeekTotals {
  problems: number
  minutes: number
  completed: number
  total: number
}

export function getWeekTotals(state: AppState, dates: string[]): WeekTotals {
  let problems = 0
  let minutes = 0
  let completed = 0
  let total = 0
  for (const date of dates) {
    const record = state.dayRecords[date]
    if (!record) continue
    problems += record.totalProblems
    minutes += record.totalTimeMinutes
    completed += record.tasks.filter(t => t.completed).length
    total += record.tasks.length
  }
  return { problems, minutes, completed, total }
}

export function getPreviousWeekDates(): string[] {
  const d = new Date()
  d.setDate(d.getDate() - 7)
  return getWeekDates(d)
}

function deltaPct(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

export function getWeeklyDelta(state: AppState) {
  const thisWeek = getWeekTotals(state, getWeekDates())
  const lastWeek = getWeekTotals(state, getPreviousWeekDates())
  return {
    thisWeek,
    lastWeek,
    problemsDelta: deltaPct(thisWeek.problems, lastWeek.problems),
    minutesDelta: deltaPct(thisWeek.minutes, lastWeek.minutes),
    completionDelta: deltaPct(thisWeek.completed, lastWeek.completed),
  }
}

/** Category completion counts per week, for momentum detection. */
function getCategoryCounts(state: AppState, dates: string[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const date of dates) {
    const record = state.dayRecords[date]
    if (!record) continue
    for (const task of record.tasks) {
      if (task.completed) {
        counts[task.categoryId] = (counts[task.categoryId] ?? 0) + 1
      }
    }
  }
  return counts
}

export function getDailyInsight(state: AppState, today: string): Insight {
  const stats = getTodayStats(state, today)
  const due = getRevisionDueProblems(state)

  // 1. Day complete — celebrate and point forward
  if (stats.total > 0 && stats.completed === stats.total) {
    if (due.length > 0) {
      return {
        id: 'done-revision',
        kind: 'done',
        tone: 'mint',
        title: 'Day complete — streak secured',
        body: `All ${stats.total} tasks done. While you're in flow, ${due.length} problem${due.length === 1 ? '' : 's'} ${due.length === 1 ? 'is' : 'are'} due for revision.`,
        ctaLabel: 'Review revision queue',
        ctaTo: '/revision',
      }
    }
    return {
      id: 'done',
      kind: 'done',
      tone: 'mint',
      title: 'Day complete — streak secured',
      body: 'Every task checked off. Review your weekly trends to see where momentum is building.',
      ctaLabel: 'View analytics',
      ctaTo: '/analytics',
    }
  }

  // 2. Revision due — spaced repetition works best on schedule
  if (due.length > 0) {
    return {
      id: 'revision',
      kind: 'revision',
      tone: 'amber',
      title: `${due.length} problem${due.length === 1 ? '' : 's'} due for revision`,
      body: 'Spaced repetition compounds fast. Clear your queue while it\'s small — the first one takes the longest.',
      ctaLabel: 'Start revision',
      ctaTo: '/revision',
    }
  }

  // 3. Topic momentum — this week vs last week
  const thisCounts = getCategoryCounts(state, getWeekDates())
  const lastCounts = getCategoryCounts(state, getPreviousWeekDates())
  let momentum: { name: string; cur: number; prev: number } | null = null
  for (const cat of state.categories) {
    if (!cat.enabled) continue
    const cur = thisCounts[cat.id] ?? 0
    const prev = lastCounts[cat.id] ?? 0
    if (cur - prev >= 2 && cur >= 3) {
      if (!momentum || cur - prev > momentum.cur - momentum.prev) {
        momentum = { name: cat.name, cur, prev }
      }
    }
  }
  if (momentum) {
    return {
      id: 'momentum',
      kind: 'momentum',
      tone: 'sky',
      title: `${momentum.name} momentum detected`,
      body: `${momentum.cur} sessions this week vs ${momentum.prev} last week. Consolidate the gain with one more focused set today.`,
      ctaLabel: 'Open today\'s tasks',
      ctaTo: '/tasks',
    }
  }

  // 4. Next best action — least-explored enabled topic
  const focusCandidate = state.categories
    .filter(c => c.enabled && c.totalProblemsPlanned > 0)
    .map(c => ({
      ...c,
      pct: Math.round((c.problemsSolved / c.totalProblemsPlanned) * 100),
    }))
    .sort((a, b) => a.pct - b.pct)[0]
  if (focusCandidate && focusCandidate.pct < 40) {
    return {
      id: 'focus',
      kind: 'focus',
      tone: 'accent',
      title: `Next best action: ${focusCandidate.name}`,
      body: `It's your least-explored topic at ${focusCandidate.pct}% complete. Two problems today compound faster than ten next month.`,
      ctaLabel: 'Practice now',
      ctaTo: '/tasks',
    }
  }

  // 5. Streak protection
  if (state.streak.current >= 2) {
    return {
      id: 'streak',
      kind: 'streak',
      tone: 'rose',
      title: `${state.streak.current}-day streak — protect it`,
      body: `You're ${stats.remaining} task${stats.remaining === 1 ? '' : 's'} away from keeping today alive. Even one counts.`,
      ctaLabel: 'Complete a task',
      ctaTo: '/tasks',
    }
  }

  // 6. Getting started
  return {
    id: 'start',
    kind: 'start',
    tone: 'accent',
    title: 'Let\'s begin',
    body: 'Complete your first task today to start building your progress history.',
    ctaLabel: 'Start practicing',
    ctaTo: '/tasks',
  }
}