import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
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
  const { playbackState, setMode } = usePlaybackEngine('review-session')
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [selectedInterval, setSelectedInterval] = useState('30m')
  const [selectedEventType, setSelectedEventType] = useState('seizure')
  const [selectedArtifact, setSelectedArtifact] = useState('hide')
  const [selectedMontage, setSelectedMontage] = useState('10-20')
  const [annotation, setAnnotation] = useState('')
  const [timeWindow, setTimeWindow] = useState(10)

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

  return (
    <div className="flex h-full flex-col gap-4 p-6">
      <div className="flex flex-shrink-0 flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <Switch
            id="mode-toggle"
            checked={playbackState.mode === 'playback'}
            onCheckedChange={handleModeToggle}
          />
          <Label htmlFor="mode-toggle" className="text-sm font-medium">
            {isLive ? 'Live Stream' : 'Playback Mode'}
          </Label>
        </div>
        
        <div className="h-6 w-px bg-border" />

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Interval:</span>
          <Select value={selectedInterval} onValueChange={setSelectedInterval}>
            <SelectTrigger className="w-32">
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
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Event Type:</span>
          <Select value={selectedEventType} onValueChange={setSelectedEventType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="seizure">Seizure</SelectItem>
              <SelectItem value="artifact">Artifact</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Montage:</span>
          <Select value={selectedMontage} onValueChange={setSelectedMontage}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10-20">10-20</SelectItem>
              <SelectItem value="10-10">10-10</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={handleApplyFilters}>Apply</Button>
        <Button variant="outline" size="sm" onClick={handleResetFilters}>Reset</Button>
      </div>

      <div className="flex min-h-0 flex-1 gap-4">
        <div className="flex min-h-0 flex-[3] flex-col gap-4">
          <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <CardHeader className="flex-shrink-0 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>EEG Waveforms</CardTitle>
                <Badge variant={isLive ? 'destructive' : 'outline'}>
                  {isLive ? 'LIVE' : 'PLAYBACK'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="min-h-0 flex-1 p-0">
              <LiveEEGStreamPanel timeWindow={timeWindow} isLive={isLive} />
            </CardContent>
          </Card>

          {!isLive && (
            <Card className="flex-shrink-0">
              <CardContent className="p-4">
                <EnhancedPlaybackControls sessionId="review-session" />
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex min-h-0 flex-[2] flex-col overflow-hidden">
          <Tabs defaultValue="analysis" className="flex h-full flex-col overflow-hidden">
            <TabsList className="grid w-full flex-shrink-0 grid-cols-3">
              <TabsTrigger value="analysis">Analysis</TabsTrigger>
              <TabsTrigger value="monitoring">Monitor</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="analysis" className="mt-4 min-h-0 flex-1 space-y-4 overflow-auto">
              <Spectrogram channelId="Fp1" isLive={isLive} timeWindow={30} />
              <FrequencyDomainAnalyzer channelId="Fp1" isLive={isLive} />
            </TabsContent>

            <TabsContent value="monitoring" className="mt-4 min-h-0 flex-1 space-y-4 overflow-auto">
              <AccelerometerStream isLive={isLive} timeWindow={timeWindow} />
              <ElectrodeScalpMap />
              <ImpedanceChecker />
            </TabsContent>

            <TabsContent value="notes" className="mt-4 min-h-0 flex-1 space-y-4 overflow-auto">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Annotations</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea 
                    placeholder="Add clinical notes and observations..." 
                    rows={8}
                    value={annotation}
                    onChange={(e) => setAnnotation(e.target.value)}
                  />
                  <Button size="sm" onClick={handleSaveAnnotation} className="w-full">
                    Save Annotation
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Session Info</CardTitle>
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

      <ExportDialog 
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        sessionId="session-12345"
      />
    </div>
  )
}
