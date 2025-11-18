import type { Session, Marker } from '@/types'

export const generateDummySessions = (): Session[] => {
  return [
    {
      id: 'session-001',
      patientId: 'Trẻ-12',
      mrn: 'MRN-789012',
      ga: '38w',
      weight: '2850g',
      clinician: 'BS. Trần',
      shift: 'Day',
      sessionName: 'Giám sát buổi sáng',
      careSetting: 'NICU',
      tech: 'KTV 1',
      startTime: '2025-01-15 08:30',
      duration: 120,
      size: '45.2 MB',
      tags: ['seizure', 'baseline'],
      integrity: 'OK',
      location: 'local'
    },
    {
      id: 'session-002',
      patientId: 'Trẻ-08',
      mrn: 'MRN-456789',
      ga: '34w',
      weight: '2100g',
      clinician: 'BS. Lê',
      shift: 'Night',
      sessionName: 'Nghiên cứu buổi tối',
      careSetting: 'NICU',
      tech: 'KTV 2',
      startTime: '2025-01-14 20:15',
      duration: 180,
      size: '67.8 MB',
      tags: ['artifact', 'review'],
      integrity: 'OK',
      location: 'local'
    },
    {
      id: 'session-003',
      patientId: 'Trẻ-15',
      mrn: 'MRN-234567',
      ga: '36w',
      weight: '2450g',
      clinician: 'BS. Nguyễn',
      shift: 'Day',
      sessionName: 'Ghi cơ bản',
      careSetting: 'NICU',
      tech: 'KTV 1',
      startTime: '2025-01-13 09:45',
      duration: 90,
      size: '32.5 MB',
      tags: ['baseline'],
      integrity: 'OK',
      location: 'cloud'
    }
  ]
}

export const generateDummyMarkers = (): Marker[] => {
  return [
    {
      id: 'marker-001',
      timestamp: 125,
      type: 'seizure',
      label: 'Seizure Event',
      description: 'Focal onset, left hemisphere'
    },
    {
      id: 'marker-002',
      timestamp: 340,
      type: 'artifact',
      label: 'Motion Artifact',
      description: 'Patient movement detected'
    },
    {
      id: 'marker-003',
      timestamp: 560,
      type: 'note',
      label: 'Clinical Note',
      description: 'Medication administered'
    }
  ]
}

export const generateAuditLog = () => {
  const now = new Date()
  return [
    {
      timestamp: new Date(now.getTime() - 3600000).toISOString(),
      user: 'BS. Trần',
      action: 'Session Created',
      details: 'Trẻ-12, 120min NICU recording',
      ipAddress: '192.168.1.42'
    },
    {
      timestamp: new Date(now.getTime() - 7200000).toISOString(),
      user: 'KTV 1',
      action: 'Export CSV',
      details: 'session-001.csv, SHA-256: a3f2c9d1...',
      ipAddress: '192.168.1.38'
    },
    {
      timestamp: new Date(now.getTime() - 10800000).toISOString(),
      user: 'BS. Lê',
      action: 'Data Import',
      details: 'Temple dataset, 12 files, 3h 42m',
      ipAddress: '192.168.1.40'
    },
    {
      timestamp: new Date(now.getTime() - 14400000).toISOString(),
      user: 'BS. Nguyễn',
      action: 'Session Review',
      details: 'Trẻ-15 baseline, annotations added',
      ipAddress: '192.168.1.45'
    },
    {
      timestamp: new Date(now.getTime() - 18000000).toISOString(),
      user: 'KTV 2',
      action: 'Impedance Check',
      details: 'All electrodes < 5kΩ',
      ipAddress: '192.168.1.38'
    }
  ]
}
