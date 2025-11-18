import { useKV } from '@github/spark/hooks'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowClockwise, Download, FolderOpen, Archive, Trash } from '@phosphor-icons/react'
import type { Session } from '@/types'

export function DataTab() {
  const [sessions] = useKV<Session[]>('eeg-sessions', [])
  const sessionList = sessions || []

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
        <div className="flex items-center gap-4 text-sm">
          <span><span className="font-semibold">82%</span> used</span>
          <span>Data root: <span className="font-medium">/data/babeeg</span></span>
          <span>Retention: <span className="font-medium">90d</span></span>
          <Button variant="outline" size="sm">Run integrity sweep</Button>
          <Badge variant="outline">DB: SQLite active</Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Sessions</CardTitle>
                <div className="flex items-center gap-2">
                  <Input placeholder="Search..." className="w-48" />
                  <Button variant="outline" size="sm">
                    <ArrowClockwise />
                  </Button>
                  <Button size="sm">New Session</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-3 flex gap-2">
                <Badge variant="outline" className="cursor-pointer">All</Badge>
                <Badge variant="outline" className="cursor-pointer">Local</Badge>
                <Badge variant="outline" className="cursor-pointer">Cloud</Badge>
                <Badge variant="outline" className="cursor-pointer">Frozen</Badge>
              </div>
              
              {sessionList.length === 0 ? (
                <div className="rounded border border-dashed border-border p-12 text-center">
                  <p className="text-sm text-muted-foreground">No sessions found. Create a new session to get started.</p>
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
                    {sessionList.map((session) => (
                      <TableRow key={session.id}>
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
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <FolderOpen className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Archive className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash className="h-4 w-4" />
                            </Button>
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
              {sessionList.length === 0 ? (
                <p className="text-sm text-muted-foreground">Select a session to view details</p>
              ) : (
                <>
                  <div>
                    <div className="text-sm font-medium">Session Summary</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge>seizure</Badge>
                      <Badge>artifact</Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Notes and observations from the recording session.
                    </p>
                  </div>

                  <div>
                    <div className="text-sm font-medium">Chain-of-custody</div>
                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                      <div>Created by: Dr. Smith</div>
                      <div>Accessed by: Dr. Jones, Tech 1</div>
                      <div>Last verified: 2025-01-10 14:30</div>
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
                    <Button variant="outline" size="sm" className="w-full">Open in Review</Button>
                    <Button variant="outline" size="sm" className="w-full">Send to Comprehensive</Button>
                    <Button variant="outline" size="sm" className="w-full">Sync to PACS/FHIR</Button>
                    <Button variant="outline" size="sm" className="w-full">Threat log</Button>
                    <Button variant="outline" size="sm" className="w-full">Usability log</Button>
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
              <Button variant="outline" size="sm" className="w-full">Export CSV</Button>
              <Button variant="outline" size="sm" className="w-full">Export EDF (pending)</Button>
              <Button variant="outline" size="sm" className="w-full">Bulk archive</Button>
              <Button variant="outline" size="sm" className="w-full">Audit Trail</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
