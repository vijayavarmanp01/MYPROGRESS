import { Star, RotateCcw, CheckCircle, ExternalLink } from 'lucide-react'
import { useApp } from '../store/AppContext'
import { getRevisionDueProblems } from '../lib/analytics'
import { REVISION_INTERVALS } from '../data/defaults'
import { difficultyEmoji, difficultyLabel, formatDisplayDate } from '../lib/utils'
import { Card, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'

export function RevisionPage() {
  const { state, setRevision, updateProblem } = useApp()
  const dueProblems = getRevisionDueProblems(state)

  const important = state.problems.filter(p => p.revisionStatus === 'important')
  const needsRevision = state.problems.filter(p => p.revisionStatus === 'needs-revision')
  const mastered = state.problems.filter(p => p.revisionStatus === 'mastered')

  const renderProblem = (problem: typeof state.problems[0], showActions = true) => {
    const topic = state.categories.find(c => c.id === problem.topicId)
    return (
      <Card key={problem.id} className="!p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-[var(--color-text-primary)]">{problem.name}</h3>
              {problem.revisionStatus === 'important' && <Star size={14} className="text-yellow-500 fill-yellow-500" />}
              {problem.revisionStatus === 'needs-revision' && <RotateCcw size={14} className="text-orange-500" />}
              {problem.revisionStatus === 'mastered' && <CheckCircle size={14} className="text-green-500" />}
            </div>
            <div className="flex flex-wrap gap-2 mt-1 text-sm text-[var(--color-text-secondary)]">
              <span>{difficultyEmoji(problem.difficulty)} {difficultyLabel(problem.difficulty)}</span>
              <span>{topic?.icon} {topic?.name}</span>
              {problem.revisionDate && (
                <Badge variant="warning">Due: {formatDisplayDate(problem.revisionDate)}</Badge>
              )}
            </div>
            {problem.notes && <p className="mt-2 text-sm text-[var(--color-text-muted)]">{problem.notes}</p>}
          </div>
          {showActions && (
            <div className="flex flex-col gap-1 shrink-0">
              <Button size="sm" variant="secondary" onClick={() => updateProblem(problem.id, { status: 'revised' })}>
                Mark Revised
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setRevision(problem.id, 'mastered')}>
                ✅ Mastered
              </Button>
              {problem.url && (
                <a href={problem.url} target="_blank" rel="noopener noreferrer">
                  <Button size="sm" variant="ghost"><ExternalLink size={14} /></Button>
                </a>
              )}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-1 mt-3">
          {REVISION_INTERVALS.map(interval => (
            <Button key={interval.value} size="sm" variant="ghost"
              onClick={() => setRevision(problem.id, problem.revisionStatus ?? 'needs-revision', interval.value)}>
              {interval.label}
            </Button>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Revision Queue</h1>
        <p className="text-[var(--color-text-secondary)] mt-1">
          Revisit problems to strengthen your understanding
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center py-4">
          <Star className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
          <p className="text-2xl font-bold">{important.length}</p>
          <p className="text-xs text-[var(--color-text-muted)]">Important</p>
        </Card>
        <Card className="text-center py-4">
          <RotateCcw className="w-6 h-6 text-orange-500 mx-auto mb-1" />
          <p className="text-2xl font-bold">{needsRevision.length}</p>
          <p className="text-xs text-[var(--color-text-muted)]">Needs Revision</p>
        </Card>
        <Card className="text-center py-4">
          <CheckCircle className="w-6 h-6 text-green-500 mx-auto mb-1" />
          <p className="text-2xl font-bold">{mastered.length}</p>
          <p className="text-xs text-[var(--color-text-muted)]">Mastered</p>
        </Card>
      </div>

      <section>
        <CardHeader>
          <CardTitle>🔄 Due for Revision ({dueProblems.length})</CardTitle>
        </CardHeader>
        {dueProblems.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-[var(--color-text-muted)]">No problems due for revision. Great job!</p>
          </Card>
        ) : (
          <div className="space-y-3">{dueProblems.map(p => renderProblem(p))}</div>
        )}
      </section>

      {important.length > 0 && (
        <section>
          <CardHeader><CardTitle>⭐ Important ({important.length})</CardTitle></CardHeader>
          <div className="space-y-3">{important.map(p => renderProblem(p))}</div>
        </section>
      )}

      {mastered.length > 0 && (
        <section>
          <CardHeader><CardTitle>✅ Mastered ({mastered.length})</CardTitle></CardHeader>
          <div className="space-y-3">{mastered.map(p => renderProblem(p, false))}</div>
        </section>
      )}
    </div>
  )
}
