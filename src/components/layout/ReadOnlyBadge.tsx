import { Badge } from '@/components/ui/badge'
import { LockSimple } from '@phosphor-icons/react'

interface ReadOnlyBadgeProps {
  isReadOnly: boolean
  className?: string
}

export function ReadOnlyBadge({ isReadOnly, className }: ReadOnlyBadgeProps) {
  if (!isReadOnly) return null

  return (
    <Badge variant="secondary" className={className}>
      <LockSimple className="mr-1 h-3 w-3" />
      Read Only
    </Badge>
  )
}
