import { cn } from '../../lib/utils'

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('animate-shimmer rounded-[10px] bg-surface-2', className)} />
}