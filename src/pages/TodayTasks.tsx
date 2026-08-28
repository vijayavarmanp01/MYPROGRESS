import { useState, useCallback } from 'react'
import { useApp } from '../store/AppContext'
import { getTodayStats } from '../lib/analytics'
import { formatDisplayDate } from '../lib/utils'
import { TaskCard } from '../components/tasks/TaskCard'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Celebration } from '../components/dashboard/Celebration'

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
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Today's Tasks</h1>
        <p className="text-[var(--color-text-secondary)] mt-1">{formatDisplayDate(today)}</p>
      </div>

      <div className="p-4 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[var(--color-text-secondary)]">
            {stats.completed} / {stats.total} completed
          </span>
          <span className="text-sm font-bold text-[var(--color-accent)]">{stats.percentage}%</span>
        </div>
        <ProgressBar value={stats.completed} max={stats.total} size="lg" />
      </div>

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
