import { useState } from 'react'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import type { DailyTask, Difficulty } from '../../types'
import { cn, difficultyEmoji, formatMinutes } from '../../lib/utils'
import { Card } from '../ui/Card'
import { Input, Textarea } from '../ui/Input'
import { Badge } from '../ui/Badge'

interface TaskCardProps {
  icon: string
  name: string
  task: DailyTask
  onToggle: () => void
  onUpdate: (updates: Partial<DailyTask>) => void
}

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

export function TaskCard({ icon, name, task, onToggle, onUpdate }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false)

  const toggleDifficulty = (d: Difficulty) => {
    const diffs = task.difficulties.includes(d)
      ? task.difficulties.filter(x => x !== d)
      : [...task.difficulties, d]
    onUpdate({ difficulties: diffs })
  }

  return (
    <Card className={cn(
      'transition-all duration-300',
      task.completed && 'border-[var(--color-success)]/30 bg-green-50/50 dark:bg-green-900/10'
    )}>
      <div className="flex items-start gap-4">
        <button
          onClick={onToggle}
          className={cn(
            'mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-200',
            task.completed
              ? 'bg-[var(--color-success)] border-[var(--color-success)] text-white'
              : 'border-[var(--color-border)] hover:border-[var(--color-accent)]'
          )}
          aria-label={`Mark ${name} as ${task.completed ? 'incomplete' : 'complete'}`}
        >
          {task.completed && <Check size={14} strokeWidth={3} />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className={cn(
              'font-semibold text-[var(--color-text-primary)]',
              task.completed && 'line-through opacity-70'
            )}>
              {icon} {name}
            </h3>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)]"
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>

          <div className="flex flex-wrap gap-3 mt-2 text-sm text-[var(--color-text-secondary)]">
            <span>
              Problems: <strong className="text-[var(--color-text-primary)]">{task.problemsSolved} / {task.problemsTarget}</strong>
            </span>
            {task.timeSpentMinutes > 0 && (
              <span>Time: <strong className="text-[var(--color-text-primary)]">{formatMinutes(task.timeSpentMinutes)}</strong></span>
            )}
            {task.difficulties.length > 0 && (
              <span className="flex items-center gap-1">
                {task.difficulties.map(d => (
                  <span key={d}>{difficultyEmoji(d)}</span>
                ))}
              </span>
            )}
            {task.completed && <Badge variant="success">Done</Badge>}
          </div>

          {task.notes && !expanded && (
            <p className="mt-2 text-sm text-[var(--color-text-muted)] italic truncate">{task.notes}</p>
          )}

          {expanded && (
            <div className="mt-4 space-y-3 animate-fade-in">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Problems Solved"
                  type="number"
                  min={0}
                  value={task.problemsSolved}
                  onChange={e => onUpdate({ problemsSolved: parseInt(e.target.value) || 0 })}
                />
                <Input
                  label="Target"
                  type="number"
                  min={1}
                  value={task.problemsTarget}
                  onChange={e => onUpdate({ problemsTarget: parseInt(e.target.value) || 1 })}
                />
                <Input
                  label="Time (minutes)"
                  type="number"
                  min={0}
                  value={task.timeSpentMinutes}
                  onChange={e => onUpdate({ timeSpentMinutes: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">Difficulty</label>
                <div className="flex gap-2">
                  {DIFFICULTIES.map(d => (
                    <button
                      key={d}
                      onClick={() => toggleDifficulty(d)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-sm border transition-all',
                        task.difficulties.includes(d)
                          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
                          : 'border-[var(--color-border)] hover:border-[var(--color-accent)]/50'
                      )}
                    >
                      {difficultyEmoji(d)} {d.charAt(0).toUpperCase() + d.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <Textarea
                label="Notes"
                rows={2}
                placeholder="What did you practice today?"
                value={task.notes}
                onChange={e => onUpdate({ notes: e.target.value })}
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
