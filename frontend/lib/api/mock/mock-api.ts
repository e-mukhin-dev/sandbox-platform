import {
  ApiError,
  type CreateSandboxPayload,
  type Sandbox,
  type SandboxAction,
  type SandboxApi,
  type SandboxStatus,
} from '../types'
import { createSeedSandboxes, MOCK_SERVICES } from './seed'

/**
 * DEMO ONLY. An in-memory stand-in for the Laravel backend.
 * It mimics the real contract: lifecycle calls resolve immediately with a transitional
 * status (like a 202 Accepted), and a background "worker" settles the final status later,
 * which the UI only learns about by polling listSandboxes().
 */

const NETWORK_LATENCY_MS = { min: 250, max: 650 }

const TRANSITION_DURATION_MS: Record<'creating' | 'stopping' | 'starting' | 'restarting', number> =
  {
    creating: 7000,
    stopping: 3500,
    starting: 4500,
    restarting: 5500,
  }

const SEEDED_TRANSITION_DURATION_MS = 30_000

const ACTION_RULES: Record<SandboxAction, { from: SandboxStatus[]; to: SandboxStatus }> = {
  start: { from: ['stopped'], to: 'starting' },
  stop: { from: ['running'], to: 'stopping' },
  restart: { from: ['running'], to: 'restarting' },
}

const SETTLED_STATUS: Partial<Record<SandboxStatus, SandboxStatus>> = {
  creating: 'running',
  stopping: 'stopped',
  starting: 'running',
  restarting: 'running',
}

let store: Map<string, Sandbox> | null = null

function getStore(): Map<string, Sandbox> {
  if (store) return store

  const startEmpty =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === 'empty'
  const seed = startEmpty ? [] : createSeedSandboxes()
  store = new Map(seed.map((sandbox) => [sandbox.id, sandbox]))

  for (const sandbox of seed) {
    if (SETTLED_STATUS[sandbox.status]) {
      scheduleSettle(sandbox.id, sandbox.status, SEEDED_TRANSITION_DURATION_MS)
    }
  }
  return store
}

function delay(): Promise<void> {
  const ms = NETWORK_LATENCY_MS.min + Math.random() * (NETWORK_LATENCY_MS.max - NETWORK_LATENCY_MS.min)
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

function generateId(): string {
  const alphabet = '0123456789abcdefghjkmnpqrstvwxyz'
  let id = 'sbx_'
  for (let i = 0; i < 10; i++) id += alphabet[Math.floor(Math.random() * alphabet.length)]
  return id
}

function scheduleSettle(id: string, fromStatus: SandboxStatus, durationMs: number) {
  const target = SETTLED_STATUS[fromStatus]
  if (!target) return

  setTimeout(() => {
    const sandbox = store?.get(id)
    if (!sandbox || sandbox.status !== fromStatus) return
    store!.set(id, { ...sandbox, status: target, updated_at: new Date().toISOString() })
  }, durationMs)
}

function findOrThrow(id: string): Sandbox {
  const sandbox = getStore().get(id)
  if (!sandbox) throw new ApiError('Sandbox not found.', 404)
  return sandbox
}

function validatePayload(payload: CreateSandboxPayload) {
  const errors: Record<string, string[]> = {}
  const name = payload.project_name.trim()
  if (name.length < 3 || name.length > 30) {
    errors.project_name = ['The project name must be between 3 and 30 characters.']
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.owner_email.trim())) {
    errors.owner_email = ['The owner email must be a valid email address.']
  }
  if (payload.services.length === 0) {
    errors.services = ['Select at least one service.']
  }
  for (const service of payload.services) {
    const definition = MOCK_SERVICES.find((s) => s.name === service.name)
    if (!definition || !definition.versions.includes(service.version)) {
      errors.services = [`Unsupported version ${service.version} for ${service.name}.`]
    }
  }
  if (Object.keys(errors).length > 0) {
    throw new ApiError('The given data was invalid.', 422, errors)
  }
}

async function runAction(id: string, action: SandboxAction): Promise<Sandbox> {
  await delay()
  const sandbox = findOrThrow(id)
  const rule = ACTION_RULES[action]

  if (!rule.from.includes(sandbox.status)) {
    throw new ApiError(`Cannot ${action} a sandbox that is ${sandbox.status}.`, 409)
  }

  const accepted: Sandbox = { ...sandbox, status: rule.to, updated_at: new Date().toISOString() }
  getStore().set(id, accepted)
  scheduleSettle(id, rule.to, TRANSITION_DURATION_MS[rule.to as keyof typeof TRANSITION_DURATION_MS])
  return clone(accepted)
}

export const mockSandboxApi: SandboxApi = {
  async listSandboxes() {
    await delay()
    return clone(
      [...getStore().values()].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    )
  },

  async listServices() {
    await delay()
    return clone(MOCK_SERVICES)
  },

  async createSandbox(payload) {
    await delay()
    validatePayload(payload)

    const now = new Date().toISOString()
    const sandbox: Sandbox = {
      id: generateId(),
      project_name: payload.project_name.trim(),
      owner_email: payload.owner_email.trim(),
      services: payload.services.map((s) => ({ ...s })),
      status: 'creating',
      error: null,
      created_at: now,
      updated_at: now,
    }
    getStore().set(sandbox.id, sandbox)
    scheduleSettle(sandbox.id, 'creating', TRANSITION_DURATION_MS.creating)
    return clone(sandbox)
  },

  startSandbox: (id) => runAction(id, 'start'),
  stopSandbox: (id) => runAction(id, 'stop'),
  restartSandbox: (id) => runAction(id, 'restart'),
}
