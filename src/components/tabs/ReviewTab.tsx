import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Separator } from '@/components/ui/separator'
import { LiveEEGStreamPanel } from '@/components/eeg/LiveEEGStreamPanel'
import { EnhancedPlaybackControls } from '@/components/eeg/EnhancedPlaybackControls'
import { AccelerometerStream } from '@/components/eeg/AccelerometerStream'
import { FrequencyDomainAnalyzer } from '@/components/eeg/FrequencyDomainAnalyzer'
import { Spectrogram } from '@/components/eeg/Spectrogram'
import { ImpedanceChecker } from '@/components/eeg/ImpedanceChecker'
import { ElectrodeScalpMap } from '@/components/eeg/ElectrodeScalpMap'
import { ExportDialog } from '@/components/export/ExportDialog'
import { toast } from 'sonner'
import { usePlaybackEngine } from '@/components/eeg/PlaybackEngine'

export function ReviewTab() {
  const { playbackState, setMode, seek } = usePlaybackEngine('review-session')
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [selectedInterval, setSelectedInterval] = useState('all')
  const [selectedEventType, setSelectedEventType] = useState('seizure')
  const [selectedArtifact, setSelectedArtifact] = useState('hide')
  const [selectedMontage, setSelectedMontage] = useState('10-20')
  const [amplitudeScale, setAmplitudeScale] = useState(100)
  const [annotation, setAnnotation] = useState('')
  const [timeWindow, setTimeWindow] = useState(10)
  const [nurseMode, setNurseMode] = useState(false)
  const [remoteMode, setRemoteMode] = useState(false)
  const [seizureThreshold, setSeizureThreshold] = useState(0.55)
  const [earTemperature] = useState(36.6)
  const [micNoiseFloor] = useState(18)
  const [aiAlgorithm, setAiAlgorithm] = useState('AI v1.2 Neonatal')
  const [aiRunning, setAiRunning] = useState(true)
  const alertThresholds = [
    { id: 'ai-seizure', label: 'AI seizure detector', value: '>= 0.65 confidence', source: 'AI' },
    { id: 'amplitude-low', label: 'Amplitude floor', value: '<5 uV for 10s', source: 'Threshold' },
    { id: 'impedance', label: 'Impedance high', value: '>10 kΩ for 15s', source: 'Threshold' },
    { id: 'temp', label: 'Temp high', value: '>= 37.8 °C sustained', source: 'Threshold' },
  ]
  const [spikeQueue, setSpikeQueue] = useState([
    { id: 'ev-1', label: 'Spike train L2-L3', confidence: 0.82, timestamp: '09:14:23', source: 'AI v1.2' },
    { id: 'ev-2', label: 'Possible electrographic seizure', confidence: 0.71, timestamp: '09:26:48', source: 'AI v1.2' },
    { id: 'ev-3', label: 'Artifact: motion', confidence: 0.34, timestamp: '09:32:11', source: 'AI v1.2' },
  ])
  const [offlineCacheCount, setOfflineCacheCount] = useState(3)
  const [cursorTime, setCursorTime] = useState(0)

  const handleApplyFilters = () => {
    toast.success(`Applied filters: ${selectedInterval}, ${selectedEventType}, ${selectedMontage}`)
  }

  const handleResetFilters = () => {
    setSelectedInterval('30m')
    setSelectedEventType('seizure')
    setSelectedArtifact('hide')
    setSelectedMontage('10-20')
    toast.info('Filters reset to defaults')
  }

  const handleSaveAnnotation = () => {
    if (annotation.trim()) {
      toast.success('Annotation saved')
      setAnnotation('')
    } else {
      toast.error('Please enter an annotation')
    }
  }

  const handleGoLive = () => {
    setMode('live')
    toast.success('Switching to live mode')
  }

  const handleModeToggle = (checked: boolean) => {
    setMode(checked ? 'playback' : 'live')
    toast.info(checked ? 'Switched to playback mode' : 'Switched to live mode')
  }

  const isLive = playbackState.mode === 'live'
  useEffect(() => {
    setCursorTime(playbackState.currentTime)
  }, [playbackState.currentTime])

  const parseTimestampToSeconds = (ts: string) => {
    const parts = ts.split(':').map(Number)
    if (parts.length !== 3 || parts.some(isNaN)) return 0
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }

  const handleJumpToTime = (ts: string) => {
    const seconds = parseTimestampToSeconds(ts)
    setMode('playback')
    seek(seconds)
    setCursorTime(seconds)
    toast.info(`Jumping to ${ts}`)
  }

  const handleSwipeSeek = (deltaSeconds: number) => {
    setMode('playback')
    const next = Math.max(0, playbackState.currentTime + deltaSeconds)
    seek(next)
    setCursorTime(next)
  }

  return (
    <div className="page-shell h-full space-y-4 overflow-hidden">
      <div className="flex flex-shrink-0 flex-wrap items-center gap-1 rounded-lg border border-border bg-card px-3 py-2 text-sm">
        {/* EEG Display Controls - Priority at top */}
        <div className="flex items-center gap-1">
          <Label htmlFor="montage-select" className="text-xs font-medium">Montage:</Label>
          <Select value={selectedMontage} onValueChange={setSelectedMontage}>
            <SelectTrigger id="montage-select" className="h-7 w-24 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bipolar">Bipolar</SelectItem>
              <SelectItem value="referential">Referential</SelectItem>
              <SelectItem value="average">Average</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator orientation="vertical" className="h-5" />

        <div className="flex items-center gap-1">
          <Label htmlFor="scale-select" className="text-xs font-medium">Scale:</Label>
          <Select value={`${amplitudeScale}`} onValueChange={(v) => setAmplitudeScale(Number(v))}>
            <SelectTrigger id="scale-select" className="h-7 w-24 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="20">20 µV</SelectItem>
              <SelectItem value="50">50 µV</SelectItem>
              <SelectItem value="100">100 µV</SelectItem>
              <SelectItem value="200">200 µV</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator orientation="vertical" className="h-5" />

        {/* Mode toggles */}
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-[10px]">Demo</Badge>
          <div className="flex items-center gap-1">
            <Switch
              id="mode-toggle"
              checked={!isLive} // Checked means playback, so !isLive
              onCheckedChange={handleModeToggle}
              className="scale-75"
            />
            <Label htmlFor="mode-toggle" className="text-xs font-medium">
              {isLive ? 'Live' : 'Playback'}
            </Label>
          </div>
          <div className="flex items-center gap-1">
            <Switch
              id="ai-mode"
              checked={aiRunning}
              onCheckedChange={setAiRunning}
              className="scale-75"
            />
            <Label htmlFor="ai-mode" className="text-xs font-medium">AI</Label>
          </div>
          <div className="flex items-center gap-1">
            <Switch
              id="nurse-mode"
              checked={nurseMode}
              onCheckedChange={(checked) => {
                setNurseMode(checked)
                toast.info(checked ? 'Nurse mode enabled' : 'Nurse mode disabled')
              }}
              className="scale-75"
            />
            <Label htmlFor="nurse-mode" className="text-xs font-medium">Nurse</Label>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-1">
          <div className="flex items-center gap-1">
            <Switch
              id="remote-toggle"
              checked={remoteMode}
              onCheckedChange={(checked) => {
                setRemoteMode(checked)
                toast.info(checked ? 'Remote/read-only mode enabled' : 'Remote mode disabled')
              }}
              className="scale-75"
            />
            <Label htmlFor="remote-toggle" className="text-xs">Remote</Label>
          </div>

          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">Int:</span>
            <Select value={selectedInterval} onValueChange={setSelectedInterval}>
              <SelectTrigger className="h-7 w-24 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10m">Last 10m</SelectItem>
                <SelectItem value="30m">Last 30m</SelectItem>
                <SelectItem value="1h">Last 1h</SelectItem>
                <SelectItem value="all">All</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">Type:</span>
            <Select value={selectedEventType} onValueChange={setSelectedEventType}>
              <SelectTrigger className="h-7 w-24 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="seizure">Seizure</SelectItem>
                <SelectItem value="artifact">Artifact</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted-foreground">Mtg:</span>
            <Select value={selectedMontage} onValueChange={setSelectedMontage}>
              <SelectTrigger className="h-7 w-24 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10-20">10-20</SelectItem>
                <SelectItem value="10-10">10-10</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button size="sm" className="h-7 text-xs" onClick={handleApplyFilters} disabled={remoteMode}>Apply</Button>
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={handleResetFilters} disabled={remoteMode}>Reset</Button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-2">
        <div className="flex min-h-0 flex-[65] flex-col gap-2">
          <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <CardHeader className="flex-shrink-0 pb-2 py-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">EEG Waveforms</CardTitle>
                <Badge variant={isLive ? 'destructive' : 'outline'}>
                  {isLive ? 'LIVE' : 'PLAYBACK'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="min-h-0 flex-1 p-0">
              <LiveEEGStreamPanel
                timeWindow={timeWindow}
                isLive={isLive}
                playbackTime={playbackState.currentTime}
                onSwipeSeek={handleSwipeSeek}
              />
            </CardContent>
          </Card>

          {!isLive && (
            <Card className="flex-shrink-0">
              <CardContent className="p-3">
                <EnhancedPlaybackControls sessionId="review-session" />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex min-h-0 flex-[35] flex-col overflow-hidden">
          <Tabs defaultValue="analysis" className="flex h-full flex-col overflow-hidden">
            <TabsList className="grid w-full flex-shrink-0 grid-cols-3">
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="monitoring">Monitor</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="analysis" className="mt-3 min-h-0 flex-1 space-y-3 overflow-auto">
              <Card>
                <CardHeader className="pb-2 py-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm">Alert Sources</CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={aiRunning ? 'destructive' : 'outline'}>
                        {aiRunning ? 'AI running' : 'AI paused'}
                      </Badge>
                      <Select value={aiAlgorithm} onValueChange={setAiAlgorithm}>
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AI v1.2 Neonatal">AI v1.2 Neonatal</SelectItem>
                          <SelectItem value="AI v1.1 NICU">AI v1.1 NICU</SelectItem>
                          <SelectItem value="Threshold-only fallback">Threshold-only fallback</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline">AI</Badge>
                    <span>alerts come from the selected algorithm; Threshold entries are deterministic rules.</span>
                  </div>
                  <div className="grid gap-2 md:grid-cols-2">
                    {alertThresholds.map((rule) => (
                      <div key={rule.id} className="flex items-start justify-between rounded border border-border px-3 py-2 text-sm">
                        <div>
                          <div className="font-semibold">{rule.label}</div>
                          <div className="text-xs text-muted-foreground">{rule.value}</div>
                        </div>
                        <Badge variant={rule.source === 'AI' ? 'destructive' : 'outline'}>
                          {rule.source === 'AI' ? aiAlgorithm : 'Threshold'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAiRunning(!aiRunning)}
                    >
                      {aiRunning ? 'Pause AI alerts' : 'Resume AI alerts'}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toast.info('Threshold list exported for audit')}
                    >
                      Export thresholds
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Spectrogram channelId="Fp1" isLive={isLive} timeWindow={30} cursorTime={cursorTime} />
              <FrequencyDomainAnalyzer channelId="Fp1" isLive={isLive} cursorTime={cursorTime} />
              <div className="rounded-lg border border-border p-3 text-xs text-muted-foreground">
                Cursor, markers, spectrogram, and FFT are synced; adjust seizure threshold below to align events (UI-REQ-002).
              </div>
            </TabsContent>

            <TabsContent value="monitoring" className="mt-3 min-h-0 flex-1 space-y-3 overflow-auto">
              <div className="grid gap-3 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-2 py-2">
                    <CardTitle className="text-sm">In-ear Temperature</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Canal temp</span>
                      <Badge variant="outline" className="bg-[oklch(0.60_0.15_145)] text-white">
                        {earTemperature.toFixed(1)} °C
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      In-ear bioboard telemetry lives here alongside accelerometer feeds; threshold at 37.8 °C will raise a device alert.
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2 py-2">
                    <CardTitle className="text-sm">Microphone</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Noise floor</span>
                      <Badge variant="outline">{micNoiseFloor} dBA</Badge>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Capture mode</span>
                      <Badge variant="outline">Quiet/monitor</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Microphone + accelerometer signals are used to triage motion/cry artifacts before alerts fire.
                    </div>
                  </CardContent>
                </Card>
              </div>
              <AccelerometerStream isLive={isLive} timeWindow={timeWindow} />
              <ElectrodeScalpMap />
              <ImpedanceChecker />
              <div className="rounded-lg border border-border p-3">
                <div className="mb-2 flex items-center justify-between text-sm font-semibold">
                  <span>aEEG dual view (NICU)</span>
                  <Badge variant="outline">Alarm 5-45 uV</Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                  <div className="h-16 rounded bg-muted/40" />
                  <div className="h-16 rounded bg-muted/40" />
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs">
                  {nurseMode && <Badge variant="outline">Nurse mode</Badge>}
                  <Badge variant="outline">Low-bandwidth ready</Badge>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="notes" className="mt-3 min-h-0 flex-1 space-y-3 overflow-auto">
              <Card>
                <CardHeader className="pb-2 py-2">
                  <CardTitle className="text-sm">Annotations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    placeholder="Add clinical notes and observations..."
                    rows={8}
                    value={annotation}
                    onChange={(e) => setAnnotation(e.target.value)}
                    disabled={remoteMode}
                  />
                  <Button size="sm" onClick={handleSaveAnnotation} className="w-full" disabled={remoteMode}>
                    Save Annotation
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 py-2">
                  <CardTitle className="text-sm">Session Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Source:</span>
                    <span className="font-medium">{isLive ? 'Live Stream' : 'session.csv'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Montage:</span>
                    <span className="font-medium">{selectedMontage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Integrity:</span>
                    <Badge variant="outline" className="text-[oklch(0.60_0.15_145)]">
                      OK
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 w-full"
                    onClick={() => setExportDialogOpen(true)}
                  >
                    Export Session
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-2 py-2">
          <CardTitle className="text-base">AI Spike / Seizure Queue</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-xs text-muted-foreground">Admit/reject events; jump-to-time keeps waveforms, event list, and spectrogram aligned (UI-REQ-009).</div>
          <div className="grid gap-2 md:grid-cols-3">
            {spikeQueue.map(event => (
              <div key={event.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold">{event.label}</div>
                  <div className="flex items-center gap-2">
                    <Badge variant={event.source.toLowerCase().includes('ai') ? 'destructive' : 'outline'}>
                      {event.source.toLowerCase().includes('ai') ? 'AI' : 'Threshold'}
                    </Badge>
                    <Badge variant={event.confidence >= seizureThreshold ? 'destructive' : 'outline'}>
                      {(event.confidence * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">t={event.timestamp} • {event.source}</div>
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    size="sm"
                    className="h-6 px-2 text-xs"
                    variant="outline"
                    onClick={() => toast.success(`Admitted ${event.id}`)}
                    disabled={remoteMode}
                  >
                    Admit
                  </Button>
                  <Button
                    size="sm"
                    className="h-6 px-2 text-xs"
                    variant="outline"
                    onClick={() => {
                      setSpikeQueue((current) => (current || []).filter(e => e.id !== event.id))
                      toast.info(`Rejected ${event.id}`)
                    }}
                    disabled={remoteMode}
                  >
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    className="h-6 px-2 text-xs"
                    variant="ghost"
                    onClick={() => handleJumpToTime(event.timestamp)}
                  >
                    Jump
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="space-y-2 rounded-lg bg-muted/30 p-3">
            <div className="flex items-center justify-between text-sm font-medium">
              <span>Seizure probability threshold</span>
              <Badge variant="outline" className="text-xs">{(seizureThreshold * 100).toFixed(0)}%</Badge>
            </div>
            <Slider
              value={[seizureThreshold]}
              onValueChange={([v]) => setSeizureThreshold(v)}
              min={0.2}
              max={0.9}
              step={0.01}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2 py-2">
          <CardTitle className="text-base">Remote / Offline Guardrails</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Badge variant="outline">Read-only when remote</Badge>
            <Badge variant="outline">Offline cache: {offlineCacheCount} items</Badge>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span>Waveforms rendered in low-bandwidth mode; edits disabled.</span>
            <span>Annotations cached locally and synced when connectivity returns.</span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => setOfflineCacheCount(Math.max(0, offlineCacheCount - 1))} disabled={remoteMode}>
              Sync cached annotations
            </Button>
            <Button size="sm" variant="outline" onClick={() => toast.info('Rendering low-bandwidth view')}>
              Render low-bandwidth view
            </Button>
          </div>
        </CardContent>
      </Card>

      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        sessionId="session-12345"
      />
    </div>
  )
}
