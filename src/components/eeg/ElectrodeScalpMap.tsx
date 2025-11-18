import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Warning, XCircle } from '@phosphor-icons/react'
import headOutline from '@/assets/images/head-outline.svg'

export interface ElectrodePosition {
  id: string
  label: string
  x: number
  y: number
  status: 'ok' | 'warn' | 'error' | 'inactive'
}

const ELECTRODE_POSITIONS: ElectrodePosition[] = [
  { id: 'fp1', label: 'Fp1', x: 35, y: 15, status: 'ok' },
  { id: 'fp2', label: 'Fp2', x: 65, y: 15, status: 'ok' },
  { id: 'f7', label: 'F7', x: 15, y: 30, status: 'ok' },
  { id: 'f3', label: 'F3', x: 35, y: 30, status: 'warn' },
  { id: 'fz', label: 'Fz', x: 50, y: 25, status: 'ok' },
  { id: 'f4', label: 'F4', x: 65, y: 30, status: 'ok' },
  { id: 'f8', label: 'F8', x: 85, y: 30, status: 'ok' },
  { id: 't3', label: 'T3', x: 10, y: 50, status: 'ok' },
  { id: 'c3', label: 'C3', x: 35, y: 50, status: 'ok' },
  { id: 'cz', label: 'Cz', x: 50, y: 50, status: 'ok' },
  { id: 'c4', label: 'C4', x: 65, y: 50, status: 'ok' },
  { id: 't4', label: 'T4', x: 90, y: 50, status: 'ok' },
  { id: 't5', label: 'T5', x: 15, y: 70, status: 'inactive' },
  { id: 'p3', label: 'P3', x: 35, y: 70, status: 'ok' },
  { id: 'pz', label: 'Pz', x: 50, y: 70, status: 'ok' },
  { id: 'p4', label: 'P4', x: 65, y: 70, status: 'ok' },
  { id: 't6', label: 'T6', x: 85, y: 70, status: 'inactive' },
  { id: 'o1', label: 'O1', x: 35, y: 85, status: 'ok' },
  { id: 'oz', label: 'Oz', x: 50, y: 90, status: 'ok' },
  { id: 'o2', label: 'O2', x: 65, y: 85, status: 'ok' },
]

function getStatusColor(status: ElectrodePosition['status']) {
  switch (status) {
    case 'ok': return 'oklch(0.60 0.15 145)'
    case 'warn': return 'oklch(0.70 0.18 75)'
    case 'error': return 'oklch(0.55 0.22 25)'
    case 'inactive': return 'oklch(0.70 0 0)'
  }
}

export function ElectrodeScalpMap() {
  const [hoveredElectrode, setHoveredElectrode] = useState<string | null>(null)
  const [selectedMontage, setSelectedMontage] = useState<'10-20' | '10-10'>('10-20')

  const activeElectrodes = ELECTRODE_POSITIONS.filter(e => e.status !== 'inactive')
  const okCount = activeElectrodes.filter(e => e.status === 'ok').length
  const warnCount = activeElectrodes.filter(e => e.status === 'warn').length
  const errorCount = activeElectrodes.filter(e => e.status === 'error').length

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Electrode Scalp Map</CardTitle>
          <Badge variant="outline">{selectedMontage} System</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant="outline"
            style={{ 
              borderColor: getStatusColor('ok'),
              color: getStatusColor('ok')
            }}
          >
            <CheckCircle weight="fill" className="mr-1 h-3 w-3" />
            OK: {okCount}
          </Badge>
          <Badge 
            variant="outline"
            style={{ 
              borderColor: getStatusColor('warn'),
              color: getStatusColor('warn')
            }}
          >
            <Warning weight="fill" className="mr-1 h-3 w-3" />
            Warn: {warnCount}
          </Badge>
          {errorCount > 0 && (
            <Badge 
              variant="outline"
              style={{ 
                borderColor: getStatusColor('error'),
                color: getStatusColor('error')
              }}
            >
              <XCircle weight="fill" className="mr-1 h-3 w-3" />
              Error: {errorCount}
            </Badge>
          )}
        </div>

        <div className="relative mx-auto aspect-[4/5] w-full max-w-md">
          <div className="relative h-full w-full">
            <img 
              src={headOutline} 
              alt="Head outline" 
              className="absolute inset-0 h-full w-full object-contain opacity-60"
            />
            <svg
              viewBox="0 0 100 125"
              className="relative h-full w-full"
              style={{ filter: 'drop-shadow(0 1px 2px rgb(0 0 0 / 0.1))' }}
            >
              {ELECTRODE_POSITIONS.map(electrode => {
                const isHovered = hoveredElectrode === electrode.id
                const radius = isHovered ? 4 : 3
                const adjustedY = electrode.y * 1.1 + 5

                return (
                  <g key={electrode.id}>
                    <circle
                      cx={electrode.x}
                      cy={adjustedY}
                      r={radius}
                      fill={getStatusColor(electrode.status)}
                      stroke="white"
                      strokeWidth="1"
                      className="cursor-pointer transition-all"
                      onMouseEnter={() => setHoveredElectrode(electrode.id)}
                      onMouseLeave={() => setHoveredElectrode(null)}
                    />
                    <text
                      x={electrode.x}
                      y={adjustedY - 5}
                      textAnchor="middle"
                      fontSize="3"
                      fontWeight={isHovered ? 'bold' : 'normal'}
                      fill="oklch(0.20 0 0)"
                      className="pointer-events-none select-none transition-all"
                      style={{ 
                        fontFamily: 'Inter, sans-serif',
                        fontSize: isHovered ? '3.5px' : '3px'
                      }}
                    >
                      {electrode.label}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>

        {hoveredElectrode && (
          <div className="rounded border border-border bg-muted/50 p-3 text-center text-sm">
            <div className="font-medium">
              {ELECTRODE_POSITIONS.find(e => e.id === hoveredElectrode)?.label}
            </div>
            <div className="text-xs text-muted-foreground">
              Status: {ELECTRODE_POSITIONS.find(e => e.id === hoveredElectrode)?.status.toUpperCase()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
