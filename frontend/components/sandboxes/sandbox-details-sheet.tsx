'use client'

import { useState, type ReactNode } from 'react'
import { AlertTriangle, Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { useNow, useServices } from '@/hooks/use-sandboxes'
import type { Sandbox, SandboxAction } from '@/lib/api'
import { formatAbsolute, formatElapsed, formatRelative } from '@/lib/format'
import { STATUS_META, isTransitional } from '@/lib/sandbox-status'
import { SandboxActionButtons } from './sandbox-actions'
import { StatusBadge } from './status-badge'

interface SandboxDetailsSheetProps {
  sandbox: Sandbox | null
  open: boolean
  onOpenChange: (open: boolean) => void
  pendingAction?: SandboxAction
  onAction: (sandbox: Sandbox, action: SandboxAction) => void
}

export function SandboxDetailsSheet({
  sandbox,
  open,
  onOpenChange,
  pendingAction,
  onAction,
}: SandboxDetailsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 bg-surface p-0 data-[side=right]:w-full data-[side=right]:sm:max-w-[460px]"
      >
        {sandbox && (
          <DetailsBody sandbox={sandbox} pendingAction={pendingAction} onAction={onAction} />
        )}
      </SheetContent>
    </Sheet>
  )
}

function DetailsBody({
  sandbox,
  pendingAction,
  onAction,
}: {
  sandbox: Sandbox
  pendingAction?: SandboxAction
  onAction: (sandbox: Sandbox, action: SandboxAction) => void
}) {
  const transitional = isTransitional(sandbox.status)
  const now = useNow(true)

  return (
    <>
      <SheetHeader className="gap-2 border-b px-4 pt-4 pb-3 pr-12">
        <div className="flex flex-wrap items-center gap-2">
          <SheetTitle className="font-mono text-base font-semibold break-all">
            {sandbox.project_name}
          </SheetTitle>
          <StatusBadge status={sandbox.status} />
        </div>
        <SheetDescription className="text-xs">
          Docker Compose environment · updated{' '}
          <time dateTime={sandbox.updated_at}>{formatRelative(sandbox.updated_at, now)}</time>
        </SheetDescription>
        <div className="pt-1">
          <SandboxActionButtons sandbox={sandbox} pendingAction={pendingAction} onAction={onAction} />
        </div>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto">
        <div aria-live="polite" aria-atomic="true">
          {transitional && <TransitionProgress sandbox={sandbox} now={now} />}
        </div>
        {sandbox.status === 'failed' && <ErrorBlock error={sandbox.error} />}

        <Section title="Overview">
          <dl className="grid grid-cols-[7.5rem_1fr] gap-x-3 gap-y-2 text-[13px]">
            <Field label="Sandbox ID">
              <span className="flex items-center gap-1">
                <span className="font-mono">{sandbox.id}</span>
                <CopyButton value={sandbox.id} label="Copy sandbox ID" iconOnly />
              </span>
            </Field>
            <Field label="Owner">
              <span className="break-all">{sandbox.owner_email}</span>
            </Field>
            <Field label="Created">
              <TimeValue iso={sandbox.created_at} now={now} />
            </Field>
            <Field label="Updated">
              <TimeValue iso={sandbox.updated_at} now={now} />
            </Field>
          </dl>
        </Section>

        <Section title="Services" count={sandbox.services.length}>
          <ServicesTable sandbox={sandbox} />
        </Section>

        <Section title="Access">
          <p className="mb-2 text-xs text-muted-foreground">
            These capabilities are planned and not yet available for sandboxes.
          </p>
          <ul className="divide-y rounded-md border text-[13px]">
            {['Public URL', 'SSH access', 'Mail testing'].map((item) => (
              <li key={item} className="flex items-center justify-between px-3 py-2">
                <span className="text-muted-foreground">{item}</span>
                <span className="rounded-sm border border-dashed px-1.5 py-px text-[11px] text-muted-foreground">
                  Planned
                </span>
              </li>
            ))}
          </ul>
        </Section>
      </div>
    </>
  )
}

