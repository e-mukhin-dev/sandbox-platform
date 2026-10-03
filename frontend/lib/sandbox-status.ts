import type { SandboxAction, SandboxStatus } from '@/lib/api'

export type StatusTone = 'success' | 'neutral' | 'warning' | 'danger'

interface StatusMeta {
  label: string
  tone: StatusTone
  transitional: boolean
  progressLabel?: string
}

export const STATUS_META: Record<SandboxStatus, StatusMeta> = {
  creating: { label: 'Creating', tone: 'warning', transitional: true, progressLabel: 'Provisioning containers' },
  running: { label: 'Running', tone: 'success', transitional: false },
  stopping: { label: 'Stopping', tone: 'warning', transitional: true, progressLabel: 'Stopping containers' },
  stopped: { label: 'Stopped', tone: 'neutral', transitional: false },
  starting: { label: 'Starting', tone: 'warning', transitional: true, progressLabel: 'Starting containers' },
  restarting: { label: 'Restarting', tone: 'warning', transitional: true, progressLabel: 'Restarting containers' },
  failed: { label: 'Failed', tone: 'danger', transitional: false },
}

export const ALL_STATUSES = Object.keys(STATUS_META) as SandboxStatus[]

export function isTransitional(status: SandboxStatus): boolean {
  return STATUS_META[status].transitional
}

export const ACTION_LABELS: Record<SandboxAction, { idle: string; pending: string }> = {
  start: { idle: 'Start', pending: 'Starting' },
  stop: { idle: 'Stop', pending: 'Stopping' },
  restart: { idle: 'Restart', pending: 'Restarting' },
}

export function allowedActions(status: SandboxStatus): SandboxAction[] {
  switch (status) {
    case 'running':
      return ['stop', 'restart']
    case 'stopped':
      return ['start']
    default:
      return []
  }
}

/** Actions to render for a status, even when disabled, so controls don't jump around mid-transition. */
export function visibleActions(status: SandboxStatus): SandboxAction[] {
  switch (status) {
    case 'running':
    case 'restarting':
    case 'stopping':
      return ['stop', 'restart']
    case 'stopped':
    case 'starting':
      return ['start']
    case 'creating':
      return ['stop', 'restart']
    default:
      return []
  }
}

export type StatusFilter = 'all' | 'running' | 'in-progress' | 'stopped' | 'failed'

export const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'running', label: 'Running' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'stopped', label: 'Stopped' },
  { value: 'failed', label: 'Failed' },
]

export function matchesStatusFilter(status: SandboxStatus, filter: StatusFilter): boolean {
  if (filter === 'all') return true
  if (filter === 'in-progress') return isTransitional(status)
  return status === filter
}
