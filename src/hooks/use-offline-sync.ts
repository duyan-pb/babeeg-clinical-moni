import { useState, useEffect, useMemo } from 'react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'

interface SyncStatus {
  isOnline: boolean
  pendingChanges: number
  lastSyncTime: number | null
  syncInProgress: boolean
}

interface PatientData {
  mrn?: string
}

interface OfflineSyncOptions {
  sessionScope?: string
  syncHandler?: (changes: any[], scopeKey: string) => Promise<void>
}

export function useOfflineSync(options?: OfflineSyncOptions) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    pendingChanges: 0,
    lastSyncTime: null,
    syncInProgress: false
  })

  const [patientData] = useKV<PatientData>('patient-data')

  const scopeKey = useMemo(() => {
    if (options?.sessionScope && options.sessionScope.trim().length > 0) {
      return options.sessionScope.trim()
    }
    const mrn = patientData?.mrn?.trim()
    return mrn && mrn.length > 0 ? `patient-${mrn}` : 'global'
  }, [patientData?.mrn, options?.sessionScope])

  const queueKey = `offline-sync-queue-${scopeKey}`
  const [offlineQueue, setOfflineQueue] = useKV<any[]>(queueKey, [])

  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }))
      toast.success('Connection restored - syncing pending changes...')
      syncPendingChanges()
    }

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }))
      toast.warning('Connection lost - switching to offline mode')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    setSyncStatus(prev => ({ 
      ...prev, 
      pendingChanges: offlineQueue?.length || 0 
    }))
  }, [offlineQueue, scopeKey])

  const queueChange = (changeType: string, data: any) => {
    const change = {
      id: Date.now(),
      type: changeType,
      data,
      timestamp: Date.now()
    }

    setOfflineQueue((current) => [...(current || []), change])
    
    if (!syncStatus.isOnline) {
      toast.info('Change queued for sync when online')
    } else {
      syncPendingChanges()
    }
  }

  const syncPendingChanges = async () => {
    const queue = offlineQueue || []
    if (queue.length === 0) return

    setSyncStatus(prev => ({ ...prev, syncInProgress: true }))

    try {
      if (options?.syncHandler) {
        await options.syncHandler(queue, scopeKey)
      } else {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      setOfflineQueue([])
      setSyncStatus(prev => ({ 
        ...prev, 
        syncInProgress: false,
        lastSyncTime: Date.now(),
        pendingChanges: 0
      }))
      
      toast.success(`Synced ${queue.length} pending changes`)
    } catch (error) {
      setSyncStatus(prev => ({ ...prev, syncInProgress: false }))
      toast.error('Sync failed - changes remain queued')
    }
  }

  return {
    syncStatus,
    queueChange,
    syncNow: syncPendingChanges
  }
}
