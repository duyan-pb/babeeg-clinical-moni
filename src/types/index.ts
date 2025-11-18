export type ElectrodeStatus = 'ok' | 'warn' | 'error' | 'unknown'

export interface Electrode {
  id: string
  label: string
  status: ElectrodeStatus
  impedance?: number
}

export interface LSLStream {
  id: string
  name: string
  type: string
  channelCount: number
  sampleRate: number
}

export interface Session {
  id: string
  patientId: string
  mrn: string
  ga: string
  weight: string
  clinician: string
  shift: 'Day' | 'Night'
  sessionName: string
  careSetting: string
  tech: string
  startTime: string
  duration: number
  size: string
  tags: string[]
  integrity: 'OK' | 'Failed'
  location: 'local' | 'cloud'
}

export interface Marker {
  id: string
  timestamp: number
  type: 'trigger' | 'event' | 'seizure' | 'artifact' | 'note'
  label: string
  description?: string
}

export interface EventItem {
  id: string
  type: 'seizure' | 'artifact' | 'note' | 'all'
  timestamp: number
  label: string
  description?: string
}

export type PlaybackMode = 'live' | 'playback'
export type LSLStatus = 'disconnected' | 'scanning' | 'connected' | 'error'
