import { cn } from '../../lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
}

const fieldBase = cn(
  'w-full rounded-[10px] border border-line bg-surface-2 text-ink',
  'px-3 text-sm placeholder:text-ink-3',
  'transition-all duration-200',
  'hover:border-line-strong',
  'focus:border-accent/60 focus:bg-surface focus:outline-none focus:ring-3 focus:ring-accent/12'
)

export function Input({ label, hint, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-[12.5px] font-medium text-ink-2">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={cn(fieldBase, 'h-10', className)}
        {...props}
      />
      {hint && <p className="text-[11.5px] text-ink-3">{hint}</p>}
    </div>
  )
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

export function Textarea({ label, className, id, ...props }: TextareaProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-[12.5px] font-medium text-ink-2">
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(fieldBase, 'min-h-[72px] resize-none py-2.5', className)}
        {...props}
      />
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
}

export function Select({ label, options, className, id, ...props }: SelectProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-[12.5px] font-medium text-ink-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={inputId}
          className={cn(
            fieldBase,
            'h-10 cursor-pointer appearance-none pr-9',
            // Dark mode color-scheme ensures native arrow matches theme
            'dark:[color-scheme:dark]',
            className
          )}
          {...props}
        >
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Custom chevron that respects dark mode */}
        <span
          aria-hidden
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-3"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </div>
    </div>
  )
}
