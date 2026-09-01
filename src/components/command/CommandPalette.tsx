import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Sun, Moon, CornerDownLeft } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'
import { useApp } from '../../store/AppContext'
import { ALL_NAV_ITEMS } from '../layout/navConfig'

interface CommandItem {
  id: string
  label: string
  section: 'Navigate' | 'Actions'
  icon: LucideIcon
  keywords?: string
  run: () => void
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const { state, dispatch } = useApp()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const isDark =
    state.settings.theme === 'dark' ||
    (state.settings.theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches)

  const items = useMemo<CommandItem[]>(() => {
    const navItems: CommandItem[] = ALL_NAV_ITEMS.map(item => ({
      id: `nav-${item.id}`,
      label: item.label,
      section: 'Navigate',
      icon: item.icon,
      keywords: item.path,
      run: () => {
        navigate(item.path)
        onClose()
      },
    }))
    const actions: CommandItem[] = [
      {
        id: 'action-theme',
        label: isDark ? 'Switch to light theme' : 'Switch to dark theme',
        section: 'Actions',
        icon: isDark ? Sun : Moon,
        keywords: 'appearance dark light mode toggle',
        run: () => {
          dispatch({ type: 'UPDATE_SETTINGS', payload: { theme: isDark ? 'light' : 'dark' } })
          onClose()
        },
      },
      {
        id: 'action-add-problem',
        label: 'Track a new problem',
        section: 'Actions',
        icon: Search,
        keywords: 'add create log leetcode',
        run: () => {
          navigate('/problems')
          onClose()
        },
      },
    ]
    return [...navItems, ...actions]
  }, [navigate, onClose, dispatch, isDark])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter(item =>
      `${item.label} ${item.keywords ?? ''}`.toLowerCase().includes(q)
    )
  }, [items, query])

  // Reset search state when the palette opens (render-time adjustment pattern)
  const [wasOpen, setWasOpen] = useState(false)
  if (open && !wasOpen) {
    setWasOpen(true)
    setQuery('')
    setIndex(0)
  } else if (!open && wasOpen) {
    setWasOpen(false)
  }

  // Reset selection whenever the query changes
  const [lastQuery, setLastQuery] = useState(query)
  if (lastQuery !== query) {
    setLastQuery(query)
    setIndex(0)
  }

  useEffect(() => {
    if (!open) return
    requestAnimationFrame(() => inputRef.current?.focus())
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  useEffect(() => {
    const active = listRef.current?.querySelector('[aria-selected="true"]')
    active?.scrollIntoView({ block: 'nearest' })
  }, [index])

  if (!open) return null

  return (
    <PaletteBody
      query={query}
      setQuery={setQuery}
      index={index}
      setIndex={setIndex}
      filtered={filtered}
      inputRef={inputRef}
      listRef={listRef}
      onClose={onClose}
    />
  )
}

interface PaletteBodyProps {
  query: string
  setQuery: (q: string) => void
  index: number
  setIndex: (fn: (i: number) => number) => void
  filtered: CommandItem[]
  inputRef: React.RefObject<HTMLInputElement | null>
  listRef: React.RefObject<HTMLDivElement | null>
  onClose: () => void
}

function PaletteBody({ query, setQuery, index, setIndex, filtered, inputRef, listRef, onClose }: PaletteBodyProps) {
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIndex(i => (filtered.length ? (i + 1) % filtered.length : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setIndex(i => (filtered.length ? (i - 1 + filtered.length) % filtered.length : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      filtered[index]?.run()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  const sections: CommandItem['section'][] = ['Navigate', 'Actions']
  let flatIdx = -1

  return (
    <div className="fixed inset-0 z-[80] px-4" role="dialog" aria-modal="true" aria-label="Command palette">
      <div className="animate-fade-in absolute inset-0 bg-[#05060a]/60 backdrop-blur-sm" onClick={onClose} />
      <div className="animate-scale-in glass-strong relative mx-auto mt-[12vh] w-full max-w-xl overflow-hidden rounded-2xl shadow-pop">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search size={17} className="shrink-0 text-ink-3" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search anything…"
            aria-label="Search commands"
            className="h-12 w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-3"
          />
          <span className="kbd">esc</span>
        </div>

        <div ref={listRef} className="max-h-[320px] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="px-3 py-10 text-center text-[13.5px] text-ink-3">
              No results for “{query}”
            </p>
          ) : (
            sections.map(section => {
              const sectionItems = filtered.filter(i => i.section === section)
              if (sectionItems.length === 0) return null
              return (
                <div key={section} className="mb-1 last:mb-0">
                  <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.09em] text-ink-3">
                    {section}
                  </p>
                  {sectionItems.map(item => {
                    flatIdx += 1
                    const active = flatIdx === index
                    return (
                      <button
                        key={item.id}
                        aria-selected={active}
                        role="option"
                        onClick={item.run}
                        onMouseEnter={() => setIndex(() => filtered.indexOf(item))}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[13.5px] transition-colors',
                          active ? 'bg-accent/10 text-ink' : 'text-ink-2'
                        )}
                      >
                        <item.icon size={16} className={active ? 'text-accent' : 'text-ink-3'} />
                        <span className="font-medium">{item.label}</span>
                        {active && <CornerDownLeft size={13} className="ml-auto shrink-0 text-ink-3" />}
                      </button>
                    )
                  })}
                </div>
              )
            })
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-line px-4 py-2.5 text-[11px] text-ink-3">
          <span className="flex items-center gap-1.5">
            <span className="kbd">↑</span>
            <span className="kbd">↓</span> navigate
          </span>
          <span className="flex items-center gap-1.5">
            <span className="kbd">↵</span> select
          </span>
          <span className="ml-auto">MyProgress</span>
        </div>
      </div>
    </div>
  )
}