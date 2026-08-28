import { useState } from 'react'
import { Plus, Trash2, ExternalLink, Star, RotateCcw, CheckCircle } from 'lucide-react'
import { useApp } from '../store/AppContext'
import type { Problem, ProblemStatus, Difficulty } from '../types'
import { PLATFORMS, REVISION_INTERVALS } from '../data/defaults'
import { generateId, getTodayString, difficultyEmoji, statusLabel, difficultyLabel } from '../lib/utils'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Select, Textarea } from '../components/ui/Input'
import { Modal } from '../components/ui/Modal'
import { Badge } from '../components/ui/Badge'

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

export function ProblemsPage() {
  const { state, addProblem, updateProblem, deleteProblem, setRevision } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyProblem())

  const [filterTopic, setFilterTopic] = useState('all')
  const [filterDifficulty, setFilterDifficulty] = useState('all')
  const [filterPlatform, setFilterPlatform] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const topicOptions = state.categories.map(c => ({ value: c.id, label: c.name }))

  const filtered = state.problems.filter(p => {
    if (filterTopic !== 'all' && p.topicId !== filterTopic) return false
    if (filterDifficulty !== 'all' && p.difficulty !== filterDifficulty) return false
    if (filterPlatform !== 'all' && p.platform !== filterPlatform) return false
    if (filterStatus !== 'all' && p.status !== filterStatus) return false
    return true
  })

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

  const statusBadge = (status: ProblemStatus) => {
    const variants: Record<ProblemStatus, 'default' | 'warning' | 'success' | 'accent'> = {
      'not-started': 'default',
      'in-progress': 'warning',
      'solved': 'success',
      'revised': 'accent',
    }
    return <Badge variant={variants[status]}>{statusLabel(status)}</Badge>
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]">Problem Tracker</h1>
          <p className="text-[var(--color-text-secondary)] mt-1">{state.problems.length} problems tracked</p>
        </div>
        <Button onClick={openAdd}>
          <Plus size={16} /> Add Problem
        </Button>
      </div>

      <Card className="!p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Select label="Topic" value={filterTopic} onChange={e => setFilterTopic(e.target.value)}
            options={[{ value: 'all', label: 'All Topics' }, ...topicOptions]} />
          <Select label="Difficulty" value={filterDifficulty} onChange={e => setFilterDifficulty(e.target.value)}
            options={[{ value: 'all', label: 'All' }, ...DIFFICULTIES.map(d => ({ value: d, label: difficultyLabel(d) }))]} />
          <Select label="Platform" value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)}
            options={[{ value: 'all', label: 'All' }, ...PLATFORMS.map(p => ({ value: p, label: p }))]} />
          <Select label="Status" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            options={[{ value: 'all', label: 'All' }, ...STATUSES.map(s => ({ value: s, label: statusLabel(s) }))]} />
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-[var(--color-text-muted)]">No problems found. Add your first problem to get started!</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(problem => {
            const topic = state.categories.find(c => c.id === problem.topicId)
            return (
              <Card key={problem.id} hover className="!p-4" onClick={() => openEdit(problem)}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-[var(--color-text-primary)]">{problem.name}</h3>
                      {statusBadge(problem.status)}
                      {problem.revisionStatus === 'important' && <Star size={14} className="text-yellow-500 fill-yellow-500" />}
                      {problem.revisionStatus === 'needs-revision' && <RotateCcw size={14} className="text-orange-500" />}
                      {problem.revisionStatus === 'mastered' && <CheckCircle size={14} className="text-green-500" />}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-1.5 text-sm text-[var(--color-text-secondary)]">
                      <span>{difficultyEmoji(problem.difficulty)} {difficultyLabel(problem.difficulty)}</span>
                      <span>{topic?.icon} {topic?.name ?? problem.topicId}</span>
                      <span>{problem.platform}</span>
                      {problem.dateSolved && <span>Solved: {problem.dateSolved}</span>}
                      {problem.timeTakenMinutes && <span>{problem.timeTakenMinutes} min</span>}
                    </div>
                    {problem.notes && (
                      <p className="mt-1 text-sm text-[var(--color-text-muted)] italic truncate">{problem.notes}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {problem.url && (
                      <a href={problem.url} target="_blank" rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="p-2 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]">
                        <ExternalLink size={16} />
                      </a>
                    )}
                    <button
                      onClick={e => { e.stopPropagation(); deleteProblem(problem.id) }}
                      className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editingId ? 'Edit Problem' : 'Add Problem'}>
        <div className="space-y-4">
          <Input label="Problem Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Two Sum" />
          <div className="grid grid-cols-2 gap-3">
            <Select label="Platform" value={form.platform} onChange={e => setForm({ ...form, platform: e.target.value })}
              options={PLATFORMS.map(p => ({ value: p, label: p }))} />
            <Select label="Topic" value={form.topicId} onChange={e => setForm({ ...form, topicId: e.target.value })}
              options={topicOptions} />
            <Select label="Difficulty" value={form.difficulty} onChange={e => setForm({ ...form, difficulty: e.target.value as Difficulty })}
              options={DIFFICULTIES.map(d => ({ value: d, label: difficultyLabel(d) }))} />
            <Select label="Status" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as ProblemStatus })}
              options={STATUSES.map(s => ({ value: s, label: statusLabel(s) }))} />
            <Input label="Time Taken (min)" type="number" min={0} value={form.timeTakenMinutes ?? ''}
              onChange={e => setForm({ ...form, timeTakenMinutes: parseInt(e.target.value) || undefined })} />
            <Input label="Date Solved" type="date" value={form.dateSolved ?? ''}
              onChange={e => setForm({ ...form, dateSolved: e.target.value || undefined })} />
          </div>
          <Input label="Problem URL" value={form.url ?? ''} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://leetcode.com/..." />
          <Textarea label="Notes" rows={2} value={form.notes ?? ''} onChange={e => setForm({ ...form, notes: e.target.value })} />

          {editingId && (
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Revision</label>
              <div className="flex flex-wrap gap-2 mb-3">
                <Button size="sm" variant={form.revisionStatus === 'important' ? 'primary' : 'secondary'}
                  onClick={() => setRevision(editingId, 'important')}>
                  ⭐ Important
                </Button>
                <Button size="sm" variant={form.revisionStatus === 'needs-revision' ? 'primary' : 'secondary'}
                  onClick={() => setRevision(editingId, 'needs-revision')}>
                  🔄 Needs Revision
                </Button>
                <Button size="sm" variant={form.revisionStatus === 'mastered' ? 'primary' : 'secondary'}
                  onClick={() => setRevision(editingId, 'mastered')}>
                  ✅ Mastered
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {REVISION_INTERVALS.map(interval => (
                  <Button key={interval.value} size="sm" variant="ghost"
                    onClick={() => setRevision(editingId, form.revisionStatus ?? 'needs-revision', interval.value)}>
                    {interval.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editingId ? 'Update' : 'Add'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
