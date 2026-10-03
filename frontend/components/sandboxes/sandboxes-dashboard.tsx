'use client'

import { useDeferredValue, useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { useNow, useSandboxActions, useSandboxes, useServices } from '@/hooks/use-sandboxes'
import type { Sandbox } from '@/lib/api'
import {
  STATUS_FILTERS,
  isTransitional,
  matchesStatusFilter,
  type StatusFilter,
} from '@/lib/sandbox-status'
import { AppHeader } from './app-header'
import { CreateSandboxDialog } from './create-sandbox-dialog'
import { LoadError, NoResults, NoSandboxes } from './empty-states'
import { SandboxDetailsSheet } from './sandbox-details-sheet'
import { SandboxTable, SandboxTableSkeleton } from './sandbox-table'
import { SandboxToolbar } from './sandbox-toolbar'

function matchesQuery(sandbox: Sandbox, query: string) {
  if (!query) return true
  const haystack = [
    sandbox.project_name,
    sandbox.owner_email,
    sandbox.id,
    ...sandbox.services.map((s) => `${s.name}:${s.version}`),
  ]
    .join(' ')
    .toLowerCase()
  return query
    .toLowerCase()
    .split(/\s+/)
    .every((term) => haystack.includes(term))
}

export function SandboxesDashboard() {
  const { data: sandboxes, error, isLoading, isValidating, mutate } = useSandboxes()
  // Warm the SWR cache so the create dialog opens with the catalog ready.
  useServices()
  const { pending, runAction } = useSandboxActions()

  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)

  const deferredQuery = useDeferredValue(query.trim())
  const list = useMemo(() => sandboxes ?? [], [sandboxes])
  const now = useNow(true, 30_000)

  const counts = useMemo(() => {
    const result = {} as Record<StatusFilter, number>
    for (const option of STATUS_FILTERS) {
      result[option.value] = list.filter((s) => matchesStatusFilter(s.status, option.value)).length
    }
    return result
  }, [list])

  const visible = useMemo(
    () =>
      list.filter((s) => matchesStatusFilter(s.status, filter) && matchesQuery(s, deferredQuery)),
    [list, filter, deferredQuery],
  )

  const selected = list.find((s) => s.id === selectedId) ?? null
  const syncing = list.some((s) => isTransitional(s.status))

  function openDetails(id: string) {
    setSelectedId(id)
    setDetailsOpen(true)
  }

  function resetFilters() {
    setQuery('')
    setFilter('all')
  }

  let body: React.ReactNode
  if (isLoading && !sandboxes) body = <SandboxTableSkeleton />
  else if (error && !sandboxes) body = <LoadError onRetry={() => mutate()} />
  else if (list.length === 0) body = <NoSandboxes onCreate={() => setCreateOpen(true)} />
  else if (visible.length === 0) body = <NoResults query={deferredQuery} onReset={resetFilters} />
  else
    body = (
      <SandboxTable
        sandboxes={visible}
        selectedId={detailsOpen ? selectedId : null}
        pending={pending}
        now={now}
        onSelect={openDetails}
        onAction={runAction}
      />
    )

  return (
    <div className="min-h-dvh bg-background">
      <AppHeader onCreate={() => setCreateOpen(true)} />

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Sandboxes</h1>
            <p className="text-[13px] text-muted-foreground">
              Isolated Docker Compose environments for feature development and review.
            </p>
          </div>
          <p
            className="flex h-5 items-center gap-1.5 text-xs whitespace-nowrap text-muted-foreground"
            aria-live="polite"
          >
            {(syncing || (isValidating && !isLoading)) && sandboxes ? (
              <>
                <Loader2 className="size-3 motion-safe:animate-spin" aria-hidden="true" />
                <span className="hidden sm:inline">Syncing status</span>
                <span className="sr-only sm:hidden">Syncing status</span>
              </>
            ) : sandboxes ? (
              <span className="font-mono tabular-nums">
                {visible.length} of {list.length}
              </span>
            ) : null}
          </p>
        </div>

        <div className="overflow-hidden rounded-md border bg-surface">
          {list.length > 0 && (
            <SandboxToolbar
              query={query}
              onQueryChange={setQuery}
              filter={filter}
              onFilterChange={setFilter}
              counts={counts}
            />
          )}
          {body}
        </div>
      </main>

      <SandboxDetailsSheet
        sandbox={selected}
        open={detailsOpen && selected !== null}
        onOpenChange={setDetailsOpen}
        pendingAction={selected ? pending[selected.id] : undefined}
        onAction={runAction}
      />

      <CreateSandboxDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(sandbox) => {
          setCreateOpen(false)
          resetFilters()
          openDetails(sandbox.id)
        }}
      />
    </div>
  )
}
