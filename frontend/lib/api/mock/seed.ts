import type { Sandbox, ServiceDefinition } from '../types'

export const MOCK_SERVICES: ServiceDefinition[] = [
  {
    name: 'php',
    label: 'PHP',
    description: 'PHP-FPM runtime',
    versions: ['8.3', '8.4'],
    default_version: '8.3',
  },
  {
    name: 'nginx',
    label: 'nginx',
    description: 'HTTP server and reverse proxy',
    versions: ['stable-alpine'],
    default_version: 'stable-alpine',
  },
  {
    name: 'postgres',
    label: 'PostgreSQL',
    description: 'Relational database',
    versions: ['17'],
    default_version: '17',
  },
]

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString()
}

function secondsAgo(seconds: number): string {
  return new Date(Date.now() - seconds * 1000).toISOString()
}

const FULL_STACK_83 = [
  { name: 'php', version: '8.3' },
  { name: 'nginx', version: 'stable-alpine' },
  { name: 'postgres', version: '17' },
] as const

const FULL_STACK_84 = [
  { name: 'php', version: '8.4' },
  { name: 'nginx', version: 'stable-alpine' },
  { name: 'postgres', version: '17' },
] as const

export function createSeedSandboxes(): Sandbox[] {
  return [
    {
      id: 'sbx_7k2m9qf4xa',
      project_name: 'feature-checkout',
      owner_email: 'maria.lopez@acme.dev',
      services: [...FULL_STACK_83],
      status: 'running',
      error: null,
      created_at: minutesAgo(60 * 26),
      updated_at: minutesAgo(42),
    },
    {
      id: 'sbx_3n8vd1rc0e',
      project_name: 'billing-api-v2',
      owner_email: 'j.chen@acme.dev',
      services: [...FULL_STACK_84],
      status: 'creating',
      error: null,
      created_at: secondsAgo(18),
      updated_at: secondsAgo(18),
    },
    {
      id: 'sbx_9p4tw6hz2b',
      project_name: 'legacy-reports',
      owner_email: 'sam.okafor@acme.dev',
      services: [
        { name: 'php', version: '8.3' },
        { name: 'nginx', version: 'stable-alpine' },
      ],
      status: 'stopping',
      error: null,
      created_at: minutesAgo(60 * 24 * 6),
      updated_at: secondsAgo(6),
    },
    {
      id: 'sbx_1c6ye5gk8m',
      project_name: 'search-reindex',
      owner_email: 'maria.lopez@acme.dev',
      services: [
        { name: 'php', version: '8.4' },
        { name: 'postgres', version: '17' },
      ],
      status: 'stopped',
      error: null,
      created_at: minutesAgo(60 * 24 * 3),
      updated_at: minutesAgo(60 * 5),
    },
    {
      id: 'sbx_5r0qa7nj3w',
      project_name: 'onboarding-flow',
      owner_email: 'priya.nair@acme.dev',
      services: [...FULL_STACK_83],
      status: 'starting',
      error: null,
      created_at: minutesAgo(60 * 50),
      updated_at: secondsAgo(4),
    },
    {
      id: 'sbx_8h2ub4ls6t',
      project_name: 'admin-dashboard',
      owner_email: 'd.weber@acme.dev',
      services: [...FULL_STACK_84],
      status: 'restarting',
      error: null,
      created_at: minutesAgo(60 * 9),
      updated_at: secondsAgo(9),
    },
    {
      id: 'sbx_4w9ec2pd7v',
      project_name: 'pg-migration-test',
      owner_email: 'j.chen@acme.dev',
      services: [
        { name: 'php', version: '8.4' },
        { name: 'nginx', version: 'stable-alpine' },
        { name: 'postgres', version: '17' },
      ],
      status: 'failed',
      error: [
        'Container sbx_4w9ec2pd7v-postgres-1  Error',
        'dependency failed to start: container sbx_4w9ec2pd7v-postgres-1 is unhealthy',
        '',
        'postgres-1  | FATAL:  database files are incompatible with server',
        'postgres-1  | DETAIL:  The data directory was initialized by PostgreSQL version 16,',
        'postgres-1  |          which is not compatible with this version 17.2.',
        '',
        'docker compose up exited with code 1',
      ].join('\n'),
      created_at: minutesAgo(60 * 3),
      updated_at: minutesAgo(60 * 3 - 2),
    },
    {
      id: 'sbx_2f5gm8ky1q',
      project_name: 'marketing-site',
      owner_email: 'priya.nair@acme.dev',
      services: [
        { name: 'php', version: '8.3' },
        { name: 'nginx', version: 'stable-alpine' },
      ],
      status: 'stopped',
      error: null,
      created_at: minutesAgo(60 * 24 * 14),
      updated_at: minutesAgo(60 * 24 * 2),
    },
  ]
}
