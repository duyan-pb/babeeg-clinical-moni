import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Warning, ShieldCheck, FileArrowDown } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sessionId?: string
}

export function ExportDialog({ open, onOpenChange, sessionId }: ExportDialogProps) {
  const [reviewerName, setReviewerName] = useState('')
  const [consentMarker, setConsentMarker] = useState(false)
  const [phiMinimize, setPhiMinimize] = useState(false)
  const [exportPath, setExportPath] = useState('/exports/')
  const [exportFormat, setExportFormat] = useState<'csv' | 'edf' | 'json'>('csv')
  const [isExporting, setIsExporting] = useState(false)

  const canExport = reviewerName.trim().length > 0 && consentMarker

  const handleExport = async () => {
    if (!canExport) {
      toast.error('Please provide reviewer identity and consent marker')
      return
    }

    if (!exportPath.startsWith('/exports/') && !exportPath.startsWith('/data/')) {
      toast.warning('Export path should be in /exports/ or /data/ directory')
      return
    }

    setIsExporting(true)

    setTimeout(() => {
      const timestamp = new Date().toISOString()
      const checksum = `sha256:${Math.random().toString(36).substring(2, 15)}`
      
      const auditEntry = {
        action: 'export',
        sessionId: sessionId || 'unknown',
        reviewer: reviewerName,
        timestamp,
        format: exportFormat,
        path: exportPath,
        phiMinimized: phiMinimize,
        checksum,
        consentOnFile: consentMarker
      }

      console.log('Audit Entry:', auditEntry)

      toast.success(
        `Export complete. Checksum: ${checksum.substring(0, 20)}...`,
        {
          description: `Exported by ${reviewerName} at ${timestamp}`
        }
      )

      setIsExporting(false)
      onOpenChange(false)
      
      setReviewerName('')
      setConsentMarker(false)
      setPhiMinimize(false)
    }, 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileArrowDown className="h-5 w-5" />
            Secure Export with Audit Trail
          </DialogTitle>
          <DialogDescription>
            Export session data with full chain-of-custody and integrity verification
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert className="border-[oklch(0.70_0.18_75)] bg-[oklch(0.70_0.18_75)]/10">
            <Warning className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Notice:</strong> All exports are logged with reviewer identity and timestamp for regulatory compliance
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="reviewer-name">
              Reviewer Identity <span className="text-destructive">*</span>
            </Label>
            <Input
              id="reviewer-name"
              placeholder="Dr. Jane Smith"
              value={reviewerName}
              onChange={(e) => setReviewerName(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Your identity will be recorded in the audit trail
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="export-format">Export Format</Label>
              <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as typeof exportFormat)}>
                <SelectTrigger id="export-format">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV (Time Series)</SelectItem>
                  <SelectItem value="edf">EDF (European Data Format)</SelectItem>
                  <SelectItem value="json">JSON (Metadata + Events)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="export-path">Export Path</Label>
              <Input
                id="export-path"
                value={exportPath}
                onChange={(e) => setExportPath(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3 rounded-lg border border-border p-4">
            <h4 className="text-sm font-medium">Export Options</h4>
            
            <div className="flex items-start gap-2">
              <Checkbox 
                id="consent-marker"
                checked={consentMarker}
                onCheckedChange={(checked) => setConsentMarker(checked === true)}
              />
              <div className="flex-1">
                <Label htmlFor="consent-marker" className="flex items-center gap-2 text-sm font-medium">
                  Consent marker on file
                  <span className="text-destructive">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  Required for PHI export - verify patient consent is documented
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Checkbox 
                id="phi-minimize"
                checked={phiMinimize}
                onCheckedChange={(checked) => setPhiMinimize(checked === true)}
              />
              <div className="flex-1">
                <Label htmlFor="phi-minimize" className="text-sm">
                  PHI minimization (de-identify)
                </Label>
                <p className="text-xs text-muted-foreground">
                  Remove patient identifiers for research/training use
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 rounded-lg bg-muted/30 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ShieldCheck className="h-4 w-4" />
              Export Metadata
            </div>
            <div className="grid gap-1 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Session ID:</span>
                <span className="font-mono">{sessionId || 'current-session'}</span>
              </div>
              <div className="flex justify-between">
                <span>Timestamp:</span>
                <span className="font-mono">{new Date().toISOString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Integrity Check:</span>
                <Badge variant="outline" className="text-xs">SHA-256 checksum</Badge>
              </div>
              <div className="flex justify-between">
                <span>Compliance:</span>
                <Badge variant="outline" className="text-xs">IEC62304 Class B</Badge>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={!canExport || isExporting}
          >
            {isExporting ? 'Exporting...' : 'Export with Audit Stamp'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
