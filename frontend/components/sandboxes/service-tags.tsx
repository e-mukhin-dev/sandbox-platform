import type { SandboxService } from '@/lib/api'
import { cn } from '@/lib/utils'

export function ServiceTag({ service }: { service: SandboxService }) {
  return (
    <span className="inline-flex h-5 items-center rounded-sm border bg-surface px-1.5 font-mono text-[11px] leading-none whitespace-nowrap">
      <span className="text-foreground">{service.name}</span>
      <span className="text-muted-foreground">:{service.version}</span>
    </span>
  )
}

export function ServiceTags({
  services,
  className,
}: {
  services: SandboxService[]
  className?: string
}) {
  return (
    <ul className={cn('flex flex-wrap gap-1', className)} aria-label="Services">
      {services.map((service) => (
        <li key={service.name}>
          <ServiceTag service={service} />
        </li>
      ))}
    </ul>
  )
}
