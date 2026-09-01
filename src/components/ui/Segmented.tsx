import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

interface SegmentedProps<T extends string> {
  options: { value: T; label: string; icon?: LucideIcon }[]
  value: T
  onChange: (value: T) => void
  size?: 'sm' | 'md'
  className?: string
  ariaLabel?: string
}

export function Segmented<T extends string>({ options, value, onChange, size = 'md', className, ariaLabel }: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={cn('inline-flex items-center gap-1 rounded-control border border-line bg-surface-2 p-1', className)}
    >
      {options.map(({ value: v, label, icon: Icon }) => {
        const active = v === value
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(v)}
            className={cn(
              'inline-flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-[9px] font-medium transition-all duration-200',
              size === 'sm' ? 'h-7 px-2.5 text-[12px]' : 'h-8 px-3.5 text-[13px]',
              active
                ? 'bg-surface text-ink shadow-[0_1px_2px_rgba(15,23,42,0.08),0_4px_12px_-6px_rgba(15,23,42,0.15)]'
                : 'text-ink-3 hover:text-ink-2'
            )}
          >
            {Icon && <Icon size={14} className={active ? 'text-accent' : ''} />}
            {label}
          </button>
        )
      })}
    </div>
  )
}