import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

export function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function getTodayString(): string {
  return formatDate(new Date())
}

export function parseDate(dateStr: string): Date {
  return new Date(dateStr + 'T00:00:00')
}

export function addDays(dateStr: string, days: number): string {
  const date = parseDate(dateStr)
  date.setDate(date.getDate() + days)
  return formatDate(date)
}

export function getDaysInRange(start: Date, end: Date): string[] {
  const days: string[] = []
  const current = new Date(start)
  while (current <= end) {
    days.push(formatDate(current))
    current.setDate(current.getDate() + 1)
  }
  return days
}

export function getWeekDates(endDate: Date = new Date()): string[] {
  const start = new Date(endDate)
  start.setDate(start.getDate() - 6)
  return getDaysInRange(start, endDate)
}

export function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

export function formatHoursDecimal(minutes: number): string {
  return (minutes / 60).toFixed(1)
}

export function difficultyEmoji(difficulty: string): string {
  switch (difficulty) {
    case 'easy': return '🟢'
    case 'medium': return '🟡'
    case 'hard': return '🔴'
    default: return '⚪'
  }
}

export function difficultyLabel(difficulty: string): string {
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
}

export function statusLabel(status: string): string {
  return status.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
}

export function generateId(): string {
  return crypto.randomUUID()
}

export function downloadFile(content: string, filename: string, type: string) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export function exportToCSV(problems: Array<Record<string, unknown>>): string {
  if (problems.length === 0) return ''
  const headers = Object.keys(problems[0])
  const rows = problems.map(p =>
    headers.map(h => {
      const val = p[h]
      const str = val === undefined || val === null ? '' : String(val)
      return str.includes(',') ? `"${str}"` : str
    }).join(',')
  )
  return [headers.join(','), ...rows].join('\n')
}
