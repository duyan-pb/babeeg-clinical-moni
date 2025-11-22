import { Badge } from '@/components/ui/badge'
import type { Electrode } from '@/types'

interface ElectrodeGridProps {
  electrodes?: Electrode[]
}

export const defaultElectrodes: Electrode[] = [
  { id: 'fp1', label: 'Fp1', status: 'ok' },
  { id: 'fp2', label: 'Fp2', status: 'ok' },
  { id: 'f3', label: 'F3', status: 'warn' },
  { id: 'f4', label: 'F4', status: 'error' },
  { id: 'cz', label: 'Cz', status: 'ok' },
  { id: 'c3', label: 'C3', status: 'ok' },
  { id: 'c4', label: 'C4', status: 'error' },
  { id: 'p3', label: 'P3', status: 'ok' },
  { id: 'p4', label: 'P4', status: 'ok' },
  { id: 'o1', label: 'O1', status: 'warn' },
  { id: 'o2', label: 'O2', status: 'ok' },
  { id: 't3', label: 'T3', status: 'ok' },
  { id: 't4', label: 'T4', status: 'ok' },
  { id: 'pz', label: 'Pz', status: 'ok' },
  { id: 'oz', label: 'Oz', status: 'ok' },
]

function getStatusColor(status: Electrode['status']) {
  switch (status) {
    case 'ok':
      return 'bg-[oklch(0.60_0.15_145)] text-white border-[oklch(0.60_0.15_145)]'
    case 'warn':
      return 'bg-[oklch(0.70_0.18_75)] text-foreground border-[oklch(0.70_0.18_75)]'
    case 'error':
      return 'bg-[oklch(0.55_0.22_25)] text-white border-[oklch(0.55_0.22_25)]'
    default:
      return 'bg-muted text-muted-foreground border-border'
  }
}

export function ElectrodeGrid({ electrodes = defaultElectrodes }: ElectrodeGridProps) {
  return (
    <div>
      <div className="mb-4 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        {electrodes.map((electrode) => (
          <div
            key={electrode.id}
            className={`flex items-center justify-center rounded border px-3 py-2 text-sm font-medium ${getStatusColor(electrode.status)}`}
          >
            {electrode.label}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-[oklch(0.60_0.15_145)]" />
          <span>OK</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-[oklch(0.70_0.18_75)]" />
          <span>Warn</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-[oklch(0.55_0.22_25)]" />
          <span>Err</span>
        </div>
      </div>
    </div>
  )
}
