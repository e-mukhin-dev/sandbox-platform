import { createHttpSandboxApi } from './http-client'
import type { SandboxApi } from './types'

export const sandboxApi: SandboxApi = createHttpSandboxApi()

export const IS_MOCK_API = false

export * from './types'