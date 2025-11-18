import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Funnel, ArrowClockwise } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface FilterPreset {
  id: string
  name: string
  lowPass: number
  highPass: number
  notchFilter: boolean
  artifactReduction: boolean
}

const PRESETS: FilterPreset[] = [
  {
    id: 'nicu-artifact',
    name: 'NICU Artifact Reduction',
    lowPass: 0.5,
    highPass: 35,
    notchFilter: true,
    artifactReduction: true
  },
  {
    id: 'neonatal-bands',
    name: 'Neonatal Bands',
    lowPass: 0.3,
    highPass: 20,
    notchFilter: true,
    artifactReduction: false
  },
  {
    id: 'low-pass-default',
    name: 'Low-Pass Default',
    lowPass: 0.5,
    highPass: 70,
    notchFilter: false,
    artifactReduction: false
  },
  {
    id: 'high-pass-default',
    name: 'High-Pass Default',
    lowPass: 1.0,
    highPass: 100,
    notchFilter: false,
    artifactReduction: false
  },
]

export function ClinicalFilterPresets() {
  const [activePreset, setActivePreset] = useKV<string | null>('active-filter-preset', null)
  const [customLowPass, setCustomLowPass] = useState(0.5)
  const [customHighPass, setCustomHighPass] = useState(70)
  const [notchFilter, setNotchFilter] = useState(false)

  const handleApplyPreset = (preset: FilterPreset) => {
    setActivePreset(() => preset.id)
    setCustomLowPass(preset.lowPass)
    setCustomHighPass(preset.highPass)
    setNotchFilter(preset.notchFilter)
    toast.success(`Applied ${preset.name} filter preset`)
  }

  const handleReset = () => {
    setActivePreset(() => null)
    setCustomLowPass(0.5)
    setCustomHighPass(70)
    setNotchFilter(false)
    toast.info('Filter settings reset to defaults')
  }

  const getPresetBadgeClass = (presetId: string) => {
    return activePreset === presetId 
      ? 'bg-primary text-primary-foreground' 
      : 'hover:bg-muted'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Funnel className="h-5 w-5" />
            <CardTitle>Clinical Filter Presets</CardTitle>
          </div>
          {activePreset && (
            <Badge variant="default">
              {PRESETS.find(p => p.id === activePreset)?.name || 'Active'}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Quick Presets</Label>
          <div className="grid gap-2 md:grid-cols-2">
            {PRESETS.map((preset) => (
              <Button
                key={preset.id}
                variant="outline"
                className={getPresetBadgeClass(preset.id)}
                onClick={() => handleApplyPreset(preset)}
              >
                <div className="text-left">
                  <div className="text-sm font-medium">{preset.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {preset.lowPass}-{preset.highPass}Hz
                    {preset.notchFilter && ' • 50/60Hz notch'}
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Custom Filter Settings</Label>
            <Button size="sm" variant="ghost" onClick={handleReset}>
              <ArrowClockwise className="mr-1 h-4 w-4" />
              Reset
            </Button>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <Label>Low-Pass (Hz)</Label>
              <span className="font-mono text-xs">{customLowPass.toFixed(1)}</span>
            </div>
            <Slider
              value={[customLowPass]}
              onValueChange={([v]) => setCustomLowPass(v)}
              min={0.1}
              max={5}
              step={0.1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <Label>High-Pass (Hz)</Label>
              <span className="font-mono text-xs">{customHighPass.toFixed(0)}</span>
            </div>
            <Slider
              value={[customHighPass]}
              onValueChange={([v]) => setCustomHighPass(v)}
              min={10}
              max={200}
              step={5}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="notch-filter" className="text-sm">
              50/60Hz Notch Filter
            </Label>
            <input
              id="notch-filter"
              type="checkbox"
              checked={notchFilter}
              onChange={(e) => setNotchFilter(e.target.checked)}
              className="h-4 w-4"
            />
          </div>
        </div>

        <div className="rounded-lg bg-muted/30 p-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Active Filter Indicator</span>
            <Badge variant="outline" className="text-xs">
              {activePreset ? 'Preset Active' : 'Custom'}
            </Badge>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          <strong>Keyboard shortcuts:</strong> Ctrl+1 through Ctrl+4 for quick preset toggles
        </div>
      </CardContent>
    </Card>
  )
}
