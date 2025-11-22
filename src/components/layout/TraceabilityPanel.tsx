import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ShieldCheck, FileText, IdentificationCard } from '@/lib/iconShim'

interface TraceabilityPanelProps {
  sessionId?: string
  reviewer?: string
  timestamp?: string
  checksum?: string
  consentStatus?: 'on-file' | 'pending' | 'not-required'
  regulatoryMarkers?: {
    iecClass: string
    hazardIds: string[]
    uiReqIds: string[]
  }
}

export function TraceabilityPanel({
  sessionId = 'N/A',
  reviewer = 'Not assigned',
  timestamp,
  checksum,
  consentStatus = 'pending',
  regulatoryMarkers
}: TraceabilityPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">Traceability & Compliance</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Session ID</span>
            <code className="text-xs">{sessionId}</code>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Reviewer</span>
            <span className="font-medium">{reviewer}</span>
          </div>
          {timestamp && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Timestamp</span>
              <span className="font-mono text-xs">{timestamp}</span>
            </div>
          )}
          {checksum && (
            <div className="flex items-start justify-between gap-2">
              <span className="text-muted-foreground">Integrity</span>
              <div className="text-right">
                <Badge variant="outline" className="text-xs">
                  <ShieldCheck className="mr-1 h-3 w-3 text-[oklch(0.60_0.15_145)]" />
                  Verified
                </Badge>
                <code className="mt-1 block text-[10px] text-muted-foreground">
                  {checksum.slice(0, 16)}...
                </code>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Consent</span>
            <Badge 
              variant={consentStatus === 'on-file' ? 'outline' : 'secondary'}
              className="text-xs"
            >
              <FileText className="mr-1 h-3 w-3" />
              {consentStatus === 'on-file' ? 'On File' : 
               consentStatus === 'pending' ? 'Pending' : 'Not Required'}
            </Badge>
          </div>
        </div>

        {regulatoryMarkers && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <IdentificationCard className="h-3 w-3" />
                <span>Regulatory Markers</span>
              </div>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-[10px]">
                  {regulatoryMarkers.iecClass}
                </Badge>
                {regulatoryMarkers.hazardIds.map((id) => (
                  <Badge key={id} variant="outline" className="text-[10px]">
                    H-{id}
                  </Badge>
                ))}
                {regulatoryMarkers.uiReqIds.map((id) => (
                  <Badge key={id} variant="outline" className="text-[10px]">
                    UI-{id}
                  </Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
