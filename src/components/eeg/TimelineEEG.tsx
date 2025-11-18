import { useEffect, useRef } from 'react'
import { Badge } from '@/components/ui/badge'

interface TimelineEEGProps {
  duration?: number
  channels?: string[]
  events?: Array<{
    time: number
    type: 'seizure' | 'artifact' | 'annotation'
    label: string
  }>
}

export function TimelineEEG({
  duration = 1800,
  channels = ['Fp1', 'Fp2', 'F3', 'F4', 'C3', 'C4', 'Cz', 'P3'],
  events = []
}: TimelineEEGProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
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

    const numChannels = channels.length
    const channelHeight = rect.height / numChannels

    ctx.strokeStyle = '#e5e5e5'
    ctx.lineWidth = 1
    for (let i = 0; i <= numChannels; i++) {
      const y = i * channelHeight
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(rect.width, y)
      ctx.stroke()
    }

    ctx.fillStyle = '#000000'
    ctx.font = '11px Inter, sans-serif'
    channels.forEach((channel, i) => {
      const y = i * channelHeight + 14
      ctx.fillText(channel, 4, y)
    })

    const colors = [
      '#3b82f6', '#8b5cf6', '#ec4899', '#f97316',
      '#eab308', '#84cc16', '#10b981', '#14b8a6'
    ]

    channels.forEach((_, channelIndex) => {
      const centerY = (channelIndex + 0.5) * channelHeight
      const amplitude = 15 + Math.random() * 10
      
      ctx.strokeStyle = colors[channelIndex % colors.length]
      ctx.lineWidth = 1
      ctx.beginPath()

      const numPoints = 300
      for (let i = 0; i < numPoints; i++) {
        const x = (i / numPoints) * rect.width
        const t = (i / numPoints) * duration
        
        const alpha = Math.sin(2 * Math.PI * 0.15 * t + channelIndex) * amplitude * 0.6
        const theta = Math.sin(2 * Math.PI * 0.08 * t + channelIndex * 0.5) * amplitude * 0.4
        const noise = (Math.random() - 0.5) * amplitude * 0.1
        
        const y = centerY - (alpha + theta + noise)
        
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.stroke()
    })

    ctx.fillStyle = 'rgba(239, 68, 68, 0.1)'
    ctx.strokeStyle = '#ef4444'
    ctx.lineWidth = 2
    events.forEach(event => {
      if (event.type === 'seizure') {
        const x = (event.time / duration) * rect.width
        ctx.fillRect(x, 0, 40, rect.height)
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, rect.height)
        ctx.stroke()
      }
    })

  }, [channels, duration, events])

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{ display: 'block', height: '12rem' }}
      />
      {events.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {events.slice(0, 3).map((event, i) => (
            <Badge 
              key={i}
              variant={event.type === 'seizure' ? 'default' : 'outline'}
              className={event.type === 'seizure' ? 'bg-destructive' : ''}
            >
              {event.label}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
