import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CheckCircle, XCircle, ArrowRight, Sparkle } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface DetectedEvent {
  id: string
  type: 'spike' | 'seizure'
  timestamp: number
  confidence: number
  channel: string
  algorithmVersion: string
  status: 'pending' | 'admitted' | 'rejected'
}

const SAMPLE_EVENTS: DetectedEvent[] = [
  { id: 'evt-001', type: 'seizure', timestamp: 450, confidence: 0.92, channel: 'Fp1', algorithmVersion: 'v2.3.1', status: 'pending' },
  { id: 'evt-002', type: 'spike', timestamp: 890, confidence: 0.87, channel: 'F3', algorithmVersion: 'v2.3.1', status: 'pending' },
  { id: 'evt-003', type: 'seizure', timestamp: 1200, confidence: 0.79, channel: 'Cz', algorithmVersion: 'v2.3.1', status: 'pending' },
  { id: 'evt-004', type: 'spike', timestamp: 1450, confidence: 0.95, channel: 'C4', algorithmVersion: 'v2.3.1', status: 'pending' },
]

export function SpikeSeizureQueue() {
  const [events, setEvents] = useKV<DetectedEvent[]>('detected-events', SAMPLE_EVENTS)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const eventList = events || SAMPLE_EVENTS
  const pendingEvents = eventList.filter(e => e.status === 'pending')

  const handleAdmit = (id: string) => {
    setEvents((current) => 
      (current || SAMPLE_EVENTS).map(e => 
        e.id === id ? { ...e, status: 'admitted' as const } : e
      )
    )
    toast.success('Event admitted to review queue')
  }

  const handleReject = (id: string) => {
    setEvents((current) => 
      (current || SAMPLE_EVENTS).map(e => 
        e.id === id ? { ...e, status: 'rejected' as const } : e
      )
    )
    toast.info('Event rejected')
  }

  const handleBatchAdmit = () => {
    setEvents((current) => 
      (current || SAMPLE_EVENTS).map(e => 
        selectedIds.includes(e.id) ? { ...e, status: 'admitted' as const } : e
      )
    )
    toast.success(`${selectedIds.length} events admitted`)
    setSelectedIds([])
  }

  const handleBatchReject = () => {
    setEvents((current) => 
      (current || SAMPLE_EVENTS).map(e => 
        selectedIds.includes(e.id) ? { ...e, status: 'rejected' as const } : e
      )
    )
    toast.info(`${selectedIds.length} events rejected`)
    setSelectedIds([])
  }

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkle className="h-5 w-5" />
            <CardTitle>AI-Assisted Detection Queue</CardTitle>
            <Badge variant="outline">{pendingEvents.length} pending</Badge>
          </div>
          {selectedIds.length > 0 && (
            <div className="flex gap-2">
              <Button size="sm" onClick={handleBatchAdmit}>
                <CheckCircle className="mr-1 h-4 w-4" />
                Admit {selectedIds.length}
              </Button>
              <Button size="sm" variant="outline" onClick={handleBatchReject}>
                <XCircle className="mr-1 h-4 w-4" />
                Reject {selectedIds.length}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-2 pr-3">
            {pendingEvents.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                No pending events
              </div>
            ) : (
              pendingEvents.map((event) => (
                <div
                  key={event.id}
                  className={`rounded-lg border p-3 transition-colors ${
                    selectedIds.includes(event.id) 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(event.id)}
                          onChange={() => toggleSelection(event.id)}
                          className="h-4 w-4"
                        />
                        <Badge 
                          variant={event.type === 'seizure' ? 'destructive' : 'outline'}
                          className="text-xs"
                        >
                          {event.type}
                        </Badge>
                        <span className="text-sm font-medium">{event.channel}</span>
                        <span className="text-xs text-muted-foreground">
                          @ {Math.floor(event.timestamp / 60)}:{(event.timestamp % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-xs">
                        <span>
                          Confidence: 
                          <span className={`ml-1 font-medium ${
                            event.confidence >= 0.9 ? 'text-[oklch(0.60_0.15_145)]' :
                            event.confidence >= 0.8 ? 'text-[oklch(0.70_0.18_75)]' :
                            'text-muted-foreground'
                          }`}>
                            {(event.confidence * 100).toFixed(0)}%
                          </span>
                        </span>
                        <span className="text-muted-foreground">
                          Algorithm: {event.algorithmVersion}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toast.info('Jumping to timestamp...')}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleAdmit(event.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(event.id)}
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
