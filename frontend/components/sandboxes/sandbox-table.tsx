'use client'

import type { KeyboardEvent } from 'react'
import type { Sandbox, SandboxAction } from '@/lib/api'
import type { PendingActions } from '@/hooks/use-sandboxes'
import { formatAbsolute, formatRelative } from '@/lib/format'
import { cn } from '@/lib/utils'
import { SandboxRowMenu } from './sandbox-actions'
import { ServiceTags } from './service-tags'
import { StatusBadge } from './status-badge'

interface SandboxTableProps {
  sandboxes: Sandbox[]
  selectedId: string | null
  pending: PendingActions
  now: number
  onSelect: (id: string) => void
  onAction: (sandbox: Sandbox, action: SandboxAction) => void
}

const HEAD_CELL = 'h-8 px-3 text-left text-xs font-medium whitespace-nowrap text-muted-foreground'

export function SandboxTable({
  sandboxes,
  selectedId,
  pending,
  now,
  onSelect,
  onAction,
}: SandboxTableProps) {
  function handleRowKeyDown(event: KeyboardEvent<HTMLTableRowElement>, id: string) {
    if (event.target !== event.currentTarget) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onSelect(id)
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const sibling =
        event.key === 'ArrowDown'
          ? event.currentTarget.nextElementSibling
          : event.currentTarget.previousElementSibling
      ;(sibling as HTMLElement | null)?.focus()
    }
  }

  return (
    <>
    <ul className="divide-y md:hidden" aria-label="Sandboxes">
      {sandboxes.map((sandbox) => {
        const selected = sandbox.id === selectedId
        return (
          <li
            key={sandbox.id}
            className={cn(
              'flex items-start gap-2 px-3 py-2.5',
              selected && 'bg-primary/[0.045] shadow-[inset_2px_0_0_var(--color-primary)]',
            )}
          >
            <button
              type="button"
              onClick={() => onSelect(sandbox.id)}
              aria-current={selected || undefined}
              className="flex min-w-0 flex-1 flex-col gap-1.5 rounded-sm text-left outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <span className="flex w-full items-center justify-between gap-2">
                <span className="truncate font-mono text-[13px] font-medium">{sandbox.project_name}</span>
                <StatusBadge status={sandbox.status} />
              </span>
              <ServiceTags services={sandbox.services} />
              <span className="flex w-full items-center gap-1.5 text-xs text-muted-foreground">
                <span className="truncate">{sandbox.owner_email}</span>
                <span aria-hidden="true">·</span>
                <time dateTime={sandbox.created_at} className="shrink-0">
                  {formatRelative(sandbox.created_at, now)}
                </time>
              </span>
            </button>
            <SandboxRowMenu
              sandbox={sandbox}
              pendingAction={pending[sandbox.id]}
              onAction={onAction}
              onOpenDetails={() => onSelect(sandbox.id)}
            />
          </li>
        )
      })}
    </ul>
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[760px] border-collapse text-[13px]">
        <caption className="sr-only">
          Sandboxes. Press Enter on a row to open its details. Use arrow keys to move between rows.
        </caption>
        <thead className="border-b bg-muted/50">
          <tr>
            <th scope="col" className={HEAD_CELL}>
              Project
            </th>
            <th scope="col" className={HEAD_CELL}>
              Services
            </th>
            <th scope="col" className={HEAD_CELL}>
              Status
            </th>
            <th scope="col" className={HEAD_CELL}>
              Owner
            </th>
            <th scope="col" className={HEAD_CELL}>
              Created
            </th>
            <th scope="col" className={cn(HEAD_CELL, 'w-12 text-right')}>
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sandboxes.map((sandbox) => {
            const selected = sandbox.id === selectedId
            return (
              <tr
                key={sandbox.id}
                tabIndex={0}
                aria-current={selected || undefined}
                onClick={() => onSelect(sandbox.id)}
                onKeyDown={(event) => handleRowKeyDown(event, sandbox.id)}
                className={cn(
                  'group cursor-pointer border-b outline-none last:border-b-0 hover:bg-accent/50 focus-visible:bg-accent/60 focus-visible:shadow-[inset_2px_0_0_var(--color-ring)]',
                  selected && 'bg-primary/[0.045] shadow-[inset_2px_0_0_var(--color-primary)] hover:bg-primary/[0.06]',
                )}
              >
                <td className="px-3 py-2 align-middle">
                  <div className="flex flex-col">
                    <span className="font-mono font-medium text-foreground">{sandbox.project_name}</span>
                    <span className="font-mono text-[11px] text-muted-foreground">{sandbox.id}</span>
                  </div>
                </td>
                <td className="px-3 py-2 align-middle">
                  <ServiceTags services={sandbox.services} />
                </td>
                <td className="px-3 py-2 align-middle">
                  <StatusBadge status={sandbox.status} />
                </td>
                <td className="max-w-56 truncate px-3 py-2 align-middle text-muted-foreground">
                  {sandbox.owner_email}
                </td>
                <td className="px-3 py-2 align-middle whitespace-nowrap text-muted-foreground">
                  <time dateTime={sandbox.created_at} title={formatAbsolute(sandbox.created_at)}>
                    {formatRelative(sandbox.created_at, now)}
                  </time>
                </td>
                <td className="px-2 py-2 text-right align-middle">
                  <SandboxRowMenu
                    sandbox={sandbox}
                    pendingAction={pending[sandbox.id]}
                    onAction={onAction}
                    onOpenDetails={() => onSelect(sandbox.id)}
                  />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
    </>
  )
}

export function SandboxTableSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading sandboxes" className="divide-y">
      <div className="h-8 bg-muted/50" />
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-6 px-3 py-3">
          <div className="flex w-40 flex-col gap-1.5">
            <div className="h-3 w-28 animate-pulse rounded-sm bg-muted" />
            <div className="h-2.5 w-20 animate-pulse rounded-sm bg-muted" />
          </div>
          <div className="hidden h-4 w-48 animate-pulse rounded-sm bg-muted sm:block" />
          <div className="h-4 w-16 animate-pulse rounded-full bg-muted" />
          <div className="hidden h-3 w-36 animate-pulse rounded-sm bg-muted md:block" />
        </div>
      ))}
    </div>
  )
}
