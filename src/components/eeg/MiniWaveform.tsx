import { useEffect, useRef } from 'react'

interface MiniWaveformProps {
  quality?: 'good' | 'fair' | 'poor'
}

export function MiniWaveform({ quality = 'good' }: MiniWaveformProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const draw = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      
      ctx.scale(dpr, dpr)

      ctx.fillStyle = '#fafafa'
      ctx.fillRect(0, 0, rect.width, rect.height)

      const centerY = rect.height / 2
      const amplitude = quality === 'good' ? 15 : quality === 'fair' ? 10 : 5
      const noise = quality === 'good' ? 0.05 : quality === 'fair' ? 0.2 : 0.5

      const color = quality === 'good' ? '#10b981' : quality === 'fair' ? '#eab308' : '#ef4444'
      ctx.strokeStyle = color
      ctx.lineWidth = 1.5
      ctx.beginPath()

      const numPoints = 100
      for (let i = 0; i < numPoints; i++) {
        const x = (i / numPoints) * rect.width
        const t = timeRef.current + i * 0.01
        
        const wave = Math.sin(2 * Math.PI * 2 * t) * amplitude
        const randomNoise = (Math.random() - 0.5) * amplitude * noise
        
        const y = centerY - (wave + randomNoise)
        
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.stroke()

      timeRef.current += 0.016
      animationFrameRef.current = requestAnimationFrame(draw)
    }

    animationFrameRef.current = requestAnimationFrame(draw)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [quality])

  return (
    <canvas
      ref={canvasRef}
      className="h-full w-full"
      style={{ display: 'block', height: '60px' }}
    />
  )
}
