import { useState } from 'react'
import { format, getDay, startOfYear, eachWeekOfInterval, endOfYear } from 'date-fns'
import type { ActivityLevel } from '../../types'
import { useApp } from '../../store/AppContext'
import { getActivityLevel } from '../../lib/storage'
import { getDayDetail } from '../../lib/analytics'
import { formatDisplayDate, formatDate } from '../../lib/utils'
import { Modal } from '../ui/Modal'
import { Badge } from '../ui/Badge'
import { formatMinutes } from '../../lib/utils'

const ACTIVITY_COLORS: Record<ActivityLevel, string> = {
  none: 'var(--heat-0)',
  low: 'var(--heat-1)',
  good: 'var(--heat-2)',
  high: 'var(--heat-3)',
}

const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  none: 'No activity',
  low: 'Low',
  good: 'Good',
  high: 'High productivity',
}

interface ContributionCalendarProps {
  year?: number
}

export function ContributionCalendar({ year = new Date().getFullYear() }: ContributionCalendarProps) {
  const { state } = useApp()
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const enabledCount = state.categories.filter(c => c.enabled).length

  const start = startOfYear(new Date(year, 0, 1))
  const end = endOfYear(new Date(year, 0, 1))
  const weeks = eachWeekOfInterval({ start, end }, { weekStartsOn: 0 })

  const getLevel = (dateStr: string): ActivityLevel => {
    const record = state.dayRecords[dateStr]
    return getActivityLevel(record, enabledCount)
  }

  const dayDetail = selectedDate ? getDayDetail(state, selectedDate) : null

  const months = Array.from({ length: 12 }, (_, i) => format(new Date(year, i, 1), 'MMM'))

  return (
    <div>
      <div className="overflow-x-auto pb-2">
        <div className="inline-flex flex-col gap-1 min-w-max">
          <div className="flex gap-1 ml-8">
            {months.map((month, i) => (
              <span
                key={month}
                className="text-xs text-[var(--color-text-muted)]"
                style={{ width: `${(weeks.filter(w => w.getMonth() === i || (w.getMonth() === i - 1 && getDay(w) !== 0)).length / weeks.length) * 100}%`, minWidth: '28px' }}
              >
                {i % 2 === 0 ? month : ''}
              </span>
            ))}
          </div>

          <div className="flex gap-1">
            <div className="flex flex-col gap-1 pr-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                <span key={day} className="text-[10px] text-[var(--color-text-muted)] h-[12px] leading-[12px]">
                  {i % 2 === 1 ? day : ''}
                </span>
              ))}
            </div>

            <div className="flex gap-[3px]">
              {weeks.map((weekStart, wi) => {
                const days = Array.from({ length: 7 }, (_, di) => {
                  const d = new Date(weekStart)
                  d.setDate(d.getDate() + di)
                  if (d.getFullYear() !== year) return null
                  return formatDate(d)
                })

                return (
                  <div key={wi} className="flex flex-col gap-[3px]">
                    {days.map((dateStr, di) => {
                      if (!dateStr) return <div key={di} className="w-[12px] h-[12px]" />
                      const level = getLevel(dateStr)
                      return (
                        <button
                          key={dateStr}
                          onClick={() => setSelectedDate(dateStr)}
                          title={`${formatDisplayDate(dateStr)} — ${ACTIVITY_LABELS[level]}`}
                          aria-label={`${formatDisplayDate(dateStr)} — ${ACTIVITY_LABELS[level]}`}
                          style={{ backgroundColor: ACTIVITY_COLORS[level] }}
                          className="h-[12px] w-[12px] rounded-[3.5px] transition-transform duration-150 hover:scale-125 focus-visible:scale-125"
                        />
                      )
                    })}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-4 text-xs text-[var(--color-ink-3)]">
        <span>Less</span>
        {(Object.keys(ACTIVITY_COLORS) as ActivityLevel[]).map(level => (
          <div
            key={level}
            className="h-[12px] w-[12px] rounded-[3.5px]"
            style={{ backgroundColor: ACTIVITY_COLORS[level] }}
            title={ACTIVITY_LABELS[level]}
          />
        ))}
        <span>More</span>
      </div>

      <Modal
        open={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        title={selectedDate ? formatDisplayDate(selectedDate) : ''}
      >
        {dayDetail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-tile border border-line bg-surface-2 p-3.5">
                <p className="text-[11.5px] font-medium text-ink-3">Tasks Completed</p>
                <p className="mt-1 text-lg font-bold text-ink tabular">{dayDetail.tasksCompleted} / {dayDetail.totalTasks}</p>
              </div>
              <div className="rounded-tile border border-line bg-surface-2 p-3.5">
                <p className="text-[11.5px] font-medium text-ink-3">Problems Solved</p>
                <p className="mt-1 text-lg font-bold text-ink tabular">{dayDetail.problemsSolved}</p>
              </div>
              <div className="rounded-tile border border-line bg-surface-2 p-3.5">
                <p className="text-[11.5px] font-medium text-ink-3">Study Time</p>
                <p className="mt-1 text-lg font-bold text-ink tabular">{formatMinutes(dayDetail.studyTimeMinutes)}</p>
              </div>
              <div className="rounded-tile border border-line bg-surface-2 p-3.5">
                <p className="text-[11.5px] font-medium text-ink-3">Activity</p>
                <div className="mt-1.5">
                  <Badge variant={dayDetail.activityLevel === 'high' ? 'accent' : dayDetail.activityLevel === 'none' ? 'default' : 'sky'}>
                    {ACTIVITY_LABELS[dayDetail.activityLevel]}
                  </Badge>
                </div>
              </div>
            </div>

            {dayDetail.topicsPracticed.length > 0 && (
              <div>
                <p className="mb-2 text-[13px] font-medium text-ink-2">Topics Practiced</p>
                <div className="flex flex-wrap gap-2">
                  {dayDetail.topicsPracticed.map(t => (
                    <Badge key={t} variant="accent">{t}</Badge>
                  ))}
                </div>
              </div>
            )}

            {dayDetail.notes.length > 0 && (
              <div>
                <p className="mb-2 text-[13px] font-medium text-ink-2">Notes</p>
                {dayDetail.notes.map((note, i) => (
                  <p key={i} className="mb-2 rounded-[10px] border border-line bg-surface-2 p-3 text-[13px] text-ink">
                    {note}
                  </p>
                ))}
              </div>
            )}

            {dayDetail.tasksCompleted === 0 && (
              <p className="py-4 text-center text-[13px] text-ink-3">No study activity recorded for this day.</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
