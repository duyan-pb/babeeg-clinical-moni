import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { HelpDialog } from './HelpDialog'
import { AuditLogViewer } from './AuditLogViewer'
import { toast } from 'sonner'

interface PatientData {
  mrn: string
  ga: string
  weight: string
  clinician: string
  shift: 'Day' | 'Night'
}

export function GlobalHeader() {
  const [patientData, setPatientData] = useKV<PatientData>('patient-data', {
    mrn: '',
    ga: '',
    weight: '',
    clinician: '',
    shift: 'Day'
  })

  const data = patientData || {
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
      <div className="flex flex-col gap-2 px-6 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold tracking-tight">BabEEG</h1>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>LSL: Disconnected</span>
            <span>License: Active</span>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Patient:</span>
            <span className="font-medium">Trẻ-##</span>
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
  return null
}

export function SafetyStrip() {
  return (
    <div className="border-b border-border bg-muted/20 px-6 py-2">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-[10px] text-muted-foreground">
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
      <div className="border-t border-border bg-card px-6 py-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
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
