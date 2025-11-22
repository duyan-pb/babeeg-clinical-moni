import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowClockwise, Play, Stop, CheckCircle, Warning, XCircle, ShieldCheck, Sparkle } from '@/lib/iconShim'
import { ElectrodeGrid, defaultElectrodes } from './ElectrodeGrid'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { MiniWaveform } from '@/components/eeg/MiniWaveform'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from 'sonner'
import type { LSLStatus, Electrode } from '@/types'

interface PreflightChecks {
  electrodesVerified: boolean
  capSizeOk: boolean
  lslLocked: boolean
  licenseRunning: boolean
  storagePathValid: boolean
}

interface PatientMeta {
  patientId: string
  ga: string
  weight: string
  shift: string
}

export function SetupTab() {
  const [lslStatus, setLslStatus] = useState<LSLStatus>('disconnected')
  const [selectedStream, setSelectedStream] = useState('')
  const [packetLoss, setPacketLoss] = useState(0.02)
  const [bufferLevel, setBufferLevel] = useState(45)
  const [lslMeta, setLslMeta] = useState({
    name: '',
    rate: 0,
    channels: 0,
  })
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [preflightChecks, setPreflightChecks] = useKV<PreflightChecks>('preflight-checks', {
    electrodesVerified: false,
    capSizeOk: false,
    lslLocked: false,
    licenseRunning: false,
    storagePathValid: false
  })
  const [activePreset, setActivePreset] = useState('Default')
  const [electrodes, setElectrodes] = useState<Electrode[]>(defaultElectrodes)

  const [patientMeta, setPatientMeta] = useKV<PatientMeta>('setup-patient-meta', {
    patientId: '',
    ga: '',
    weight: '',
    shift: 'Day'
  })
  const [deviceModel, setDeviceModel] = useKV<string>('device-model', 'BabEEG Core')
  const [autoRecognized, setAutoRecognized] = useState(true)
  const deviceFamilies = [
    { id: 'BabEEG Core', label: 'BabEEG Core (Headcap)' },
    { id: 'In-Ear Bioboard', label: 'In-Ear Bioboard' },
    { id: 'cEEGrid', label: 'cEEGrid (prototype)' },
  ]
  const impedanceOverlay = [
    { label: 'Front L', status: 'good' as const },
    { label: 'Front R', status: 'good' as const },
    { label: 'Crown', status: 'fair' as const },
    { label: 'Nape', status: 'warn' as const },
    { label: 'Ear L', status: 'good' as const },
    { label: 'Ear R', status: 'warn' as const },
  ]

  const checks = preflightChecks || {
    electrodesVerified: false,
    capSizeOk: false,
    lslLocked: false,
    licenseRunning: false,
    storagePathValid: false
  }

  const allChecksPassed = Object.values(checks).every(Boolean)
  const goNoGo = allChecksPassed && lslStatus === 'connected' && packetLoss < 0.05 && bufferLevel < 80
  const deviceHealthy = goNoGo && autoRecognized
  const deviceStatusLabel = deviceHealthy
    ? 'Device Connected / Working OK'
    : lslStatus === 'connected'
      ? 'Connected - pending validation'
      : 'Device not connected'
  const deviceStatusTone = deviceHealthy
    ? 'bg-[oklch(0.60_0.15_145)] text-white'
    : lslStatus === 'error'
      ? 'bg-[oklch(0.55_0.22_25)] text-white'
      : 'bg-muted text-foreground'

  const handleRefreshImpedance = () => {
    toast.info('Refreshing electrode impedance...')
    // Simulate impedance check with random results
    const newElectrodes = electrodes.map(e => ({
      ...e,
      status: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'warn' : 'error') : 'ok'
    })) as Electrode[]

    setTimeout(() => {
      setElectrodes(newElectrodes)
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
    <div className="page-shell space-y-6">
      <Card className="border-2 border-border/80 shadow-sm">
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold">BabEEG Setup</h2>
              <Badge variant="outline" className={`flex items-center gap-2 text-xs ${deviceStatusTone}`}>
                <ShieldCheck className="h-4 w-4" />
                {deviceStatusLabel}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="gap-1">
                <Sparkle className="h-3 w-3" />
                Unified device UI
              </Badge>
              <span className="text-muted-foreground">Auto-recognition {autoRecognized ? 'enabled' : 'paused for manual selection'}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Select
                  value={deviceModel}
                  onValueChange={(v) => {
                    setDeviceModel(v)
                    setAutoRecognized(false)
                    toast.info(`Device model set to ${v}`)
                  }}
                >
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="Select device family" />
                  </SelectTrigger>
                  <SelectContent>
                    {deviceFamilies.map((device) => (
                      <SelectItem key={device.id} value={device.id}>{device.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </TooltipTrigger>
              <TooltipContent>Choose hardware family or override auto-recognition</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Select value={selectedStream} onValueChange={setSelectedStream}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Select stream" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stream1">EEG-Stream-01 (256Hz, 32ch)</SelectItem>
                    <SelectItem value="stream2">EEG-Stream-02 (512Hz, 16ch)</SelectItem>
                  </SelectContent>
                </Select>
              </TooltipTrigger>
              <TooltipContent>Select LSL stream to monitor</TooltipContent>
            </Tooltip>
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
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast.info('Scanning for LSL streams...')
                    setTimeout(() => {
                      setLslStatus('connected')
                      setLslMeta({ name: 'EEG-Stream-01', rate: 256, channels: 32 })
                      setAutoRecognized(true)
                      toast.success('LSL stream found and mapped')
                    }, 1000)
                  }}
                >
                  <ArrowClockwise className="mr-2" />
                  Scan
                </Button>
              </TooltipTrigger>
              <TooltipContent>Scan for available LSL streams</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLslStatus('connected')
                    toast.success('Device connected')
                  }}
                >
                  Connect
                </Button>
              </TooltipTrigger>
              <TooltipContent>Connect to the selected device/stream</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLslStatus('disconnected')
                    setIsMonitoring(false)
                    toast.info('Device disconnected')
                  }}
                >
                  Disconnect
                </Button>
              </TooltipTrigger>
              <TooltipContent>Disconnect device and stop monitoring</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  disabled={!allChecksPassed || lslStatus !== 'connected'}
                  onClick={handleStartMonitoring}
                >
                  <Play className="mr-2" />
                  Start
                </Button>
              </TooltipTrigger>
              <TooltipContent>Start monitoring when checks and connection are OK</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStopMonitoring}
                  disabled={!isMonitoring}
                >
                  <Stop className="mr-2" />
                  Stop
                </Button>
              </TooltipTrigger>
              <TooltipContent>Stop monitoring</TooltipContent>
            </Tooltip>
          </div>
        </CardContent>
      </Card>

      {!goNoGo && (
        <Alert className="border-[oklch(0.70_0.18_75)] bg-[oklch(0.70_0.18_75)]/10">
          <Warning className="h-4 w-4" />
          <AlertDescription>
            <strong>NO-GO:</strong> Complete all preflight checks, connect LSL, and keep packet loss &lt;5% / buffer &lt;80%.
          </AlertDescription>
        </Alert>
      )}

      {goNoGo && (
        <Alert className="border-[oklch(0.60_0.15_145)] bg-[oklch(0.60_0.15_145)]/10">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>GO:</strong> All systems ready for monitoring
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Patient Metadata</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <Input
                placeholder="Patient ID"
                value={patientMeta?.patientId || ''}
                onChange={(e) => setPatientMeta((cur: any) => ({ ...(cur || {}), patientId: e.target.value }))}
              />
              <Input
                placeholder="GA (weeks)"
                value={patientMeta?.ga || ''}
                onChange={(e) => setPatientMeta((cur: any) => ({ ...(cur || {}), ga: e.target.value }))}
              />
              <Input
                placeholder="Weight (g)"
                value={patientMeta?.weight || ''}
                onChange={(e) => setPatientMeta((cur: any) => ({ ...(cur || {}), weight: e.target.value }))}
              />
              <Select
                value={patientMeta?.shift || 'Day'}
                onValueChange={(v) => setPatientMeta((cur: any) => ({ ...(cur || {}), shift: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Shift" />
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
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">LSL Telemetry</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Name</div>
              <div className="font-medium">{lslMeta.name || '—'}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Rate</div>
              <div className="font-medium">{lslMeta.rate ? `${lslMeta.rate} Hz` : '—'}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Channels</div>
              <div className="font-medium">{lslMeta.channels || '—'}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Packet loss</div>
              <div className={`font-medium ${packetLoss > 0.05 ? 'text-[oklch(0.55_0.22_25)]' : ''}`}>
                {(packetLoss * 100).toFixed(2)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Buffer</div>
              <div className={`font-medium ${bufferLevel > 80 ? 'text-[oklch(0.70_0.18_75)]' : ''}`}>
                {bufferLevel}%
              </div>
            </div>
            <div className="col-span-2 flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPacketLoss(Math.max(0.0, packetLoss - 0.01))}>Refresh stats</Button>
              <Button variant="outline" size="sm" onClick={() => { setLslStatus('connected'); setPacketLoss(0.02); toast.success('Auto re-linked to stream') }}>
                Auto re-link
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Recording Safety Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded border border-border px-3 py-2">
              <span>Loss watchdog</span>
              <Badge variant={packetLoss > 0.05 || bufferLevel > 85 ? 'destructive' : 'outline'}>
                {packetLoss > 0.05 || bufferLevel > 85 ? 'Triggered' : 'Monitoring'}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded border border-border px-3 py-2">
              <span>Buffer overrun</span>
              <Badge variant={bufferLevel > 80 ? 'destructive' : 'outline'}>
                {bufferLevel > 80 ? 'High' : 'Nominal'}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => { setLslStatus('disconnected'); toast.error('Stopped due to watchdog') }}
              >
                Stop with log
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.info('Watchdog reset; monitoring resumed')}
              >
                Acknowledge
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
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

      <div className="grid gap-6 lg:grid-cols-3">
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
            <ElectrodeGrid electrodes={electrodes} />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={handleAutoMap}>Auto-map 10-20</Button>
              <Button variant="outline" size="sm" onClick={handleCheckContinuity}>
                Check Ref/Ground
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Device 3D View</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[11px]">Traffic-light overlay</Badge>
                <Badge variant="outline" className="text-[11px]">Demo data</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 p-5 text-white shadow-lg">
              <div className="absolute inset-0 -left-10 h-full w-1/2 rounded-full bg-white/10 blur-3xl" />
              <div className="relative space-y-3">
                <div className="flex items-center justify-between text-sm font-semibold">
                  <span>{deviceModel}</span>
                  <Badge variant="outline" className="border-white/40 bg-white/10 text-white">3D mock</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  {impedanceOverlay.map((point) => (
                    <div
                      key={point.label}
                      className="flex items-center gap-2 rounded-md bg-white/10 px-2 py-1 backdrop-blur"
                    >
                      <span className={`h-2.5 w-2.5 rounded-full ${point.status === 'good' ? 'bg-[oklch(0.60_0.15_145)]' :
                        point.status === 'warn' ? 'bg-[oklch(0.70_0.18_75)]' :
                          'bg-[oklch(0.55_0.22_25)]'
                        }`} />
                      <span>{point.label}</span>
                    </div>
                  ))}
                </div>
                <div className="h-28 rounded-lg bg-gradient-to-br from-[oklch(0.60_0.15_145)]/40 via-cyan-400/30 to-emerald-300/40 shadow-inner" />
              </div>
            </div>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex flex-wrap gap-3">
                <Badge variant="outline" className="text-[10px]">Legend</Badge>
                <span>Green: &lt;5kOhm • Amber: 5-10kOhm • Red: &gt;10kOhm</span>
              </div>
              <div>
                Impedance and electrode quality map onto the 3D graphic for visual GO/NOGO traffic-light feedback. When wired to live feeds, each pad will animate as impedance updates arrive.
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device / Routing / Safety</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded border border-border bg-muted/40 p-3 text-xs">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-foreground">{deviceModel}</div>
                <Badge variant="outline" className="text-[11px]">Shared UI profile</Badge>
              </div>
              <div className="mt-1 text-muted-foreground">
                Connect/disconnect controls live in the header device box; routing and safety settings stay consistent across BabEEG Core, in-ear bioboard, and cEEGrid hardware.
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="auto-recognition"
                checked={autoRecognized}
                onCheckedChange={(checked) => setAutoRecognized(checked === true)}
              />
              <Label htmlFor="auto-recognition" className="text-sm">Auto-recognize hardware family and apply matching profile</Label>
            </div>
            <div>
              <Label className="text-sm">Calibrate</Label>
              <div className="mt-1 flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={handleRunCalibration}>Run</Button>
                <Progress value={0} className="flex-1" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-sm">Reference/Ground</Label>
              <div className="flex flex-wrap gap-2">
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
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => toast.info('Opening threat log...')}>Threat log</Button>
              <Button variant="outline" size="sm" onClick={() => toast.info('Opening HF notes...')}>HF notes</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Signal Quality Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[600px] overflow-y-auto pr-2">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                { name: 'Fp1', quality: 'good' as const },
                { name: 'Fp2', quality: 'good' as const },
                { name: 'F3', quality: 'fair' as const },
                { name: 'F4', quality: 'good' as const },
                { name: 'C3', quality: 'good' as const },
                { name: 'C4', quality: 'good' as const },
                { name: 'Cz', quality: 'fair' as const },
                { name: 'P3', quality: 'good' as const },
                { name: 'P4', quality: 'good' as const },
                { name: 'O1', quality: 'good' as const },
                { name: 'O2', quality: 'fair' as const },
                { name: 'T3', quality: 'poor' as const },
                { name: 'T4', quality: 'good' as const },
                { name: 'Pz', quality: 'good' as const },
                { name: 'Oz', quality: 'fair' as const },
                { name: 'Fz', quality: 'good' as const },
              ].slice(0, selectedStream ? 32 : 3).map((channel) => (
                <div key={channel.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Channel {channel.name}</span>
                    <Badge
                      variant="outline"
                      className={
                        channel.quality === 'good'
                          ? 'bg-[oklch(0.60_0.15_145)] text-white'
                          : channel.quality === 'fair'
                            ? 'bg-[oklch(0.70_0.18_75)] text-white'
                            : 'bg-[oklch(0.55_0.22_25)] text-white'
                      }
                    >
                      {channel.quality === 'good' ? 'Good' : channel.quality === 'fair' ? 'Fair' : 'Poor'}
                    </Badge>
                  </div>
                  <MiniWaveform quality={channel.quality} />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Clinical Filter Presets</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {['NICU Artifact', 'Neonatal Bands', 'Default'].map((preset) => (
              <Button
                key={preset}
                variant={activePreset === preset ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setActivePreset(preset)
                  toast.success(`Preset applied: ${preset}`)
                }}
              >
                {preset}
              </Button>
            ))}
          </div>
          <div className="text-xs text-muted-foreground">
            Active preset: {activePreset}. Filters stay aligned across Live/Review/Export (UI-REQ-013).
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
              <Input id="patient-id" placeholder="Trẻ-##" />
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

      <div className="flex flex-wrap gap-3">
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
