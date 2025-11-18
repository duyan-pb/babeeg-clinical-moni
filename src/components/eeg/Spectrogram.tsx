import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

interface SpectrogramProps {
  channelId?: string
  isLive?: boolean
  timeWindow?: number
}

export function Spectrogram({ channelId = 'Fp1', isLive = false, timeWindow = 30 }: SpectrogramProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const spectrogramDataRef = useRef<number[][]>([])
  const [selectedChannel, setSelectedChannel] = useState(channelId)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const timeRef = useRef(0)

  const freqBins = 64
  const maxFreq = 50
  const timeSlices = 150

  const generateSpectralSlice = (time: number): number[] => {
    const slice: number[] = []
    
    for (let i = 0; i < freqBins; i++) {
      const freq = (i / freqBins) * maxFreq
      
      let power = 0
      
      if (freq >= 0.5 && freq <= 4) {
        power = 0.7 + Math.random() * 0.2 + Math.sin(time * 2) * 0.1
      } else if (freq > 4 && freq <= 8) {
        power = 0.6 + Math.random() * 0.15 + Math.cos(time * 1.5) * 0.08
      } else if (freq > 8 && freq <= 13) {
        power = 0.8 + Math.random() * 0.15 + Math.sin(time * 3) * 0.1
      } else if (freq > 13 && freq <= 30) {
        power = 0.4 + Math.random() * 0.1
      } else {
        power = 0.1 + Math.random() * 0.05 * Math.exp(-(freq - 30) / 10)
      }

      if (Math.random() < 0.05 && freq >= 8 && freq <= 13) {
        power += 0.3
      }

      slice.push(Math.max(0, Math.min(1, power)))
    }
    
    return slice
  }

  const getColorForPower = (power: number): string => {
    const r = Math.floor(power * 255)
    const g = Math.floor(power * 180)
    const b = Math.floor((1 - power) * 255)
    return `rgb(${r}, ${g}, ${b})`
  }

  const drawSpectrogram = () => {
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

    const cellWidth = rect.width / timeSlices
    const cellHeight = rect.height / freqBins

    for (let t = 0; t < spectrogramDataRef.current.length; t++) {
      const slice = spectrogramDataRef.current[t]
      for (let f = 0; f < slice.length; f++) {
        const power = slice[f]
        ctx.fillStyle = getColorForPower(power)
        const x = t * cellWidth
        const y = rect.height - (f + 1) * cellHeight
        ctx.fillRect(x, y, cellWidth + 1, cellHeight + 1)
      }
    }

    ctx.strokeStyle = 'oklch(0.70 0 0)'
    ctx.lineWidth = 1
    for (let i = 0; i <= 5; i++) {
      const freq = (i / 5) * maxFreq
      const y = rect.height - (i / 5) * rect.height
      
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(rect.width, y)
      ctx.stroke()

      ctx.fillStyle = '#000'
      ctx.font = 'bold 10px Inter, sans-serif'
      ctx.fillText(`${freq.toFixed(0)} Hz`, 4, y - 2)
    }

    ctx.fillStyle = '#737373'
    ctx.font = '10px Inter, sans-serif'
    for (let i = 0; i <= 5; i++) {
      const time = (i / 5) * timeWindow
      const x = (i / 5) * rect.width
      ctx.fillText(`-${(timeWindow - time).toFixed(0)}s`, x + 2, rect.height - 4)
    }
  }

  useEffect(() => {
    spectrogramDataRef.current = []
    for (let i = 0; i < timeSlices; i++) {
      spectrogramDataRef.current.push(generateSpectralSlice(i * 0.1))
    }
    drawSpectrogram()
  }, [selectedChannel])

  useEffect(() => {
    if (isLive) {
      const animate = () => {
        const newSlice = generateSpectralSlice(timeRef.current)
        spectrogramDataRef.current.push(newSlice)
        
        if (spectrogramDataRef.current.length > timeSlices) {
          spectrogramDataRef.current.shift()
        }

        timeRef.current += 0.1
        drawSpectrogram()
        animationFrameRef.current = requestAnimationFrame(animate)
      }

      animationFrameRef.current = requestAnimationFrame(animate)

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      }
    }
  }, [isLive, selectedChannel])

  useEffect(() => {
    const handleResize = () => {
      drawSpectrogram()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Spectrogram</CardTitle>
          {isLive && (
            <Badge variant="outline" className="bg-background">
              LIVE
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm">Channel</Label>
          <Select value={selectedChannel} onValueChange={setSelectedChannel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Fp1">Fp1</SelectItem>
              <SelectItem value="Fp2">Fp2</SelectItem>
              <SelectItem value="F3">F3</SelectItem>
              <SelectItem value="F4">F4</SelectItem>
              <SelectItem value="Cz">Cz</SelectItem>
              <SelectItem value="C3">C3</SelectItem>
              <SelectItem value="C4">C4</SelectItem>
              <SelectItem value="P3">P3</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="relative">
          <canvas
            ref={canvasRef}
            className="h-64 w-full rounded border border-border"
            style={{ display: 'block' }}
          />
        </div>

        <div className="flex items-center justify-between rounded border border-border bg-muted/30 p-2 text-xs">
          <span className="text-muted-foreground">Power Scale:</span>
          <div className="flex items-center gap-1">
            <div className="h-4 w-6" style={{ background: getColorForPower(0) }} />
            <span className="text-muted-foreground">Low</span>
            <div className="h-4 w-6" style={{ background: getColorForPower(0.5) }} />
            <span className="text-muted-foreground">Medium</span>
            <div className="h-4 w-6" style={{ background: getColorForPower(1) }} />
            <span className="text-muted-foreground">High</span>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          <div>Time flows left to right (most recent on the right)</div>
          <div>Frequency axis: 0-{maxFreq} Hz (vertical)</div>
        </div>
      </CardContent>
    </Card>
  )
}
