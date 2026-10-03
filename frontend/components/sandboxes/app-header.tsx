import { Boxes, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { IS_MOCK_API } from '@/lib/api'

export function AppHeader({ onCreate }: { onCreate: () => void }) {
  return (
    <header className="sticky top-0 z-30 border-b bg-surface">
      <div className="mx-auto flex h-12 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-foreground text-background"
            aria-hidden="true"
          >
            <Boxes className="size-3.5" />
          </span>
          <span className="truncate text-sm font-semibold tracking-tight">Sandbox Platform</span>
          {IS_MOCK_API && (
            <span
              className="hidden rounded-sm border border-dashed px-1.5 py-px font-mono text-[10px] tracking-wide text-muted-foreground uppercase sm:inline"
              title="Data comes from an in-memory mock API. No requests are sent to the Laravel backend."
            >
              Mock API
            </span>
          )}
        </div>
        <Button onClick={onCreate} size="sm" className="shrink-0">
          <Plus aria-hidden="true" />
          Create sandbox
        </Button>
      </div>
    </header>
  )
}
