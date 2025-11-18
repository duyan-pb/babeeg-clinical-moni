import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowClockwise, Play, Stop } from '@phosphor-icons/react'
import { ElectrodeGrid } from './ElectrodeGrid'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { MiniWaveform } from '@/components/eeg/MiniWaveform'

export function SetupTab() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">BabEEG Setup</h2>
        <div className="flex items-center gap-3">
          <Badge variant="outline">LSL Status: Disconnected</Badge>
          <Select>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Active stream" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stream1">EEG-Stream-01</SelectItem>
              <SelectItem value="stream2">EEG-Stream-02</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <ArrowClockwise className="mr-2" />
            Refresh
          </Button>
          <Button size="sm">
            <Play className="mr-2" />
            Start
          </Button>
          <Button variant="outline" size="sm">
            <Stop className="mr-2" />
            Stop
          </Button>
          <Button variant="outline" size="sm">License daemon</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Channels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">32</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sample Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">256 Hz</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Packet Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">0.02%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Buffer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">45%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Impedance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">Good</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Battery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">AC/Ext</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Electrode Placement + Checks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ElectrodeGrid />
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <ArrowClockwise className="mr-2" />
                Refresh Impedance
              </Button>
              <Button variant="outline" size="sm">Auto-map 10-20</Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox id="electrodes-verified" />
                <Label htmlFor="electrodes-verified" className="text-sm">Electrodes verified</Label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox id="cap-size" />
                <Label htmlFor="cap-size" className="text-sm">Cap size ok</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device / Routing / Safety</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Connect</Button>
                <Button variant="outline" size="sm">Disconnect</Button>
              </div>
              <div>
                <Label className="text-sm">Calibrate</Label>
                <div className="mt-1 flex gap-2">
                  <Button variant="outline" size="sm">Run</Button>
                  <div className="h-9 flex-1 rounded border border-input bg-muted/30" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-sm">Reference/Ground</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">Set</Button>
                  <Button variant="outline" size="sm">Check continuity</Button>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-sm">Stream router</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="LSL to Renderer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lsl-renderer">LSL to Renderer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-sm">Recording path</Label>
                <Input defaultValue="/data/babeeg" />
              </div>
              <div>
                <Label className="text-sm">License/Qt daemon</Label>
                <div className="mt-1">
                  <Badge>Running</Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Threat log</Button>
                <Button variant="outline" size="sm">HF notes</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Signal Quality Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Channel Fp1</span>
                <Badge variant="outline" className="bg-[oklch(0.60_0.15_145)]">Good</Badge>
              </div>
              <MiniWaveform quality="good" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Channel F3</span>
                <Badge variant="outline" className="bg-[oklch(0.70_0.18_75)]">Fair</Badge>
              </div>
              <MiniWaveform quality="fair" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Channel T4</span>
                <Badge variant="outline" className="bg-[oklch(0.55_0.22_25)]">Poor</Badge>
              </div>
              <MiniWaveform quality="poor" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session Form</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            <div className="space-y-1">
              <Label htmlFor="patient-id">Patient ID</Label>
              <Input id="patient-id" placeholder="Neo-##" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="session-name">Session name</Label>
              <Input id="session-name" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="care-setting">Care setting</Label>
              <Select>
                <SelectTrigger id="care-setting">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nicu">NICU</SelectItem>
                  <SelectItem value="home">Home</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="tech">Tech</Label>
              <Select>
                <SelectTrigger id="tech">
                  <SelectValue placeholder="Select tech" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tech1">Tech 1</SelectItem>
                  <SelectItem value="tech2">Tech 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full">Save Profile</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button size="lg">Start Monitoring</Button>
        <Button variant="outline">Dry-run Test Signal</Button>
        <Button variant="outline">Export setup report</Button>
        <Button variant="outline">Open SBOM entry</Button>
        <Button variant="outline">Audit Trail</Button>
      </div>
    </div>
  )
}
