import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Play, Pause, FastForward, Rewind, Download } from '@phosphor-icons/react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { TimelineEEG } from '@/components/eeg/TimelineEEG'
import { SpikeSeizureQueue } from '@/components/review/SpikeSeizureQueue'
import { ExportDialog } from '@/components/export/ExportDialog'
import { toast } from 'sonner'

export function ReviewTab() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState('1x')
  const [currentTime, setCurrentTime] = useState(0)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  
  const sampleEvents = [
    { time: 450, type: 'seizure' as const, label: 'Seizure Event' },
    { time: 890, type: 'seizure' as const, label: 'Possible Seizure' },
    { time: 1200, type: 'artifact' as const, label: 'Motion Artifact' },
  ]

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    toast.info(isPlaying ? 'Playback paused' : 'Playback started')
  }

  const handleSeek = (delta: number) => {
    setCurrentTime((prev) => Math.max(0, prev + delta))
    toast.info(`Seeked ${delta > 0 ? '+' : ''}${delta}s`)
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Interval:</span>
          <Select defaultValue="30m">
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
          <Select defaultValue="seizure">
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
          <span className="text-sm text-muted-foreground">Artifact:</span>
          <Select defaultValue="hide">
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hide">Hide motion</SelectItem>
              <SelectItem value="show">Show all</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Montage:</span>
          <Select defaultValue="10-20">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10-20">10-20</SelectItem>
              <SelectItem value="10-10">10-10</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button size="sm">Apply</Button>
        <Button variant="outline" size="sm">Reset</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Synchronized Timeline + Trends</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded border border-border bg-background p-4">
                <TimelineEEG 
                  duration={1800}
                  channels={['Fp1', 'Fp2', 'F3', 'F4', 'C3', 'C4', 'Cz', 'P3']}
                  events={sampleEvents}
                />
              </div>
              <div className="h-32 rounded border border-border bg-muted/20 p-4">
                <div className="text-sm font-medium">Accelerometer + Posture</div>
                <div className="mt-2 text-xs text-muted-foreground">XYZ axes with motion flags</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Seizure Probability with Threshold</div>
                <div className="h-24 rounded border border-border bg-muted/20 p-4">
                  <div className="text-xs text-muted-foreground">Real-time probability curve</div>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Alarm Threshold</span>
                    <Badge variant="outline" className="text-xs">75%</Badge>
                  </div>
                  <Slider defaultValue={[75]} max={100} step={1} className="w-full" />
                </div>
              </div>
            </CardContent>
          </Card>

          <SpikeSeizureQueue />

          <Card>
            <CardHeader>
              <CardTitle>Annotations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea placeholder="Add clinical notes and observations..." rows={4} />
              <div className="flex gap-2">
                <Button size="sm">Save Annotation</Button>
                <Button variant="outline" size="sm">Attach to Event</Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
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
                <div className="text-sm font-medium">Frequency (Y) vs Time (X)</div>
                <div className="text-xs text-muted-foreground">Power spectral density heatmap</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>FFT / Band Power</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="h-32 rounded border border-border bg-muted/20 p-4">
                <div className="text-xs text-muted-foreground">Delta, Theta, Alpha, Beta bands</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded bg-muted/30 p-2">
                  <div className="font-medium">Delta</div>
                  <div className="text-muted-foreground">0.5-4 Hz</div>
                </div>
                <div className="rounded bg-muted/30 p-2">
                  <div className="font-medium">Theta</div>
                  <div className="text-muted-foreground">4-8 Hz</div>
                </div>
                <div className="rounded bg-muted/30 p-2">
                  <div className="font-medium">Alpha</div>
                  <div className="text-muted-foreground">8-13 Hz</div>
                </div>
                <div className="rounded bg-muted/30 p-2">
                  <div className="font-medium">Beta</div>
                  <div className="text-muted-foreground">13-30 Hz</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transport Controls (Synchronized)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handlePlayPause}
            >
              {isPlaying ? <Pause /> : <Play />}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleSeek(-10)}
            >
              <Rewind />
              -10s
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleSeek(10)}
            >
              +10s
              <FastForward />
            </Button>
            <Select value={playbackSpeed} onValueChange={setPlaybackSpeed}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.5x">0.5x</SelectItem>
                <SelectItem value="1x">1.0x</SelectItem>
                <SelectItem value="2x">2.0x</SelectItem>
                <SelectItem value="4x">4.0x</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Position:</span>
              <span className="font-mono">{Math.floor(currentTime / 60)}:{(currentTime % 60).toString().padStart(2, '0')}</span>
            </div>
            <Button variant="outline" size="sm">Go Live</Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setExportDialogOpen(true)}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Clip
            </Button>
            <Button variant="outline" size="sm">Send to Review Queue</Button>
          </div>
        </CardContent>
      </Card>

      <div className="rounded border border-border bg-muted/20 px-4 py-2">
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span>Source: <span className="font-medium">Playback</span></span>
          <span>File: <span className="font-medium">session.csv</span></span>
          <span>Integrity: <span className="font-medium text-[oklch(0.60_0.15_145)]">OK (SHA-256)</span></span>
          <span>Consent: <span className="font-medium">on file</span></span>
          <span>Reviewer: <span className="font-medium">Dr. Smith</span></span>
          <span>Timestamp: <span className="font-medium">{new Date().toLocaleTimeString()}</span></span>
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
