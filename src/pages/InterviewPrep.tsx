import { useApp } from '../store/AppContext'
import { Card, CardHeader, CardTitle } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'

const SECTIONS = [
  { key: 'dsa' as const, title: 'DSA', icon: '💻' },
  { key: 'core-cs' as const, title: 'Core CS', icon: '📖' },
  { key: 'interview-skills' as const, title: 'Interview Skills', icon: '🎯' },
]

export function InterviewPrepPage() {
  const { state, dispatch } = useApp()

  const updateProgress = (id: string, progress: number) => {
    dispatch({
      type: 'UPDATE_INTERVIEW_TOPIC',
      payload: { id, updates: { progress: Math.min(100, Math.max(0, progress)) } },
    })
  }

  const sectionProgress = (category: typeof SECTIONS[0]['key']) => {
    const topics = state.interviewTopics.filter(t => t.category === category)
    if (topics.length === 0) return 0
    return Math.round(topics.reduce((s, t) => s + t.progress, 0) / topics.length)
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Interview Preparation</h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          Track your readiness across DSA, core CS, and interview skills
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SECTIONS.map(section => (
          <Card key={section.key} className="text-center py-5">
            <span className="text-3xl">{section.icon}</span>
            <p className="font-semibold text-[var(--color-text-primary)] mt-2">{section.title}</p>
            <p className="text-2xl font-bold text-[var(--color-accent)] mt-1">{sectionProgress(section.key)}%</p>
          </Card>
        ))}
      </div>

      {SECTIONS.map(section => {
        const topics = state.interviewTopics.filter(t => t.category === section.key)
        return (
          <section key={section.key}>
            <CardHeader>
              <CardTitle>{section.icon} {section.title}</CardTitle>
            </CardHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topics.map(topic => (
                <Card key={topic.id}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-[var(--color-text-primary)]">{topic.name}</h3>
                    <span className="text-sm font-bold text-[var(--color-accent)]">{topic.progress}%</span>
                  </div>
                  <ProgressBar value={topic.progress} max={100} size="sm" />
                  <div className="flex gap-1 mt-3">
                    {[0, 25, 50, 75, 100].map(val => (
                      <button
                        key={val}
                        onClick={() => updateProgress(topic.id, val)}
                        className={`flex-1 py-1 text-xs rounded transition-colors ${
                          topic.progress >= val
                            ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]'
                            : 'bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]'
                        }`}
                      >
                        {val}%
                      </button>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
