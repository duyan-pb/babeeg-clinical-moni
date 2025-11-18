import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowClockwise, Play, Stop, CheckCircle, Warning, XCircle } from '@phosphor-icons/react'
import { ElectrodeGrid } from './ElectrodeGrid'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { MiniWaveform } from '@/components/eeg/MiniWaveform'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import type { LSLStatus } from '@/types'

interface PreflightChecks {
  electrodesVerified: boolean
  capSizeOk: boolean
  lslLocked: boolean
  licenseRunning: boolean
  storagePathValid: boolean
}

export function SetupTab() {
  const [lslStatus, setLslStatus] = useState<LSLStatus>('disconnected')
  const [selectedStream, setSelectedStream] = useState('')
  const [packetLoss, setPacketLoss] = useState(0.02)
  const [bufferLevel, setBufferLevel] = useState(45)
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [preflightChecks, setPreflightChecks] = useKV<PreflightChecks>('preflight-checks', {
    electrodesVerified: false,
    capSizeOk: false,
    lslLocked: false,
    licenseRunning: false,
    storagePathValid: false
  })

  const checks = preflightChecks || {
    electrodesVerified: false,
    capSizeOk: false,
    lslLocked: false,
    licenseRunning: false,
    storagePathValid: false
  }

  const allChecksPassed = Object.values(checks).every(Boolean)

  const handleRefreshImpedance = () => {
    toast.info('Refreshing electrode impedance...')
    setTimeout(() => {
      toast.success('Impedance check complete')
    }, 1500)
  }

  const handleCheckContinuity = () => {
    toast.info('Checking reference/ground continuity...')
    setTimeout(() => {
      toast.success('Continuity verified')
    }, 1000)
  }

  const handleStartMonitoring = () => {
    if (!allChecksPassed || lslStatus !== 'connected') {
      toast.error('Cannot start: Complete all preflight checks and connect LSL')
      return
    }
    setIsMonitoring(true)
    toast.success('Monitoring started')
  }

  const handleStopMonitoring = () => {
    setIsMonitoring(false)
    toast.info('Monitoring stopped')
  }

  const handleAutoMap = () => {
    toast.success('Auto-mapped electrodes to 10-20 standard')
  }

  const handleRunCalibration = () => {
    toast.info('Starting calibration...')
    setTimeout(() => toast.success('Calibration complete'), 2000)
  }

  const handleSetRef = () => {
    toast.success('Reference electrode set')
  }

  const handleSaveProfile = () => {
    toast.success('Session profile saved')
  }

  const handleDryRunTest = () => {
    toast.info('Running dry-run test signal...')
    setTimeout(() => toast.success('Test signal complete - all channels responding'), 2000)
  }

  const handleExportSetupReport = () => {
    toast.success('Setup report exported to /exports/setup-report.pdf')
  }

  const handleOpenSBOM = () => {
    toast.info('Opening SBOM entry...')
  }

  const handleAuditTrail = () => {
    toast.info('Opening audit trail...')
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">BabEEG Setup</h2>
        <div className="flex flex-wrap items-center gap-3">
          <Badge 
            variant={lslStatus === 'connected' ? 'default' : 'outline'}
            className={
              lslStatus === 'connected' 
                ? 'bg-[oklch(0.60_0.15_145)] text-white' 
                : lslStatus === 'error' 
                ? 'bg-[oklch(0.55_0.22_25)] text-white'
                : ''
            }
          >
            {lslStatus === 'connected' && <CheckCircle className="mr-1 h-3 w-3" />}
            {lslStatus === 'error' && <XCircle className="mr-1 h-3 w-3" />}
            LSL: {lslStatus.charAt(0).toUpperCase() + lslStatus.slice(1)}
          </Badge>
          <Select value={selectedStream} onValueChange={setSelectedStream}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select stream" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="stream1">EEG-Stream-01 (256Hz, 32ch)</SelectItem>
              <SelectItem value="stream2">EEG-Stream-02 (512Hz, 16ch)</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              toast.info('Scanning for LSL streams...')
              setTimeout(() => {
                setLslStatus('connected')
                toast.success('LSL stream found')
              }, 1000)
            }}
          >
            <ArrowClockwise className="mr-2" />
            Scan
          </Button>
          <Button 
            size="sm"
            disabled={!allChecksPassed || lslStatus !== 'connected'}
            onClick={handleStartMonitoring}
          >
            <Play className="mr-2" />
            Start
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleStopMonitoring}
            disabled={!isMonitoring}
          >
            <Stop className="mr-2" />
            Stop
          </Button>
        </div>
      </div>

      {!allChecksPassed && (
        <Alert className="border-[oklch(0.70_0.18_75)] bg-[oklch(0.70_0.18_75)]/10">
          <Warning className="h-4 w-4" />
          <AlertDescription>
            <strong>NO-GO:</strong> Complete all preflight checks before starting monitoring
          </AlertDescription>
        </Alert>
      )}

      {allChecksPassed && lslStatus === 'connected' && (
        <Alert className="border-[oklch(0.60_0.15_145)] bg-[oklch(0.60_0.15_145)]/10">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>GO:</strong> All systems ready for monitoring
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Channels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{selectedStream ? '32' : '-'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sample Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{selectedStream ? '256 Hz' : '-'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Packet Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-semibold ${packetLoss > 1 ? 'text-destructive' : ''}`}>
              {selectedStream ? `${packetLoss.toFixed(2)}%` : '-'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Buffer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-semibold ${bufferLevel > 80 ? 'text-[oklch(0.70_0.18_75)]' : ''}`}>
              {selectedStream ? `${bufferLevel}%` : '-'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Impedance</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="outline" className="bg-[oklch(0.60_0.15_145)] text-white">Good</Badge>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Battery</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">AC/Ext</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Preflight Checklist</span>
            <Badge variant={allChecksPassed ? 'default' : 'outline'}>
              {Object.values(checks).filter(Boolean).length} / {Object.keys(checks).length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-2">
              <Checkbox 
                id="electrodes-verified" 
                checked={checks.electrodesVerified}
                onCheckedChange={(checked) => {
                  setPreflightChecks((current) => ({
                    ...(current || checks),
                    electrodesVerified: checked === true
                  }))
                }}
              />
              <Label htmlFor="electrodes-verified" className="text-sm">Electrodes verified</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="cap-size" 
                checked={checks.capSizeOk}
                onCheckedChange={(checked) => {
                  setPreflightChecks((current) => ({
                    ...(current || checks),
                    capSizeOk: checked === true
                  }))
                }}
              />
              <Label htmlFor="cap-size" className="text-sm">Cap size OK</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="lsl-locked" 
                checked={checks.lslLocked}
                onCheckedChange={(checked) => {
                  setPreflightChecks((current) => ({
                    ...(current || checks),
                    lslLocked: checked === true
                  }))
                }}
              />
              <Label htmlFor="lsl-locked" className="text-sm">LSL stream locked</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="license-running" 
                checked={checks.licenseRunning}
                onCheckedChange={(checked) => {
                  setPreflightChecks((current) => ({
                    ...(current || checks),
                    licenseRunning: checked === true
                  }))
                }}
              />
              <Label htmlFor="license-running" className="text-sm">License daemon running</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id="storage-path" 
                checked={checks.storagePathValid}
                onCheckedChange={(checked) => {
                  setPreflightChecks((current) => ({
                    ...(current || checks),
                    storagePathValid: checked === true
                  }))
                }}
              />
              <Label htmlFor="storage-path" className="text-sm">Storage path valid</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Electrode Quality + Impedance</CardTitle>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleRefreshImpedance}
              >
                <ArrowClockwise className="mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-[oklch(0.60_0.15_145)]" />
                <span>OK (&lt;5kΩ)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-[oklch(0.70_0.18_75)]" />
                <span>Warn (5-10kΩ)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 rounded-full bg-[oklch(0.55_0.22_25)]" />
                <span>Error (&gt;10kΩ)</span>
              </div>
            </div>
            <ElectrodeGrid />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleAutoMap}>Auto-map 10-20</Button>
              <Button variant="outline" size="sm" onClick={handleCheckContinuity}>
                Check Ref/Ground
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device / Routing / Safety</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setLslStatus('connected')
                    toast.success('Connected to LSL stream')
                  }}
                >
                  Connect
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setLslStatus('disconnected')
                    toast.info('Disconnected from LSL stream')
                  }}
                >
                  Disconnect
                </Button>
              </div>
              <div>
                <Label className="text-sm">Calibrate</Label>
                <div className="mt-1 flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleRunCalibration}>Run</Button>
                  <Progress value={0} className="flex-1" />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-sm">Reference/Ground</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleSetRef}>Set Ref</Button>
                  <Button variant="outline" size="sm" onClick={handleCheckContinuity}>
                    Check continuity
                  </Button>
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-sm">Stream router</Label>
                <Select defaultValue="lsl-renderer">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lsl-renderer">LSL to Renderer</SelectItem>
                    <SelectItem value="lsl-file">LSL to File</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-sm">Recording path</Label>
                <Input 
                  defaultValue="/data/babeeg" 
                  onChange={(e) => {
                    const isValid = e.target.value.startsWith('/data/')
                    setPreflightChecks((current) => ({
                      ...(current || checks),
                      storagePathValid: isValid
                    }))
                  }}
                />
              </div>
              <div>
                <Label className="text-sm">License/Qt daemon</Label>
                <div className="mt-1 flex items-center gap-2">
                  <Badge className="bg-[oklch(0.60_0.15_145)]">Running</Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setPreflightChecks((current) => ({
                        ...(current || checks),
                        licenseRunning: true
                      }))
                      toast.success('License daemon verified')
                    }}
                  >
                    Verify
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Loss-of-signal watchdog</Label>
                <div className="rounded border border-border bg-muted/20 p-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span>Status:</span>
                    <Badge variant="outline">Active</Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => toast.info('Opening threat log...')}>Threat log</Button>
                <Button variant="outline" size="sm" onClick={() => toast.info('Opening HF notes...')}>HF notes</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Signal Quality Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Channel Fp1</span>
                <Badge variant="outline" className="bg-[oklch(0.60_0.15_145)]">Good</Badge>
              </div>
              <MiniWaveform quality="good" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Channel F3</span>
                <Badge variant="outline" className="bg-[oklch(0.70_0.18_75)]">Fair</Badge>
              </div>
              <MiniWaveform quality="fair" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Channel T4</span>
                <Badge variant="outline" className="bg-[oklch(0.55_0.22_25)]">Poor</Badge>
              </div>
              <MiniWaveform quality="poor" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session Form</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-5">
            <div className="space-y-1">
              <Label htmlFor="patient-id">Patient ID</Label>
              <Input id="patient-id" placeholder="Neo-##" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="session-name">Session name</Label>
              <Input id="session-name" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="care-setting">Care setting</Label>
              <Select>
                <SelectTrigger id="care-setting">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nicu">NICU</SelectItem>
                  <SelectItem value="home">Home</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="tech">Tech</Label>
              <Select>
                <SelectTrigger id="tech">
                  <SelectValue placeholder="Select tech" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tech1">Tech 1</SelectItem>
                  <SelectItem value="tech2">Tech 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={handleSaveProfile}>Save Profile</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button size="lg" onClick={handleStartMonitoring} disabled={!allChecksPassed || lslStatus !== 'connected'}>
          Start Monitoring
        </Button>
        <Button variant="outline" onClick={handleDryRunTest}>Dry-run Test Signal</Button>
        <Button variant="outline" onClick={handleExportSetupReport}>Export setup report</Button>
        <Button variant="outline" onClick={handleOpenSBOM}>Open SBOM entry</Button>
        <Button variant="outline" onClick={handleAuditTrail}>Audit Trail</Button>
      </div>
    </div>
  )
}
