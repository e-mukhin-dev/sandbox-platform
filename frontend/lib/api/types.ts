export type SandboxStatus =
  | 'creating'
  | 'running'
  | 'stopping'
  | 'stopped'
  | 'starting'
  | 'restarting'
  | 'failed'

export type ServiceName = 'php' | 'nginx' | 'postgres'

export interface SandboxService {
  name: ServiceName
  version: string
}

export interface Sandbox {
  id: string
  project_name: string
  owner_email: string
  services: SandboxService[]
  status: SandboxStatus
  error: string | null
  created_at: string
  updated_at: string
  url: string
}

export interface ServiceDefinition {
  name: ServiceName
  label: string
  description: string
  versions: string[]
  default_version: string
}

export interface CreateSandboxPayload {
  project_name: string
  owner_email: string
  services: SandboxService[]
}

export type SandboxAction = 'start' | 'stop' | 'restart'

/**
 * Lifecycle endpoints respond with HTTP 202 Accepted: the request was queued,
 * not completed. The returned sandbox carries the transitional status
 * (e.g. "stopping"); the final status arrives via a later listSandboxes() call.
 */
export type AcceptedSandbox = Sandbox

export interface SandboxApi {
  listSandboxes(): Promise<Sandbox[]>
  listServices(): Promise<ServiceDefinition[]>
  createSandbox(payload: CreateSandboxPayload): Promise<AcceptedSandbox>
  startSandbox(id: string): Promise<AcceptedSandbox>
  stopSandbox(id: string): Promise<AcceptedSandbox>
  restartSandbox(id: string): Promise<AcceptedSandbox>
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}
