import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { EEGWaveformCanvas } from './EEGWaveformCanvas'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import { 
  Sliders, 
  Eye, 
  EyeSlash,
  CheckCircle,
  Circle
} from '@phosphor-icons/react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface Channel {
  id: string
  label: string
  color: string
  enabled: boolean
}

const DEFAULT_CHANNELS: Channel[] = [
  { id: 'fp1', label: 'Fp1', color: '#3b82f6', enabled: true },
  { id: 'fp2', label: 'Fp2', color: '#8b5cf6', enabled: true },
  { id: 'f3', label: 'F3', color: '#ec4899', enabled: true },
  { id: 'f4', label: 'F4', color: '#f97316', enabled: true },
  { id: 'c3', label: 'C3', color: '#eab308', enabled: true },
  { id: 'c4', label: 'C4', color: '#84cc16', enabled: true },
  { id: 'cz', label: 'Cz', color: '#10b981', enabled: true },
  { id: 'p3', label: 'P3', color: '#14b8a6', enabled: true },
  { id: 'p4', label: 'P4', color: '#06b6d4', enabled: false },
  { id: 'o1', label: 'O1', color: '#0ea5e9', enabled: false },
  { id: 'o2', label: 'O2', color: '#6366f1', enabled: false },
  { id: 't3', label: 'T3', color: '#a855f7', enabled: false },
  { id: 't4', label: 'T4', color: '#d946ef', enabled: false },
  { id: 'pz', label: 'Pz', color: '#f43f5e', enabled: false },
  { id: 'oz', label: 'Oz', color: '#ef4444', enabled: false },
  { id: 'fz', label: 'Fz', color: '#f59e0b', enabled: false },
]

interface LiveEEGStreamPanelProps {
  timeWindow: number
  isLive?: boolean
}

export function LiveEEGStreamPanel({ 
  timeWindow,
  isLive = true 
}: LiveEEGStreamPanelProps) {
  const [channels, setChannels] = useKV<Channel[]>('eeg-channels', DEFAULT_CHANNELS)
  const [amplitude, setAmplitude] = useState(100)
  const [showControls, setShowControls] = useState(false)

  const activeChannels = channels || DEFAULT_CHANNELS

  const toggleChannel = (channelId: string) => {
    setChannels((currentChannels) => 
      (currentChannels || DEFAULT_CHANNELS).map(ch => 
        ch.id === channelId ? { ...ch, enabled: !ch.enabled } : ch
      )
    )
  }

  const enabledCount = activeChannels.filter(ch => ch.enabled).length

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2">
        <Badge variant="outline" className="bg-background/95 backdrop-blur">
          {enabledCount} / {activeChannels.length} channels
        </Badge>
        {isLive && (
          <Badge className="animate-pulse bg-destructive">
            LIVE
          </Badge>
        )}
      </div>

      <div className="absolute right-4 top-4 z-10">
        <Popover open={showControls} onOpenChange={setShowControls}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="bg-background/95 backdrop-blur">
              <Sliders className="mr-2" />
              Controls
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="space-y-4">
              <div>
                <h4 className="mb-3 font-medium">Display Settings</h4>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Amplitude</Label>
                      <span className="text-xs text-muted-foreground">{amplitude}µV</span>
                    </div>
                    <Slider
                      value={[amplitude]}
                      onValueChange={([val]) => setAmplitude(val)}
                      min={20}
                      max={200}
                      step={10}
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="font-medium">Channels</h4>
                  <div className="flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setChannels((currentChannels) => 
                          (currentChannels || DEFAULT_CHANNELS).map(ch => ({ ...ch, enabled: true }))
                        )
                      }}
                    >
                      <Eye />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setChannels((currentChannels) => 
                          (currentChannels || DEFAULT_CHANNELS).map(ch => ({ ...ch, enabled: false }))
                        )
                      }}
                    >
                      <EyeSlash />
                    </Button>
                  </div>
                </div>
                <ScrollArea className="h-64">
                  <div className="space-y-1">
                    {activeChannels.map(channel => (
                      <div
                        key={channel.id}
                        className="flex items-center justify-between rounded px-2 py-1.5 hover:bg-muted/50"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: channel.color }}
                          />
                          <span className="text-sm font-medium">{channel.label}</span>
                        </div>
                        <Switch
                          checked={channel.enabled}
                          onCheckedChange={() => toggleChannel(channel.id)}
                        />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex gap-2 border-t pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setChannels(DEFAULT_CHANNELS)}
                >
                  Reset
                </Button>
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => setShowControls(false)}
                >
                  Done
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex-1 overflow-auto">
        <EEGWaveformCanvas
          timeWindow={timeWindow}
          channels={activeChannels}
          amplitude={amplitude}
          isLive={isLive}
        />
      </div>
    </div>
  )
}
