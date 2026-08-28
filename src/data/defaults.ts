import type { AppState, Category, InterviewTopic, Settings } from '../types'

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'leetcode-daily', name: 'LeetCode Daily Challenge', icon: '✅', totalProblemsPlanned: 365, problemsSolved: 0, enabled: true },
  { id: 'sql', name: 'SQL', icon: '🗄️', totalProblemsPlanned: 40, problemsSolved: 0, enabled: true },
  { id: 'arrays-hashing', name: 'Arrays & Hashing', icon: '🔢', totalProblemsPlanned: 50, problemsSolved: 0, enabled: true },
  { id: 'two-pointers', name: 'Two Pointers', icon: '👉', totalProblemsPlanned: 30, problemsSolved: 0, enabled: true },
  { id: 'sliding-window', name: 'Sliding Window', icon: '🪟', totalProblemsPlanned: 30, problemsSolved: 0, enabled: true },
  { id: 'stack', name: 'Stack', icon: '📚', totalProblemsPlanned: 35, problemsSolved: 0, enabled: true },
  { id: 'binary-search', name: 'Binary Search', icon: '🔍', totalProblemsPlanned: 30, problemsSolved: 0, enabled: true },
  { id: 'linked-list', name: 'Linked List', icon: '🔗', totalProblemsPlanned: 35, problemsSolved: 0, enabled: true },
  { id: 'trees', name: 'Trees', icon: '🌳', totalProblemsPlanned: 45, problemsSolved: 0, enabled: true },
  { id: 'heap', name: 'Heap / Priority Queue', icon: '🏆', totalProblemsPlanned: 30, problemsSolved: 0, enabled: true },
  { id: 'backtracking', name: 'Backtracking', icon: '🔄', totalProblemsPlanned: 35, problemsSolved: 0, enabled: true },
  { id: 'graphs', name: 'Graphs', icon: '🕸️', totalProblemsPlanned: 40, problemsSolved: 0, enabled: true },
  { id: 'dynamic-programming', name: 'Dynamic Programming', icon: '🧠', totalProblemsPlanned: 50, problemsSolved: 0, enabled: true },
  { id: 'greedy-misc', name: 'Greedy & Miscellaneous', icon: '💡', totalProblemsPlanned: 35, problemsSolved: 0, enabled: true },
  { id: 'interview-placement', name: 'Interview & Placement Topics', icon: '🎯', totalProblemsPlanned: 50, problemsSolved: 0, enabled: true },
]

export const DEFAULT_INTERVIEW_TOPICS: InterviewTopic[] = [
  // DSA
  { id: 'int-arrays', category: 'dsa', name: 'Arrays', progress: 0 },
  { id: 'int-strings', category: 'dsa', name: 'Strings', progress: 0 },
  { id: 'int-linked-list', category: 'dsa', name: 'Linked List', progress: 0 },
  { id: 'int-stack', category: 'dsa', name: 'Stack', progress: 0 },
  { id: 'int-queue', category: 'dsa', name: 'Queue', progress: 0 },
  { id: 'int-trees', category: 'dsa', name: 'Trees', progress: 0 },
  { id: 'int-graphs', category: 'dsa', name: 'Graphs', progress: 0 },
  { id: 'int-dp', category: 'dsa', name: 'DP', progress: 0 },
  { id: 'int-greedy', category: 'dsa', name: 'Greedy', progress: 0 },
  { id: 'int-backtracking', category: 'dsa', name: 'Backtracking', progress: 0 },
  { id: 'int-binary-search', category: 'dsa', name: 'Binary Search', progress: 0 },
  { id: 'int-heap', category: 'dsa', name: 'Heap', progress: 0 },
  // Core CS
  { id: 'int-dbms', category: 'core-cs', name: 'DBMS', progress: 0 },
  { id: 'int-os', category: 'core-cs', name: 'Operating Systems', progress: 0 },
  { id: 'int-cn', category: 'core-cs', name: 'Computer Networks', progress: 0 },
  { id: 'int-oop', category: 'core-cs', name: 'OOP', progress: 0 },
  { id: 'int-system-design', category: 'core-cs', name: 'System Design Basics', progress: 0 },
  // Interview Skills
  { id: 'int-resume', category: 'interview-skills', name: 'Resume', progress: 0 },
  { id: 'int-hr', category: 'interview-skills', name: 'HR Questions', progress: 0 },
  { id: 'int-behavioral', category: 'interview-skills', name: 'Behavioral Questions', progress: 0 },
  { id: 'int-projects', category: 'interview-skills', name: 'Projects', progress: 0 },
  { id: 'int-mock', category: 'interview-skills', name: 'Mock Interviews', progress: 0 },
]

export const DEFAULT_SETTINGS: Settings = {
  dailyStudyGoalMinutes: 120,
  problemsPerDayGoal: 5,
  weeklyProblemsGoal: 25,
  weeklyTaskCompletionGoal: 80,
  theme: 'system',
}

export const PLATFORMS = ['LeetCode', 'Codeforces', 'HackerRank', 'CodeChef', 'GFG', 'InterviewBit', 'Other'] as const

export const REVISION_INTERVALS = [
  { value: 'tomorrow' as const, label: 'Tomorrow', days: 1 },
  { value: '3-days' as const, label: '3 Days', days: 3 },
  { value: '1-week' as const, label: '1 Week', days: 7 },
  { value: '2-weeks' as const, label: '2 Weeks', days: 14 },
  { value: '1-month' as const, label: '1 Month', days: 30 },
]

export function createDefaultState(): AppState {
  return {
    categories: DEFAULT_CATEGORIES.map(c => ({ ...c })),
    dayRecords: {},
    problems: [],
    interviewTopics: DEFAULT_INTERVIEW_TOPICS.map(t => ({ ...t })),
    settings: { ...DEFAULT_SETTINGS },
    streak: { current: 0, longest: 0 },
    problemsMastered: 0,
  }
}

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: '🏠', path: '/' },
  { id: 'tasks', label: "Today's Tasks", icon: '📋', path: '/tasks' },
  { id: 'topics', label: 'Topics', icon: '📚', path: '/topics' },
  { id: 'problems', label: 'Problems', icon: '💻', path: '/problems' },
  { id: 'revision', label: 'Revision', icon: '🔄', path: '/revision' },
  { id: 'analytics', label: 'Analytics', icon: '📊', path: '/analytics' },
  { id: 'calendar', label: 'Calendar', icon: '📅', path: '/calendar' },
  { id: 'interview', label: 'Interview Prep', icon: '🎯', path: '/interview' },
  { id: 'settings', label: 'Settings', icon: '⚙️', path: '/settings' },
]
