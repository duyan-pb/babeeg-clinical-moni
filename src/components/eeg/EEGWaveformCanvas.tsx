import { useEffect, useRef, useState } from 'react'

interface Channel {
  id: string
  label: string
  color: string
  enabled: boolean
}

interface EEGWaveformCanvasProps {
  timeWindow?: number
  sampleRate?: number
  channels?: Channel[]
  amplitude?: number
  isLive?: boolean
  playbackTime?: number
}

export function EEGWaveformCanvas({
  timeWindow = 10,
  sampleRate = 256,
  channels = [],
  amplitude = 100,
  isLive = true,
  playbackTime = 0,
}: EEGWaveformCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const dataBuffersRef = useRef<Map<string, Float32Array>>(new Map())
  const timeRef = useRef(0)
  const [fps, setFps] = useState(60)
  const lastFrameTimeRef = useRef(performance.now())
  const frameCountRef = useRef(0)

  const enabledChannels = channels.filter(ch => ch.enabled)
  const bufferSize = timeWindow * sampleRate

  useEffect(() => {
    enabledChannels.forEach(channel => {
      if (!dataBuffersRef.current.has(channel.id)) {
        dataBuffersRef.current.set(channel.id, new Float32Array(bufferSize))
      }
    })

    const currentKeys = Array.from(dataBuffersRef.current.keys())
    currentKeys.forEach((key) => {
      if (!enabledChannels.find(ch => ch.id === key)) {
        dataBuffersRef.current.delete(key)
      }
    })
  }, [enabledChannels, bufferSize])

  const generateEEGSample = (time: number, channelIndex: number): number => {
    const baseFreq = 8 + channelIndex * 0.5
    const alpha = Math.sin(2 * Math.PI * baseFreq * time) * 0.5
    
    const theta = Math.sin(2 * Math.PI * 4 * time + channelIndex) * 0.3
    
    const beta = Math.sin(2 * Math.PI * 15 * time + channelIndex * 0.3) * 0.15
    
    const noise = (Math.random() - 0.5) * 0.1
    
    const artifact = Math.random() < 0.001 ? (Math.random() - 0.5) * 2 : 0
    
    return (alpha + theta + beta + noise + artifact) * amplitude
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

    const numChannels = enabledChannels.length
    if (numChannels === 0) return

    const channelHeight = rect.height / numChannels
    const pixelsPerSample = rect.width / bufferSize

    ctx.strokeStyle = '#e5e5e5'
    ctx.lineWidth = 1
    for (let i = 0; i <= numChannels; i++) {
      const y = i * channelHeight
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(rect.width, y)
      ctx.stroke()
    }

    const timeStep = timeWindow / 10
    ctx.fillStyle = '#737373'
    ctx.font = '10px Inter, sans-serif'
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * rect.width
      const time = i * timeStep + (isLive ? 0 : playbackTime)
      ctx.fillText(`${time.toFixed(1)}s`, x + 2, rect.height - 4)
    }

    enabledChannels.forEach((channel, channelIndex) => {
      const buffer = dataBuffersRef.current.get(channel.id)
      if (!buffer) return

      const centerY = (channelIndex + 0.5) * channelHeight

      ctx.fillStyle = '#000000'
      ctx.font = '12px Inter, sans-serif'
      ctx.fillText(channel.label, 4, centerY - channelHeight / 2 + 14)

      ctx.strokeStyle = channel.color
      ctx.lineWidth = 1.5
      ctx.beginPath()

      let firstPoint = true
      for (let i = 0; i < buffer.length; i++) {
        const x = i * pixelsPerSample
        const y = centerY - buffer[i]

        if (firstPoint) {
          ctx.moveTo(x, y)
          firstPoint = false
        } else {
          ctx.lineTo(x, y)
        }
      }

      ctx.stroke()
    })

    frameCountRef.current++
    const now = performance.now()
    if (now - lastFrameTimeRef.current >= 1000) {
      setFps(frameCountRef.current)
      frameCountRef.current = 0
      lastFrameTimeRef.current = now
    }
  }

  const updateBuffers = () => {
    if (!isLive) {
      // Render a static window aligned to the playback time
      enabledChannels.forEach((channel, channelIndex) => {
        const buffer = dataBuffersRef.current.get(channel.id)
        if (!buffer) return

        for (let i = 0; i < buffer.length; i++) {
          const t = playbackTime + i / sampleRate
          buffer[i] = generateEEGSample(t, channelIndex)
        }
      })
      return
    }

    const samplesPerFrame = Math.ceil(sampleRate / 60)
    
    enabledChannels.forEach((channel, channelIndex) => {
      const buffer = dataBuffersRef.current.get(channel.id)
      if (!buffer) return

      for (let i = 0; i < samplesPerFrame; i++) {
        for (let j = 0; j < buffer.length - 1; j++) {
          buffer[j] = buffer[j + 1]
        }

        const sample = generateEEGSample(timeRef.current, channelIndex)
        buffer[buffer.length - 1] = sample

        timeRef.current += 1 / sampleRate
      }
    })
  }

  useEffect(() => {
    if (isLive) {
      const animate = () => {
        updateBuffers()
        drawWaveform()
        animationFrameRef.current = requestAnimationFrame(animate)
      }

      animationFrameRef.current = requestAnimationFrame(animate)
      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current)
        }
      }
    }

    // Playback/static: redraw whenever inputs change
    updateBuffers()
    drawWaveform()
  }, [isLive, enabledChannels, timeWindow, amplitude, bufferSize, playbackTime])

  useEffect(() => {
    if (!isLive) {
      updateBuffers()
      drawWaveform()
    }
  }, [isLive, enabledChannels])

  useEffect(() => {
    const handleResize = () => {
      drawWaveform()
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const minChannelHeight = 50
  const calculatedHeight = Math.max(enabledChannels.length * minChannelHeight, 300)

  return (
    <div className="relative w-full" style={{ height: `${calculatedHeight}px`, minHeight: '100%' }}>
      <canvas
        ref={canvasRef}
        className="h-full w-full"
        style={{ display: 'block' }}
      />
      {isLive && (
        <div className="absolute right-2 top-2 rounded bg-background/80 px-2 py-1 text-xs text-muted-foreground backdrop-blur">
          {fps} FPS
        </div>
      )}
    </div>
  )
}
