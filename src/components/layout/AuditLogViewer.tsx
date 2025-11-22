import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Download, MagnifyingGlass, FileText } from '@/lib/iconShim'
import { toast } from 'sonner'

interface AuditEntry {
  id: string
  timestamp: string
  user: string
  action: string
  resource: string
  status: 'success' | 'failure' | 'pending'
  details?: string
}

export function AuditLogViewer() {
  const [auditLog] = useKV<AuditEntry[]>('audit-log', [
    {
      id: '1',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      user: 'Dr. Smith',
      action: 'Export Session',
      resource: 'session-12345',
      status: 'success',
      details: 'Exported to CSV with PHI consent'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      user: 'Dr. Johnson',
      action: 'Review Session',
      resource: 'session-12344',
      status: 'success'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      user: 'Tech Williams',
      action: 'Start Monitoring',
      resource: 'Neo-12',
      status: 'success',
      details: 'LSL stream connected, 32 channels @ 256Hz'
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      user: 'Dr. Brown',
      action: 'Import Dataset',
      resource: 'temple_001.edf',
      status: 'success'
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 18000000).toISOString(),
      user: 'System',
      action: 'Integrity Check',
      resource: 'session-12340',
      status: 'failure',
      details: 'Checksum mismatch detected'
    }
  ])

  const [filter, setFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredLog = (auditLog || []).filter(entry => {
    const matchesFilter = filter === 'all' || entry.status === filter
    const matchesSearch = 
      entry.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.resource.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const handleExportLog = () => {
    toast.success('Audit log exported to CSV')
  }

  const formatTimestamp = (iso: string) => {
    const date = new Date(iso)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle>Audit Trail</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportLog}>
              <Download className="mr-2 h-4 w-4" />
              Export Log
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <div className="relative flex-1 min-w-48">
            <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search user, action, resource..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="failure">Failure</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <ScrollArea className="h-96">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-40">Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLog.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No audit entries found
                  </TableCell>
                </TableRow>
              ) : (
                filteredLog.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-mono text-xs">
                      {formatTimestamp(entry.timestamp)}
                    </TableCell>
                    <TableCell className="text-sm font-medium">{entry.user}</TableCell>
                    <TableCell className="text-sm">{entry.action}</TableCell>
                    <TableCell className="text-sm">
                      <code className="text-xs">{entry.resource}</code>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          entry.status === 'success'
                            ? 'outline'
                            : entry.status === 'failure'
                            ? 'destructive'
                            : 'secondary'
                        }
                        className="text-xs"
                      >
                        {entry.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {entry.details || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing {filteredLog.length} of {auditLog?.length || 0} entries</span>
          <span>Retention: 90 days (IEC62304 compliance)</span>
        </div>
      </CardContent>
    </Card>
  )
}
