import { AlertCircle, Boxes, Plus, SearchX } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'

function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon: ReactNode
  title: string
  description: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="mb-3 flex size-8 items-center justify-center rounded-md border bg-muted text-muted-foreground">
        {icon}
      </span>
      <h2 className="text-sm font-semibold">{title}</h2>
      <p className="mt-1 max-w-sm text-[13px] text-muted-foreground">{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function NoSandboxes({ onCreate }: { onCreate: () => void }) {
  return (
    <EmptyState
      icon={<Boxes className="size-4" aria-hidden="true" />}
      title="No sandboxes yet"
      description="Create an isolated Docker Compose environment with PHP, nginx, and PostgreSQL."
      action={
        <Button size="sm" onClick={onCreate}>
          <Plus aria-hidden="true" />
          Create sandbox
        </Button>
      }
    />
  )
}

export function NoResults({ query, onReset }: { query: string; onReset: () => void }) {
  return (
    <EmptyState
      icon={<SearchX className="size-4" aria-hidden="true" />}
      title="No matching sandboxes"
      description={
        query ? (
          <>
            Nothing matches <span className="font-mono text-foreground">{`"${query}"`}</span> with the
            current filter.
          </>
        ) : (
          'No sandboxes have this status.'
        )
      }
      action={
        <Button size="sm" variant="outline" onClick={onReset}>
          Clear filters
        </Button>
      }
    />
  )
}

export function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <EmptyState
      icon={<AlertCircle className="size-4 text-danger" aria-hidden="true" />}
      title="Could not load sandboxes"
      description="The sandbox list could not be retrieved."
      action={
        <Button size="sm" variant="outline" onClick={onRetry}>
          Retry
        </Button>
      }
    />
  )
}
