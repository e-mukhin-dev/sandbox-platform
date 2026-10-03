import {
  ApiError,
  type AcceptedSandbox,
  type CreateSandboxPayload,
  type Sandbox,
  type SandboxApi,
  type ServiceDefinition,
} from './types'

/**
 * Laravel implementation of the SandboxApi contract.
 * Not used by the prototype — switch to it in lib/api/index.ts once the backend is reachable.
 */
export const ENDPOINTS = {
  sandboxes: '/api/sandboxes',
  services: '/api/services',
  start: (id: string) => `/api/sandboxes/${encodeURIComponent(id)}/start`,
  stop: (id: string) => `/api/sandboxes/${encodeURIComponent(id)}/stop`,
  restart: (id: string) => `/api/sandboxes/${encodeURIComponent(id)}/restart`,
} as const

interface LaravelResource<T> {
  data: T
}

interface LaravelValidationError {
  message: string
  errors?: Record<string, string[]>
}

async function request<T>(baseUrl: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as LaravelValidationError | null
    throw new ApiError(body?.message ?? response.statusText, response.status, body?.errors)
  }

  const body = (await response.json()) as LaravelResource<T>
  return body.data
}

export function createHttpSandboxApi(baseUrl = ''): SandboxApi {
  return {
    listSandboxes: () => request<Sandbox[]>(baseUrl, ENDPOINTS.sandboxes),
    listServices: () => request<ServiceDefinition[]>(baseUrl, ENDPOINTS.services),
    createSandbox: (payload: CreateSandboxPayload) =>
      request<AcceptedSandbox>(baseUrl, ENDPOINTS.sandboxes, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    startSandbox: (id) => request<AcceptedSandbox>(baseUrl, ENDPOINTS.start(id), { method: 'POST' }),
    stopSandbox: (id) => request<AcceptedSandbox>(baseUrl, ENDPOINTS.stop(id), { method: 'POST' }),
    restartSandbox: (id) =>
      request<AcceptedSandbox>(baseUrl, ENDPOINTS.restart(id), { method: 'POST' }),
  }
}
