'use client'

import { useId, useState, type FormEvent } from 'react'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { isValidationError, useCreateSandbox, useServices } from '@/hooks/use-sandboxes'
import type { CreateSandboxPayload, Sandbox, ServiceDefinition, ServiceName } from '@/lib/api'
import { cn } from '@/lib/utils'

type FieldName = 'project_name' | 'owner_email' | 'services'
type FieldErrors = Partial<Record<FieldName, string>>

interface FormState {
  projectName: string
  ownerEmail: string
  selected: Partial<Record<ServiceName, string>>
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(state: FormState): FieldErrors {
  const errors: FieldErrors = {}
  const name = state.projectName.trim()
  if (!name) errors.project_name = 'Project name is required.'
  else if (name.length < 3 || name.length > 30)
    errors.project_name = 'Project name must be between 3 and 30 characters.'

  const email = state.ownerEmail.trim()
  if (!email) errors.owner_email = 'Owner email is required.'
  else if (!EMAIL_PATTERN.test(email)) errors.owner_email = 'Enter a valid email address.'

  if (Object.keys(state.selected).length === 0) errors.services = 'Select at least one service.'
  return errors
}

function toPayload(state: FormState, catalog: ServiceDefinition[]): CreateSandboxPayload {
  return {
    project_name: state.projectName.trim(),
    owner_email: state.ownerEmail.trim(),
    services: catalog
      .filter((def) => state.selected[def.name])
      .map((def) => ({ name: def.name, version: state.selected[def.name] as string })),
  }
}

interface CreateSandboxDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated: (sandbox: Sandbox) => void
}

export function CreateSandboxDialog({ open, onOpenChange, onCreated }: CreateSandboxDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 p-0 sm:max-w-lg">
        {open && <CreateSandboxForm onCreated={onCreated} />}
      </DialogContent>
    </Dialog>
  )
}

