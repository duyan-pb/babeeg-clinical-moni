import { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

interface FrequencyDomainProps {
  channelId?: string
  isLive?: boolean
  cursorTime?: number
}

const FREQUENCY_BANDS = [
  { name: 'Delta', range: '0.5-4 Hz', color: '#8b5cf6', min: 0.5, max: 4 },
  { name: 'Theta', range: '4-8 Hz', color: '#3b82f6', min: 4, max: 8 },
  { name: 'Alpha', range: '8-13 Hz', color: '#10b981', min: 8, max: 13 },
  { name: 'Beta', range: '13-30 Hz', color: '#f59e0b', min: 13, max: 30 },
  { name: 'Gamma', range: '30-100 Hz', color: '#ef4444', min: 30, max: 100 },
]

export function FrequencyDomainAnalyzer({ channelId = 'Fp1', isLive = false, cursorTime }: FrequencyDomainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [nfft, setNfft] = useState<number>(256)
  const [selectedChannel, setSelectedChannel] = useState(channelId)
  const animationFrameRef = useRef<number | undefined>(undefined)

  const computeFFT = (nfftSize: number): number[] => {
    const spectrum: number[] = []
    const numBins = nfftSize / 2

    for (let i = 0; i < numBins; i++) {
      const freq = (i / numBins) * 128
      
      let power = 0
      
      if (freq >= 0.5 && freq <= 4) {
        power = 30 + Math.random() * 15
      } else if (freq > 4 && freq <= 8) {
        power = 25 + Math.random() * 10
      } else if (freq > 8 && freq <= 13) {
        power = 35 + Math.random() * 12
      } else if (freq > 13 && freq <= 30) {
        power = 15 + Math.random() * 8
      } else if (freq > 30) {
        power = 5 + Math.random() * 5 * Math.exp(-(freq - 30) / 20)
      }

      spectrum.push(power)
    }

    return spectrum
  }

  const drawSpectrum = () => {
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

    const spectrum = computeFFT(nfft)
    const numBins = spectrum.length
    const maxFreq = 100
    const barWidth = rect.width / numBins
    const maxPower = Math.max(...spectrum)

    ctx.strokeStyle = '#e5e5e5'
    ctx.lineWidth = 1
    for (let i = 0; i <= 5; i++) {
      const y = (i / 5) * rect.height
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(rect.width, y)
      ctx.stroke()

      ctx.fillStyle = '#737373'
      ctx.font = '10px Inter, sans-serif'
      const power = ((5 - i) / 5) * maxPower
      ctx.fillText(`${power.toFixed(0)}`, 2, y - 2)
    }

    FREQUENCY_BANDS.forEach(band => {
      const startX = (band.min / maxFreq) * rect.width
      const endX = (band.max / maxFreq) * rect.width
      
      ctx.fillStyle = band.color + '10'
      ctx.fillRect(startX, 0, endX - startX, rect.height)
      
      ctx.fillStyle = band.color
      ctx.font = '10px Inter, sans-serif'
      const labelX = startX + (endX - startX) / 2
      ctx.fillText(band.name, labelX - 15, 12)
    })

    const gradient = ctx.createLinearGradient(0, rect.height, 0, 0)
    gradient.addColorStop(0, 'oklch(0.35 0.08 250)')
    gradient.addColorStop(1, 'oklch(0.55 0.12 200)')

    for (let i = 0; i < numBins; i++) {
      const freq = (i / numBins) * maxFreq
      const x = (freq / maxFreq) * rect.width
      const barHeight = (spectrum[i] / maxPower) * rect.height

      ctx.fillStyle = gradient
      ctx.fillRect(x, rect.height - barHeight, barWidth, barHeight)
    }

    ctx.strokeStyle = 'oklch(0.35 0.08 250)'
    ctx.lineWidth = 2
    ctx.beginPath()
    for (let i = 0; i < numBins; i++) {
      const freq = (i / numBins) * maxFreq
      const x = (freq / maxFreq) * rect.width
      const y = rect.height - (spectrum[i] / maxPower) * rect.height

      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.stroke()

    ctx.fillStyle = '#737373'
    ctx.font = '10px Inter, sans-serif'
    for (let i = 0; i <= 10; i++) {
      const freq = (i / 10) * maxFreq
      const x = (freq / maxFreq) * rect.width
      ctx.fillText(`${freq.toFixed(0)}`, x - 8, rect.height - 2)
    }
  }

  useEffect(() => {
    if (isLive) {
      const animate = () => {
        drawSpectrum()
        animationFrameRef.current = requestAnimationFrame(animate)
      }
      animationFrameRef.current = requestAnimationFrame(animate)

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      }
    } else {
      drawSpectrum()
    }
  }, [isLive, nfft, selectedChannel])

  useEffect(() => {
    const handleResize = () => {
      drawSpectrum()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [nfft])

  const spectrum = computeFFT(nfft)
  const bandPowers = FREQUENCY_BANDS.map(band => {
    const numBins = nfft / 2
    const maxFreq = 128
    const startBin = Math.floor((band.min / maxFreq) * numBins)
    const endBin = Math.ceil((band.max / maxFreq) * numBins)
    
    const power = spectrum.slice(startBin, endBin).reduce((sum, val) => sum + val, 0) / (endBin - startBin)
    return { ...band, power }
  })

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Frequency Domain Analysis</CardTitle>
          <div className="flex items-center gap-2">
            {typeof cursorTime === 'number' && (
              <Badge variant="outline" className="text-xs">
                Cursor: {cursorTime.toFixed(1)}s
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
        <div className="grid gap-3 md:grid-cols-2">
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

          <div className="space-y-2">
            <Label className="text-sm">NFFT (Frequency Resolution)</Label>
            <Select value={nfft.toString()} onValueChange={(v) => setNfft(parseInt(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="128">128 points</SelectItem>
                <SelectItem value="256">256 points</SelectItem>
                <SelectItem value="512">512 points</SelectItem>
                <SelectItem value="1024">1024 points</SelectItem>
                <SelectItem value="2048">2048 points</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="relative h-64 w-full">
          <canvas
            ref={canvasRef}
            className="h-full w-full rounded border border-border"
            style={{ display: 'block' }}
          />
        </div>

        <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-5">
          {bandPowers.map(band => (
            <div 
              key={band.name}
              className="rounded border border-border bg-muted/30 p-2"
            >
              <div className="flex items-center gap-2">
                <div 
                  className="h-2 w-2 rounded-full" 
                  style={{ backgroundColor: band.color }}
                />
                <span className="text-xs font-medium">{band.name}</span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{band.range}</div>
              <div className="mt-1 text-sm font-semibold">{band.power.toFixed(1)} µV²</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
