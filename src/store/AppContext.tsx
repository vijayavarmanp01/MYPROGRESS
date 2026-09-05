import { createContext, useContext, useReducer, useEffect, useCallback, useRef, type ReactNode } from 'react'
import type { AppAction, AppState, DailyTask, Problem, RevisionInterval } from '../types'
import { createDefaultState, REVISION_INTERVALS } from '../data/defaults'
import { useAuth } from './AuthContext'
import {
  loadState,
  saveState,
  ensureTodayRecord,
  recalculateDayTotals,
  calculateStreak,
  countMasteredProblems,
} from '../lib/storage'
import { addDays, getTodayString } from '../lib/utils'

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOAD_STATE':
      return action.payload

    case 'TOGGLE_TASK': {
      const { date, categoryId } = action.payload
      const record = state.dayRecords[date]
      if (!record) return state

      // Capture old task state BEFORE toggling
      const oldTask = record.tasks.find(t => t.categoryId === categoryId)
      const wasCompleted = oldTask?.completed ?? false

      const tasks = record.tasks.map(t =>
        t.categoryId === categoryId ? { ...t, completed: !t.completed } : t
      )
      const updatedRecord = recalculateDayTotals({ ...record, tasks })
      const dayRecords = { ...state.dayRecords, [date]: updatedRecord }

      // Update category problems solved correctly on both toggle directions
      const task = tasks.find(t => t.categoryId === categoryId)!
      let categories = state.categories
      if (!wasCompleted && task.completed && task.problemsSolved > 0) {
        // Toggling ON — increment
        categories = categories.map(c =>
          c.id === categoryId
            ? { ...c, problemsSolved: c.problemsSolved + task.problemsSolved }
            : c
        )
      } else if (wasCompleted && !task.completed && task.problemsSolved > 0) {
        // Toggling OFF — decrement
        categories = categories.map(c =>
          c.id === categoryId
            ? { ...c, problemsSolved: Math.max(0, c.problemsSolved - task.problemsSolved) }
            : c
        )
      }

      const newState = { ...state, dayRecords, categories }
      const streak = calculateStreak(dayRecords, categories)
      return { ...newState, streak }
    }

    case 'UPDATE_TASK': {
      const { date, categoryId, updates } = action.payload
      const record = state.dayRecords[date]
      if (!record) return state

      const tasks = record.tasks.map(t =>
        t.categoryId === categoryId ? { ...t, ...updates } : t
      )
      const updatedRecord = recalculateDayTotals({ ...record, tasks })
      const dayRecords = { ...state.dayRecords, [date]: updatedRecord }
      const streak = calculateStreak(dayRecords, state.categories)
      return { ...state, dayRecords, streak }
    }

    case 'ADD_PROBLEM': {
      const problems = [...state.problems, action.payload]
      let categories = state.categories
      if (action.payload.status === 'solved') {
        categories = categories.map(c =>
          c.id === action.payload.topicId
            ? { ...c, problemsSolved: c.problemsSolved + 1 }
            : c
        )
      }
      return {
        ...state,
        problems,
        categories,
        problemsMastered: countMasteredProblems(problems),
      }
    }

    case 'UPDATE_PROBLEM': {
      const { id, updates } = action.payload
      const oldProblem = state.problems.find(p => p.id === id)
      const problems = state.problems.map(p => (p.id === id ? { ...p, ...updates } : p))
      let categories = state.categories

      if (oldProblem && updates.status) {
        const wasSolved = oldProblem.status === 'solved' || oldProblem.status === 'revised'
        const isSolved = updates.status === 'solved' || updates.status === 'revised'
        if (!wasSolved && isSolved) {
          categories = categories.map(c =>
            c.id === oldProblem.topicId
              ? { ...c, problemsSolved: c.problemsSolved + 1 }
              : c
          )
        } else if (wasSolved && !isSolved) {
          categories = categories.map(c =>
            c.id === oldProblem.topicId
              ? { ...c, problemsSolved: Math.max(0, c.problemsSolved - 1) }
              : c
          )
        }
      }

      return {
        ...state,
        problems,
        categories,
        problemsMastered: countMasteredProblems(problems),
      }
    }

    case 'DELETE_PROBLEM': {
      const problem = state.problems.find(p => p.id === action.payload)
      let categories = state.categories
      if (problem && (problem.status === 'solved' || problem.status === 'revised')) {
        categories = categories.map(c =>
          c.id === problem.topicId
            ? { ...c, problemsSolved: Math.max(0, c.problemsSolved - 1) }
            : c
        )
      }
      const problems = state.problems.filter(p => p.id !== action.payload)
      return {
        ...state,
        problems,
        categories,
        problemsMastered: countMasteredProblems(problems),
      }
    }

    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(c =>
          c.id === action.payload.id ? { ...c, ...action.payload.updates } : c
        ),
      }

    case 'UPDATE_INTERVIEW_TOPIC':
      return {
        ...state,
        interviewTopics: state.interviewTopics.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload.updates } : t
        ),
      }

    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.payload },
      }

    case 'SET_REVISION': {
      const { problemId, revisionStatus, revisionDate } = action.payload
      const problems = state.problems.map(p =>
        p.id === problemId
          ? { ...p, revisionStatus, revisionDate: revisionDate ?? p.revisionDate }
          : p
      )
      return {
        ...state,
        problems,
        problemsMastered: countMasteredProblems(problems),
      }
    }

    case 'RESET_DATA':
      return createDefaultState()

    default:
      return state
  }
}

