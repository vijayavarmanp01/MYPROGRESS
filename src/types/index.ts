export type Difficulty = 'easy' | 'medium' | 'hard'
export type ProblemStatus = 'not-started' | 'in-progress' | 'solved' | 'revised'
export type RevisionStatus = 'important' | 'needs-revision' | 'mastered' | null
export type RevisionInterval = 'tomorrow' | '3-days' | '1-week' | '2-weeks' | '1-month'
export type Theme = 'light' | 'dark' | 'system'
export type ActivityLevel = 'none' | 'low' | 'good' | 'high'

export interface Category {
  id: string
  name: string
  icon: string
  totalProblemsPlanned: number
  problemsSolved: number
  enabled: boolean
}

export interface DailyTask {
  categoryId: string
  completed: boolean
  problemsSolved: number
  problemsTarget: number
  difficulties: Difficulty[]
  timeSpentMinutes: number
  notes: string
}

export interface DayRecord {
  date: string
  tasks: DailyTask[]
  totalProblems: number
  totalTimeMinutes: number
}

export interface Problem {
  id: string
  name: string
  platform: string
  topicId: string
  difficulty: Difficulty
  status: ProblemStatus
  dateSolved?: string
  timeTakenMinutes?: number
  notes?: string
  url?: string
  revisionStatus: RevisionStatus
  revisionDate?: string
}

export interface InterviewTopic {
  id: string
  category: 'dsa' | 'core-cs' | 'interview-skills'
  name: string
  progress: number
  notes?: string
}

export interface Settings {
  dailyStudyGoalMinutes: number
  problemsPerDayGoal: number
  weeklyProblemsGoal: number
  weeklyTaskCompletionGoal: number
  theme: Theme
}

export interface StreakInfo {
  current: number
  longest: number
}

export interface AppState {
  categories: Category[]
  dayRecords: Record<string, DayRecord>
  problems: Problem[]
  interviewTopics: InterviewTopic[]
  settings: Settings
  streak: StreakInfo
  problemsMastered: number
}

export type AppAction =
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'TOGGLE_TASK'; payload: { date: string; categoryId: string } }
  | { type: 'UPDATE_TASK'; payload: { date: string; categoryId: string; updates: Partial<DailyTask> } }
  | { type: 'ADD_PROBLEM'; payload: Problem }
  | { type: 'UPDATE_PROBLEM'; payload: { id: string; updates: Partial<Problem> } }
  | { type: 'DELETE_PROBLEM'; payload: string }
  | { type: 'UPDATE_CATEGORY'; payload: { id: string; updates: Partial<Category> } }
  | { type: 'UPDATE_INTERVIEW_TOPIC'; payload: { id: string; updates: Partial<InterviewTopic> } }
  | { type: 'UPDATE_SETTINGS'; payload: Partial<Settings> }
  | { type: 'SET_REVISION'; payload: { problemId: string; revisionStatus: RevisionStatus; revisionDate?: string } }
  | { type: 'RESET_DATA' }

export interface NavItem {
  id: string
  label: string
  icon: string
  path: string
}

export interface DayDetail {
  date: string
  tasksCompleted: number
  totalTasks: number
  problemsSolved: number
  studyTimeMinutes: number
  topicsPracticed: string[]
  notes: string[]
  activityLevel: ActivityLevel
}

export interface WeeklySummary {
  streak: number
  problemsSolved: number
  hoursStudied: number
  taskCompletionRate: number
  topicsPracticed: number
}
