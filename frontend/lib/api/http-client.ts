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

    return (await response.json()) as T
}

export function createHttpSandboxApi(baseUrl = ''): SandboxApi {
    async function sandboxRequest(
        path: string,
        init?: RequestInit,
    ): Promise<Sandbox> {
        const sandbox = await request<SandboxResponse>(baseUrl, path, init)

        return normalizeSandbox(sandbox)
    }

    return {
        async listSandboxes() {
            const sandboxes = await request<SandboxResponse[]>(
                baseUrl,
                ENDPOINTS.sandboxes,
            )

            return sandboxes.map(normalizeSandbox)
        },

        listServices: () =>
            request<ServiceDefinition[]>(baseUrl, ENDPOINTS.services),

        createSandbox: (payload: CreateSandboxPayload) =>
            sandboxRequest(ENDPOINTS.sandboxes, {
                method: 'POST',
                body: JSON.stringify(payload),
            }),

        startSandbox: (id) =>
            sandboxRequest(ENDPOINTS.start(id), { method: 'POST' }),

        stopSandbox: (id) =>
            sandboxRequest(ENDPOINTS.stop(id), { method: 'POST' }),

        restartSandbox: (id) =>
            sandboxRequest(ENDPOINTS.restart(id), { method: 'POST' }),
    }
}

type SandboxResponse = Omit<Sandbox, 'id' | 'error'> & {
    id: string | number
    error_message?: string | null
}

function normalizeSandbox(sandbox: SandboxResponse): Sandbox {
    const { error_message, ...rest } = sandbox

    return {
        ...rest,
        id: String(sandbox.id),
        error: error_message ?? null,
    }
}