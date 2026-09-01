import { useApp } from '../store/AppContext'
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'
import { CircularProgress } from '../components/ui/CircularProgress'
import { PageHeader } from '../components/ui/PageHeader'
import { cn } from '../lib/utils'

const SECTIONS = [
  { key: 'dsa' as const, title: 'DSA', icon: '💻', blurb: 'Problem-solving patterns' },
  { key: 'core-cs' as const, title: 'Core CS', icon: '📖', blurb: 'Fundamentals & theory' },
  { key: 'interview-skills' as const, title: 'Interview Skills', icon: '🎯', blurb: 'The human layer' },
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
    <div className="space-y-8">
      <PageHeader
        eyebrow="Readiness"
        title="Interview Preparation"
        description="Track your readiness across DSA, core CS, and interview skills"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {SECTIONS.map(section => (
          <Card key={section.key} className="card-hover flex flex-col items-center py-6 text-center">
            <span className="text-[22px]" aria-hidden>{section.icon}</span>
            <p className="mt-2 text-[14px] font-semibold text-ink">{section.title}</p>
            <p className="text-[12px] text-ink-3">{section.blurb}</p>
            <CircularProgress percentage={sectionProgress(section.key)} size={92} strokeWidth={8} className="mt-4">
              <span className="text-[17px] font-bold text-ink tabular">{sectionProgress(section.key)}%</span>
            </CircularProgress>
          </Card>
        ))}
      </div>

      {SECTIONS.map(section => {
        const topics = state.interviewTopics.filter(t => t.category === section.key)
        return (
          <section key={section.key}>
            <CardHeader>
              <div>
                <CardTitle>{section.icon} {section.title}</CardTitle>
                <CardDescription>{topics.length} topics</CardDescription>
              </div>
            </CardHeader>
            <div className="stagger grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {topics.map(topic => (
                <Card key={topic.id} hover={false}>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h3 className="truncate text-[14px] font-semibold text-ink">{topic.name}</h3>
                    <span className="shrink-0 text-[13px] font-bold text-accent tabular">{topic.progress}%</span>
                  </div>
                  <ProgressBar value={topic.progress} max={100} size="sm" />
                  <div className="mt-3 flex gap-1" role="group" aria-label={`Set ${topic.name} progress`}>
                    {[0, 25, 50, 75, 100].map(val => (
                      <button
                        key={val}
                        onClick={() => updateProgress(topic.id, val)}
                        aria-pressed={topic.progress >= val}
                        className={cn(
                          'flex-1 rounded-[8px] py-1.5 text-[11.5px] font-semibold transition-colors duration-150',
                          topic.progress >= val
                            ? 'bg-accent/15 text-accent'
                            : 'bg-surface-2 text-ink-3 hover:text-ink-2'
                        )}
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
