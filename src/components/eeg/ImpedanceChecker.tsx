import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ArrowClockwise, CheckCircle, Warning, XCircle } from '@phosphor-icons/react'
import { toast } from 'sonner'
import headOutline from '@/assets/images/head-outline.svg'

export interface ElectrodeImpedance {
  id: string
  label: string
  value: number
  status: 'ok' | 'warn' | 'error' | 'checking'
  type: 'electrode' | 'reference' | 'ground'
  x?: number
  y?: number
}

const IMPEDANCE_THRESHOLDS = {
  ok: 5,
  warn: 10
}

const STANDARD_ELECTRODES = [
  { id: 'fp1', label: 'Fp1', type: 'electrode' as const, x: 35, y: 15 },
  { id: 'fp2', label: 'Fp2', type: 'electrode' as const, x: 65, y: 15 },
  { id: 'f7', label: 'F7', type: 'electrode' as const, x: 15, y: 30 },
  { id: 'f3', label: 'F3', type: 'electrode' as const, x: 35, y: 30 },
  { id: 'fz', label: 'Fz', type: 'electrode' as const, x: 50, y: 25 },
  { id: 'f4', label: 'F4', type: 'electrode' as const, x: 65, y: 30 },
  { id: 'f8', label: 'F8', type: 'electrode' as const, x: 85, y: 30 },
  { id: 't3', label: 'T3', type: 'electrode' as const, x: 10, y: 50 },
  { id: 'c3', label: 'C3', type: 'electrode' as const, x: 35, y: 50 },
  { id: 'cz', label: 'Cz', type: 'electrode' as const, x: 50, y: 50 },
  { id: 'c4', label: 'C4', type: 'electrode' as const, x: 65, y: 50 },
  { id: 't4', label: 'T4', type: 'electrode' as const, x: 90, y: 50 },
  { id: 'p3', label: 'P3', type: 'electrode' as const, x: 35, y: 70 },
  { id: 'pz', label: 'Pz', type: 'electrode' as const, x: 50, y: 70 },
  { id: 'p4', label: 'P4', type: 'electrode' as const, x: 65, y: 70 },
  { id: 'o1', label: 'O1', type: 'electrode' as const, x: 35, y: 85 },
  { id: 'oz', label: 'Oz', type: 'electrode' as const, x: 50, y: 90 },
  { id: 'o2', label: 'O2', type: 'electrode' as const, x: 65, y: 85 },
  { id: 'ref', label: 'REF', type: 'reference' as const },
  { id: 'gnd', label: 'GND', type: 'ground' as const },
]

function getStatusColor(status: ElectrodeImpedance['status']) {
  switch (status) {
    case 'ok': return 'oklch(0.60 0.15 145)'
    case 'warn': return 'oklch(0.70 0.18 75)'
    case 'error': return 'oklch(0.55 0.22 25)'
    case 'checking': return 'oklch(0.55 0.12 200)'
  }
}

function getStatusIcon(status: ElectrodeImpedance['status']) {
  switch (status) {
    case 'ok': return <CheckCircle weight="fill" className="h-4 w-4" />
    case 'warn': return <Warning weight="fill" className="h-4 w-4" />
    case 'error': return <XCircle weight="fill" className="h-4 w-4" />
    case 'checking': return <ArrowClockwise className="h-4 w-4 animate-spin" />
  }
}

function simulateImpedanceValue(): number {
  const rand = Math.random()
  if (rand < 0.7) return Math.random() * 5
  if (rand < 0.9) return 5 + Math.random() * 5
  return 10 + Math.random() * 10
}

function getImpedanceStatus(value: number): 'ok' | 'warn' | 'error' {
  if (value < IMPEDANCE_THRESHOLDS.ok) return 'ok'
  if (value < IMPEDANCE_THRESHOLDS.warn) return 'warn'
  return 'error'
}

