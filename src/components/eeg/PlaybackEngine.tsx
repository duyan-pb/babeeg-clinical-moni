import { useEffect, useRef, useState } from 'react'
import { useKV } from '@github/spark/hooks'

export interface PlaybackState {
  isPlaying: boolean
  currentTime: number
  duration: number
  speed: number
  mode: 'live' | 'playback'
}

export interface EEGDataPoint {
  timestamp: number
  channels: Record<string, number>
  markers?: Marker[]
}

export interface Marker {
  id: string
  timestamp: number
  type: 'manual' | 'trigger' | 'artifact' | 'seizure'
  label: string
  source: 'user' | 'psychopy' | 'software'
  metadata?: Record<string, any>
}

export interface AccelerometerData {
  timestamp: number
  x: number
  y: number
  z: number
}

export function usePlaybackEngine(sessionId?: string) {
  const stateKey = sessionId ? `playback-state-${sessionId}` : 'playback-state'
  const markersKey = sessionId ? `markers-${sessionId}` : 'markers-live'

  const [playbackState, setPlaybackState] = useKV<PlaybackState>(stateKey, {
    isPlaying: false,
    currentTime: 0,
    duration: 3600,
    speed: 1,
    mode: 'live'
  })

  const [markers, setMarkers, deleteMarkers] = useKV<Marker[]>(markersKey, [])
  const animationFrameRef = useRef<number | undefined>(undefined)
  const lastUpdateRef = useRef<number>(performance.now())

  const defaultState: PlaybackState = {
    isPlaying: false,
    currentTime: 0,
    duration: 3600,
    speed: 1,
    mode: 'live'
  }

  useEffect(() => {
    if (!playbackState?.isPlaying || playbackState?.mode === 'live') return

    const animate = () => {
      const now = performance.now()
      const deltaMs = now - lastUpdateRef.current
      lastUpdateRef.current = now

      setPlaybackState((current = defaultState) => {
        const deltaTime = (deltaMs / 1000) * current.speed
        const newTime = Math.min(current.currentTime + deltaTime, current.duration)
        
        if (newTime >= current.duration) {
          return { ...current, currentTime: newTime, isPlaying: false }
        }
        
        return { ...current, currentTime: newTime }
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [playbackState?.isPlaying, playbackState?.mode, playbackState?.speed])

  const play = () => {
    setPlaybackState((current = defaultState) => ({ ...current, isPlaying: true }))
    lastUpdateRef.current = performance.now()
  }

  const pause = () => {
    setPlaybackState((current = defaultState) => ({ ...current, isPlaying: false }))
  }

  const seek = (time: number) => {
    setPlaybackState((current = defaultState) => ({
      ...current, 
      currentTime: Math.max(0, Math.min(time, current.duration))
    }))
  }

  const setSpeed = (speed: number) => {
    setPlaybackState((current = defaultState) => ({ ...current, speed }))
  }

  const setMode = (mode: 'live' | 'playback') => {
    setPlaybackState((current = defaultState) => ({ 
      ...current, 
      mode, 
      isPlaying: mode === 'live' ? false : current.isPlaying,
      currentTime: mode === 'live' ? 0 : current.currentTime
    }))
  }

  const addMarker = (marker: Omit<Marker, 'id'>) => {
    const newMarker: Marker = {
      ...marker,
      id: `marker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
    setMarkers((current) => [...(current || []), newMarker])
    return newMarker
  }

  const removeMarker = (markerId: string) => {
    setMarkers((current) => (current || []).filter(m => m.id !== markerId))
  }

  const clearMarkers = () => {
    setMarkers([])
  }

  return {
    playbackState: playbackState || defaultState,
    markers: markers || [],
    play,
    pause,
    seek,
    setSpeed,
    setMode,
    addMarker,
    removeMarker,
    clearMarkers
  }
}
