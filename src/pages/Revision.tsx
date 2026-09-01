import { Star, RotateCcw, CircleCheck, ExternalLink } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { getRevisionDueProblems } from '../lib/analytics'
import { REVISION_INTERVALS } from '../data/defaults'
import { difficultyLabel, formatDisplayDate, cn } from '../lib/utils'
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { StatTile } from '../components/ui/StatTile'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'

const DIFFICULTY_DOT: Record<string, string> = {
  easy: 'bg-mint',
  medium: 'bg-amber',
  hard: 'bg-rose',
}

export function RevisionPage() {
  const { state, setRevision, updateProblem } = useApp()
  const dueProblems = getRevisionDueProblems(state)

  const important = state.problems.filter(p => p.revisionStatus === 'important')
  const needsRevision = state.problems.filter(p => p.revisionStatus === 'needs-revision')
  const mastered = state.problems.filter(p => p.revisionStatus === 'mastered')

  const renderProblem = (problem: typeof state.problems[0], showActions = true) => {
    const topic = state.categories.find(c => c.id === problem.topicId)
    return (
      <Card key={problem.id} className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[14.5px] font-semibold tracking-[-0.01em] text-ink">{problem.name}</h3>
              {problem.revisionStatus === 'important' && (
                <Star size={14} className="fill-amber text-amber" aria-label="Important" />
              )}
              {problem.revisionStatus === 'needs-revision' && (
                <RotateCcw size={14} className="text-sky" aria-label="Needs revision" />
              )}
              {problem.revisionStatus === 'mastered' && (
                <CircleCheck size={14} className="text-mint" aria-label="Mastered" />
              )}
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[12.5px] text-ink-3">
              <span className="flex items-center gap-1.5">
                <span className={cn('h-2 w-2 rounded-full', DIFFICULTY_DOT[problem.difficulty])} />
                {difficultyLabel(problem.difficulty)}
              </span>
              {topic && (
                <span>
                  {topic.icon} {topic.name}
                </span>
              )}
              {problem.revisionDate && (
                <Badge variant="warning">Due {formatDisplayDate(problem.revisionDate)}</Badge>
              )}
            </div>
            {problem.notes && <p className="mt-2 text-[13px] text-ink-2">{problem.notes}</p>}
          </div>
          {showActions && (
            <div className="flex shrink-0 flex-col items-stretch gap-1.5">
              <Button size="sm" variant="secondary" onClick={() => updateProblem(problem.id, { status: 'revised' })}>
                Mark revised
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setRevision(problem.id, 'mastered')}>
                Mastered
              </Button>
              {problem.url && (
                <a
                  href={problem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid h-8 place-items-center rounded-[10px] text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
                  aria-label="Open problem link"
                >
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-line pt-3">
          {REVISION_INTERVALS.map(interval => (
            <Button
              key={interval.value}
              size="sm"
              variant="ghost"
              className="h-7 px-2.5 text-[12px]"
              onClick={() => setRevision(problem.id, problem.revisionStatus ?? 'needs-revision', interval.value)}
            >
              {interval.label}
            </Button>
          ))}
        </div>
      </Card>
    )
  }


  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Spaced repetition"
        title="Revision Queue"
        description="Revisit problems to strengthen your understanding"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile icon={Star} tone="amber" label="Important" value={important.length} sub="Flagged for keeps" />
        <StatTile icon={RotateCcw} tone="sky" label="Needs revision" value={needsRevision.length} sub="In the loop" />
        <StatTile icon={CircleCheck} tone="mint" label="Mastered" value={mastered.length} sub="Locked in" />
      </div>

      <section>
        <CardHeader>
          <div>
            <CardTitle>Due for revision</CardTitle>
            <CardDescription>{dueProblems.length} problem{dueProblems.length === 1 ? '' : 's'} scheduled</CardDescription>
          </div>
        </CardHeader>
        {dueProblems.length === 0 ? (
          <Card>
            <EmptyState
              icon={CircleCheck}
              title="Queue is clear"
              body="No problems are due right now. Keep the streak going — new revisions will surface here on schedule."
            />
          </Card>
        ) : (
          <div className="space-y-3">{dueProblems.map(p => renderProblem(p))}</div>
        )}
      </section>

      {important.length > 0 && (
        <section>
          <CardHeader>
            <div>
              <CardTitle>Important</CardTitle>
              <CardDescription>Your starred, must-know problems</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-3">{important.map(p => renderProblem(p))}</div>
        </section>
      )}

      {mastered.length > 0 && (
        <section>
          <CardHeader>
            <div>
              <CardTitle>Mastered</CardTitle>
              <CardDescription>Solved confidently — archived from the queue</CardDescription>
            </div>
          </CardHeader>
          <div className="space-y-3">{mastered.map(p => renderProblem(p, false))}</div>
        </section>
      )}
    </div>
  )
}
