import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Question, Keyboard, ShieldCheck, BookOpen } from '@/lib/iconShim'

export function HelpDialog() {
  const [open, setOpen] = useState(false)

  const keyboardShortcuts = [
    { key: 'Ctrl + 1', action: 'NICU artifact reduction filter' },
    { key: 'Ctrl + 2', action: 'Neonatal bands filter' },
    { key: 'Ctrl + 3', action: 'Low-pass default' },
    { key: 'Ctrl + 4', action: 'High-pass default' },
    { key: 'Space', action: 'Play/Pause playback' },
    { key: 'Left Arrow', action: 'Seek backward 10s' },
    { key: 'Right Arrow', action: 'Seek forward 10s' },
    { key: '?', action: 'Show this help dialog' },
  ]

  const regulatoryInfo = [
    { standard: 'IEC 62304', description: 'Medical device software - Class B' },
    { standard: 'ISO 14971', description: 'Risk management for medical devices' },
    { standard: 'IEC 62366', description: 'Usability engineering for medical devices' },
    { standard: 'IEC 81001-5-1', description: 'Cybersecurity for connected medical devices' },
  ]

  const quickGuides = [
    {
      title: 'Starting a Monitoring Session',
      steps: [
        'Navigate to Setup tab',
        'Enter patient metadata (ID, GA, weight)',
        'Check electrode impedance (all should be < 5kΩ)',
        'Verify LSL stream connection',
        'Complete preflight checklist',
        'Click "Start Monitoring" when all checks pass'
      ]
    },
    {
      title: 'Reviewing EEG Data',
      steps: [
        'Navigate to Data tab',
        'Select session from table',
        'Click "Review" to open Review tab',
        'Use transport controls to navigate timeline',
        'Add annotations as needed',
        'Export findings with reviewer identity'
      ]
    },
    {
      title: 'Importing Datasets',
      steps: [
        'Navigate to Import tab',
        'Select dataset type (Temple/CHB-MIT)',
        'Browse and select EDF file',
        'Assign to patient (new or existing)',
        'Click "Validate File" to check integrity',
        'Review validation results',
        'Map channels if needed',
        'Click "Start Import" when ready'
      ]
    }
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Question className="mr-2 h-4 w-4" />
          Help
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>BabEEG Help & Documentation</DialogTitle>
          <DialogDescription>
            Quick reference for keyboard shortcuts, workflows, and regulatory information
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="shortcuts" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="shortcuts">
              <Keyboard className="mr-2 h-4 w-4" />
              Shortcuts
            </TabsTrigger>
            <TabsTrigger value="guides">
              <BookOpen className="mr-2 h-4 w-4" />
              Guides
            </TabsTrigger>
            <TabsTrigger value="regulatory">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Regulatory
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-96 mt-4">
            <TabsContent value="shortcuts" className="space-y-3">
              <div className="space-y-2">
                {keyboardShortcuts.map((shortcut, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded border border-border bg-card p-3"
                  >
                    <span className="text-sm">{shortcut.action}</span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {shortcut.key}
                    </Badge>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="guides" className="space-y-4">
              {quickGuides.map((guide, idx) => (
                <Card key={idx}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{guide.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-2">
                      {guide.steps.map((step, stepIdx) => (
                        <li key={stepIdx} className="flex gap-2 text-sm">
                          <Badge variant="outline" className="h-5 w-5 shrink-0 justify-center p-0 text-xs">
                            {stepIdx + 1}
                          </Badge>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="regulatory" className="space-y-3">
              <div className="space-y-3">
                {regulatoryInfo.map((info, idx) => (
                  <Card key={idx}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">{info.standard}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">{info.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="border-primary/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Traceability Requirements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs">
                  <div>
                    <div className="font-medium">UI Requirements</div>
                    <p className="text-muted-foreground">
                      All UI elements are tagged with UI-REQ-XXX identifiers for traceability to requirements
                    </p>
                  </div>
                  <div>
                    <div className="font-medium">Hazard IDs</div>
                    <p className="text-muted-foreground">
                      Risk mitigations are marked with Hazard IDs per ISO 14971 risk analysis
                    </p>
                  </div>
                  <div>
                    <div className="font-medium">Audit Trail</div>
                    <p className="text-muted-foreground">
                      All user actions, data exports, and system events are logged with 90-day retention
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
