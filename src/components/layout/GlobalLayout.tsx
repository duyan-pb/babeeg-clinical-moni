import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { HelpDialog } from './HelpDialog'
import { AuditLogViewer } from './AuditLogViewer'
import { toast } from 'sonner'
import { useSparkMode } from '@/lib/sparkContext'

interface PatientData {
  patientId: string
  mrn: string
  ga: string
  weight: string
  clinician: string
  shift: 'Day' | 'Night'
}

export function GlobalHeader() {
  const sparkMode = useSparkMode()
  const [patientData, setPatientData] = useKV<PatientData>('patient-data', {
    patientId: 'Trẻ-##',
    mrn: '',
    ga: '',
    weight: '',
    clinician: '',
    shift: 'Day'
  })

  const data = patientData || {
    patientId: 'Trẻ-##',
    mrn: '',
    ga: '',
    weight: '',
    clinician: '',
    shift: 'Day' as const
  }

  const handleUpdate = (field: keyof PatientData, value: string) => {
    setPatientData((current) => ({
      ...(current || data),
      [field]: value
    }))
  }

  return (
    <div className="border-b border-border bg-card">
      <div className="flex flex-col gap-1 px-4 py-2">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">BabEEG</h1>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>LSL: Demo</span>
            <span>License: Active</span>
            <span>Spark: {sparkMode === 'mock' ? 'Mock' : 'Live'}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Patient:</span>
            <input
              type="text"
              className="h-6 w-28 rounded border border-input bg-background px-2 text-xs"
              placeholder="Patient ID"
              value={data.patientId}
              onChange={(e) => handleUpdate('patientId', e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">MRN:</span>
            <input
              type="text"
              className="h-6 w-24 rounded border border-input bg-background px-2 text-xs"
              placeholder="Enter MRN"
              value={data.mrn}
              onChange={(e) => handleUpdate('mrn', e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">GA:</span>
            <input
              type="text"
              className="h-6 w-16 rounded border border-input bg-background px-2 text-xs"
              placeholder="weeks"
              value={data.ga}
              onChange={(e) => handleUpdate('ga', e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Weight:</span>
            <input
              type="text"
              className="h-6 w-20 rounded border border-input bg-background px-2 text-xs"
              placeholder="grams"
              value={data.weight}
              onChange={(e) => handleUpdate('weight', e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Clinician:</span>
            <input
              type="text"
              className="h-6 w-28 rounded border border-input bg-background px-2 text-xs"
              placeholder="BS."
              value={data.clinician}
              onChange={(e) => handleUpdate('clinician', e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Shift:</span>
            <select
              className="h-6 rounded border border-input bg-background px-2 text-xs"
              value={data.shift}
              onChange={(e) => handleUpdate('shift', e.target.value as 'Day' | 'Night')}
            >
              <option>Day</option>
              <option>Night</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

export function PatientStrip() {
  const [patientData] = useKV<PatientData>('patient-data', {
    patientId: 'Trẻ-##',
    mrn: '',
    ga: '',
    weight: '',
    clinician: '',
    shift: 'Day'
  })
  const [activeDataset] = useKV<{ id: string; sessionName?: string; patientId?: string } | null>('active-dataset', null)
  const data = patientData || {
    patientId: 'Trẻ-##',
    mrn: '',
    ga: '',
    weight: '',
    clinician: '',
    shift: 'Day' as const
  }

  return (
    <div className="border-b border-border bg-[oklch(0.15_0.02_250)]/5 px-4 py-1.5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        <Badge variant="secondary">Patient Context</Badge>
        <span>Patient: <span className="font-semibold">{data.patientId || 'Unset'}</span></span>
        <span>MRN: <span className="font-semibold">{data.mrn || '—'}</span></span>
        <span>GA: <span className="font-semibold">{data.ga || '—'} weeks</span></span>
        <span>Weight: <span className="font-semibold">{data.weight || '—'} g</span></span>
        <span>Shift: <span className="font-semibold">{data.shift}</span></span>
        <Separator orientation="vertical" className="h-4" />
        <span>Dataset: <span className="font-semibold">{activeDataset?.sessionName || 'Not selected'}</span></span>
        <Badge variant="outline" className="ml-auto">
          {activeDataset?.patientId ? `Linked to ${activeDataset.patientId}` : 'Awaiting dataset link'}
        </Badge>
      </div>
    </div>
  )
}

export function SafetyStrip() {
  return (
    <div className="border-b border-border bg-muted/20 px-4 py-1.5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-muted-foreground">
        <span className="font-medium">IEC62304 Class B</span>
        <span>ISO14971</span>
        <span>IEC62366</span>
        <span>Cyber (81001-5-1)</span>
        <span>UI-REQ-ID</span>
        <span>Hazard ID</span>
        <span className="ml-auto">Audit Trail [ ]</span>
      </div>
    </div>
  )
}

export function Footer() {
  const [auditDialogOpen, setAuditDialogOpen] = useState(false)

  const handleLockLogout = () => {
    toast.info('Locking session...')
    setTimeout(() => toast.success('Session locked'), 1000)
  }

  return (
    <>
      <div className="border-t border-border bg-card px-4 py-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <span>CPU: 12%</span>
            <span>GPU: 8%</span>
            <span>FPS: 60</span>
            <span>Buffer: 45%</span>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <HelpDialog />
            <button
              className="hover:text-foreground"
              onClick={() => setAuditDialogOpen(true)}
            >
              Audit Trail
            </button>
            <button
              className="hover:text-foreground"
              onClick={handleLockLogout}
            >
              Lock/Logout
            </button>
          </div>
        </div>
      </div>

      <Dialog open={auditDialogOpen} onOpenChange={setAuditDialogOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Audit Trail</DialogTitle>
          </DialogHeader>
          <AuditLogViewer />
        </DialogContent>
      </Dialog>
    </>
  )
}
