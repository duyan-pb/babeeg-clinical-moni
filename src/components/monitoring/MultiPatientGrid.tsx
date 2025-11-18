import { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { WifiHigh, WifiSlash, BatteryChargingVertical, BatteryWarning, ArrowRight } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface PatientBed {
  id: string
  bedNumber: string
  patientId: string
  streamHealth: 'good' | 'degraded' | 'disconnected'
  battery: number
  connectivity: 'wifi' | 'ethernet' | 'disconnected'
  seizureProbability: number
  acuity: 'high' | 'medium' | 'low'
  lastUpdate: string
}

const SAMPLE_BEDS: PatientBed[] = [
  { id: 'bed-1', bedNumber: 'NICU-01', patientId: 'Neo-101', streamHealth: 'good', battery: 95, connectivity: 'wifi', seizureProbability: 0.12, acuity: 'low', lastUpdate: '2s ago' },
  { id: 'bed-2', bedNumber: 'NICU-02', patientId: 'Neo-102', streamHealth: 'good', battery: 78, connectivity: 'ethernet', seizureProbability: 0.68, acuity: 'high', lastUpdate: '1s ago' },
  { id: 'bed-3', bedNumber: 'NICU-03', patientId: 'Neo-103', streamHealth: 'degraded', battery: 45, connectivity: 'wifi', seizureProbability: 0.34, acuity: 'medium', lastUpdate: '5s ago' },
  { id: 'bed-4', bedNumber: 'NICU-04', patientId: 'Neo-104', streamHealth: 'good', battery: 100, connectivity: 'ethernet', seizureProbability: 0.08, acuity: 'low', lastUpdate: '1s ago' },
  { id: 'bed-5', bedNumber: 'NICU-05', patientId: 'Neo-105', streamHealth: 'disconnected', battery: 12, connectivity: 'disconnected', seizureProbability: 0.0, acuity: 'high', lastUpdate: '45s ago' },
  { id: 'bed-6', bedNumber: 'NICU-06', patientId: 'Neo-106', streamHealth: 'good', battery: 88, connectivity: 'wifi', seizureProbability: 0.21, acuity: 'low', lastUpdate: '2s ago' },
]

export function MultiPatientGrid() {
  const [beds] = useState<PatientBed[]>(SAMPLE_BEDS)
  const [sortBy, setSortBy] = useState<'bed' | 'acuity'>('bed')
  const [filterAcuity, setFilterAcuity] = useState<'all' | 'high' | 'medium' | 'low'>('all')

  const filteredBeds = beds
    .filter(bed => filterAcuity === 'all' || bed.acuity === filterAcuity)
    .sort((a, b) => {
      if (sortBy === 'acuity') {
        const acuityOrder = { high: 0, medium: 1, low: 2 }
        return acuityOrder[a.acuity] - acuityOrder[b.acuity]
      }
      return a.bedNumber.localeCompare(b.bedNumber)
    })

  const handleDrillDown = (bed: PatientBed) => {
    toast.info(`Opening detailed view for ${bed.patientId}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold">Multi-Patient Monitor</h3>
          <Badge variant="outline">{beds.length} beds</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterAcuity} onValueChange={(v) => setFilterAcuity(v as typeof filterAcuity)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Acuity</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bed">Sort by Bed</SelectItem>
              <SelectItem value="acuity">Sort by Acuity</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredBeds.map((bed) => (
          <Card 
            key={bed.id}
            className={`transition-all hover:shadow-md ${
              bed.streamHealth === 'disconnected' ? 'opacity-60' : ''
            }`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{bed.bedNumber}</div>
                  <div className="text-xs text-muted-foreground">{bed.patientId}</div>
                </div>
                <Badge 
                  variant={
                    bed.acuity === 'high' ? 'destructive' :
                    bed.acuity === 'medium' ? 'outline' :
                    'outline'
                  }
                  className={
                    bed.acuity === 'medium' ? 'bg-[oklch(0.70_0.18_75)] text-white' :
                    bed.acuity === 'low' ? 'bg-[oklch(0.60_0.15_145)] text-white' :
                    ''
                  }
                >
                  {bed.acuity}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-1">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    bed.streamHealth === 'good' ? 'bg-[oklch(0.60_0.15_145)] text-white' :
                    bed.streamHealth === 'degraded' ? 'bg-[oklch(0.70_0.18_75)] text-white' :
                    'bg-[oklch(0.55_0.22_25)] text-white'
                  }`}
                >
                  Stream: {bed.streamHealth}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {bed.connectivity === 'wifi' && <WifiHigh className="mr-1 h-3 w-3" />}
                  {bed.connectivity === 'disconnected' && <WifiSlash className="mr-1 h-3 w-3" />}
                  {bed.connectivity}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${
                    bed.battery < 20 ? 'bg-[oklch(0.55_0.22_25)] text-white' :
                    bed.battery < 50 ? 'bg-[oklch(0.70_0.18_75)] text-white' :
                    ''
                  }`}
                >
                  {bed.battery < 20 ? (
                    <BatteryWarning className="mr-1 h-3 w-3" />
                  ) : (
                    <BatteryChargingVertical className="mr-1 h-3 w-3" />
                  )}
                  {bed.battery}%
                </Badge>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Seizure Probability</span>
                  <span className={`font-medium ${
                    bed.seizureProbability >= 0.6 ? 'text-[oklch(0.55_0.22_25)]' :
                    bed.seizureProbability >= 0.4 ? 'text-[oklch(0.70_0.18_75)]' :
                    'text-muted-foreground'
                  }`}>
                    {(bed.seizureProbability * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div 
                    className={`h-full rounded-full transition-all ${
                      bed.seizureProbability >= 0.6 ? 'bg-[oklch(0.55_0.22_25)]' :
                      bed.seizureProbability >= 0.4 ? 'bg-[oklch(0.70_0.18_75)]' :
                      'bg-[oklch(0.60_0.15_145)]'
                    }`}
                    style={{ width: `${bed.seizureProbability * 100}%` }}
                  />
                </div>
              </div>

              <div className="h-16 rounded border border-border bg-muted/20 p-2">
                <div className="text-[10px] text-muted-foreground">Mini trend sparkline</div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Updated {bed.lastUpdate}</span>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => handleDrillDown(bed)}
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
