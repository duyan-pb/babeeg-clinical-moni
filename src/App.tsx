import { useState } from 'react'
import { GlobalHeader, PatientStrip, SafetyStrip, Footer } from '@/components/layout/GlobalLayout'
import { LeftNav } from '@/components/layout/LeftNav'
import { SecurityBanner } from '@/components/layout/SecurityBanner'
import { SetupTab } from '@/components/tabs/SetupTab'
import { ReviewTab } from '@/components/tabs/ReviewTab'
import { PatientTab } from '@/components/tabs/PatientTab'
import { DataTab } from '@/components/tabs/DataTab'
import { ImportTab } from '@/components/tabs/ImportTab'
import { ComprehensiveTab } from '@/components/tabs/ComprehensiveTab'
import { InnovationTab } from '@/components/tabs/InnovationTab'
import { Toaster } from '@/components/ui/sonner'
import { useOfflineSync } from '@/hooks/use-offline-sync'
import { Badge } from '@/components/ui/badge'

function App() {
  const { syncStatus } = useOfflineSync()
  const [isRemoteAccess] = useState(false)
  const [activeView, setActiveView] = useState('setup')
  const chromeHeight = 220 + (isRemoteAccess ? 40 : 0) + (!syncStatus.isOnline ? 28 : 0)

  const renderContent = () => {
    switch (activeView) {
      case 'setup':
        return <SetupTab />
      case 'patient':
        return <PatientTab />
      case 'review':
        return <ReviewTab />
      case 'data':
        return <DataTab />
      case 'import':
        return <ImportTab />
      case 'comprehensive':
        return <ComprehensiveTab />
      case 'innovation':
        return <InnovationTab />
      case 'preferences':
        return (
          <div className="flex h-full items-center justify-center p-6">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-muted-foreground">Settings</h2>
              <p className="mt-2 text-sm text-muted-foreground">This view is planned for a future release</p>
            </div>
          </div>
        )
      default:
        return <SetupTab />
    }
  }

  return (
    <div
      className="layout-16x9 flex h-screen flex-col overflow-hidden bg-muted/30"
      style={{ ['--chrome-height' as string]: `${chromeHeight}px` }}
    >
      <GlobalHeader />
      <SafetyStrip />
      <PatientStrip />

      {isRemoteAccess && (
        <div className="px-4 pt-2">
          <SecurityBanner isRemote={isRemoteAccess} isOnline={syncStatus.isOnline} />
        </div>
      )}

      {!syncStatus.isOnline && (
        <div className="border-b border-border bg-muted px-6 py-2">
          <div className="flex items-center gap-2 text-xs">
            <Badge variant="secondary">Offline Mode</Badge>
            {syncStatus.pendingChanges > 0 && (
              <span className="text-muted-foreground">
                {syncStatus.pendingChanges} change{syncStatus.pendingChanges !== 1 ? 's' : ''} pending sync
              </span>
            )}
          </div>
        </div>
      )}

      <div className="layout-viewport">
        <LeftNav activeView={activeView} onViewChange={setActiveView} />

        <main className="viewport-canvas">
          <div className="viewport-scroll">
            {renderContent()}
          </div>
        </main>
      </div>

      <Footer />
      <Toaster />
    </div>
  )
}

export default App
