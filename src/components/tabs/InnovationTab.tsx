import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { FolderOpen, Bell, ArrowClockwise } from '@phosphor-icons/react'

export function InnovationTab() {
  return (
    <div className="space-y-6 p-6">
      <div className="rounded-lg border border-amber-500 bg-amber-50 p-4 dark:bg-amber-950">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-amber-600 text-amber-600">Lab-only</Badge>
            <span className="text-sm text-amber-900 dark:text-amber-100">No patient PHI</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Switch id="ab-test" />
              <Label htmlFor="ab-test" className="text-sm">Enable A/B test</Label>
            </div>
            <Button variant="outline" size="sm">Back to stable</Button>
            <Button variant="outline" size="sm">Export prototype log</Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Multi-Patient Grid (Persyst-style prototype)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((bed) => (
                <div key={bed} className="rounded-lg border border-border p-4">
                  <div className="mb-2 font-semibold">Bed {bed}</div>
                  <div className="mb-3 h-16 rounded border border-border bg-muted/20 p-2">
                    <div className="text-xs text-muted-foreground">Trend mini</div>
                  </div>
                  <div className="mb-3 h-12 rounded border border-border bg-muted/20 p-2">
                    <div className="text-xs text-muted-foreground">Seiz prob sparkline</div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="flex-1">
                      <FolderOpen className="h-3 w-3" />
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">Pin</Button>
                    <Button variant="outline" size="sm" className="flex-1">Remove</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Spike Review / Ops (pilot)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded border border-border p-4">
              <div className="mb-2 text-sm font-medium">Spike Queue</div>
              <div className="h-32 rounded border border-border bg-muted/20 p-2">
                <div className="text-xs text-muted-foreground">Pending spike events</div>
              </div>
            </div>
            <div className="rounded border border-border p-4">
              <div className="mb-2 text-sm font-medium">Band Power Panels</div>
              <div className="h-32 rounded border border-border bg-muted/20 p-2">
                <div className="text-xs text-muted-foreground">Theta/Alpha/Beta</div>
              </div>
            </div>
            <div className="rounded border border-border p-4">
              <div className="mb-2 text-sm font-medium">Actions</div>
              <div className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">Admit to trend view</Button>
                <Button variant="outline" size="sm" className="w-full">Reject</Button>
                <Button variant="outline" size="sm" className="w-full">Export findings</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
