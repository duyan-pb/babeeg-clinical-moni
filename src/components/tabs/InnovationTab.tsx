import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Bell, ArrowClockwise, Flask } from '@phosphor-icons/react'
import { MultiPatientGrid } from '@/components/monitoring/MultiPatientGrid'
import { toast } from 'sonner'

interface FeatureFlags {
  multiPatientGrid: boolean
  mobileMonitoring: boolean
  aiSpikeDetection: boolean
  abTest: boolean
}

export function InnovationTab() {
  const [featureFlags, setFeatureFlags] = useKV<FeatureFlags>('innovation-feature-flags', {
    multiPatientGrid: true,
    mobileMonitoring: false,
    aiSpikeDetection: true,
    abTest: false
  })

  const flags = featureFlags || {
    multiPatientGrid: true,
    mobileMonitoring: false,
    aiSpikeDetection: true,
    abTest: false
  }

  const toggleFlag = (flag: keyof FeatureFlags) => {
    const currentFlags = featureFlags || flags
    setFeatureFlags((current) => ({
      ...(current || flags),
      [flag]: !currentFlags[flag]
    }))
    toast.info(`Feature ${flag} ${!currentFlags[flag] ? 'enabled' : 'disabled'}`)
  }

  return (
    <div className="space-y-6 p-6">
      <Alert className="border-[oklch(0.70_0.18_75)] bg-[oklch(0.70_0.18_75)]/10">
        <Flask className="h-4 w-4" />
        <AlertDescription>
          <strong>LAB-ONLY / SANDBOX:</strong> Experimental features isolated from production data. No patient PHI in this environment.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Feature Flags</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between rounded border border-border p-3">
              <Label htmlFor="multi-patient-flag" className="text-sm">Multi-Patient Grid</Label>
              <Switch 
                id="multi-patient-flag"
                checked={flags.multiPatientGrid}
                onCheckedChange={() => toggleFlag('multiPatientGrid')}
              />
            </div>
            <div className="flex items-center justify-between rounded border border-border p-3">
              <Label htmlFor="mobile-flag" className="text-sm">Mobile Monitoring</Label>
              <Switch 
                id="mobile-flag"
                checked={flags.mobileMonitoring}
                onCheckedChange={() => toggleFlag('mobileMonitoring')}
              />
            </div>
            <div className="flex items-center justify-between rounded border border-border p-3">
              <Label htmlFor="ai-spike-flag" className="text-sm">AI Spike Detection</Label>
              <Switch 
                id="ai-spike-flag"
                checked={flags.aiSpikeDetection}
                onCheckedChange={() => toggleFlag('aiSpikeDetection')}
              />
            </div>
            <div className="flex items-center justify-between rounded border border-border p-3">
              <Label htmlFor="ab-test-flag" className="text-sm">A/B Testing Mode</Label>
              <Switch 
                id="ab-test-flag"
                checked={flags.abTest}
                onCheckedChange={() => toggleFlag('abTest')}
              />
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm">Back to stable</Button>
            <Button variant="outline" size="sm">Export prototype log</Button>
          </div>
        </CardContent>
      </Card>

      {flags.multiPatientGrid && (
        <Card>
          <CardHeader>
            <CardTitle>Multi-Patient Grid (Persyst-style prototype)</CardTitle>
          </CardHeader>
          <CardContent>
            <MultiPatientGrid />
          </CardContent>
        </Card>
      )}

      {flags.mobileMonitoring && (
        <Card>
          <CardHeader>
            <CardTitle>Mobile Monitoring Cards (planned)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-border p-4">
                <div className="mb-3 font-semibold">Home Kit A</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className="bg-[oklch(0.60_0.15_145)] text-white">Online</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Battery:</span>
                    <span className="font-medium">82%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Connectivity:</span>
                    <Badge variant="outline">OK</Badge>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <Bell className="mr-2 h-3 w-3" />
                    Notify caregiver
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <ArrowClockwise className="mr-2 h-3 w-3" />
                    Reboot
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">Sync logs</Button>
                </div>
              </div>

              <div className="rounded-lg border border-border p-4">
                <div className="mb-3 font-semibold">Home Kit B</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="outline">Offline</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Battery:</span>
                    <span className="font-medium text-[oklch(0.70_0.18_75)]">34%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Connectivity:</span>
                    <Badge variant="outline" className="border-[oklch(0.70_0.18_75)] text-[oklch(0.70_0.18_75)]">Low</Badge>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Button variant="outline" size="sm" className="w-full">
                    <Bell className="mr-2 h-3 w-3" />
                    Notify caregiver
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">
                    <ArrowClockwise className="mr-2 h-3 w-3" />
                    Reboot
                  </Button>
                  <Button variant="outline" size="sm" className="w-full">Sync logs</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Prototype Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea 
            placeholder="Risk flags, usability observations, cyber notes (kept in sandbox log)..." 
            rows={6}
          />
          <Button>Save to Sandbox Log</Button>
        </CardContent>
      </Card>
    </div>
  )
}
