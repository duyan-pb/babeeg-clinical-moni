import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
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
import { ImpedanceChecker } from '@/components/eeg/ImpedanceChecker'
import { ElectrodeScalpMap } from '@/components/eeg/ElectrodeScalpMap'
import { AccelerometerStream } from '@/components/eeg/AccelerometerStream'
import { FrequencyDomainAnalyzer } from '@/components/eeg/FrequencyDomainAnalyzer'
import { Spectrogram } from '@/components/eeg/Spectrogram'
import { EnhancedPlaybackControls } from '@/components/eeg/EnhancedPlaybackControls'
import { generateDummyMarkers } from '@/lib/dummy-data'
import { toast } from 'sonner'
import type { Marker } from '@/types'

export function ComprehensiveTab() {
  const [mode, setMode] = useState<'live' | 'playback'>('live')
  const [timeWindow, setTimeWindow] = useState(10)
  const [isPlaying, setIsPlaying] = useState(false)
  const [markers, setMarkers] = useKV<Marker[]>('comprehensive-markers', [])
  const [playbackSpeed, setPlaybackSpeed] = useState('1x')
  
  const markerList = markers || []

  const handleModeSwitch = () => {
    const newMode = mode === 'live' ? 'playback' : 'live'
    setMode(newMode)
    toast.info(`Switched to ${newMode} mode`)
  }

  const handleAddMarker = () => {
    const newMarker: Marker = {
      id: `marker-${Date.now()}`,
      timestamp: Date.now(),
      type: 'note',
      label: 'Manual marker',
      description: 'Added from comprehensive view'
    }
    setMarkers((current) => [...(current || []), newMarker])
    toast.success('Marker added')
  }

  const handleClearMarkers = () => {
    setMarkers([])
    toast.success('All markers cleared')
  }

  const handleExportMarkers = () => {
    toast.success('Markers exported to CSV')
  }

  const handleImportMarkers = () => {
    const dummyMarkers = generateDummyMarkers()
    setMarkers(dummyMarkers)
    toast.success(`Imported ${dummyMarkers.length} markers from CSV`)
  }

  const handlePinMarkers = () => {
    toast.success('Markers pinned to timeline')
  }

  const handleRefreshImpedance = () => {
    toast.info('Refreshing impedance...')
    setTimeout(() => toast.success('Impedance check complete'), 1500)
  }

  const handleSetRefGround = () => {
    toast.success('Reference/Ground set')
  }

  const handleJump = (seconds: number) => {
    toast.info(`Jumped ${seconds > 0 ? '+' : ''}${seconds}s`)
  }

  const handleExportClip = () => {
    toast.success('CSV clip exported')
  }

  const handleTriggerMarker = () => {
    handleAddMarker()
  }

  return (
    <div className="h-full overflow-auto">
      <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <h2 className="text-xl font-semibold">BabEEG Comprehensive View</h2>
          <Badge variant="outline">Mode: {mode === 'live' ? 'Live' : 'Playback'}</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleModeSwitch}
          >
            Switch to {mode === 'live' ? 'Playback' : 'Live'}
          </Button>
          <Button onClick={handleAddMarker}>
            <Plus className="mr-2" />
            Add Marker
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
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
          <TabsTrigger value="impedance">Impedance</TabsTrigger>
          <TabsTrigger value="electrode">Electrode Map</TabsTrigger>
          <TabsTrigger value="accel">Accelerometer</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
          <TabsTrigger value="ops">Ops Center</TabsTrigger>
        </TabsList>

        <TabsContent value="live-eeg" className="space-y-4">
          <Card className="flex flex-col">
            <CardHeader className="flex-shrink-0">
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
            <CardContent className="flex-1 overflow-hidden p-0">
              <div className="h-[600px] w-full overflow-auto">
                <LiveEEGStreamPanel 
                  timeWindow={timeWindow}
                  isLive={mode === 'live'}
                />
              </div>
            </CardContent>
          </Card>

          {mode === 'playback' && (
            <EnhancedPlaybackControls sessionId="comprehensive-session" />
          )}
        </TabsContent>

        <TabsContent value="aeeg">
          <AEEGView />
        </TabsContent>

        <TabsContent value="impedance">
          <ImpedanceChecker />
        </TabsContent>

        <TabsContent value="electrode">
          <ElectrodeScalpMap />
        </TabsContent>

        <TabsContent value="accel">
          <AccelerometerStream isLive={mode === 'live'} timeWindow={timeWindow} />
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <FrequencyDomainAnalyzer isLive={mode === 'live'} />
            <Spectrogram isLive={mode === 'live'} timeWindow={30} />
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
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleModeSwitch}
        >
          {mode === 'live' ? 'Stop' : 'Go Live'}
        </Button>
        <Button variant="outline" size="sm" onClick={() => handleJump(-10)}>Jump -10s</Button>
        <Button variant="outline" size="sm" onClick={() => handleJump(10)}>Jump +10s</Button>
        <Select value={playbackSpeed} onValueChange={setPlaybackSpeed}>
          <SelectTrigger className="w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0.5x">0.5x</SelectItem>
            <SelectItem value="1x">1.0x</SelectItem>
            <SelectItem value="2x">2.0x</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm" onClick={handleExportClip}>Export CSV clip</Button>
        <Button variant="outline" size="sm" onClick={handleTriggerMarker}>Trigger marker</Button>
        <Button variant="outline" size="sm" onClick={() => toast.info('Opening threat log...')}>Threat log</Button>
        <Button variant="outline" size="sm" onClick={() => toast.info('Opening usability logs...')}>Usability logs</Button>
      </div>
      </div>
    </div>
  )
}
