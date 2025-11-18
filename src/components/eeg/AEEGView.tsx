import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Bell, BellSlash, ChartLine } from '@phosphor-icons/react'

export function AEEGView() {
  const [nurseMode, setNurseMode] = useState(false)
  const [alarmsEnabled, setAlarmsEnabled] = useState(true)
  const [layout, setLayout] = useState('dual')
  const [upperMargin, setUpperMargin] = useState([25])
  const [lowerMargin, setLowerMargin] = useState([5])

  return (
    <div className="h-full overflow-auto">
      <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Neonatal aEEG View</h2>
          <Badge variant="outline">NICU Mode</Badge>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              id="nurse-mode"
              checked={nurseMode}
              onCheckedChange={setNurseMode}
            />
            <Label htmlFor="nurse-mode" className="text-sm">Nurse Mode</Label>
          </div>
          <Select value={layout} onValueChange={setLayout}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dual">Dual View (aEEG + Raw)</SelectItem>
              <SelectItem value="aeeg-only">aEEG Only</SelectItem>
              <SelectItem value="raw-only">Raw EEG Only</SelectItem>
              <SelectItem value="quad">Quad View</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Amplitude-Integrated EEG (aEEG)</CardTitle>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">6hr window</Badge>
                  <Badge variant="outline" className="text-xs">
                    <ChartLine className="mr-1 h-3 w-3" />
                    Semi-log scale
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-[300px] overflow-y-auto">
                <div className="h-64 rounded border border-border bg-gradient-to-b from-muted/20 to-background p-4">
                  <div className="flex h-full flex-col justify-between text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>100 µV</span>
                      <div className="flex-1 border-t border-dashed border-destructive/30 mx-2" />
                      <span className="text-destructive text-[10px]">Upper Margin</span>
                    </div>
                    <div className="text-center">
                      <div className="mb-1 font-medium text-foreground">Trend envelope visualization</div>
                      <div className="text-[10px]">Min/Max amplitude over time with background pattern classification</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>5 µV</span>
                      <div className="flex-1 border-t border-dashed border-destructive/30 mx-2" />
                      <span className="text-destructive text-[10px]">Lower Margin</span>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                  <span>6hr ago</span>
                  <Badge variant="secondary" className="text-xs">Continuous</Badge>
                  <span>Now</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Raw EEG (Multi-Channel)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] space-y-3 overflow-y-auto pr-2">
                {[
                  { name: 'F3-P3', id: 'ch1' },
                  { name: 'F4-P4', id: 'ch2' },
                  { name: 'C3-O1', id: 'ch3' },
                  { name: 'C4-O2', id: 'ch4' },
                  { name: 'T3-T5', id: 'ch5' },
                  { name: 'T4-T6', id: 'ch6' },
                  { name: 'Fp1-C3', id: 'ch7' },
                  { name: 'Fp2-C4', id: 'ch8' },
                ].map((channel) => (
                  <div key={channel.id} className="h-24 rounded border border-border bg-muted/20 p-3">
                    <div className="mb-1 text-xs font-medium">{channel.name}</div>
                    <div className="text-[10px] text-muted-foreground">10-second epoch with real-time waveform</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {!nurseMode && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Background Pattern Classification</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="rounded bg-[oklch(0.60_0.15_145)]/10 p-3">
                    <div className="font-medium">Continuous</div>
                    <div className="text-[10px] text-muted-foreground">Normal voltage</div>
                  </div>
                  <div className="rounded bg-[oklch(0.70_0.18_75)]/10 p-3">
                    <div className="font-medium">Discontinuous</div>
                    <div className="text-[10px] text-muted-foreground">Burst suppression</div>
                  </div>
                  <div className="rounded bg-muted p-3">
                    <div className="font-medium">Low Voltage</div>
                    <div className="text-[10px] text-muted-foreground">Suppressed activity</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Alarm Limits</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAlarmsEnabled(!alarmsEnabled)}
                >
                  {alarmsEnabled ? <Bell className="text-accent" /> : <BellSlash className="text-muted-foreground" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <Label>Upper Margin</Label>
                  <Badge variant="outline">{upperMargin[0]} µV</Badge>
                </div>
                <Slider
                  value={upperMargin}
                  onValueChange={setUpperMargin}
                  min={10}
                  max={50}
                  step={1}
                  disabled={!alarmsEnabled}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <Label>Lower Margin</Label>
                  <Badge variant="outline">{lowerMargin[0]} µV</Badge>
                </div>
                <Slider
                  value={lowerMargin}
                  onValueChange={setLowerMargin}
                  min={3}
                  max={10}
                  step={0.5}
                  disabled={!alarmsEnabled}
                />
              </div>

              <Separator />

              <div className="space-y-2 text-xs">
                <div className="font-medium">NICU Thresholds</div>
                <div className="space-y-1 text-[10px] text-muted-foreground">
                  <div>• Seizure detection: Active</div>
                  <div>• Discontinuity alert: 30s</div>
                  <div>• Low voltage alert: {'<'}5µV</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">NICU Layouts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                Standard 2-Channel
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                Bilateral Comparison
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                Full 8-Channel
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start text-xs">
                Seizure Detection
              </Button>
            </CardContent>
          </Card>

          {nurseMode && (
            <Alert>
              <AlertDescription className="text-xs">
                <div className="font-medium mb-1">Nurse Mode Active</div>
                Simplified view with essential monitoring only. Advanced controls hidden.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
      </div>
    </div>
  )
}
