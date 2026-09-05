import { useState, useMemo } from 'react'
import { Plus, Trash2, ExternalLink, Star, RotateCcw, CircleCheck, Search, X, Filter } from 'lucide-react'
import { useApp } from '../store/AppContext'
import type { Problem, ProblemStatus, Difficulty } from '../types'
import { PLATFORMS, REVISION_INTERVALS } from '../data/defaults'
import { generateId, getTodayString, statusLabel, difficultyLabel, cn } from '../lib/utils'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Select, Textarea } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Badge } from '../components/ui/Badge'
import { EmptyState } from '../components/ui/EmptyState'
import { PageHeader } from '../components/ui/PageHeader'

const STATUSES: ProblemStatus[] = ['not-started', 'in-progress', 'solved', 'revised']
const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

const emptyProblem = (): Omit<Problem, 'id'> => ({
  name: '',
  platform: 'LeetCode',
  topicId: 'arrays-hashing',
  difficulty: 'medium',
  status: 'not-started',
  revisionStatus: null,
})

const STATUS_CONFIG: Record<ProblemStatus, { dot: string; badge: 'default' | 'warning' | 'success' | 'accent' }> = {
  'not-started': { dot: 'bg-ink-3/40',  badge: 'default' },
  'in-progress':  { dot: 'bg-amber',      badge: 'warning' },
  'solved':        { dot: 'bg-mint',       badge: 'success' },
  'revised':       { dot: 'bg-accent',     badge: 'accent' },
}

const DIFFICULTY_COLORS: Record<Difficulty, string> = {
  easy:   'text-mint',
  medium: 'text-amber',
  hard:   'text-rose',
}

