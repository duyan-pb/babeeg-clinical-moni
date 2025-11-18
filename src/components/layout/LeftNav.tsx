import { 
  FolderOpen, 
  Activity, 
  ChartLine, 
  MonitorPlay,
  Video,
  Scissors,
  User,
  Gear,
  SpeakerHigh,
  Wrench,
  ArrowsOut,
  Question,
  MagnifyingGlass,
  Database,
  Upload,
  ListChecks,
  Lightbulb
} from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface LeftNavProps {
  activeView: string
  onViewChange: (view: string) => void
}

export function LeftNav({ activeView, onViewChange }: LeftNavProps) {
  const navItems = [
    { id: 'setup', label: 'Setup', icon: Wrench },
    { id: 'review', label: 'Review', icon: MagnifyingGlass },
    { id: 'data', label: 'Data', icon: Database },
    { id: 'import', label: 'Import', icon: Upload },
    { id: 'comprehensive', label: 'Comprehensive', icon: ListChecks },
    { id: 'innovation', label: 'Innovation', icon: Lightbulb },
    { id: 'open', label: 'Open', icon: FolderOpen },
    { id: 'eeg', label: 'EEG', icon: Activity },
    { id: 'trends', label: 'Trends', icon: ChartLine },
    { id: 'split-screen', label: 'Split Screen', icon: MonitorPlay },
    { id: 'video', label: 'Video', icon: Video },
    { id: 'process', label: 'Process', icon: Scissors },
    { id: 'patient', label: 'Patient', icon: User },
    { id: 'preferences', label: 'Preferences', icon: Gear },
    { id: 'spike-review', label: 'Spike Review', icon: SpeakerHigh },
    { id: 'full-screen', label: 'Full Screen', icon: ArrowsOut },
    { id: 'help', label: 'Help', icon: Question },
  ]

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-full w-16 flex-col items-center gap-1 border-r border-border bg-card py-3">
        {navItems.map((item, index) => {
          const Icon = item.icon
          const isActive = activeView === item.id
          
          return (
            <div key={item.id} className="flex flex-col items-center">
              {(index === 6 || index === 11 || index === 13) && (
                <Separator className="my-1 w-10" />
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={isActive ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-12 w-12 flex-col gap-0.5 rounded-md"
                    onClick={() => onViewChange(item.id)}
                  >
                    <Icon 
                      size={20} 
                      weight={isActive ? 'fill' : 'regular'}
                    />
                    <span className="text-[9px] leading-none">{item.label.split(' ')[0]}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )
        })}
      </div>
    </TooltipProvider>
  )
}