function Section({ title, count, children }: { title: string; count?: number; children: ReactNode }) {
  return (
    <section className="border-b px-4 py-4 last:border-b-0">
      <h3 className="mb-3 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {title}
        {count !== undefined && (
          <span className="rounded-full bg-muted px-1.5 font-mono text-[11px] font-normal tracking-normal">
            {count}
          </span>
        )}
      </h3>
      {children}
    </section>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0">{children}</dd>
    </>
  )
}

function TimeValue({ iso, now }: { iso: string; now: number }) {
  return (
    <span className="flex flex-col">
      <time dateTime={iso} className="font-mono text-xs tabular-nums">
        {formatAbsolute(iso)}
      </time>
      <span className="text-xs text-muted-foreground">{formatRelative(iso, now)}</span>
    </span>
  )
}

function ServicesTable({ sandbox }: { sandbox: Sandbox }) {
  const { data: catalog } = useServices()

  return (
    <table className="w-full overflow-hidden rounded-md border text-[13px]">
      <thead className="bg-muted/50">
        <tr className="border-b">
          <th scope="col" className="h-7 px-3 text-left text-xs font-medium text-muted-foreground">
            Service
          </th>
          <th scope="col" className="h-7 px-3 text-left text-xs font-medium text-muted-foreground">
            Image
          </th>
          <th scope="col" className="h-7 px-3 text-left text-xs font-medium text-muted-foreground">
            Version
          </th>
        </tr>
      </thead>
      <tbody>
        {sandbox.services.map((service) => {
          const definition = catalog?.find((d) => d.name === service.name)
          return (
            <tr key={service.name} className="border-b last:border-b-0">
              <td className="px-3 py-2">{definition?.label ?? service.name}</td>
              <td className="px-3 py-2 font-mono text-xs text-muted-foreground">{service.name}</td>
              <td className="px-3 py-2 font-mono text-xs">{service.version}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function TransitionProgress({ sandbox, now }: { sandbox: Sandbox; now: number }) {
  const meta = STATUS_META[sandbox.status]
  return (
    <div className="border-b bg-warning-muted/60 px-4 py-3">
      <div className="flex items-center justify-between gap-3 text-[13px]">
        <span className="font-medium text-foreground">{meta.progressLabel}…</span>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">
          {formatElapsed(sandbox.updated_at, now)}
        </span>
      </div>
      <div
        className="relative mt-2 h-1 overflow-hidden rounded-full bg-warning/15"
        role="progressbar"
        aria-label={`${meta.label} in progress`}
        aria-valuetext="In progress"
      >
        <div className="absolute inset-y-0 w-1/3 rounded-full bg-warning motion-safe:animate-[indeterminate_1.4s_ease-in-out_infinite] motion-reduce:w-full motion-reduce:opacity-60" />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Request accepted. Lifecycle actions stay locked until the backend reports the new state.
      </p>
    </div>
  )
}

function ErrorBlock({ error }: { error: string | null }) {
  const message = error ?? 'The sandbox failed without reporting an error message.'
  return (
    <section className="border-b px-4 py-4" aria-labelledby="sandbox-error-heading">
      <div className="overflow-hidden rounded-md border border-danger/30">
        <div className="flex items-center justify-between gap-2 border-b border-danger/20 bg-danger-muted px-3 py-1.5">
          <h3
            id="sandbox-error-heading"
            className="flex items-center gap-1.5 text-[13px] font-medium text-danger"
          >
            <AlertTriangle className="size-3.5" aria-hidden="true" />
            Provisioning failed
          </h3>
          <CopyButton value={message} label="Copy error" />
        </div>
        <pre className="max-h-64 overflow-auto bg-surface px-3 py-2.5 font-mono text-xs leading-relaxed whitespace-pre-wrap break-words text-foreground">
          {message}
        </pre>
      </div>
    </section>
  )
}

function CopyButton({ value, label, iconOnly }: { value: string; label: string; iconOnly?: boolean }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  const Icon = copied ? Check : Copy
  if (iconOnly) {
    return (
      <Button variant="ghost" size="icon-xs" onClick={copy} aria-label={copied ? 'Copied' : label}>
        <Icon aria-hidden="true" />
      </Button>
    )
  }
  return (
    <Button variant="ghost" size="xs" onClick={copy} className="h-6">
      <Icon aria-hidden="true" />
      <span aria-live="polite">{copied ? 'Copied' : label}</span>
    </Button>
  )
}
