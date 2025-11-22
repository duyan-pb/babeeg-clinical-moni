import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { 
  Play, 
  Pause, 
  FastForward, 
  Rewind, 
  SkipBack, 
  SkipForward,
  MapPin,
  Trash,
  Download
} from '@/lib/iconShim'
import { toast } from 'sonner'
import { usePlaybackEngine, Marker } from './PlaybackEngine'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface EnhancedPlaybackControlsProps {
  sessionId?: string
}

export function EnhancedPlaybackControls({ sessionId }: EnhancedPlaybackControlsProps) {
  const {
    playbackState,
    markers,
    play,
    pause,
    seek,
    setSpeed,
    setMode,
    addMarker,
    removeMarker,
    clearMarkers
  } = usePlaybackEngine(sessionId)

  const [markerLabel, setMarkerLabel] = useState('')
  const [markerType, setMarkerType] = useState<Marker['type']>('manual')
  const [markerDialogOpen, setMarkerDialogOpen] = useState(false)

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const handlePlayPause = () => {
    if (playbackState.isPlaying) {
      pause()
      toast.info('Playback paused')
    } else {
      if (playbackState.mode === 'live') {
        setMode('playback')
      }
      play()
      toast.info('Playback started')
    }
  }

  const handleSeek = (delta: number) => {
    if (playbackState.mode === 'live') {
      setMode('playback')
    }
    seek(playbackState.currentTime + delta)
    toast.info(`Seeked ${delta > 0 ? '+' : ''}${delta}s`)
  }

  const handleSpeedChange = (speed: string) => {
    const speedValue = parseFloat(speed)
    if (playbackState.mode === 'live') {
      setMode('playback')
    }
    setSpeed(speedValue)
    toast.info(`Playback speed: ${speed}x`)
  }

  const handleAddMarker = () => {
    if (!markerLabel.trim()) {
      toast.error('Please enter a marker label')
      return
    }

    const marker = addMarker({
      timestamp: playbackState.currentTime,
      type: markerType,
      label: markerLabel,
      source: 'user'
    })

    toast.success(`Marker added at ${formatTime(marker.timestamp)}`)
    setMarkerLabel('')
    setMarkerDialogOpen(false)
  }

  const handleJumpToMarker = (timestamp: number) => {
    seek(timestamp)
    toast.info(`Jumped to ${formatTime(timestamp)}`)
  }

  const handleRemoveMarker = (markerId: string) => {
    removeMarker(markerId)
    toast.info('Marker removed')
  }

  const handleClearMarkers = () => {
    clearMarkers()
    toast.info('All markers cleared')
  }

  const handleExportMarkers = () => {
    const csv = [
      'Timestamp,Type,Label,Source',
      ...markers.map(m => `${m.timestamp},${m.type},${m.label},${m.source}`)
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `markers-${sessionId || 'live'}.csv`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Markers exported to CSV')
  }

  const progress = (playbackState.currentTime / playbackState.duration) * 100

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Playback Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Position</span>
              <span className="font-mono font-medium">
                {formatTime(playbackState.currentTime)} / {formatTime(playbackState.duration)}
              </span>
            </div>
            <Slider
              value={[playbackState.currentTime]}
              onValueChange={([value]) => seek(value)}
              max={playbackState.duration}
              step={0.1}
              className="w-full"
            />
            <div className="relative h-2">
              {markers.map(marker => {
                const position = (marker.timestamp / playbackState.duration) * 100
                const markerColor = 
                  marker.type === 'seizure' ? 'oklch(0.55 0.22 25)' :
                  marker.type === 'trigger' ? 'oklch(0.35 0.08 250)' :
                  marker.type === 'artifact' ? 'oklch(0.70 0.18 75)' :
                  'oklch(0.55 0.12 200)'
                
                return (
                  <div
                    key={marker.id}
                    className="absolute top-0 h-full w-0.5 cursor-pointer"
                    style={{ 
                      left: `${position}%`,
                      backgroundColor: markerColor
                    }}
                    onClick={() => handleJumpToMarker(marker.timestamp)}
                    title={`${marker.label} (${formatTime(marker.timestamp)})`}
                  />
                )
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => seek(0)}
                >
                  <SkipBack />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Jump to start</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleSeek(-10)}
                >
                  <Rewind />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Seek -10s (switches to playback)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  onClick={handlePlayPause}
                  disabled={playbackState.mode === 'live'}
                >
                  {playbackState.isPlaying ? <Pause weight="fill" /> : <Play weight="fill" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {playbackState.isPlaying ? 'Pause playback' : 'Play (switches from live)'}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleSeek(10)}
                >
                  <FastForward />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Seek +10s</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => seek(playbackState.duration)}
                >
                  <SkipForward />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Jump to end</TooltipContent>
            </Tooltip>

            <div className="flex-1" />

            <Select 
              value={playbackState.speed.toString()} 
              onValueChange={handleSpeedChange}
              disabled={playbackState.mode === 'live'}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.25">0.25x</SelectItem>
                <SelectItem value="0.5">0.5x</SelectItem>
                <SelectItem value="1">1.0x</SelectItem>
                <SelectItem value="2">2.0x</SelectItem>
                <SelectItem value="4">4.0x</SelectItem>
              </SelectContent>
            </Select>

            <Tooltip>
              <TooltipTrigger asChild>
                <Dialog open={markerDialogOpen} onOpenChange={setMarkerDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MapPin className="mr-2" />
                      Add Marker
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Marker</DialogTitle>
                      <DialogDescription>
                        Add an annotation marker at {formatTime(playbackState.currentTime)}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Label</Label>
                        <Input
                          placeholder="Marker description"
                          value={markerLabel}
                          onChange={(e) => setMarkerLabel(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Type</Label>
                        <Select value={markerType} onValueChange={(v) => setMarkerType(v as Marker['type'])}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manual">Manual Annotation</SelectItem>
                            <SelectItem value="trigger">Trigger Event</SelectItem>
                            <SelectItem value="artifact">Artifact</SelectItem>
                            <SelectItem value="seizure">Seizure</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setMarkerDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleAddMarker}>
                        Add Marker
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </TooltipTrigger>
              <TooltipContent>Add and tag an annotation at the current time</TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Markers ({markers.length})</CardTitle>
            <div className="flex gap-2">
              {markers.length > 0 && (
                <>
                  <Button variant="outline" size="sm" onClick={handleExportMarkers}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleClearMarkers}>
                    <Trash className="mr-2 h-4 w-4" />
                    Clear All
                  </Button>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {markers.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No markers added yet
            </div>
          ) : (
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {markers
                  .sort((a, b) => a.timestamp - b.timestamp)
                  .map(marker => {
                    const typeColor = 
                      marker.type === 'seizure' ? 'destructive' :
                      marker.type === 'trigger' ? 'default' :
                      marker.type === 'artifact' ? 'secondary' :
                      'outline'

                    return (
                      <div
                        key={marker.id}
                        className="flex items-center justify-between rounded border border-border bg-card p-3"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant={typeColor as any}>
                              {marker.type}
                            </Badge>
                            <span className="font-medium">{marker.label}</span>
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {formatTime(marker.timestamp)} • {marker.source}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleJumpToMarker(marker.timestamp)}
                          >
                            Jump
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveMarker(marker.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