function CreateSandboxForm({ onCreated }: { onCreated: (sandbox: Sandbox) => void }) {
  const { data: catalog, error: catalogError, isLoading: catalogLoading } = useServices()
  const createSandbox = useCreateSandbox()
  const [state, setState] = useState<FormState>({ projectName: '', ownerEmail: '', selected: {} })
  const [initializedSelection, setInitializedSelection] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [serverErrors, setServerErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const ids = { name: useId(), email: useId(), services: useId() }

  if (catalog && !initializedSelection) {
    setInitializedSelection(true)
    setState((prev) => ({
      ...prev,
      selected: Object.fromEntries(catalog.map((def) => [def.name, def.default_version])),
    }))
  }

  const clientErrors = submitted ? validate(state) : {}
  const errors: FieldErrors = { ...serverErrors, ...clientErrors }

  function update(patch: Partial<FormState>, field: FieldName) {
    setState((prev) => ({ ...prev, ...patch }))
    setServerErrors((prev) => ({ ...prev, [field]: undefined }))
    setFormError(null)
  }

  function toggleService(def: ServiceDefinition, checked: boolean) {
    const selected = { ...state.selected }
    if (checked) selected[def.name] = def.default_version
    else delete selected[def.name]
    update({ selected }, 'services')
  }

  function setVersion(name: ServiceName, version: string) {
    update({ selected: { ...state.selected, [name]: version } }, 'services')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting || !catalog) return
    setSubmitted(true)

    const found = validate(state)
    const firstInvalid = (['project_name', 'owner_email', 'services'] as const).find((f) => found[f])
    if (firstInvalid) {
      const target = { project_name: ids.name, owner_email: ids.email, services: ids.services }[firstInvalid]
      document.getElementById(target)?.focus()
      return
    }

    setSubmitting(true)
    try {
      const created = await createSandbox(toPayload(state, catalog))
      onCreated(created)
    } catch (error) {
      if (isValidationError(error) && error.fieldErrors) {
        setServerErrors(
          Object.fromEntries(
            Object.entries(error.fieldErrors).map(([key, messages]) => [key, messages[0]]),
          ) as FieldErrors,
        )
      } else {
        setFormError(error instanceof Error ? error.message : 'Could not create sandbox.')
      }
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex max-h-[calc(100dvh-2rem)] flex-col">
      <DialogHeader className="border-b px-4 py-3">
        <DialogTitle className="text-sm font-semibold">Create sandbox</DialogTitle>
        <DialogDescription className="text-xs">
          Provisions an isolated Docker Compose environment with the selected services.
        </DialogDescription>
      </DialogHeader>

      <div className="flex flex-col gap-4 overflow-y-auto px-4 py-4">
        <FormField
          id={ids.name}
          label="Project name"
          hint="3–30 characters. Used to identify the environment."
          error={errors.project_name}
        >
          <Input
            id={ids.name}
            value={state.projectName}
            onChange={(e) => update({ projectName: e.target.value }, 'project_name')}
            placeholder="feature-checkout"
            maxLength={30}
            autoComplete="off"
            spellCheck={false}
            autoFocus
            aria-invalid={Boolean(errors.project_name) || undefined}
            aria-describedby={`${ids.name}-desc`}
            className="font-mono text-[13px]"
          />
        </FormField>

        <FormField id={ids.email} label="Owner email" error={errors.owner_email}>
          <Input
            id={ids.email}
            type="email"
            value={state.ownerEmail}
            onChange={(e) => update({ ownerEmail: e.target.value }, 'owner_email')}
            placeholder="developer@example.com"
            autoComplete="email"
            aria-invalid={Boolean(errors.owner_email) || undefined}
            aria-describedby={`${ids.email}-desc`}
            className="text-[13px]"
          />
        </FormField>

        <fieldset
          aria-describedby={`${ids.services}-desc`}
          aria-invalid={Boolean(errors.services) || undefined}
        >
          <legend className="mb-1.5 text-[13px] font-medium">Services</legend>
          <div
            id={ids.services}
            tabIndex={-1}
            className={cn(
              'divide-y rounded-md border outline-none focus-visible:ring-2 focus-visible:ring-ring/50',
              errors.services && 'border-danger/50',
            )}
          >
            {catalogLoading && (
              <div className="flex items-center gap-2 px-3 py-3 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 motion-safe:animate-spin" aria-hidden="true" />
                Loading available services…
              </div>
            )}
            {catalogError && (
              <p className="px-3 py-3 text-xs text-danger">Could not load available services.</p>
            )}
            {catalog?.map((def) => (
              <ServiceRow
                key={def.name}
                definition={def}
                version={state.selected[def.name]}
                onToggle={(checked) => toggleService(def, checked)}
                onVersionChange={(version) => setVersion(def.name, version)}
              />
            ))}
          </div>
          <FieldMessage id={`${ids.services}-desc`} error={errors.services} />
        </fieldset>

        {catalog && (
          <details className="group rounded-md border bg-muted/40 text-xs">
            <summary className="cursor-pointer list-none px-3 py-2 text-muted-foreground select-none hover:text-foreground [&::-webkit-details-marker]:hidden">
              <span className="font-mono">POST /api/sandboxes</span>
              <span className="ml-2 group-open:hidden">· show request body</span>
              <span className="ml-2 hidden group-open:inline">· hide request body</span>
            </summary>
            <pre className="overflow-x-auto border-t px-3 py-2 font-mono text-[11px] leading-relaxed">
              {JSON.stringify(toPayload(state, catalog), null, 2)}
            </pre>
          </details>
        )}

        {formError && (
          <p role="alert" className="flex items-start gap-1.5 rounded-md border border-danger/30 bg-danger-muted px-3 py-2 text-xs text-danger">
            <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden="true" />
            {formError}
          </p>
        )}
      </div>

      <DialogFooter className="mx-0 mb-0 rounded-b-xl border-t bg-muted/40 px-4 py-3">
        <DialogClose render={<Button type="button" variant="outline" size="sm" disabled={submitting} />}>
          Cancel
        </DialogClose>
        <Button type="submit" size="sm" disabled={submitting || !catalog} aria-busy={submitting || undefined}>
          {submitting && <Loader2 className="motion-safe:animate-spin" aria-hidden="true" />}
          {submitting ? 'Creating…' : 'Create sandbox'}
        </Button>
      </DialogFooter>
    </form>
  )
}

function FormField({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id} className="text-[13px]">
        {label}
        <span className="text-danger" aria-hidden="true">
          *
        </span>
      </Label>
      {children}
      <FieldMessage id={`${id}-desc`} error={error} hint={hint} />
    </div>
  )
}

function FieldMessage({ id, error, hint }: { id: string; error?: string; hint?: string }) {
  if (!error && !hint) return <span id={id} hidden />
  return (
    <p
      id={id}
      className={cn('mt-1 flex items-center gap-1 text-xs', error ? 'text-danger' : 'text-muted-foreground')}
    >
      {error && <AlertCircle className="size-3 shrink-0" aria-hidden="true" />}
      {error ?? hint}
    </p>
  )
}

function ServiceRow({
  definition,
  version,
  onToggle,
  onVersionChange,
}: {
  definition: ServiceDefinition
  version: string | undefined
  onToggle: (checked: boolean) => void
  onVersionChange: (version: string) => void
}) {
  const checkboxId = useId()
  const checked = version !== undefined

  return (
    <div className={cn('flex items-center gap-3 px-3 py-2.5', !checked && 'bg-muted/30')}>
      <Checkbox id={checkboxId} checked={checked} onCheckedChange={(value) => onToggle(value === true)} />
      <label htmlFor={checkboxId} className="flex min-w-0 flex-1 cursor-pointer flex-col">
        <span className="text-[13px] font-medium">
          {definition.label}{' '}
          <span className="font-mono text-xs font-normal text-muted-foreground">{definition.name}</span>
        </span>
        <span className="truncate text-xs text-muted-foreground">{definition.description}</span>
      </label>
      <Select
        value={version ?? definition.default_version}
        onValueChange={(value) => value && onVersionChange(String(value))}
        disabled={!checked || definition.versions.length < 2}
      >
        <SelectTrigger
          size="sm"
          className="w-36 shrink-0 font-mono text-xs"
          aria-label={`${definition.label} version`}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {definition.versions.map((v) => (
            <SelectItem key={v} value={v} className="font-mono text-xs">
              {v}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
