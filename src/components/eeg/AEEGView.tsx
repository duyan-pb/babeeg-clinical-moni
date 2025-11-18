import { useState, useRef, useEffect } from 'react'
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

interface AEEGViewProps {
  isLive?: boolean
  playbackTime?: number
}

export function AEEGView({ isLive = true, playbackTime = 0 }: AEEGViewProps) {
  const [nurseMode, setNurseMode] = useState(false)
  const [alarmsEnabled, setAlarmsEnabled] = useState(true)
  const [layout, setLayout] = useState('dual')
  const [upperMargin, setUpperMargin] = useState([25])
  const [lowerMargin, setLowerMargin] = useState([5])

  const aeegCanvasRef = useRef<HTMLCanvasElement>(null)
  const rawEEGRefs = useRef<Map<string, HTMLCanvasElement>>(new Map())
  const animationFrameRef = useRef<number | undefined>(undefined)
  const timeRef = useRef(0)

  const channels = [
    { name: 'F3-P3', id: 'ch1', color: '#3b82f6' },
    { name: 'F4-P4', id: 'ch2', color: '#8b5cf6' },
    { name: 'C3-O1', id: 'ch3', color: '#ec4899' },
    { name: 'C4-O2', id: 'ch4', color: '#f97316' },
    { name: 'T3-T5', id: 'ch5', color: '#eab308' },
    { name: 'T4-T6', id: 'ch6', color: '#84cc16' },
    { name: 'Fp1-C3', id: 'ch7', color: '#10b981' },
    { name: 'Fp2-C4', id: 'ch8', color: '#14b8a6' },
  ]

  const generateAEEGData = (timePoint: number) => {
    const baseActivity = 15 + Math.sin(timePoint * 0.001) * 5
    const variability = Math.random() * 8
    const sleepCycle = Math.sin(timePoint * 0.0003) * 10
    
    const maxAmplitude = baseActivity + variability + sleepCycle + 5
    const minAmplitude = Math.max(3, baseActivity - variability - 2)
    
    return { max: maxAmplitude, min: minAmplitude }
  }

  const generateRawEEG = (time: number, channelIndex: number) => {
    const baseFreq = 8 + channelIndex * 0.3
    const alpha = Math.sin(2 * Math.PI * baseFreq * time) * 0.6
    const theta = Math.sin(2 * Math.PI * 4.5 * time + channelIndex) * 0.4
    const delta = Math.sin(2 * Math.PI * 2 * time) * 0.5
    const noise = (Math.random() - 0.5) * 0.15
    
    return (alpha + theta + delta + noise) * 30
  }

  const drawAEEGCanvas = () => {
    const canvas = aeegCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    const gradient = ctx.createLinearGradient(0, 0, 0, rect.height)
    gradient.addColorStop(0, '#fafafa')
    gradient.addColorStop(1, '#ffffff')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, rect.width, rect.height)

    const timeWindow = 6 * 3600
    const currentTime = isLive ? timeRef.current : playbackTime
    const startTime = Math.max(0, currentTime - timeWindow)
    const numPoints = 500
    const timeStep = timeWindow / numPoints

    const logScale = (value: number) => {
      const minLog = Math.log(3)
      const maxLog = Math.log(100)
      const valueLog = Math.log(Math.max(3, Math.min(100, value)))
      return rect.height - ((valueLog - minLog) / (maxLog - minLog)) * rect.height
    }

    const upperMarginY = logScale(upperMargin[0])
    const lowerMarginY = logScale(lowerMargin[0])

    ctx.strokeStyle = 'rgba(239, 68, 68, 0.3)'
    ctx.lineWidth = 1
    ctx.setLineDash([5, 5])
    ctx.beginPath()
    ctx.moveTo(0, upperMarginY)
    ctx.lineTo(rect.width, upperMarginY)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, lowerMarginY)
    ctx.lineTo(rect.width, lowerMarginY)
    ctx.stroke()
    ctx.setLineDash([])

    const maxPoints: number[] = []
    const minPoints: number[] = []

    for (let i = 0; i < numPoints; i++) {
      const t = startTime + i * timeStep
      const data = generateAEEGData(t)
      maxPoints.push(logScale(data.max))
      minPoints.push(logScale(data.min))
    }

    const gradient1 = ctx.createLinearGradient(0, 0, 0, rect.height)
    gradient1.addColorStop(0, 'rgba(59, 130, 246, 0.3)')
    gradient1.addColorStop(1, 'rgba(59, 130, 246, 0.1)')
    
    ctx.fillStyle = gradient1
    ctx.beginPath()
    ctx.moveTo(0, maxPoints[0])
    
    for (let i = 0; i < numPoints; i++) {
      const x = (i / numPoints) * rect.width
      ctx.lineTo(x, maxPoints[i])
    }
    
    for (let i = numPoints - 1; i >= 0; i--) {
      const x = (i / numPoints) * rect.width
      ctx.lineTo(x, minPoints[i])
    }
    
    ctx.closePath()
    ctx.fill()

    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, maxPoints[0])
    for (let i = 1; i < numPoints; i++) {
      const x = (i / numPoints) * rect.width
      ctx.lineTo(x, maxPoints[i])
    }
    ctx.stroke()

    ctx.strokeStyle = '#8b5cf6'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, minPoints[0])
    for (let i = 1; i < numPoints; i++) {
      const x = (i / numPoints) * rect.width
      ctx.lineTo(x, minPoints[i])
    }
    ctx.stroke()

    ctx.strokeStyle = '#e5e5e5'
    ctx.lineWidth = 1
    const logValues = [3, 5, 10, 25, 50, 100]
    logValues.forEach(val => {
      const y = logScale(val)
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(rect.width, y)
      ctx.stroke()
      
      ctx.fillStyle = '#737373'
      ctx.font = '10px Inter, sans-serif'
      ctx.fillText(`${val}µV`, 4, y - 2)
    })
  }

  const drawRawEEG = (canvas: HTMLCanvasElement, channelIndex: number) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    ctx.fillStyle = '#fafafa'
    ctx.fillRect(0, 0, rect.width, rect.height)

    const timeWindow = 10
    const sampleRate = 256
    const numSamples = timeWindow * sampleRate
    const currentTime = isLive ? timeRef.current : playbackTime
    
    const centerY = rect.height / 2
    const scale = rect.height / 100

    ctx.strokeStyle = channels[channelIndex].color
    ctx.lineWidth = 1.5
    ctx.beginPath()
    
    for (let i = 0; i < numSamples; i++) {
      const t = currentTime - timeWindow + (i / sampleRate)
      const value = generateRawEEG(t, channelIndex)
      const x = (i / numSamples) * rect.width
      const y = centerY - value * scale
      
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    
    ctx.stroke()

    ctx.strokeStyle = '#e5e5e5'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(0, centerY)
    ctx.lineTo(rect.width, centerY)
    ctx.stroke()
  }

  useEffect(() => {
    if (!isLive) {
      drawAEEGCanvas()
      channels.forEach((_, idx) => {
        const canvas = rawEEGRefs.current.get(`ch${idx + 1}`)
        if (canvas) drawRawEEG(canvas, idx)
      })
      return
    }

    const animate = () => {
      timeRef.current += 1 / 60
      
      drawAEEGCanvas()
      channels.forEach((_, idx) => {
        const canvas = rawEEGRefs.current.get(`ch${idx + 1}`)
        if (canvas) drawRawEEG(canvas, idx)
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isLive, playbackTime, upperMargin, lowerMargin])

  return (
    <div className="h-full overflow-auto">
      <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Neonatal aEEG View</h2>
          <Badge variant="outline">NICU Mode</Badge>
          {isLive && (
            <Badge className="animate-pulse bg-destructive">LIVE</Badge>
          )}
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
              <div className="overflow-hidden rounded border border-border bg-background">
                <canvas
                  ref={aeegCanvasRef}
                  className="w-full"
                  style={{ height: '300px' }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>6hr ago</span>
                <Badge variant="secondary" className="text-xs">Continuous</Badge>
                <span>Now</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Raw EEG (Multi-Channel)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] space-y-3 overflow-y-auto pr-2">
                {channels.map((channel, idx) => (
                  <div key={channel.id} className="rounded border border-border bg-background p-2">
                    <div className="mb-1 text-xs font-medium">{channel.name}</div>
                    <canvas
                      ref={(el) => {
                        if (el) rawEEGRefs.current.set(channel.id, el)
                      }}
                      className="w-full"
                      style={{ height: '80px' }}
                    />
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
