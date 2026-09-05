import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

/** Returns all focusable elements inside a container */
function getFocusable(el: HTMLElement): HTMLElement[] {
  return Array.from(
    el.querySelectorAll<HTMLElement>(
      'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'
    )
  ).filter(e => !e.closest('[disabled]'))
}

export function Modal({ open, onClose, title, children, className, size = 'md' }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    // Body scroll lock
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    // Keyboard handler: Escape to close, Tab to trap focus
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = getFocusable(panelRef.current)
        if (focusable.length === 0) { e.preventDefault(); return }
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }
    document.addEventListener('keydown', onKey)

    // Auto-focus first focusable element
    requestAnimationFrame(() => {
      if (panelRef.current) {
        const focusable = getFocusable(panelRef.current)
        focusable[0]?.focus()
      }
    })

    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [open, onClose])

  if (!open) return null

  const sizeClass = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  }[size]

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop */}
      <div
        className="animate-fade-in absolute inset-0 bg-black/50 backdrop-blur-md"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className={cn(
          'animate-scale-in relative flex max-h-[90vh] w-full flex-col overflow-hidden',
          'rounded-2xl border border-line bg-surface shadow-pop',
          sizeClass,
          className
        )}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-line bg-surface-2/60 px-5 py-4">
          <h2
            id="modal-title"
            className="text-[15px] font-semibold tracking-[-0.015em] text-ink"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="grid h-8 w-8 place-items-center rounded-[10px] text-ink-3 transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  )
}
