import { useState, useCallback } from 'react'
import { useApp } from '../store/AppContext'
import { getTodayStats } from '../lib/analytics'
import { formatDisplayDate, formatMinutes } from '../lib/utils'
import { TaskCard } from '../components/tasks/TaskCard'
import { ProgressBar } from '../components/ui/ProgressBar'
import { CircularProgress } from '../components/ui/CircularProgress'
import { Celebration } from '../components/dashboard/Celebration'
import { Card } from '../components/ui/Card'
import { PageHeader } from '../components/ui/PageHeader'
import { Clock, Target } from 'lucide-react'

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

      {/* Progress overview card */}
      <Card className="p-5 sm:p-6">
        <div className="flex items-center gap-6">
          {/* Circular progress */}
          <div className="shrink-0">
            <CircularProgress
              percentage={stats.percentage}
              size={88}
              strokeWidth={8}
              glow={stats.percentage > 0}
            >
              <span className="text-[15px] font-bold leading-none text-ink tabular">
                {stats.percentage}%
              </span>
            </CircularProgress>
          </div>

          {/* Stats text */}
          <div className="min-w-0 flex-1">
            <div className="flex items-end gap-1">
              <span className="text-[28px] font-extrabold leading-none tracking-[-0.03em] text-accent tabular">
                {stats.completed}
              </span>
              <span className="mb-0.5 text-[16px] font-semibold text-ink-3">
                / {stats.total}
              </span>
              <span className="mb-0.5 ml-1 text-sm text-ink-3">tasks done</span>
            </div>

            <ProgressBar className="mt-3" value={stats.completed} max={stats.total} size="md" />

            {record && (
              <div className="mt-3 flex flex-wrap gap-3 text-[12.5px] text-ink-3">
                <span className="chip-mint flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium tabular">
                  <Target size={11} />
                  {record.totalProblems} problem{record.totalProblems !== 1 ? 's' : ''} solved
                </span>
                <span className="chip-sky flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium tabular">
                  <Clock size={11} />
                  {formatMinutes(record.totalTimeMinutes)} logged
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Task cards */}
      <div className="stagger space-y-3">
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
