import { mockSandboxApi } from './mock/mock-api'
import type { SandboxApi } from './types'

/**
 * Single switch point between the demo backend and Laravel.
 * To connect the real API: `export const sandboxApi = createHttpSandboxApi(process.env.NEXT_PUBLIC_API_URL)`
 */
export const sandboxApi: SandboxApi = mockSandboxApi

export const IS_MOCK_API = true

export * from './types'
