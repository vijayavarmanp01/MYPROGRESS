import { cn } from '../../lib/utils'

interface CheckboxProps {
  checked: boolean
  onChange: () => void
  label: string
  className?: string
}

export function Checkbox({ checked, onChange, label, className }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        'grid h-[22px] w-[22px] shrink-0 place-items-center rounded-[7px] border transition-all duration-200',
        checked
          ? 'border-mint bg-mint text-white shadow-[0_3px_10px_-3px_var(--color-mint)]'
          : 'border-line-strong bg-surface hover:border-accent',
        className
      )}
    >
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
        <path
          d="M3.5 8.5 6.5 11.5 12.5 4.5"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn('check-path', checked && 'check-path-in')}
        />
      </svg>
    </button>
  )
}