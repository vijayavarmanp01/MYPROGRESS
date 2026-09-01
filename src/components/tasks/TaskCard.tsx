import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import type { DailyTask, Difficulty } from '../../types'
import { cn, formatMinutes } from '../../lib/utils'
import { Card } from '../ui/Card'
import { Input, Textarea } from '../ui/Input'
import { Badge } from '../ui/Badge'
import { Checkbox } from '../ui/Checkbox'

interface TaskCardProps {
  icon: string
  name: string
  task: DailyTask
  onToggle: () => void
  onUpdate: (updates: Partial<DailyTask>) => void
}

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard']

const DIFFICULTY_DOT: Record<Difficulty, string> = {
  easy: 'bg-mint',
  medium: 'bg-amber',
  hard: 'bg-rose',
}

export function TaskCard({ icon, name, task, onToggle, onUpdate }: TaskCardProps) {
  const [expanded, setExpanded] = useState(false)

  const toggleDifficulty = (d: Difficulty) => {
    const diffs = task.difficulties.includes(d)
      ? task.difficulties.filter(x => x !== d)
      : [...task.difficulties, d]
    onUpdate({ difficulties: diffs })
  }


  return (
    <Card
      padded={false}
      className={cn(
        'p-4 transition-all duration-300 sm:p-5',
        task.completed && 'border-mint/25 bg-mint/[0.035]'
      )}
    >
      <div className="flex items-start gap-3.5">
        <Checkbox
          checked={task.completed}
          onChange={onToggle}
          label={`Mark ${name} as ${task.completed ? 'incomplete' : 'complete'}`}
          className="mt-0.5"
        />

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                aria-hidden
                className="grid h-8 w-8 shrink-0 place-items-center rounded-[10px] border border-line bg-surface-2 text-[14px]"
              >
                {icon}
              </span>
              <h3
                className={cn(
                  'min-w-0 truncate text-[14.5px] font-semibold tracking-[-0.01em] text-ink transition-colors',
                  task.completed && 'text-ink-2 line-through decoration-ink-3/50'
                )}
              >
                {name}
              </h3>
            </div>
            <button
              onClick={() => setExpanded(!expanded)}
              aria-expanded={expanded}
              aria-label={expanded ? `Collapse ${name} details` : `Expand ${name} details`}
              className="grid h-7 w-7 shrink-0 place-items-center rounded-[8px] text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
            >
              {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3.5 gap-y-1.5 pl-[42px] text-[12.5px] text-ink-3">
            <span className="tabular">
              <span className="font-semibold text-ink">{task.problemsSolved}</span>
              {' / '}
              {task.problemsTarget} problems
            </span>
            {task.timeSpentMinutes > 0 && (
              <span className="tabular">{formatMinutes(task.timeSpentMinutes)}</span>
            )}
            <span className="flex items-center gap-1" aria-label="Difficulty mix">
              {task.difficulties.map(d => (
                <span key={d} className={cn('h-2 w-2 rounded-full', DIFFICULTY_DOT[d])} title={d} />
              ))}
            </span>
            {task.completed && <Badge variant="success">Done</Badge>}
          </div>

          {task.notes && !expanded && (
            <p className="mt-2 truncate pl-[42px] text-[12.5px] italic text-ink-3">{task.notes}</p>
          )}

          {expanded && (
            <div className="animate-fade-in mt-4 space-y-3 border-t border-line pt-4">
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
                <label className="mb-2 block text-[13px] font-medium text-ink-2">Difficulty</label>
                <div className="flex gap-2">
                  {DIFFICULTIES.map(d => (
                    <button
                      key={d}
                      onClick={() => toggleDifficulty(d)}
                      aria-pressed={task.difficulties.includes(d)}
                      className={cn(
                        'rounded-[10px] border px-3 py-1.5 text-[13px] font-medium transition-all',
                        task.difficulties.includes(d)
                          ? 'border-accent/40 bg-accent/10 text-accent'
                          : 'border-line text-ink-3 hover:border-line-strong hover:text-ink-2'
                      )}
                    >
                      <span className={cn('mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle', DIFFICULTY_DOT[d])} />
                      {d.charAt(0).toUpperCase() + d.slice(1)}
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
