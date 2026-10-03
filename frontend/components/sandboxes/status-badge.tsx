import { Loader2 } from 'lucide-react'
import type { SandboxStatus } from '@/lib/api'
import { STATUS_META, type StatusTone } from '@/lib/sandbox-status'
import { cn } from '@/lib/utils'

const TONE_CLASSES: Record<StatusTone, { badge: string; dot: string }> = {
  success: { badge: 'border-success/25 bg-success-muted text-success', dot: 'bg-success' },
  neutral: { badge: 'border-border bg-muted text-muted-foreground', dot: 'bg-muted-foreground/60' },
  warning: { badge: 'border-warning/30 bg-warning-muted text-warning', dot: 'bg-warning' },
  danger: { badge: 'border-danger/25 bg-danger-muted text-danger', dot: 'bg-danger' },
}

export function StatusBadge({ status, className }: { status: SandboxStatus; className?: string }) {
  const meta = STATUS_META[status]
  const tone = TONE_CLASSES[meta.tone]

  return (
    <span
      className={cn(
        'inline-flex h-5 items-center gap-1.5 rounded-full border px-2 text-xs font-medium whitespace-nowrap',
        tone.badge,
        className,
      )}
    >
      {meta.transitional ? (
        <Loader2 className="size-3 motion-safe:animate-spin" aria-hidden="true" />
      ) : (
        <span className={cn('size-1.5 rounded-full', tone.dot)} aria-hidden="true" />
      )}
      {meta.label}
    </span>
  )
}
