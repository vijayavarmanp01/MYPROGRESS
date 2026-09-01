import { cn } from '../../lib/utils'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  ariaLabel: string
}

export function Switch({ checked, onChange, ariaLabel }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-[22px] w-[38px] shrink-0 rounded-full border transition-colors duration-200',
        checked ? 'border-accent/40 bg-accent' : 'border-line-strong bg-surface-2'
      )}
    >
      <span
        className={cn(
          'absolute top-1/2 h-[16px] w-[16px] -translate-y-1/2 rounded-full transition-all duration-200',
          checked ? 'left-[19px] bg-accent-contrast' : 'left-[2px] bg-ink-3'
        )}
      />
    </button>
  )
}