'use client'

import { AlertCircle, Loader2, MoreHorizontal, PanelRightOpen, Play, RotateCw, Square } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Sandbox, SandboxAction } from '@/lib/api'
import {
  ACTION_LABELS,
  STATUS_META,
  allowedActions,
  isTransitional,
  visibleActions,
} from '@/lib/sandbox-status'

export const ACTION_ICONS: Record<SandboxAction, LucideIcon> = {
  start: Play,
  stop: Square,
  restart: RotateCw,
}

interface ActionProps {
  sandbox: Sandbox
  pendingAction?: SandboxAction
  onAction: (sandbox: Sandbox, action: SandboxAction) => void
}

export function SandboxRowMenu({
  sandbox,
  pendingAction,
  onAction,
  onOpenDetails,
}: ActionProps & { onOpenDetails: () => void }) {
  const allowed = pendingAction ? [] : allowedActions(sandbox.status)
  const transitional = isTransitional(sandbox.status)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label={`Actions for ${sandbox.project_name}`}
            onClick={(event) => event.stopPropagation()}
            onKeyDown={(event) => event.stopPropagation()}
          />
        }
      >
        {pendingAction ? (
          <Loader2 className="motion-safe:animate-spin" aria-hidden="true" />
        ) : (
          <MoreHorizontal aria-hidden="true" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48" onClick={(event) => event.stopPropagation()}>
        {(transitional || pendingAction) && (
          <>
            <DropdownMenuGroup>
              <DropdownMenuLabel className="flex items-center gap-1.5">
                <Loader2 className="size-3 motion-safe:animate-spin" aria-hidden="true" />
                {pendingAction
                  ? 'Sending request…'
                  : `${STATUS_META[sandbox.status].label}… actions locked`}
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
          </>
        )}

        <DropdownMenuItem onClick={onOpenDetails}>
          <PanelRightOpen aria-hidden="true" />
          View details
        </DropdownMenuItem>

        {sandbox.status === 'failed' && (
          <DropdownMenuItem onClick={onOpenDetails}>
            <AlertCircle aria-hidden="true" />
            View error
          </DropdownMenuItem>
        )}

        {visibleActions(sandbox.status).length > 0 && <DropdownMenuSeparator />}
        {visibleActions(sandbox.status).map((action) => {
          const Icon = ACTION_ICONS[action]
          return (
            <DropdownMenuItem
              key={action}
              disabled={!allowed.includes(action)}
              onClick={() => onAction(sandbox, action)}
            >
              <Icon aria-hidden="true" />
              {ACTION_LABELS[action].idle}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function SandboxActionButtons({ sandbox, pendingAction, onAction }: ActionProps) {
  const actions = visibleActions(sandbox.status)
  const allowed = pendingAction ? [] : allowedActions(sandbox.status)
  if (actions.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Lifecycle actions">
      {actions.map((action) => {
        const Icon = ACTION_ICONS[action]
        const isPending = pendingAction === action
        return (
          <Button
            key={action}
            variant="outline"
            size="sm"
            disabled={!allowed.includes(action)}
            aria-busy={isPending || undefined}
            onClick={() => onAction(sandbox, action)}
          >
            {isPending ? (
              <Loader2 className="motion-safe:animate-spin" aria-hidden="true" />
            ) : (
              <Icon aria-hidden="true" />
            )}
            {ACTION_LABELS[action].idle}
          </Button>
        )
      })}
    </div>
  )
}
