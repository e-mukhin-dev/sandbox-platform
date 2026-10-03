'use client'

import { useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { STATUS_FILTERS, type StatusFilter } from '@/lib/sandbox-status'
import { cn } from '@/lib/utils'

interface SandboxToolbarProps {
  query: string
  onQueryChange: (value: string) => void
  filter: StatusFilter
  onFilterChange: (value: StatusFilter) => void
  counts: Record<StatusFilter, number>
}

export function SandboxToolbar({
  query,
  onQueryChange,
  filter,
  onFilterChange,
  counts,
}: SandboxToolbarProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement
      const isTyping = target.closest('input, textarea, select, [contenteditable="true"]')
      if (event.key === '/' && !isTyping && !event.metaKey && !event.ctrlKey) {
        event.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <div className="flex flex-col gap-2 border-b px-3 py-2 md:flex-row md:items-center md:justify-between">
      <div
        role="group"
        aria-label="Filter by status"
        className="-mx-1 flex items-center gap-0.5 overflow-x-auto px-1"
      >
        {STATUS_FILTERS.map((option) => {
          const active = filter === option.value
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onFilterChange(option.value)}
              className={cn(
                'inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2 text-[13px] whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
                active
                  ? 'bg-accent font-medium text-foreground'
                  : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground',
              )}
            >
              {option.label}
              <span
                className={cn(
                  'rounded-full px-1.5 font-mono text-[11px] tabular-nums',
                  active ? 'bg-background text-foreground' : 'bg-muted text-muted-foreground',
                )}
              >
                {counts[option.value]}
              </span>
            </button>
          )
        })}
      </div>

      <div className="relative w-full md:w-72">
        <label htmlFor="sandbox-search" className="sr-only">
          Search sandboxes
        </label>
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          ref={inputRef}
          id="sandbox-search"
          type="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && query) {
              event.preventDefault()
              onQueryChange('')
            }
          }}
          placeholder="Search name, owner, ID, service"
          className="h-7 bg-surface pr-8 pl-8 text-[13px] [&::-webkit-search-cancel-button]:hidden"
          autoComplete="off"
          spellCheck={false}
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              onQueryChange('')
              inputRef.current?.focus()
            }}
            className="absolute top-1/2 right-1.5 flex size-5 -translate-y-1/2 items-center justify-center rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="size-3.5" aria-hidden="true" />
          </button>
        ) : (
          <kbd
            className="pointer-events-none absolute top-1/2 right-2 hidden -translate-y-1/2 rounded-sm border bg-muted px-1 font-mono text-[10px] text-muted-foreground md:block"
            aria-hidden="true"
          >
            /
          </kbd>
        )}
      </div>
    </div>
  )
}
