import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Play, Pause, FastForward, Rewind } from '@phosphor-icons/react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { TimelineEEG } from '@/components/eeg/TimelineEEG'

export function ReviewTab() {
  const sampleEvents = [
    { time: 450, type: 'seizure' as const, label: 'Seizure Event' },
    { time: 890, type: 'seizure' as const, label: 'Possible Seizure' },
    { time: 1200, type: 'artifact' as const, label: 'Motion Artifact' },
  ]

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
              <CardTitle>Timeline + Trends</CardTitle>
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
                <div className="text-sm text-muted-foreground">Accel XYZ + posture + motion flags</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Seizure Probability</div>
                <div className="h-24 rounded border border-border bg-muted/20 p-4">
                  <div className="text-xs text-muted-foreground">Probability curve</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground">Threshold</div>
                  <Slider defaultValue={[75]} max={100} step={1} className="w-full" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Events</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex gap-2">
                <Badge variant="outline" className="cursor-pointer">All</Badge>
                <Badge variant="outline" className="cursor-pointer">Seizure</Badge>
                <Badge variant="outline" className="cursor-pointer">Artifact</Badge>
                <Badge variant="outline" className="cursor-pointer">Note</Badge>
              </div>
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="rounded border-l-4 border-l-[oklch(0.55_0.22_25)] bg-card p-3 text-sm"
                    >
                      <div className="font-medium">Seizure Event {i}</div>
                      <div className="text-xs text-muted-foreground">14:23:{i * 10}</div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
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
                <div className="text-sm text-muted-foreground">Spectrogram visualization</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>FFT Panel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-32 rounded border border-border bg-muted/20 p-4">
                <div className="text-sm text-muted-foreground">FFT with band sliders</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea placeholder="Clinician tags and notes..." rows={4} />
              <div className="flex gap-2">
                <Button size="sm">Save</Button>
                <Button variant="outline" size="sm">Attach to patient</Button>
              </div>
              <Separator />
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Export JSON</Button>
                <Button variant="outline" size="sm">Threat log</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transport Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm">
              <Play />
            </Button>
            <Button variant="outline" size="sm">
              <Pause />
            </Button>
            <Button variant="outline" size="sm">
              <Rewind />
              -10s
            </Button>
            <Button variant="outline" size="sm">
              +10s
              <FastForward />
            </Button>
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
            <Button variant="outline" size="sm">Go Live</Button>
            <Button variant="outline" size="sm">Export Clip</Button>
            <Button variant="outline" size="sm">Send to Review Queue</Button>
          </div>
        </CardContent>
      </Card>

      <div className="rounded border border-border bg-muted/20 px-4 py-2">
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span>Source: <span className="font-medium">Playback</span></span>
          <span>File: <span className="font-medium">session.csv</span></span>
          <span>Integrity: <span className="font-medium text-[oklch(0.60_0.15_145)]">OK</span></span>
          <span>Consent: <span className="font-medium">on file</span></span>
          <span>Reviewer: <span className="font-medium">Dr. Smith</span></span>
        </div>
      </div>
    </div>
  )
}
