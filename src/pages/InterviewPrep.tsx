import { useApp } from '../store/AppContext'
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'
import { CircularProgress } from '../components/ui/CircularProgress'
import { PageHeader } from '../components/ui/PageHeader'
import { cn } from '../lib/utils'

const SECTIONS = [
  { key: 'dsa' as const, title: 'DSA', icon: '💻', blurb: 'Problem-solving patterns', color: 'accent' },
  { key: 'core-cs' as const, title: 'Core CS', icon: '📖', blurb: 'Fundamentals & theory', color: 'sky' },
  { key: 'interview-skills' as const, title: 'Interview Skills', icon: '🎯', blurb: 'The human layer', color: 'mint' },
] as const

const PROGRESS_STEPS = [0, 25, 50, 75, 100]

export function InterviewPrepPage() {
  const { state, dispatch } = useApp()

  const updateProgress = (id: string, progress: number) => {
    dispatch({
      type: 'UPDATE_INTERVIEW_TOPIC',
      payload: { id, updates: { progress: Math.min(100, Math.max(0, progress)) } },
    })
  }

  const sectionProgress = (category: (typeof SECTIONS)[number]['key']) => {
    const topics = state.interviewTopics.filter(t => t.category === category)
    if (topics.length === 0) return 0
    return Math.round(topics.reduce((s, t) => s + t.progress, 0) / topics.length)
  }

  const overallProgress = Math.round(
    state.interviewTopics.reduce((s, t) => s + t.progress, 0) /
    Math.max(1, state.interviewTopics.length)
  )

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Readiness"
        title="Interview Preparation"
        description="Track your readiness across DSA, core CS, and interview skills"
      />

      {/* Overall + section summaries */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Overall circular */}
        <Card className="flex flex-col items-center py-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-3">
            Overall Readiness
          </p>
          <CircularProgress
            percentage={overallProgress}
            size={100}
            strokeWidth={9}
            glow={overallProgress > 0}
            className="mt-4"
          >
            <span className="text-[18px] font-bold text-ink tabular">{overallProgress}%</span>
          </CircularProgress>
        </Card>

        {SECTIONS.map(section => {
          const pct = sectionProgress(section.key)
          return (
            <Card key={section.key} className="card-hover flex flex-col items-center py-6 text-center">
              <span className="text-[24px]" aria-hidden>{section.icon}</span>
              <p className="mt-2 text-[14px] font-semibold text-ink">{section.title}</p>
              <p className="text-[12px] text-ink-3">{section.blurb}</p>
              <CircularProgress
                percentage={pct}
                size={84}
                strokeWidth={7}
                glow={pct > 0}
                className="mt-4"
              >
                <span className="text-[15px] font-bold text-ink tabular">{pct}%</span>
              </CircularProgress>
            </Card>
          )
        })}
      </div>

      {/* Topic sections */}
      {SECTIONS.map(section => {
        const topics = state.interviewTopics.filter(t => t.category === section.key)
        return (
          <section key={section.key}>
            <CardHeader>
              <div>
                <CardTitle>
                  <span className="mr-2">{section.icon}</span>
                  {section.title}
                </CardTitle>
                <CardDescription>{topics.length} topics</CardDescription>
              </div>
              <span className="text-[13px] font-semibold text-ink-3 tabular">
                {sectionProgress(section.key)}% avg
              </span>
            </CardHeader>

            <div className="stagger grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {topics.map(topic => (
                <Card key={topic.id}>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <h3 className="truncate text-[14px] font-semibold text-ink">
                      {topic.name}
                    </h3>
                    <span
                      className={cn(
                        'shrink-0 text-[13px] font-extrabold tabular',
                        topic.progress >= 75 ? 'text-mint' :
                        topic.progress >= 25 ? 'text-accent' : 'text-ink-3'
                      )}
                    >
                      {topic.progress}%
                    </span>
                  </div>

                  <ProgressBar value={topic.progress} max={100} size="sm" />

                  {/* Progress preset buttons */}
                  <div className="mt-3 flex gap-1.5" role="group" aria-label={`Set ${topic.name} progress`}>
                    {PROGRESS_STEPS.map(val => (
                      <button
                        key={val}
                        onClick={() => updateProgress(topic.id, val)}
                        aria-pressed={topic.progress === val}
                        title={`Set to ${val}%`}
                        className={cn(
                          'flex-1 rounded-[8px] py-1.5 text-[11px] font-semibold transition-all duration-150',
                          topic.progress >= val && topic.progress > 0
                            ? 'bg-accent/15 text-accent'
                            : val === 0 && topic.progress === 0
                            ? 'bg-surface-2 text-ink-3 ring-1 ring-line'
                            : 'bg-surface-2 text-ink-3 hover:text-ink-2'
                        )}
                      >
                        {val === 0 ? '—' : `${val}`}
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
