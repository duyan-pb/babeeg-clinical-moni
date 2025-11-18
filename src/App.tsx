import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GlobalHeader, PatientStrip, SafetyStrip, Footer } from '@/components/layout/GlobalLayout'
import { SecurityBanner } from '@/components/layout/SecurityBanner'
import { SetupTab } from '@/components/tabs/SetupTab'
import { ReviewTab } from '@/components/tabs/ReviewTab'
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

  return (
    <div className="flex min-h-screen flex-col">
      <GlobalHeader />
      <PatientStrip />
      <SafetyStrip />
      
      {isRemoteAccess && (
        <div className="px-6 pt-4">
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
      
      <main className="flex-1">
        <Tabs defaultValue="setup" className="h-full">
          <div className="border-b border-border bg-card px-6">
            <TabsList className="h-12 w-full justify-start rounded-none border-0 bg-transparent p-0">
              <TabsTrigger 
                value="setup" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Setup
              </TabsTrigger>
              <TabsTrigger 
                value="review" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Review
              </TabsTrigger>
              <TabsTrigger 
                value="data" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Data
              </TabsTrigger>
              <TabsTrigger 
                value="import" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Import
              </TabsTrigger>
              <TabsTrigger 
                value="comprehensive" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Comprehensive
              </TabsTrigger>
              <TabsTrigger 
                value="innovation" 
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent"
              >
                Innovation
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="setup" className="m-0">
            <SetupTab />
          </TabsContent>
          <TabsContent value="review" className="m-0">
            <ReviewTab />
          </TabsContent>
          <TabsContent value="data" className="m-0">
            <DataTab />
          </TabsContent>
          <TabsContent value="import" className="m-0">
            <ImportTab />
          </TabsContent>
          <TabsContent value="comprehensive" className="m-0">
            <ComprehensiveTab />
          </TabsContent>
          <TabsContent value="innovation" className="m-0">
            <InnovationTab />
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
      <Toaster />
    </div>
  )
}

export default App