import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { ShieldWarning, WifiHigh, WifiSlash } from '@/lib/iconShim'

interface SecurityBannerProps {
  isRemote: boolean
  isOnline: boolean
}

export function SecurityBanner({ isRemote, isOnline }: SecurityBannerProps) {
  if (!isRemote) return null

  return (
    <Alert variant={isOnline ? 'default' : 'destructive'} className="border-l-4">
      <ShieldWarning className="h-4 w-4" />
      <AlertDescription className="flex flex-wrap items-center gap-3">
        <span className="font-medium">Remote Access Mode</span>
        <Badge variant={isOnline ? 'outline' : 'destructive'} className="gap-1">
          {isOnline ? <WifiHigh className="h-3 w-3" /> : <WifiSlash className="h-3 w-3" />}
          {isOnline ? 'Connected' : 'Offline'}
        </Badge>
        {!isOnline && (
          <span className="text-xs">Read-only cache active. Changes will sync when connection restored.</span>
        )}
        {isOnline && (
          <span className="text-xs">Ensure secure network. PHI transmission encrypted via TLS 1.3.</span>
        )}
      </AlertDescription>
    </Alert>
  )
}
