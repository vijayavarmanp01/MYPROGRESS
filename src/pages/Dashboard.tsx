import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Flame, Trophy, Target, TrendingUp, Star, ArrowRight } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { getTodayStats, getOverallCompletion, getWeakTopics } from '../lib/analytics'
import { CircularProgress } from '../components/ui/CircularProgress'
import { Card, CardHeader, CardTitle } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Celebration } from '../components/dashboard/Celebration'
import { TaskCard } from '../components/tasks/TaskCard'

export function DashboardPage() {
  const { state, today, toggleTask, updateTask } = useApp()
  const [showCelebration, setShowCelebration] = useState(false)
  const [celebrated, setCelebrated] = useState(false)

  const stats = getTodayStats(state, today)
  const overallCompletion = getOverallCompletion(state)
  const weakTopics = getWeakTopics(state, 3)
  const record = stats.record

  const handleToggle = useCallback((categoryId: string) => {
    toggleTask(today, categoryId)
    const task = record?.tasks.find(t => t.categoryId === categoryId)
    if (task && !task.completed) {
      const willComplete = stats.completed + 1
      if (willComplete === stats.total && !celebrated) {
        setShowCelebration(true)
        setCelebrated(true)
      }
    }
  }, [toggleTask, today, record, stats, celebrated])

  const statCards = [
    { icon: Flame, label: 'Current Streak', value: `${state.streak.current} days`, color: 'text-orange-500' },
    { icon: Trophy, label: 'Best Streak', value: `${state.streak.longest} days`, color: 'text-yellow-500' },
    { icon: Target, label: 'Completed Today', value: stats.completed, color: 'text-green-500' },
    { icon: TrendingUp, label: 'Remaining', value: stats.remaining, color: 'text-blue-500' },
    { icon: Star, label: 'Mastered', value: state.problemsMastered, color: 'text-purple-500' },
  ]

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-[var(--color-text-primary)]">
          Good {getGreeting()}! 👋
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          Here's your training command center for today.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 flex flex-col items-center justify-center py-8">
          <p className="text-sm font-medium text-[var(--color-text-secondary)] mb-4 uppercase tracking-wider">
            Today's Progress
          </p>
          <CircularProgress percentage={stats.percentage} size={180} strokeWidth={12}>
            <span className="text-4xl font-bold text-[var(--color-text-primary)]">{stats.percentage}%</span>
            <span className="text-sm text-[var(--color-text-secondary)] mt-1">
              {stats.completed} / {stats.total}
            </span>
          </CircularProgress>
          <div className="flex gap-6 mt-6 text-sm">
            <span>🔥 {state.streak.current} Day Streak</span>
            <span>🏆 Best: {state.streak.longest}</span>
          </div>
        </Card>

        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
          {statCards.map(({ icon: Icon, label, value, color }) => (
            <Card key={label} className="flex flex-col items-center justify-center py-5">
              <Icon className={`w-5 h-5 ${color} mb-2`} />
              <span className="text-2xl font-bold text-[var(--color-text-primary)]">{value}</span>
              <span className="text-xs text-[var(--color-text-muted)] mt-1">{label}</span>
            </Card>
          ))}
          <Card className="flex flex-col items-center justify-center py-5">
            <TrendingUp className="w-5 h-5 text-[var(--color-accent)] mb-2" />
            <span className="text-2xl font-bold text-[var(--color-text-primary)]">{overallCompletion}%</span>
            <span className="text-xs text-[var(--color-text-muted)] mt-1">Overall Completion</span>
          </Card>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">Today's Tasks</h2>
          <Link to="/tasks" className="flex items-center gap-1 text-sm text-[var(--color-accent)] hover:underline">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {record?.tasks.slice(0, 6).map(task => {
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
      </div>

      {weakTopics.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Topics Needing Focus</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {weakTopics.map(topic => (
              <div key={topic.name} className="flex items-center gap-4">
                <span className="text-lg">{topic.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">{topic.name}</p>
                  <ProgressBar value={topic.percentage} max={100} size="sm" color="#ef4444" />
                </div>
                <span className="text-sm font-medium text-red-500">{topic.percentage}%</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Celebration show={showCelebration} onDone={() => setShowCelebration(false)} />
    </div>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}
