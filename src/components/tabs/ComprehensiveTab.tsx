import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Play, Pause, Stop, Plus, ArrowClockwise } from '@phosphor-icons/react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { LiveEEGStreamPanel } from '@/components/eeg/LiveEEGStreamPanel'
import { AEEGView } from '@/components/eeg/AEEGView'

export function ComprehensiveTab() {
  const [mode, setMode] = useState<'live' | 'playback'>('live')
  const [timeWindow, setTimeWindow] = useState(10)

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">BabEEG Comprehensive View</h2>
          <Badge variant="outline">Mode: {mode === 'live' ? 'Live' : 'Playback'}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setMode(mode === 'live' ? 'playback' : 'live')}
          >
            Switch to {mode === 'live' ? 'Playback' : 'Live'}
          </Button>
          <Button>
            <Plus className="mr-2" />
            Add Marker
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant={mode === 'live' ? 'default' : 'outline'}>
              {mode === 'live' ? 'Streaming Active' : 'Disconnected'}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Channels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">32</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sample Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">256 Hz</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Packet Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">0.02%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="live-eeg" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="live-eeg">Live EEG</TabsTrigger>
          <TabsTrigger value="aeeg">aEEG</TabsTrigger>
          <TabsTrigger value="impedance">Impedance Check</TabsTrigger>
          <TabsTrigger value="electrode">Electrode Map</TabsTrigger>
          <TabsTrigger value="accel">Accelerometer</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="ops">Ops Center</TabsTrigger>
        </TabsList>

        <TabsContent value="live-eeg" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{mode === 'live' ? 'Live EEG Stream' : 'Playback'}</CardTitle>
                  {mode === 'live' && (
                    <div className="flex items-center gap-2">
                      <Label className="text-sm">Time Window:</Label>
                      <Input 
                        type="number" 
                        value={timeWindow}
                        onChange={(e) => setTimeWindow(Number(e.target.value))}
                        min={1} 
                        max={30} 
                        className="w-20" 
                      />
                      <span className="text-sm text-muted-foreground">sec</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[32rem] rounded border border-border bg-background">
                  <LiveEEGStreamPanel 
                    timeWindow={timeWindow}
                    isLive={mode === 'live'}
                  />
                </div>
                {mode === 'playback' && (
                  <div className="mt-4 flex items-center gap-3">
                    <Button variant="outline" size="sm">
                      <Play />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Pause />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Stop />
                    </Button>
                    <Slider defaultValue={[50]} max={100} className="flex-1" />
                    <span className="text-xs text-muted-foreground">14:30:45</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Markers</CardTitle>
                  <Badge variant="outline">3</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="w-full">
                    <Plus className="mr-2" />
                    Add
                  </Button>
                  <Button size="sm" variant="outline" className="w-full">Clear</Button>
                </div>
                <ScrollArea className="h-64">
                  <div className="space-y-2">
                    {[
                      { type: 'trigger', label: 'Seizure onset', time: '14:23:15' },
                      { type: 'event', label: 'Movement artifact', time: '14:25:30' },
                      { type: 'other', label: 'Care activity', time: '14:28:45' },
                    ].map((marker, i) => (
                      <div
                        key={i}
                        className="rounded border-l-4 border-l-primary bg-card p-2 text-xs"
                      >
                        <div className="font-medium">{marker.label}</div>
                        <div className="text-muted-foreground">{marker.time}</div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full">Export CSV</Button>
                  <Button variant="outline" size="sm" className="w-full">Import CSV</Button>
                  <Button variant="outline" size="sm" className="w-full">Pin markers</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="aeeg">
          <AEEGView />
        </TabsContent>

        <TabsContent value="impedance">
          <Card>
            <CardHeader>
              <CardTitle>Impedance Check</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-64 rounded border border-border bg-muted/20 p-4">
                <div className="text-sm text-muted-foreground">Impedance values per channel</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <ArrowClockwise className="mr-2" />
                  Refresh
                </Button>
                <Button variant="outline">Set Reference/Ground</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="electrode">
          <Card>
            <CardHeader>
              <CardTitle>Electrode Map</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 rounded border border-border bg-muted/20 p-4">
                <div className="text-sm text-muted-foreground">10-20 electrode montage overlay</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accel">
          <Card>
            <CardHeader>
              <CardTitle>Accelerometer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 rounded border border-border bg-muted/20 p-4">
                <div className="text-sm text-muted-foreground">Tilt, motion flags, fall risk</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Frequency Domain (FFT)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 rounded border border-border bg-muted/20 p-4">
                  <div className="text-sm text-muted-foreground">FFT with band power</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Spectrogram</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fp1">Fp1</SelectItem>
                    <SelectItem value="fp2">Fp2</SelectItem>
                    <SelectItem value="cz">Cz</SelectItem>
                  </SelectContent>
                </Select>
                <div className="h-64 rounded border border-border bg-muted/20 p-4">
                  <div className="text-sm text-muted-foreground">Spectrogram display</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ops">
          <Card>
            <CardHeader>
              <CardTitle>Ops Center</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 rounded border border-border bg-muted/20 p-4">
                <div className="text-sm text-muted-foreground">Operations grid and trend panel</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex flex-wrap items-center gap-3 rounded border border-border bg-card p-4">
        <Button variant="outline" size="sm">
          {mode === 'live' ? 'Stop' : 'Go Live'}
        </Button>
        <Button variant="outline" size="sm">Jump -10s</Button>
        <Button variant="outline" size="sm">Jump +10s</Button>
        <Select defaultValue="1x">
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0.5x">0.5x</SelectItem>
            <SelectItem value="1x">1.0x</SelectItem>
            <SelectItem value="2x">2.0x</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm">Export CSV clip</Button>
        <Button variant="outline" size="sm">Trigger marker</Button>
        <Button variant="outline" size="sm">Threat log</Button>
        <Button variant="outline" size="sm">Usability logs</Button>
      </div>
    </div>
  )
}
