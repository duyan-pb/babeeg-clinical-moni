import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, Warning, Circle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface StatusItem {
  label: string
  value: string | number
  status?: 'ok' | 'warn' | 'error' | 'neutral'
  description?: string
}

interface SystemStatusWidgetProps {
  title?: string
  items: StatusItem[]
  className?: string
}

export function SystemStatusWidget({ title = 'System Status', items, className }: SystemStatusWidgetProps) {
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'ok':
        return <CheckCircle className="h-4 w-4 text-[oklch(0.60_0.15_145)]" weight="fill" />
      case 'warn':
        return <Warning className="h-4 w-4 text-[oklch(0.70_0.18_75)]" weight="fill" />
      case 'error':
        return <XCircle className="h-4 w-4 text-destructive" weight="fill" />
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'ok':
        return 'text-[oklch(0.60_0.15_145)]'
      case 'warn':
        return 'text-[oklch(0.70_0.18_75)]'
      case 'error':
        return 'text-destructive'
      default:
        return 'text-foreground'
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-start justify-between gap-3 text-sm">
              <div className="flex items-center gap-2">
                {item.status && getStatusIcon(item.status)}
                <div>
                  <div className="text-muted-foreground">{item.label}</div>
                  {item.description && (
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  )}
                </div>
              </div>
              <div className={cn('font-medium', getStatusColor(item.status))}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
