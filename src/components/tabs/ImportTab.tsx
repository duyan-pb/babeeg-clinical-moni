import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { FolderOpen, FileArrowDown } from '@phosphor-icons/react'

export function ImportTab() {
  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Import Dataset Folder</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[200px_1fr_auto]">
            <div className="space-y-1">
              <Label>Dataset</Label>
              <Select defaultValue="4940267">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4940267">4940267 (Temple)</SelectItem>
                  <SelectItem value="7477575">7477575 (CHB-MIT)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Path</Label>
              <Input readOnly placeholder="Select folder..." />
            </div>
            <div className="flex items-end">
              <Button variant="outline">
                <FolderOpen className="mr-2" />
                Select Folder
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Button>Import Dataset</Button>
            <Progress value={0} className="w-full" />
            <p className="text-xs text-muted-foreground">Status: Idle</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Import Single EDF</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-[1fr_200px_auto]">
            <div className="space-y-1">
              <Label>EDF File</Label>
              <Input readOnly placeholder="Select EDF file..." />
            </div>
            <div className="space-y-1">
              <Label>Subject ID (optional)</Label>
              <Input placeholder="e.g., Neo-12" />
            </div>
            <div className="flex items-end">
              <Button variant="outline">
                <FileArrowDown className="mr-2" />
                Browse
              </Button>
            </div>
          </div>
          <Button>Import File</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>EDF File Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 text-sm md:grid-cols-2">
            <div>
              <span className="text-muted-foreground">Start Time:</span>
              <span className="ml-2 font-medium">2025-01-10 14:30:00</span>
            </div>
            <div>
              <span className="text-muted-foreground">Duration:</span>
              <span className="ml-2 font-medium">45 minutes</span>
            </div>
            <div>
              <span className="text-muted-foreground">Channels:</span>
              <span className="ml-2 font-medium">32</span>
            </div>
            <div>
              <span className="text-muted-foreground">Sampling Rate:</span>
              <span className="ml-2 font-medium">256 Hz</span>
            </div>
            <div className="md:col-span-2">
              <div className="text-muted-foreground">Patient Info:</div>
              <p className="mt-1 text-xs">Neonatal patient, gestational age 38w, weight 2800g</p>
            </div>
            <div className="md:col-span-2">
              <div className="mb-2 text-muted-foreground">Channel Labels:</div>
              <div className="flex flex-wrap gap-2">
                {['Fp1', 'Fp2', 'F3', 'F4', 'Cz', 'C3', 'C4', 'P3', 'P4', 'O1', 'O2', 'T3', 'T4', 'Pz', 'Oz'].map((ch) => (
                  <Badge key={ch} variant="outline">{ch}</Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
