import { useState, useCallback } from 'react'
import { useApp } from '../store/AppContext'
import { getTodayStats } from '../lib/analytics'
import { formatDisplayDate } from '../lib/utils'
import { TaskCard } from '../components/tasks/TaskCard'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Celebration } from '../components/dashboard/Celebration'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'

export function TodayTasksPage() {
  const { state, today, toggleTask, updateTask } = useApp()
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrated, setCelebrated] = useState(false)

  const stats = getTodayStats(state, today)
  const record = stats.record

  const handleToggle = useCallback((categoryId: string) => {
    const task = record?.tasks.find(t => t.categoryId === categoryId)
    toggleTask(today, categoryId)
    if (task && !task.completed) {
      if (stats.completed + 1 === stats.total && !celebrated) {
        setShowCelebration(true)
        setCelebrated(true)
      }
    }
  }, [toggleTask, today, record, stats, celebrated])

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        title="Today's Tasks"
        description={formatDisplayDate(today)}
      />

      <Card className="p-5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-ink-2 tabular">
            <span className="font-semibold text-ink">{stats.completed}</span> / {stats.total} completed
          </span>
          <span className="text-2xl font-bold tracking-[-0.02em] text-accent tabular">
            {stats.percentage}%
          </span>
        </div>
        <ProgressBar className="mt-3" value={stats.completed} max={stats.total} size="lg" />
        {record && (
          <p className="mt-3 text-[12.5px] text-ink-3 tabular">
            {record.totalProblems} problems solved · {formatDisplayDuration(record.totalTimeMinutes)} logged
          </p>
        )}
      </Card>

      <div className="space-y-3">
        {record?.tasks.map(task => {
          const cat = state.categories.find(c => c.id === task.categoryId)
          if (!cat) return null
          return (
            <TaskCard
              key={task.categoryId}
              icon={cat.icon}
              name={cat.name}
              task={task}
              onToggle={() => handleToggle(task.categoryId)}
              onUpdate={updates => updateTask(today, task.categoryId, updates)}
            />
          )
        })}
      </div>

      <Celebration show={showCelebration} onDone={() => setShowCelebration(false)} />
    </div>
  )
}

function formatDisplayDuration(minutes: number): string {
  if (minutes <= 0) return '0 min'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}
