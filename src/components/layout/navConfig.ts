import type { LucideIcon } from 'lucide-react'
import {
  House,
  ListChecks,
  Library,
  CodeXml,
  RotateCcw,
  ChartColumn,
  CalendarDays,
  Target,
  Settings,
} from 'lucide-react'

export interface NavEntry {
  id: string
  label: string
  short: string
  path: string
  icon: LucideIcon
}

export const NAV_SECTIONS: { title: string; items: NavEntry[] }[] = [
  {
    title: 'Workspace',
    items: [
      { id: 'dashboard', label: 'Overview', short: 'Home', path: '/', icon: House },
      { id: 'tasks', label: "Today's Tasks", short: 'Tasks', path: '/tasks', icon: ListChecks },
      { id: 'topics', label: 'Topics', short: 'Topics', path: '/topics', icon: Library },
      { id: 'problems', label: 'Problems', short: 'Problems', path: '/problems', icon: CodeXml },
      { id: 'revision', label: 'Revision', short: 'Revision', path: '/revision', icon: RotateCcw },
    ],
  },
  {
    title: 'Insights',
    items: [
      { id: 'analytics', label: 'Analytics', short: 'Analytics', path: '/analytics', icon: ChartColumn },
      { id: 'calendar', label: 'Calendar', short: 'Calendar', path: '/calendar', icon: CalendarDays },
      { id: 'interview', label: 'Interview Prep', short: 'Interview', path: '/interview', icon: Target },
    ],
  },
]

export const ALL_NAV_ITEMS: NavEntry[] = NAV_SECTIONS.flatMap(s => s.items)

export const SETTINGS_NAV: NavEntry = {
  id: 'settings',
  label: 'Settings',
  short: 'Settings',
  path: '/settings',
  icon: Settings,
}

/** Bottom tab bar on mobile: 4 primary destinations + menu. */
export const MOBILE_TABS: NavEntry[] = [
  { id: 'dashboard', label: 'Home', short: 'Home', path: '/', icon: House },
  { id: 'tasks', label: 'Tasks', short: 'Tasks', path: '/tasks', icon: ListChecks },
  { id: 'problems', label: 'Problems', short: 'Problems', path: '/problems', icon: CodeXml },
  { id: 'analytics', label: 'Stats', short: 'Stats', path: '/analytics', icon: ChartColumn },
]