interface AppContextValue {
  state: AppState
  dispatch: React.Dispatch<AppAction>
  toggleTask: (date: string, categoryId: string) => void
  updateTask: (date: string, categoryId: string, updates: Partial<DailyTask>) => void
  addProblem: (problem: Problem) => void
  updateProblem: (id: string, updates: Partial<Problem>) => void
  deleteProblem: (id: string) => void
  setRevision: (problemId: string, revisionStatus: Problem['revisionStatus'], interval?: RevisionInterval) => void
  today: string
}

const AppContext = createContext<AppContextValue | null>(null)

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const userId = user?.id ?? null

  const [state, dispatch] = useReducer(appReducer, undefined, () => {
    const loaded = ensureTodayRecord(loadState(userId))
    const streak = calculateStreak(loaded.dayRecords, loaded.categories)
    return { ...loaded, streak }
  })

  // When userId changes (login or logout), reload corresponding user-scoped state
  const prevUserIdRef = useRef(userId)
  useEffect(() => {
    if (prevUserIdRef.current !== userId) {
      prevUserIdRef.current = userId
      const loaded = ensureTodayRecord(loadState(userId))
      const streak = calculateStreak(loaded.dayRecords, loaded.categories)
      dispatch({ type: 'LOAD_STATE', payload: { ...loaded, streak } })
    }
  }, [userId])

  const today = getTodayString()

  useEffect(() => {
    const withToday = ensureTodayRecord(state)
    if (withToday.dayRecords[getTodayString()] && !state.dayRecords[getTodayString()]) {
      dispatch({ type: 'LOAD_STATE', payload: withToday })
    }
  }, [today])

  useEffect(() => {
    saveState(state, userId)
  }, [state, userId])

  const toggleTask = useCallback((date: string, categoryId: string) => {
    dispatch({ type: 'TOGGLE_TASK', payload: { date, categoryId } })
  }, [])

  const updateTask = useCallback((date: string, categoryId: string, updates: Partial<DailyTask>) => {
    dispatch({ type: 'UPDATE_TASK', payload: { date, categoryId, updates } })
  }, [])

  const addProblem = useCallback((problem: Problem) => {
    dispatch({ type: 'ADD_PROBLEM', payload: problem })
  }, [])

  const updateProblem = useCallback((id: string, updates: Partial<Problem>) => {
    dispatch({ type: 'UPDATE_PROBLEM', payload: { id, updates } })
  }, [])

  const deleteProblem = useCallback((id: string) => {
    dispatch({ type: 'DELETE_PROBLEM', payload: id })
  }, [])

  const setRevision = useCallback((
    problemId: string,
    revisionStatus: Problem['revisionStatus'],
    interval?: RevisionInterval
  ) => {
    let revisionDate: string | undefined
    if (interval) {
      const intervalConfig = REVISION_INTERVALS.find(i => i.value === interval)
      if (intervalConfig) {
        revisionDate = addDays(getTodayString(), intervalConfig.days)
      }
    }
    dispatch({ type: 'SET_REVISION', payload: { problemId, revisionStatus, revisionDate } })
  }, [])

  return (
    <AppContext.Provider value={{
      state, dispatch, toggleTask, updateTask, addProblem,
      updateProblem, deleteProblem, setRevision, today,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

export function useTheme() {
  const { state } = useApp()

  useEffect(() => {
    const theme = state.settings.theme
    const root = document.documentElement
    const apply = (dark: boolean) => {
      root.classList.toggle('dark', dark)
    }

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      apply(mq.matches)
      const handler = (e: MediaQueryListEvent) => apply(e.matches)
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
    apply(theme === 'dark')
  }, [state.settings.theme])
}
