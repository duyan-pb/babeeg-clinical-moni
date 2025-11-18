import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface AccelDataPoint {
  timestamp: number
  x: number
  y: number
  z: number
}

interface AccelerometerStreamProps {
  isLive?: boolean
  timeWindow?: number
}

export function AccelerometerStream({ isLive = true, timeWindow = 10 }: AccelerometerStreamProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dataRef = useRef<AccelDataPoint[]>([])
  const animationFrameRef = useRef<number | undefined>(undefined)
  const [showGrid, setShowGrid] = useState(true)
  const [motionDetected, setMotionDetected] = useState(false)

  const sampleRate = 100
  const bufferSize = timeWindow * sampleRate

  const generateAccelData = (time: number): Omit<AccelDataPoint, 'timestamp'> => {
    const baseX = Math.sin(time * 0.5) * 0.2
    const baseY = Math.cos(time * 0.7) * 0.15
    const baseZ = 1.0 + Math.sin(time * 0.3) * 0.1

    const noiseX = (Math.random() - 0.5) * 0.05
    const noiseY = (Math.random() - 0.5) * 0.05
    const noiseZ = (Math.random() - 0.5) * 0.05

    const motion = Math.random() < 0.01 ? (Math.random() - 0.5) * 2 : 0

    return {
      x: baseX + noiseX + motion,
      y: baseY + noiseY + motion,
      z: baseZ + noiseZ + motion * 0.5
    }
  }

  const detectMotion = (data: AccelDataPoint[]) => {
    if (data.length < 10) return false
    
    const recent = data.slice(-10)
    const magnitudes = recent.map(d => Math.sqrt(d.x ** 2 + d.y ** 2 + d.z ** 2))
    const avgMagnitude = magnitudes.reduce((a, b) => a + b, 0) / magnitudes.length
    const variance = magnitudes.reduce((sum, m) => sum + Math.abs(m - avgMagnitude), 0) / magnitudes.length
    
    return variance > 0.2
  }

  const drawWaveform = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    
    ctx.scale(dpr, dpr)

    ctx.fillStyle = '#fafafa'
    ctx.fillRect(0, 0, rect.width, rect.height)

    const data = dataRef.current
    if (data.length === 0) return

    const centerY = rect.height / 2
    const pixelsPerSample = rect.width / bufferSize
    const scale = rect.height / 6

    if (showGrid) {
      ctx.strokeStyle = '#e5e5e5'
      ctx.lineWidth = 1
      
      for (let i = -2; i <= 2; i++) {
        const y = centerY + i * scale
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(rect.width, y)
        ctx.stroke()

        ctx.fillStyle = '#737373'
        ctx.font = '10px Inter, sans-serif'
        ctx.fillText(`${i}g`, 4, y - 2)
      }

      ctx.strokeStyle = '#d4d4d4'
      const timeStep = timeWindow / 5
      for (let i = 0; i <= 5; i++) {
        const x = (i / 5) * rect.width
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, rect.height)
        ctx.stroke()

        const time = i * timeStep
        ctx.fillStyle = '#737373'
        ctx.fillText(`${time.toFixed(1)}s`, x + 2, rect.height - 4)
      }
    }

    const drawChannel = (getValue: (d: AccelDataPoint) => number, color: string, label: string) => {
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.beginPath()

      let firstPoint = true
      for (let i = 0; i < data.length; i++) {
        const x = i * pixelsPerSample
        const y = centerY - getValue(data[i]) * scale

        if (firstPoint) {
          ctx.moveTo(x, y)
          firstPoint = false
        } else {
          ctx.lineTo(x, y)
        }
      }

      ctx.stroke()

      ctx.fillStyle = color
      ctx.font = 'bold 12px Inter, sans-serif'
      ctx.fillText(label, rect.width - 60 + (label === 'X' ? 0 : label === 'Y' ? 20 : 40), 20)
    }

    drawChannel(d => d.x, '#3b82f6', 'X')
    drawChannel(d => d.y, '#10b981', 'Y')
    drawChannel(d => d.z, '#f59e0b', 'Z')
  }

  useEffect(() => {
    if (!isLive) return

    let time = 0
    const samplesPerFrame = Math.ceil(sampleRate / 60)

    const animate = () => {
      for (let i = 0; i < samplesPerFrame; i++) {
        const accelData = generateAccelData(time)
        dataRef.current.push({
          timestamp: time,
          ...accelData
        })

        if (dataRef.current.length > bufferSize) {
          dataRef.current.shift()
        }

        time += 1 / sampleRate
      }

      setMotionDetected(detectMotion(dataRef.current))
      drawWaveform()
      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [isLive, timeWindow, showGrid])

  useEffect(() => {
    const handleResize = () => {
      drawWaveform()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Accelerometer Stream</CardTitle>
          <div className="flex items-center gap-3">
            {motionDetected && (
              <Badge variant="destructive" className="animate-pulse">
                Motion Detected
              </Badge>
            )}
            {isLive && (
              <Badge variant="outline" className="bg-background">
                LIVE
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#3b82f6]" />
            <span className="text-sm">X-axis</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#10b981]" />
            <span className="text-sm">Y-axis</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-[#f59e0b]" />
            <span className="text-sm">Z-axis</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Switch
              id="show-grid"
              checked={showGrid}
              onCheckedChange={setShowGrid}
            />
            <Label htmlFor="show-grid" className="text-sm">Grid</Label>
          </div>
        </div>

        <div className="relative h-64 w-full">
          <canvas
            ref={canvasRef}
            className="h-full w-full rounded border border-border"
            style={{ display: 'block' }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="rounded border border-border bg-muted/30 p-2">
            <div className="font-medium text-[#3b82f6]">X-Axis</div>
            <div className="text-muted-foreground">
              {dataRef.current.length > 0 
                ? `${dataRef.current[dataRef.current.length - 1].x.toFixed(3)} g`
                : '0.000 g'}
            </div>
          </div>
          <div className="rounded border border-border bg-muted/30 p-2">
            <div className="font-medium text-[#10b981]">Y-Axis</div>
            <div className="text-muted-foreground">
              {dataRef.current.length > 0 
                ? `${dataRef.current[dataRef.current.length - 1].y.toFixed(3)} g`
                : '0.000 g'}
            </div>
          </div>
          <div className="rounded border border-border bg-muted/30 p-2">
            <div className="font-medium text-[#f59e0b]">Z-Axis</div>
            <div className="text-muted-foreground">
              {dataRef.current.length > 0 
                ? `${dataRef.current[dataRef.current.length - 1].z.toFixed(3)} g`
                : '0.000 g'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
