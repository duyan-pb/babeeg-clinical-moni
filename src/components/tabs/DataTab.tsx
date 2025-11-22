import { useState, useEffect } from 'react'
import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowClockwise, Download, FolderOpen, Archive, Trash } from '@/lib/iconShim'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { ExportDialog } from '@/components/export/ExportDialog'
import { generateDummySessions } from '@/lib/dummy-data'
import { toast } from 'sonner'
import type { Session } from '@/types'

export function DataTab() {
  const [sessions, setSessions] = useKV<Session[]>('eeg-sessions', [])
  const [activeDataset, setActiveDataset] = useKV<{ id: string; sessionName: string; patientId: string } | null>('active-dataset', null)
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const sessionList = sessions || []
  const [patientData] = useKV<{
    patientId: string
    mrn: string
    ga: string
    weight: string
    clinician: string
    shift: 'Day' | 'Night'
  }>('patient-data', {
    patientId: 'Trẻ-##',
    mrn: '',
    ga: '',
    weight: '',
    clinician: '',
    shift: 'Day'
  })

  useEffect(() => {
    if (sessionList.length === 0) {
      setSessions(generateDummySessions())
    }
  }, [])

  const handleSelectSession = (session: Session) => {
    setSelectedSession(session)
    setActiveDataset({
      id: session.id,
      sessionName: session.sessionName,
      patientId: session.patientId
    })
    toast.info(`Selected session: ${session.sessionName}`)
  }

  const handleExport = (session: Session) => {
    setSelectedSession(session)
    setExportDialogOpen(true)
  }

  const handleRefresh = () => {
    toast.success('Sessions refreshed')
  }

  const handleNewSession = () => {
    const newSession: Session = {
      id: `session-${Date.now()}`,
      patientId: 'Trẻ-##',
      mrn: 'MRN-000000',
      ga: '36w',
      weight: '2500g',
      clinician: 'BS. Nguyễn',
      shift: 'Day',
      sessionName: 'Phiên mới',
      careSetting: 'NICU',
      tech: 'KTV 1',
      startTime: new Date().toLocaleString(),
      duration: 0,
      size: '0 MB',
      tags: [],
      integrity: 'OK',
      location: 'local'
    }
    setSessions((current) => [...(current || []), newSession])
    setActiveDataset({
      id: newSession.id,
      sessionName: newSession.sessionName,
      patientId: newSession.patientId
    })
    toast.success('New session created')
  }

  const handleOpenFolder = (session: Session) => {
    toast.info(`Opening folder for ${session.sessionName}`)
  }

  const handleArchive = (session: Session) => {
    toast.success(`Archived ${session.sessionName}`)
  }

  const handleDelete = (session: Session) => {
    setSessions((current) => (current || []).filter(s => s.id !== session.id))
    if (selectedSession?.id === session.id) {
      setSelectedSession(null)
      setActiveDataset(null)
    }
    toast.success(`Deleted ${session.sessionName}`)
  }

  const handleIntegritySweep = () => {
    toast.info('Running integrity sweep...')
    setTimeout(() => toast.success('Integrity sweep complete - all checksums valid'), 2000)
  }

  const handleOpenInReview = () => {
    if (selectedSession) {
      toast.success(`Opening ${selectedSession.sessionName} in Review tab`)
    }
  }

  const handleSendToComprehensive = () => {
    if (selectedSession) {
      toast.success(`Sending ${selectedSession.sessionName} to Comprehensive view`)
    }
  }

  const handleSyncToPACS = () => {
    if (selectedSession) {
      toast.info(`Syncing ${selectedSession.sessionName} to PACS/FHIR...`)
      setTimeout(() => toast.success('Sync complete'), 2000)
    }
  }

  const filteredSessions = sessionList.filter(session => {
    const matchesSearch = session.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         session.sessionName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'local' && session.location === 'local') ||
                         (filterType === 'cloud' && session.location === 'cloud')
    return matchesSearch && matchesFilter
  })

  return (
    <div className="page-shell space-y-6">
      <Card className="border border-border/70 bg-card/80 shadow-sm">
        <CardContent className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <Badge variant="outline">Patient</Badge>
            <span className="font-semibold">{patientData?.patientId || 'Unset'}</span>
            <span className="text-muted-foreground">MRN: {patientData?.mrn || '—'}</span>
            <span className="text-muted-foreground">GA: {patientData?.ga || '—'} wks</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Badge variant="outline">Dataset</Badge>
            <span className="font-semibold">{activeDataset?.sessionName || 'Not selected'}</span>
            <Badge variant="outline" className="text-[11px]">
              {activeDataset?.patientId ? `Linked to ${activeDataset.patientId}` : 'Select a session to link'}
            </Badge>
            <Badge variant="outline" className="text-[11px]">Demo data</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span><span className="font-semibold">82%</span> used</span>
          <span>Data root: <span className="font-medium">/data/babeeg</span></span>
          <span>Retention: <span className="font-medium">90d</span></span>
          <Button variant="outline" size="sm" onClick={handleIntegritySweep}>Run integrity sweep</Button>
          <Badge variant="outline">DB: SQLite active</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Sessions</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Input 
                    placeholder="Search..." 
                    className="w-48" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Button variant="outline" size="sm" onClick={handleRefresh}>
                    <ArrowClockwise />
                  </Button>
                  <Button size="sm" onClick={handleNewSession}>New Session</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="overflow-auto">
              <div className="mb-3 flex gap-2">
                <Badge 
                  variant={filterType === 'all' ? 'default' : 'outline'} 
                  className="cursor-pointer"
                  onClick={() => setFilterType('all')}
                >
                  All
                </Badge>
                <Badge 
                  variant={filterType === 'local' ? 'default' : 'outline'} 
                  className="cursor-pointer"
                  onClick={() => setFilterType('local')}
                >
                  Local
                </Badge>
                <Badge 
                  variant={filterType === 'cloud' ? 'default' : 'outline'} 
                  className="cursor-pointer"
                  onClick={() => setFilterType('cloud')}
                >
                  Cloud
                </Badge>
                <Badge 
                  variant={filterType === 'frozen' ? 'default' : 'outline'} 
                  className="cursor-pointer"
                  onClick={() => setFilterType('frozen')}
                >
                  Frozen
                </Badge>
              </div>
              
              {filteredSessions.length === 0 ? (
                <div className="rounded border border-dashed border-border p-12 text-center">
                  <p className="text-sm text-muted-foreground">
                    {searchQuery ? 'No sessions match your search.' : 'No sessions found. Create a new session to get started.'}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date/Time</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Integrity</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSessions.map((session) => (
                      <TableRow 
                        key={session.id}
                        className={`cursor-pointer hover:bg-muted/50 ${selectedSession?.id === session.id ? 'bg-muted/60' : ''}`}
                        onClick={() => handleSelectSession(session)}
                      >
                        <TableCell className="text-xs">{session.startTime}</TableCell>
                        <TableCell className="text-xs font-medium">{session.patientId}</TableCell>
                        <TableCell className="text-xs">{session.duration} min</TableCell>
                        <TableCell className="text-xs">{session.size}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {session.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={session.integrity === 'OK' ? 'outline' : 'destructive'} className="text-xs">
                            {session.integrity}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs">{session.location}</TableCell>
                        <TableCell>
                            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  disabled={selectedSession?.id !== session.id}
                                  onClick={() => handleOpenFolder(session)}
                                >
                                  <FolderOpen className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Open session folder</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  disabled={selectedSession?.id !== session.id}
                                  onClick={() => handleExport(session)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Export session</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  disabled={selectedSession?.id !== session.id}
                                  onClick={() => handleArchive(session)}
                                >
                                  <Archive className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Archive session</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  disabled={selectedSession?.id !== session.id}
                                  onClick={() => handleDelete(session)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete session</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selectedSession ? (
                <p className="text-sm text-muted-foreground">Select a session to view details</p>
              ) : (
                <>
                  <div>
                    <div className="text-sm font-medium">Session Summary</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {selectedSession.tags.map(tag => (
                        <Badge key={tag}>{tag}</Badge>
                      ))}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {selectedSession.sessionName} - {selectedSession.duration} minutes
                    </p>
                  </div>

                  <div>
                    <div className="text-sm font-medium">Chain-of-custody</div>
                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                      <div>Created by: {selectedSession.clinician}</div>
                      <div>Accessed by: {selectedSession.tech}</div>
                      <div>Last verified: {new Date().toLocaleString()}</div>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 text-sm font-medium">Verification</div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">Checksum OK</Badge>
                      <Badge variant="outline">Schema v1.4</Badge>
                      <Badge variant="outline">Compression Zstd</Badge>
                      <Badge variant="outline">Consent linked</Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={handleOpenInReview}
                    >
                      Open in Review
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={handleSendToComprehensive}
                    >
                      Send to Comprehensive
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={handleSyncToPACS}
                    >
                      Sync to PACS/FHIR
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => toast.info('Opening threat log...')}
                    >
                      Threat log
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => toast.info('Opening usability log...')}
                    >
                      Usability log
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Export Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => selectedSession && handleExport(selectedSession)}
                disabled={!selectedSession}
              >
                Export CSV
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => toast.info('EDF export pending implementation')}
                disabled={!selectedSession}
              >
                Export EDF (pending)
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => toast.info('Bulk archive started')}
                disabled={!selectedSession}
              >
                Bulk archive
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => toast.info('Opening audit trail...')}
                disabled={!selectedSession}
              >
                Audit Trail
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <ExportDialog 
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        sessionId={selectedSession?.id}
      />
    </div>
  )
}
