import type { ActivityLevel, AppState, DayRecord, DailyTask, StreakInfo } from '../types'
import { createDefaultState } from '../data/defaults'
import { formatDate, getTodayString } from './utils'

const STORAGE_KEY = 'myprogress-app-state'

export function loadState(): AppState {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return createDefaultState()
    const parsed = JSON.parse(stored) as AppState
    return migrateState(parsed)
  } catch {
    return createDefaultState()
  }
}

export function saveState(state: AppState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function migrateState(state: Partial<AppState>): AppState {
  const defaults = createDefaultState()
  return {
    categories: state.categories ?? defaults.categories,
    dayRecords: state.dayRecords ?? {},
    problems: state.problems ?? [],
    interviewTopics: state.interviewTopics ?? defaults.interviewTopics,
    settings: { ...defaults.settings, ...state.settings },
    streak: state.streak ?? defaults.streak,
    problemsMastered: state.problemsMastered ?? 0,
  }
}

export function createDailyTasks(categories: AppState['categories']): DailyTask[] {
  return categories
    .filter(c => c.enabled)
    .map(c => ({
      categoryId: c.id,
      completed: false,
      problemsSolved: 0,
      problemsTarget: 2,
      difficulties: [] as DailyTask['difficulties'],
      timeSpentMinutes: 0,
      notes: '',
    }))
}

export function ensureTodayRecord(state: AppState): AppState {
  const today = getTodayString()
  if (state.dayRecords[today]) return state

  const tasks = createDailyTasks(state.categories)
  const newRecord: DayRecord = {
    date: today,
    tasks,
    totalProblems: 0,
    totalTimeMinutes: 0,
  }

  return {
    ...state,
    dayRecords: { ...state.dayRecords, [today]: newRecord },
  }
}

export function recalculateDayTotals(record: DayRecord): DayRecord {
  const totalProblems = record.tasks.reduce((sum, t) => sum + t.problemsSolved, 0)
  const totalTimeMinutes = record.tasks.reduce((sum, t) => sum + t.timeSpentMinutes, 0)
  return { ...record, totalProblems, totalTimeMinutes }
}

export function calculateStreak(dayRecords: Record<string, DayRecord>, _categories: AppState['categories']): StreakInfo {
  let current = 0
  let longest = 0
  let temp = 0
  const today = getTodayString()

  const isProductiveDay = (date: string): boolean => {
    const record = dayRecords[date]
    if (!record) return false
    return record.tasks.some(t => t.completed)
  }

  // Calculate current streak
  // Start from today; if today is not productive, start from yesterday
  const todayDate = new Date(today + 'T00:00:00')
  let checkDate = today

  if (!isProductiveDay(today)) {
    // Today hasn't been completed yet — start streak from yesterday
    todayDate.setDate(todayDate.getDate() - 1)
    checkDate = formatDate(todayDate)
  }

  while (isProductiveDay(checkDate)) {
    current++
    const d = new Date(checkDate + 'T00:00:00')
    d.setDate(d.getDate() - 1)
    checkDate = formatDate(d)
  }

  // Calculate longest streak across all recorded days
  const allDates = Object.keys(dayRecords).sort()
  for (const date of allDates) {
    if (isProductiveDay(date)) {
      temp++
      longest = Math.max(longest, temp)
    } else {
      temp = 0
    }
  }

  return { current, longest: Math.max(longest, current) }
}

export function getActivityLevel(record: DayRecord | undefined, totalCategories: number): ActivityLevel {
  if (!record) return 'none'
  const completed = record.tasks.filter(t => t.completed).length
  const ratio = totalCategories > 0 ? completed / totalCategories : 0
  if (ratio >= 0.8) return 'high'
  if (ratio >= 0.5) return 'good'
  if (ratio > 0) return 'low'
  return 'none'
}

export function countMasteredProblems(problems: AppState['problems']): number {
  return problems.filter(p => p.revisionStatus === 'mastered').length
}
