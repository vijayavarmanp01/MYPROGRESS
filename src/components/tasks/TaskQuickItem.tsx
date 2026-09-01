import type { DailyTask } from '../../types'
import { cn } from '../../lib/utils'

interface TaskQuickItemProps {
  icon: string
  name: string
  task: DailyTask
  onToggle: () => void
}

/** Compact checklist row for the dashboard bento tile. */
export function TaskQuickItem({ icon, name, task, onToggle }: TaskQuickItemProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={task.completed}
      aria-label={`Mark ${name} as ${task.completed ? 'incomplete' : 'complete'}`}
      onClick={onToggle}
      className="group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors duration-200 hover:bg-surface-2"
    >
      <span
        aria-hidden
        className={cn(
          'grid h-[18px] w-[18px] shrink-0 place-items-center rounded-[6px] border transition-all duration-200',
          task.completed
            ? 'border-mint bg-mint text-white'
            : 'border-line-strong bg-surface group-hover:border-accent'
        )}
      >
        <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none">
          <path
            d="M3.5 8.5 6.5 11.5 12.5 4.5"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn('check-path', task.completed && 'check-path-in')}
          />
        </svg>
      </span>
      <span aria-hidden className="text-[14px] leading-none opacity-90">{icon}</span>
      <span
        className={cn(
          'min-w-0 flex-1 truncate text-[13px] font-medium transition-colors',
          task.completed ? 'text-ink-3 line-through decoration-ink-3/50' : 'text-ink-2 group-hover:text-ink'
        )}
      >
        {name}
      </span>
      <span className="shrink-0 text-[11.5px] text-ink-3 tabular">
        {task.problemsSolved}/{task.problemsTarget}
      </span>
    </button>
  )
}