export function ProblemsPage() {
  const { state, addProblem, updateProblem, deleteProblem, setRevision } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyProblem())

  // Filters
  const [search, setSearch]             = useState('')
  const [filterTopic, setFilterTopic]   = useState('all')
  const [filterDifficulty, setFilterDifficulty] = useState('all')
  const [filterPlatform, setFilterPlatform]     = useState('all')
  const [filterStatus, setFilterStatus]         = useState('all')

  const topicOptions = state.categories.map(c => ({ value: c.id, label: c.name }))

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return state.problems.filter(p => {
      if (q && !p.name.toLowerCase().includes(q)) return false
      if (filterTopic      !== 'all' && p.topicId    !== filterTopic)      return false
      if (filterDifficulty !== 'all' && p.difficulty !== filterDifficulty) return false
      if (filterPlatform   !== 'all' && p.platform   !== filterPlatform)   return false
      if (filterStatus     !== 'all' && p.status     !== filterStatus)     return false
      return true
    })
  }, [state.problems, search, filterTopic, filterDifficulty, filterPlatform, filterStatus])

  const solvedCount      = state.problems.filter(p => p.status === 'solved' || p.status === 'revised').length
  const inProgressCount  = state.problems.filter(p => p.status === 'in-progress').length
  const masteredCount    = state.problems.filter(p => p.revisionStatus === 'mastered').length

  const hasActiveFilters = search || filterTopic !== 'all' || filterDifficulty !== 'all' || filterPlatform !== 'all' || filterStatus !== 'all'

  const clearFilters = () => {
    setSearch('')
    setFilterTopic('all')
    setFilterDifficulty('all')
    setFilterPlatform('all')
    setFilterStatus('all')
  }

  const openAdd = () => {
    setForm(emptyProblem())
    setEditingId(null)
    setShowForm(true)
  }

  const openEdit = (p: Problem) => {
    setForm({ ...p })
    setEditingId(p.id)
    setShowForm(true)
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    if (editingId) {
      updateProblem(editingId, form)
    } else {
      addProblem({
        ...form,
        id: generateId(),
        dateSolved: form.status === 'solved' ? getTodayString() : form.dateSolved,
      })
    }
    setShowForm(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Log"
        title="Problem Tracker"
        description={`${state.problems.length} problem${state.problems.length === 1 ? '' : 's'} tracked`}
        actions={
          <Button onClick={openAdd}>
            <Plus size={16} /> Add Problem
          </Button>
        }
      />

      {/* Stats row */}
      {state.problems.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Tracked',     value: state.problems.length, color: 'text-ink' },
            { label: 'Solved',      value: solvedCount,           color: 'text-mint' },
            { label: 'In progress', value: inProgressCount,       color: 'text-amber' },
            { label: 'Mastered',    value: masteredCount,         color: 'text-accent' },
          ].map(s => (
            <Card key={s.label} className="p-4 sm:p-5">
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.07em] text-ink-3">{s.label}</p>
              <p className={cn('mt-1.5 text-[22px] font-extrabold leading-none tracking-[-0.03em] tabular', s.color)}>
                {s.value}
              </p>
            </Card>
          ))}
        </div>
      )}

      {/* Search + filters */}
      <Card className="p-4 sm:p-5">
        {/* Text search */}
        <div className="relative mb-3">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-3"
          />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search problems by name…"
            className={cn(
              'h-10 w-full rounded-[10px] border border-line bg-surface-2 pl-9 pr-9 text-sm text-ink',
              'placeholder:text-ink-3 transition-all',
              'hover:border-line-strong',
              'focus:border-accent/60 focus:bg-surface focus:outline-none focus:ring-3 focus:ring-accent/12',
              search && 'border-accent/40'
            )}
            aria-label="Search problems"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 transition-colors hover:text-ink"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Dropdown filters */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Select
            label="Topic"
            value={filterTopic}
            onChange={e => setFilterTopic(e.target.value)}
            options={[{ value: 'all', label: 'All Topics' }, ...topicOptions]}
          />
          <Select
            label="Difficulty"
            value={filterDifficulty}
            onChange={e => setFilterDifficulty(e.target.value)}
            options={[{ value: 'all', label: 'All' }, ...DIFFICULTIES.map(d => ({ value: d, label: difficultyLabel(d) }))]}
          />
          <Select
            label="Platform"
            value={filterPlatform}
            onChange={e => setFilterPlatform(e.target.value)}
            options={[{ value: 'all', label: 'All' }, ...PLATFORMS.map(p => ({ value: p, label: p }))]}
          />
          <Select
            label="Status"
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            options={[{ value: 'all', label: 'All' }, ...STATUSES.map(s => ({ value: s, label: statusLabel(s) }))]}
          />
        </div>

        {hasActiveFilters && (
          <div className="mt-3 flex items-center justify-between">
            <p className="text-[12.5px] text-ink-3">
              <span className="font-semibold text-ink tabular">{filtered.length}</span> of {state.problems.length} problems
            </p>
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 text-[12.5px] font-medium text-accent transition-colors hover:text-accent-hover"
            >
              <Filter size={12} /> Clear filters
            </button>
          </div>
        )}
      </Card>

      {/* Problem list */}
      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            icon={Search}
            title={state.problems.length === 0 ? 'No problems yet' : 'No problems match your filters'}
            body={
              state.problems.length === 0
                ? 'Add your first problem to start building a searchable, revisable log.'
                : 'Try adjusting your filters, or add the problem you were looking for.'
            }
            action={state.problems.length === 0 ? { label: 'Add Problem', onClick: openAdd } : undefined}
          />
        </Card>
      ) : (
        <div className="stagger space-y-2.5">
          {filtered.map(problem => {
            const topic = state.categories.find(c => c.id === problem.topicId)
            const { dot, badge } = STATUS_CONFIG[problem.status]
            return (
              <Card
                key={problem.id}
                hover
                className="card-hover p-4 sm:p-5"
                onClick={() => openEdit(problem)}
                role="button"
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    openEdit(problem)
                  }
                }}
                aria-label={`Edit ${problem.name}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn('h-2 w-2 shrink-0 rounded-full', dot)} aria-hidden />
                      <h3 className="min-w-0 truncate text-[14.5px] font-semibold tracking-[-0.01em] text-ink">
                        {problem.name}
                      </h3>
                      <Badge variant={badge}>{statusLabel(problem.status)}</Badge>
                      {problem.revisionStatus === 'important' && (
                        <Star size={13} className="fill-amber text-amber" aria-label="Important" />
                      )}
                      {problem.revisionStatus === 'needs-revision' && (
                        <RotateCcw size={13} className="text-sky" aria-label="Needs revision" />
                      )}
                      {problem.revisionStatus === 'mastered' && (
                        <CircleCheck size={13} className="text-mint" aria-label="Mastered" />
                      )}
                    </div>

                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-ink-3">
                      <span className={cn('font-medium', DIFFICULTY_COLORS[problem.difficulty])}>
                        {difficultyLabel(problem.difficulty)}
                      </span>
                      <span>{topic?.icon} {topic?.name ?? problem.topicId}</span>
                      <span>{problem.platform}</span>
                      {problem.dateSolved && (
                        <span className="tabular">Solved {problem.dateSolved}</span>
                      )}
                      {problem.timeTakenMinutes != null && (
                        <span className="tabular">{problem.timeTakenMinutes} min</span>
                      )}
                    </div>

                    {problem.notes && (
                      <p className="mt-1.5 truncate text-[12.5px] italic text-ink-3">
                        {problem.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    {problem.url && (
                      <a
                        href={problem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        aria-label="Open problem link"
                        className="grid h-8 w-8 place-items-center rounded-[10px] text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); deleteProblem(problem.id) }}
                      aria-label={`Delete ${problem.name}`}
                      className="grid h-8 w-8 place-items-center rounded-[10px] text-ink-3 transition-colors hover:bg-rose/10 hover:text-rose"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add / Edit modal */}
      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title={editingId ? 'Edit Problem' : 'Add Problem'}
      >
        <div className="space-y-4">
          <Input
            label="Problem Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Two Sum"
          />
          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Platform"
              value={form.platform}
              onChange={e => setForm({ ...form, platform: e.target.value })}
              options={PLATFORMS.map(p => ({ value: p, label: p }))}
            />
            <Select
              label="Topic"
              value={form.topicId}
              onChange={e => setForm({ ...form, topicId: e.target.value })}
              options={topicOptions}
            />
            <Select
              label="Difficulty"
              value={form.difficulty}
              onChange={e => setForm({ ...form, difficulty: e.target.value as Difficulty })}
              options={DIFFICULTIES.map(d => ({ value: d, label: difficultyLabel(d) }))}
            />
            <Select
              label="Status"
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value as ProblemStatus })}
              options={STATUSES.map(s => ({ value: s, label: statusLabel(s) }))}
            />
            <Input
              label="Time Taken (min)"
              type="number"
              min={0}
              value={form.timeTakenMinutes ?? ''}
              onChange={e => setForm({ ...form, timeTakenMinutes: parseInt(e.target.value) || undefined })}
            />
            <Input
              label="Date Solved"
              type="date"
              value={form.dateSolved ?? ''}
              onChange={e => setForm({ ...form, dateSolved: e.target.value || undefined })}
            />
          </div>
          <Input
            label="Problem URL"
            value={form.url ?? ''}
            onChange={e => setForm({ ...form, url: e.target.value })}
            placeholder="https://leetcode.com/problems/..."
          />
          <Textarea
            label="Notes"
            rows={2}
            value={form.notes ?? ''}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            placeholder="Key observations, patterns, pitfalls…"
          />

          {editingId && (
            <div>
              <label className="mb-2 block text-[12.5px] font-semibold uppercase tracking-[0.07em] text-ink-2">
                Revision Status
              </label>
              <div className="mb-3 flex flex-wrap gap-2">
                {(
                  [
                    { value: 'important' as const,      icon: Star,        label: 'Important' },
                    { value: 'needs-revision' as const, icon: RotateCcw,   label: 'Needs Revision' },
                    { value: 'mastered' as const,       icon: CircleCheck, label: 'Mastered' },
                  ] as const
                ).map(({ value, icon: Icon, label }) => (
                  <Button
                    key={value}
                    size="sm"
                    variant={form.revisionStatus === value ? 'primary' : 'secondary'}
                    onClick={() => setRevision(editingId, value)}
                  >
                    <Icon size={13} className={form.revisionStatus === value && value === 'important' ? 'fill-current' : ''} />
                    {label}
                  </Button>
                ))}
              </div>
              <p className="mb-2 text-[12px] font-medium text-ink-3">Schedule next review:</p>
              <div className="flex flex-wrap gap-2">
                {REVISION_INTERVALS.map(interval => (
                  <Button
                    key={interval.value}
                    size="sm"
                    variant="ghost"
                    className="h-8"
                    onClick={() =>
                      setRevision(editingId, form.revisionStatus ?? 'needs-revision', interval.value)
                    }
                  >
                    {interval.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <Button variant="secondary" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!form.name.trim()}>
              {editingId ? 'Update Problem' : 'Add Problem'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
