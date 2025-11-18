import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { FolderOpen, FileArrowDown, CheckCircle, XCircle, Warning, ArrowsLeftRight } from '@phosphor-icons/react'
import { toast } from 'sonner'

type ValidationStatus = 'idle' | 'validating' | 'valid' | 'invalid'
type ImportStatus = 'idle' | 'importing' | 'complete' | 'error'

interface ValidationResult {
  checksum: { status: 'pass' | 'fail' | 'pending'; value?: string }
  schema: { status: 'pass' | 'fail' | 'pending'; message?: string }
  gaps: { detected: boolean; count: number; details?: string[] }
  channels: { status: 'pass' | 'fail' | 'pending'; missing?: string[] }
}

interface ChannelMapping {
  source: string
  target: string
  mapped: boolean
}

export function ImportTab() {
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>('idle')
  const [importStatus, setImportStatus] = useState<ImportStatus>('idle')
  const [importProgress, setImportProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<string>('')
  const [patientId, setPatientId] = useState<string>('')
  const [showChannelMapper, setShowChannelMapper] = useState(false)
  const [showSummary, setShowSummary] = useState(false)

  const [validationResult, setValidationResult] = useState<ValidationResult>({
    checksum: { status: 'pending' },
    schema: { status: 'pending' },
    gaps: { detected: false, count: 0 },
    channels: { status: 'pending' }
  })

  const [channelMappings, setChannelMappings] = useState<ChannelMapping[]>([
    { source: 'EEG Fp1-Ref', target: 'Fp1', mapped: true },
    { source: 'EEG Fp2-Ref', target: 'Fp2', mapped: true },
    { source: 'EEG F3-Ref', target: 'F3', mapped: true },
    { source: 'EEG F4-Ref', target: 'F4', mapped: true },
    { source: 'EEG C3-Ref', target: 'C3', mapped: true },
    { source: 'EEG C4-Ref', target: 'C4', mapped: true },
    { source: 'ECG', target: '', mapped: false },
    { source: 'SpO2', target: '', mapped: false }
  ])

  const [importSummary] = useState({
    filesProcessed: 12,
    duration: '3h 42m',
    samplesImported: 3248640,
    gapsDetected: 2,
    checksumVerified: true,
    patientsAssigned: 1
  })

  const handleFileSelect = () => {
    setSelectedFile('/datasets/temple_4940267/patient_001.edf')
    toast.success('File selected for import')
  }

  const handleValidate = () => {
    setValidationStatus('validating')
    
    setTimeout(() => {
      const hasGaps = Math.random() > 0.7
      const checksumPass = Math.random() > 0.1
      const schemaPass = Math.random() > 0.2
      const channelsPass = Math.random() > 0.3

      setValidationResult({
        checksum: { 
          status: checksumPass ? 'pass' : 'fail', 
          value: checksumPass ? 'a3f2c9d1b8e4f7a2c9d1b8e4f7a2c9d1' : undefined 
        },
        schema: { 
          status: schemaPass ? 'pass' : 'fail',
          message: schemaPass ? 'EDF+ compliant' : 'Missing required header field: patient_id'
        },
        gaps: { 
          detected: hasGaps, 
          count: hasGaps ? 2 : 0,
          details: hasGaps ? ['Gap at 00:34:12 (2.3s)', 'Gap at 01:45:28 (0.8s)'] : []
        },
        channels: { 
          status: channelsPass ? 'pass' : 'fail',
          missing: channelsPass ? [] : ['Cz', 'Pz']
        }
      })

      const allPass = checksumPass && schemaPass && channelsPass
      setValidationStatus(allPass ? 'valid' : 'invalid')
      
      if (!allPass) {
        toast.error('Validation failed - see details below')
      } else {
        toast.success('File validated successfully')
      }
    }, 2000)
  }

  const handleImport = () => {
    if (validationStatus !== 'valid') {
      toast.error('Cannot import - validation must pass first')
      return
    }

    if (!patientId.trim()) {
      toast.error('Patient assignment required')
      return
    }

    setImportStatus('importing')
    setImportProgress(0)

    const interval = setInterval(() => {
      setImportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setImportStatus('complete')
          setShowSummary(true)
          toast.success('Import completed successfully')
          return 100
        }
        return prev + 10
      })
    }, 300)
  }

  const StatusIcon = ({ status }: { status: 'pass' | 'fail' | 'pending' }) => {
    if (status === 'pass') return <CheckCircle className="text-[oklch(0.60_0.15_145)]" weight="fill" />
    if (status === 'fail') return <XCircle className="text-destructive" weight="fill" />
    return <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
  }

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Import EDF/EDF+ File</CardTitle>
          <CardDescription>Import Temple, CHB-MIT datasets or individual EDF files with validation and integrity checks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[200px_1fr_auto]">
            <div className="space-y-1">
              <Label>Dataset</Label>
              <Select defaultValue="4940267">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4940267">Temple TUH</SelectItem>
                  <SelectItem value="7477575">CHB-MIT</SelectItem>
                  <SelectItem value="custom">Custom EDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>File Path</Label>
              <Input 
                readOnly 
                placeholder="Select EDF file..." 
                value={selectedFile}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button variant="outline" onClick={handleFileSelect}>
                <FileArrowDown className="mr-2" />
                Browse
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-1">
            <Label>Patient Assignment *</Label>
            <div className="flex gap-2">
              <Input 
                placeholder="Enter Patient ID or MRN" 
                value={patientId}
                onChange={(e) => setPatientId(e.target.value)}
              />
              <Select defaultValue="new">
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New Patient</SelectItem>
                  <SelectItem value="neo-12">Neo-12 (38w GA)</SelectItem>
                  <SelectItem value="neo-08">Neo-08 (34w GA)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleValidate} 
              disabled={!selectedFile || validationStatus === 'validating'}
              variant="outline"
            >
              {validationStatus === 'validating' ? 'Validating...' : 'Validate File'}
            </Button>
            <Button onClick={() => setShowChannelMapper(true)} variant="outline" disabled={!selectedFile}>
              <ArrowsLeftRight className="mr-2" />
              Channel Mapper
            </Button>
          </div>
        </CardContent>
      </Card>

      {validationStatus !== 'idle' && (
        <Card>
          <CardHeader>
            <CardTitle>Validation Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <div className="flex items-center gap-3 text-sm">
                <StatusIcon status={validationResult.checksum.status} />
                <span className="font-medium">Checksum Verification</span>
                {validationResult.checksum.status === 'pass' && (
                  <code className="ml-auto text-xs text-muted-foreground">{validationResult.checksum.value?.slice(0, 16)}...</code>
                )}
                {validationResult.checksum.status === 'fail' && (
                  <Badge variant="destructive" className="ml-auto">Failed</Badge>
                )}
              </div>

              <div className="flex items-center gap-3 text-sm">
                <StatusIcon status={validationResult.schema.status} />
                <span className="font-medium">Schema Validation</span>
                <span className="ml-auto text-xs text-muted-foreground">{validationResult.schema.message}</span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <StatusIcon status={validationResult.channels.status} />
                <span className="font-medium">Channel Labels</span>
                {validationResult.channels.status === 'fail' && validationResult.channels.missing && (
                  <div className="ml-auto flex gap-1">
                    <span className="text-xs text-destructive">Missing:</span>
                    {validationResult.channels.missing.map(ch => (
                      <Badge key={ch} variant="destructive" className="text-xs">{ch}</Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-start gap-3 text-sm">
                {validationResult.gaps.detected ? (
                  <Warning className="mt-0.5 text-[oklch(0.70_0.18_75)]" weight="fill" />
                ) : (
                  <CheckCircle className="mt-0.5 text-[oklch(0.60_0.15_145)]" weight="fill" />
                )}
                <div className="flex-1">
                  <span className="font-medium">Gap Detection</span>
                  {validationResult.gaps.detected && validationResult.gaps.details && (
                    <div className="mt-1 space-y-1">
                      {validationResult.gaps.details.map((gap, i) => (
                        <div key={i} className="text-xs text-muted-foreground">⚠ {gap}</div>
                      ))}
                    </div>
                  )}
                  {!validationResult.gaps.detected && (
                    <div className="text-xs text-muted-foreground">No gaps detected</div>
                  )}
                </div>
              </div>
            </div>

            {validationStatus === 'invalid' && (
              <Alert variant="destructive">
                <AlertDescription>
                  Validation failed. Please resolve the issues above before importing. Critical errors will block import.
                </AlertDescription>
              </Alert>
            )}

            {validationStatus === 'valid' && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  File validation passed. Ready to import.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {validationStatus === 'valid' && (
        <Card>
          <CardHeader>
            <CardTitle>Import</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Import Progress</span>
                <span className="text-muted-foreground">{importProgress}%</span>
              </div>
              <Progress value={importProgress} />
              {importStatus === 'importing' && (
                <p className="text-xs text-muted-foreground">Importing EDF data and validating continuity...</p>
              )}
              {importStatus === 'complete' && (
                <p className="text-xs text-[oklch(0.60_0.15_145)]">✓ Import completed successfully</p>
              )}
            </div>

            <Button 
              onClick={handleImport}
              disabled={importStatus === 'importing' || importStatus === 'complete'}
            >
              {importStatus === 'importing' ? 'Importing...' : 'Start Import'}
            </Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={showChannelMapper} onOpenChange={setShowChannelMapper}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Channel Mapping</DialogTitle>
            <DialogDescription>Map source EDF channels to standard BabEEG channels</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Source Channel</TableHead>
                  <TableHead>Target Channel</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {channelMappings.map((mapping, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{mapping.source}</TableCell>
                    <TableCell>
                      {mapping.mapped ? (
                        <Badge variant="outline">{mapping.target}</Badge>
                      ) : (
                        <Select defaultValue="skip">
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="skip">Skip</SelectItem>
                            <SelectItem value="aux1">Aux 1</SelectItem>
                            <SelectItem value="aux2">Aux 2</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                    <TableCell>
                      {mapping.mapped ? (
                        <CheckCircle className="text-[oklch(0.60_0.15_145)]" weight="fill" />
                      ) : (
                        <Badge variant="secondary">Unmapped</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowChannelMapper(false)}>Close</Button>
              <Button onClick={() => {
                setShowChannelMapper(false)
                toast.success('Channel mapping saved')
              }}>Save Mapping</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Summary</DialogTitle>
            <DialogDescription>Import completed successfully</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-muted-foreground">Files Processed</div>
                <div className="text-lg font-semibold">{importSummary.filesProcessed}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Total Duration</div>
                <div className="text-lg font-semibold">{importSummary.duration}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Samples Imported</div>
                <div className="text-lg font-semibold">{importSummary.samplesImported.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Gaps Detected</div>
                <div className="text-lg font-semibold">{importSummary.gapsDetected}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Checksum</div>
                <div className="flex items-center gap-1">
                  <CheckCircle className="text-[oklch(0.60_0.15_145)]" weight="fill" />
                  <span className="text-sm">Verified</span>
                </div>
              </div>
              <div>
                <div className="text-muted-foreground">Patients</div>
                <div className="text-lg font-semibold">{importSummary.patientsAssigned}</div>
              </div>
            </div>
            <Separator />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSummary(false)}>Close</Button>
              <Button onClick={() => {
                setShowSummary(false)
                toast.success('Navigating to Data tab')
              }}>View in Data Tab</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
