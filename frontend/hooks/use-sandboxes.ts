'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { toast } from 'sonner'
import {
  ApiError,
  sandboxApi,
  type CreateSandboxPayload,
  type Sandbox,
  type SandboxAction,
} from '@/lib/api'
import { ACTION_LABELS, isTransitional } from '@/lib/sandbox-status'

export const SANDBOXES_KEY = '/api/sandboxes'
export const SERVICES_KEY = '/api/services'

const POLL_INTERVAL_MS = 1500

export function useSandboxes() {
  return useSWR<Sandbox[]>(SANDBOXES_KEY, () => sandboxApi.listSandboxes(), {
    refreshInterval: (data) => (data?.some((s) => isTransitional(s.status)) ? POLL_INTERVAL_MS : 0),
    keepPreviousData: true,
  })
}

export function useServices() {
  return useSWR(SERVICES_KEY, () => sandboxApi.listServices(), {
    revalidateOnFocus: false,
  })
}

function upsert(list: Sandbox[] | undefined, sandbox: Sandbox): Sandbox[] {
  if (!list) return [sandbox]
  const exists = list.some((s) => s.id === sandbox.id)
  return exists ? list.map((s) => (s.id === sandbox.id ? sandbox : s)) : [sandbox, ...list]
}

const ACTION_CALLS: Record<SandboxAction, (id: string) => Promise<Sandbox>> = {
  start: (id) => sandboxApi.startSandbox(id),
  stop: (id) => sandboxApi.stopSandbox(id),
  restart: (id) => sandboxApi.restartSandbox(id),
}

export type PendingActions = Record<string, SandboxAction | undefined>

export function useSandboxActions() {
  const { mutate } = useSWRConfig()
  const [pending, setPending] = useState<PendingActions>({})
  const inFlight = useRef(new Set<string>())

  const runAction = useCallback(
    async (sandbox: Sandbox, action: SandboxAction) => {
      if (inFlight.current.has(sandbox.id)) return
      inFlight.current.add(sandbox.id)
      setPending((prev) => ({ ...prev, [sandbox.id]: action }))

      try {
        const accepted = await ACTION_CALLS[action](sandbox.id)
        await mutate<Sandbox[]>(SANDBOXES_KEY, (list) => upsert(list, accepted), { revalidate: false })
        toast.success(`${ACTION_LABELS[action].idle} requested`, {
          description: `${sandbox.project_name} is ${ACTION_LABELS[action].pending.toLowerCase()}.`,
        })
      } catch (error) {
        toast.error(`Could not ${action} ${sandbox.project_name}`, {
          description: error instanceof Error ? error.message : 'Unexpected error.',
        })
        void mutate(SANDBOXES_KEY)
      } finally {
        inFlight.current.delete(sandbox.id)
        setPending((prev) => {
          const next = { ...prev }
          delete next[sandbox.id]
          return next
        })
      }
    },
    [mutate],
  )

  return { pending, runAction }
}

export function useCreateSandbox() {
  const { mutate } = useSWRConfig()

  return useCallback(
    async (payload: CreateSandboxPayload) => {
      const created = await sandboxApi.createSandbox(payload)
      await mutate<Sandbox[]>(SANDBOXES_KEY, (list) => upsert(list, created), { revalidate: false })
      return created
    },
    [mutate],
  )
}

export function isValidationError(error: unknown): error is ApiError {
  return error instanceof ApiError && error.status === 422
}

/** Ticks while `active`, so elapsed timers update without polling the API. */
export function useNow(active: boolean, intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [active, intervalMs])
  return now
}
