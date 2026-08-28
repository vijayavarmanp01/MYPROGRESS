import { format, startOfYear, endOfYear, eachDayOfInterval } from 'date-fns'
import type { AppState, DayDetail, WeeklySummary } from '../types'
import { getActivityLevel } from './storage'
import { getWeekDates, formatDate } from './utils'

export interface DailyChartData {
  date: string
  label: string
  problems: number
  hours: number
  tasksCompleted: number
}

export function getWeeklyChartData(state: AppState): DailyChartData[] {
  const dates = getWeekDates()
  return dates.map(date => {
    const record = state.dayRecords[date]
    return {
      date,
      label: format(new Date(date + 'T00:00:00'), 'EEE'),
      problems: record?.totalProblems ?? 0,
      hours: record ? Math.round((record.totalTimeMinutes / 60) * 10) / 10 : 0,
      tasksCompleted: record?.tasks.filter(t => t.completed).length ?? 0,
    }
  })
}

export function getTopicDistribution(state: AppState): { name: string; count: number; icon: string }[] {
  const topicCounts: Record<string, number> = {}
  for (const problem of state.problems) {
    if (problem.status === 'solved' || problem.status === 'revised') {
      topicCounts[problem.topicId] = (topicCounts[problem.topicId] ?? 0) + 1
    }
  }

  // Also count from daily tasks
  for (const record of Object.values(state.dayRecords)) {
    for (const task of record.tasks) {
      if (task.completed && task.problemsSolved > 0) {
        topicCounts[task.categoryId] = (topicCounts[task.categoryId] ?? 0) + task.problemsSolved
      }
    }
  }

  return state.categories
    .map(c => ({ name: c.name, count: topicCounts[c.id] ?? 0, icon: c.icon }))
    .filter(t => t.count > 0)
    .sort((a, b) => b.count - a.count)
}

export function getDifficultyDistribution(state: AppState): { name: string; value: number; color: string }[] {
  const counts = { easy: 0, medium: 0, hard: 0 }
  for (const p of state.problems) {
    if (p.status === 'solved' || p.status === 'revised') {
      counts[p.difficulty]++
    }
  }
  for (const record of Object.values(state.dayRecords)) {
    for (const task of record.tasks) {
      for (const d of task.difficulties) {
        counts[d]++
      }
    }
  }
  return [
    { name: 'Easy', value: counts.easy, color: '#22c55e' },
    { name: 'Medium', value: counts.medium, color: '#eab308' },
    { name: 'Hard', value: counts.hard, color: '#ef4444' },
  ]
}

export function getWeeklySummary(state: AppState): WeeklySummary {
  const dates = getWeekDates()
  let problemsSolved = 0
  let totalMinutes = 0
  let totalCompleted = 0
  let totalTasks = 0
  const topicsSet = new Set<string>()

  for (const date of dates) {
    const record = state.dayRecords[date]
    if (!record) continue
    problemsSolved += record.totalProblems
    totalMinutes += record.totalTimeMinutes
    const completed = record.tasks.filter(t => t.completed)
    totalCompleted += completed.length
    totalTasks += record.tasks.length
    completed.forEach(t => topicsSet.add(t.categoryId))
  }

  return {
    streak: state.streak.current,
    problemsSolved,
    hoursStudied: Math.round((totalMinutes / 60) * 10) / 10,
    taskCompletionRate: totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0,
    topicsPracticed: topicsSet.size,
  }
}

export function getCalendarDays(year: number): string[] {
  const start = startOfYear(new Date(year, 0, 1))
  const end = endOfYear(new Date(year, 0, 1))
  return eachDayOfInterval({ start, end }).map(d => formatDate(d))
}

export function getDayDetail(state: AppState, date: string): DayDetail {
  const record = state.dayRecords[date]
  const enabledCount = state.categories.filter(c => c.enabled).length

  if (!record) {
    return {
      date,
      tasksCompleted: 0,
      totalTasks: enabledCount,
      problemsSolved: 0,
      studyTimeMinutes: 0,
      topicsPracticed: [],
      notes: [],
      activityLevel: 'none',
    }
  }

  const completedTasks = record.tasks.filter(t => t.completed)
  const topicsPracticed = completedTasks.map(t => {
    const cat = state.categories.find(c => c.id === t.categoryId)
    return cat ? `${cat.icon} ${cat.name}` : t.categoryId
  })
  const notes = record.tasks.filter(t => t.notes).map(t => t.notes)

  return {
    date,
    tasksCompleted: completedTasks.length,
    totalTasks: record.tasks.length,
    problemsSolved: record.totalProblems,
    studyTimeMinutes: record.totalTimeMinutes,
    topicsPracticed,
    notes,
    activityLevel: getActivityLevel(record, record.tasks.length),
  }
}

export function getOverallCompletion(state: AppState): number {
  const total = state.categories.reduce((sum, c) => sum + c.totalProblemsPlanned, 0)
  const solved = state.categories.reduce((sum, c) => sum + c.problemsSolved, 0)
  return total > 0 ? Math.round((solved / total) * 100) : 0
}

export function getWeakTopics(state: AppState, limit = 5): { name: string; icon: string; percentage: number }[] {
  return state.categories
    .map(c => ({
      name: c.name,
      icon: c.icon,
      percentage: c.totalProblemsPlanned > 0
        ? Math.round((c.problemsSolved / c.totalProblemsPlanned) * 100)
        : 0,
    }))
    .sort((a, b) => a.percentage - b.percentage)
    .slice(0, limit)
}

export function getTodayStats(state: AppState, today: string) {
  const record = state.dayRecords[today]
  const enabledCount = state.categories.filter(c => c.enabled).length
  const completed = record?.tasks.filter(t => t.completed).length ?? 0
  const remaining = enabledCount - completed
  const percentage = enabledCount > 0 ? Math.round((completed / enabledCount) * 100) : 0

  return { completed, remaining, total: enabledCount, percentage, record }
}

export function getRevisionDueProblems(state: AppState) {
  const today = formatDate(new Date())
  return state.problems.filter(p => {
    if (p.revisionStatus === 'needs-revision' || p.revisionStatus === 'important') {
      if (!p.revisionDate) return true
      return p.revisionDate <= today
    }
    return false
  })
}
