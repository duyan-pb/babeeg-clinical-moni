import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

interface PatientData {
  patientId: string
  mrn: string
  ga: string
  weight: string
  clinician: string
  shift: 'Day' | 'Night'
}

interface PatientNote {
  id: string
  tag: string
  note: string
  timestamp: string
  dataset?: string
  author?: string
}

export function PatientTab() {
  const [patientData, setPatientData] = useKV<PatientData>('patient-data', {
    patientId: 'Trẻ-##',
    mrn: '',
    ga: '',
    weight: '',
    clinician: '',
    shift: 'Day'
  })
  const [activeDataset] = useKV<{ id: string; sessionName?: string; patientId?: string } | null>('active-dataset', null)
  const [notes, setNotes] = useKV<PatientNote[]>('patient-notes', [])
  const [noteDraft, setNoteDraft] = useState('')
  const [noteTag, setNoteTag] = useState('observation')
  const [noteAuthor, setNoteAuthor] = useState('KTV')

  const data = patientData || {
    patientId: 'Trẻ-##',
    mrn: '',
    ga: '',
    weight: '',
    clinician: '',
    shift: 'Day' as const
  }
  const noteList = notes || []

  const handleUpdate = (field: keyof PatientData, value: string) => {
    setPatientData((current) => ({
      ...(current || data),
      [field]: value
    }))
  }

  const handleSaveNote = () => {
    if (!noteDraft.trim()) {
      toast.error('Add a note before saving')
      return
    }
    const newNote: PatientNote = {
      id: `note-${Date.now()}`,
      tag: noteTag,
      note: noteDraft.trim(),
      timestamp: new Date().toLocaleString(),
      dataset: activeDataset?.sessionName,
      author: noteAuthor
    }
    setNotes([...(noteList || []), newNote])
    setNoteDraft('')
    toast.success('Patient note saved and tagged to context')
  }

  const handleRemoveNote = (id: string) => {
    setNotes((current) => (current || []).filter((n) => n.id !== id))
  }

  return (
    <div className="page-shell space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">Patient Record</h2>
          <Badge variant="outline">Linked to Setup + Data</Badge>
          <Badge variant="outline" className="text-[11px]">Demo data</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline">Notes tagged to events</Badge>
          <span>Active dataset: {activeDataset?.sessionName || 'Not selected'}</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle>Demographics + Context</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1">
              <Label htmlFor="patient-id">Patient ID</Label>
              <Input 
                id="patient-id"
                value={data.patientId}
                onChange={(e) => handleUpdate('patientId', e.target.value)}
                placeholder="Trẻ-##"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="mrn">MRN</Label>
              <Input 
                id="mrn"
                value={data.mrn}
                onChange={(e) => handleUpdate('mrn', e.target.value)}
                placeholder="MRN-0000"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ga">GA (weeks)</Label>
              <Input 
                id="ga"
                value={data.ga}
                onChange={(e) => handleUpdate('ga', e.target.value)}
                placeholder="36"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="weight">Weight (g)</Label>
              <Input 
                id="weight"
                value={data.weight}
                onChange={(e) => handleUpdate('weight', e.target.value)}
                placeholder="2500"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="clinician">Clinician</Label>
              <Input 
                id="clinician"
                value={data.clinician}
                onChange={(e) => handleUpdate('clinician', e.target.value)}
                placeholder="BS."
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="shift">Shift</Label>
              <Select value={data.shift} onValueChange={(v) => handleUpdate('shift', v)}>
                <SelectTrigger id="shift">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Day">Day</SelectItem>
                  <SelectItem value="Night">Night</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Event Tags + Attribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded border border-border px-3 py-2">
              <span className="text-muted-foreground">Dataset</span>
              <Badge variant="outline">{activeDataset?.sessionName || 'Not selected'}</Badge>
            </div>
            <div className="flex items-center justify-between rounded border border-border px-3 py-2">
              <span className="text-muted-foreground">Patient</span>
              <Badge variant="outline">{data.patientId || 'Unset'}</Badge>
            </div>
            <div className="text-xs text-muted-foreground">
              Patient data binds to Setup/Data/Review. Notes below stay linked to the current dataset ID for IEC 62304 traceability.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1.2fr]">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Comments / Notations (stored with events)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="event-tag">Event Tag</Label>
                <Select value={noteTag} onValueChange={setNoteTag}>
                  <SelectTrigger id="event-tag">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seizure-alert">Seizure alert</SelectItem>
                    <SelectItem value="threshold">Threshold trigger</SelectItem>
                    <SelectItem value="artifact">Artifact</SelectItem>
                    <SelectItem value="care-note">Care team note</SelectItem>
                    <SelectItem value="observation">Observation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="author">Author</Label>
                <Input 
                  id="author"
                  value={noteAuthor}
                  onChange={(e) => setNoteAuthor(e.target.value)}
                  placeholder="KTV / BS."
                />
              </div>
              <div className="space-y-1">
                <Label>Dataset Link</Label>
                <Input 
                  value={activeDataset?.sessionName || ''}
                  readOnly
                  placeholder="Select a dataset in Data tab"
                  className="text-muted-foreground"
                />
              </div>
            </div>
            <Textarea 
              placeholder="Add comments/notations; they will be tagged to the selected event and dataset"
              rows={4}
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
            />
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={handleSaveNote}>Save note to patient record</Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setNoteDraft('')}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Notation Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {noteList.length === 0 ? (
              <div className="rounded border border-dashed border-border p-6 text-sm text-muted-foreground">
                No notes yet. Add comments and tag them to events above to see them here.
              </div>
            ) : (
              <div className="space-y-2">
                {noteList.map((entry) => (
                  <div key={entry.id} className="rounded border border-border p-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{entry.tag}</Badge>
                        {entry.dataset && <Badge variant="outline">Dataset: {entry.dataset}</Badge>}
                        {entry.author && <Badge variant="outline">Author: {entry.author}</Badge>}
                      </div>
                      <span className="text-xs text-muted-foreground">{entry.timestamp}</span>
                    </div>
                    <p className="mt-2 text-muted-foreground">{entry.note}</p>
                    <div className="mt-2 flex gap-2">
                      <Button 
                        size="xs" 
                        variant="outline"
                        onClick={() => toast.info(`Would open event at ${entry.timestamp}`)}
                      >
                        Jump to event
                      </Button>
                      <Button 
                        size="xs" 
                        variant="ghost"
                        onClick={() => handleRemoveNote(entry.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