export function ImpedanceChecker() {
  const [electrodes, setElectrodes] = useState<ElectrodeImpedance[]>(
    STANDARD_ELECTRODES.map(e => ({
      ...e,
      value: 0,
      status: 'error' as const
    }))
  )
  const [isChecking, setIsChecking] = useState(false)
  const [hoveredElectrode, setHoveredElectrode] = useState<string | null>(null)

  const checkImpedance = async () => {
    setIsChecking(true)
    toast.info('Starting impedance check...')

    setElectrodes(electrodes.map(e => ({ ...e, status: 'checking' as const })))

    for (let i = 0; i < electrodes.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 100))
      
      setElectrodes(prev => {
        const updated = [...prev]
        const value = simulateImpedanceValue()
        updated[i] = {
          ...updated[i],
          value,
          status: getImpedanceStatus(value)
        }
        return updated
      })
    }

    setIsChecking(false)
    
    const okCount = electrodes.filter(e => getImpedanceStatus(e.value) === 'ok').length
    const warnCount = electrodes.filter(e => getImpedanceStatus(e.value) === 'warn').length
    const errorCount = electrodes.filter(e => getImpedanceStatus(e.value) === 'error').length
    
    if (errorCount > 0) {
      toast.error(`Impedance check complete: ${errorCount} electrode${errorCount !== 1 ? 's' : ''} need attention`)
    } else if (warnCount > 0) {
      toast.warning(`Impedance check complete: ${warnCount} electrode${warnCount !== 1 ? 's' : ''} in warning range`)
    } else {
      toast.success('Impedance check complete: All electrodes OK')
    }
  }

  const okCount = electrodes.filter(e => e.status === 'ok').length
  const warnCount = electrodes.filter(e => e.status === 'warn').length
  const errorCount = electrodes.filter(e => e.status === 'error').length
  const progress = (okCount / electrodes.length) * 100

  const scalpElectrodes = electrodes.filter(e => e.x !== undefined && e.y !== undefined)
  const systemElectrodes = electrodes.filter(e => e.x === undefined || e.y === undefined)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Electrode Impedance Check</CardTitle>
          <Button 
            size="sm" 
            onClick={checkImpedance}
            disabled={isChecking}
          >
            <ArrowClockwise className={`mr-2 ${isChecking ? 'animate-spin' : ''}`} />
            {isChecking ? 'Checking...' : 'Check Impedance'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Overall Quality</span>
            <span className="font-medium">{progress.toFixed(0)}%</span>
          </div>
          <Progress value={progress} />
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge 
            variant="outline" 
            style={{ 
              borderColor: getStatusColor('ok'),
              color: getStatusColor('ok')
            }}
          >
            <CheckCircle weight="fill" className="mr-1 h-3 w-3" />
            OK: {okCount} (&lt; {IMPEDANCE_THRESHOLDS.ok}kΩ)
          </Badge>
          <Badge 
            variant="outline"
            style={{ 
              borderColor: getStatusColor('warn'),
              color: getStatusColor('warn')
            }}
          >
            <Warning weight="fill" className="mr-1 h-3 w-3" />
            Warn: {warnCount} ({IMPEDANCE_THRESHOLDS.ok}-{IMPEDANCE_THRESHOLDS.warn}kΩ)
          </Badge>
          <Badge 
            variant="outline"
            style={{ 
              borderColor: getStatusColor('error'),
              color: getStatusColor('error')
            }}
          >
            <XCircle weight="fill" className="mr-1 h-3 w-3" />
            Error: {errorCount} (&gt; {IMPEDANCE_THRESHOLDS.warn}kΩ)
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Scalp Electrode Map</h3>
            <div className="relative mx-auto aspect-[4/5] w-full max-w-sm rounded-lg border border-border bg-muted/20 p-4">
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
                  {scalpElectrodes.map(electrode => {
                    if (!electrode.x || !electrode.y) return null
                    
                    const isHovered = hoveredElectrode === electrode.id
                    const radius = isHovered ? 4.5 : 3.5
                    const adjustedY = electrode.y * 1.1 + 5

                    return (
                      <g key={electrode.id}>
                        <circle
                          cx={electrode.x}
                          cy={adjustedY}
                          r={radius}
                          fill={getStatusColor(electrode.status)}
                          stroke="white"
                          strokeWidth="1.2"
                          className="cursor-pointer transition-all"
                          onMouseEnter={() => setHoveredElectrode(electrode.id)}
                          onMouseLeave={() => setHoveredElectrode(null)}
                        />
                        {electrode.status === 'checking' && (
                          <circle
                            cx={electrode.x}
                            cy={adjustedY}
                            r={radius + 2}
                            fill="none"
                            stroke={getStatusColor('checking')}
                            strokeWidth="0.8"
                            opacity="0.6"
                            className="animate-ping"
                          />
                        )}
                        <text
                          x={electrode.x}
                          y={adjustedY - 6}
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
              <div className="rounded border border-border bg-card p-3 text-center text-sm">
                <div className="font-medium">
                  {electrodes.find(e => e.id === hoveredElectrode)?.label}
                </div>
                <div className="text-xs text-muted-foreground">
                  {electrodes.find(e => e.id === hoveredElectrode)?.status === 'checking' 
                    ? 'Measuring...' 
                    : `${electrodes.find(e => e.id === hoveredElectrode)?.value.toFixed(1)} kΩ - ${electrodes.find(e => e.id === hoveredElectrode)?.status.toUpperCase()}`
                  }
                </div>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-medium">Electrode Details</h3>
            <ScrollArea className="h-[400px]">
              <div className="space-y-2 pr-4">
                {electrodes.map(electrode => (
                  <div
                    key={electrode.id}
                    className="flex items-center justify-between rounded border border-border bg-card p-3 transition-colors hover:bg-muted/30"
                    onMouseEnter={() => electrode.x !== undefined && setHoveredElectrode(electrode.id)}
                    onMouseLeave={() => setHoveredElectrode(null)}
                  >
                    <div className="flex items-center gap-2">
                      <div style={{ color: getStatusColor(electrode.status) }}>
                        {getStatusIcon(electrode.status)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{electrode.label}</span>
                          {electrode.type !== 'electrode' && (
                            <Badge variant="secondary" className="text-xs">
                              {electrode.type.toUpperCase()}
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {electrode.status === 'checking' 
                            ? 'Measuring...' 
                            : `${electrode.value.toFixed(1)} kΩ`
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
