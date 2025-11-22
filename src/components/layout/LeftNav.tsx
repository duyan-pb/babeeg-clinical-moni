import { 
  Activity, 
  Gear,
  Wrench,
  MagnifyingGlass,
  Database,
  Upload,
  Lightbulb,
  IdentificationCard
} from '@/lib/iconShim'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface LeftNavProps {
  activeView: string
  onViewChange: (view: string) => void
}

export function LeftNav({ activeView, onViewChange }: LeftNavProps) {
  const navSections = [
    {
      title: 'Core Workflows',
      items: [
        { id: 'setup', label: 'Setup', icon: Wrench },
        { id: 'patient', label: 'Patient', icon: IdentificationCard },
        { id: 'comprehensive', label: 'Monitor', icon: Activity },
        { id: 'review', label: 'Review', icon: MagnifyingGlass },
        { id: 'data', label: 'Data', icon: Database },
      ]
    },
    {
      title: 'Tools',
      items: [
        { id: 'import', label: 'Import', icon: Upload },
        { id: 'innovation', label: 'Analysis', icon: Lightbulb },
        { id: 'preferences', label: 'Settings', icon: Gear },
      ]
    }
  ]

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-full w-24 flex-col items-center gap-2 border-r border-border bg-card/60 px-3 py-4">
        <ScrollArea className="h-full w-full">
          <div className="flex flex-col items-stretch gap-2">
            {navSections.map((section, sectionIndex) => (
              <div key={section.title} className="flex flex-col gap-2">
                {sectionIndex > 0 && <Separator className="my-2 w-full" />}
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = activeView === item.id
                  
                  return (
                    <Tooltip key={item.id}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={isActive ? 'secondary' : 'ghost'}
                          size="icon"
                          className="h-12 w-full flex-col gap-1 rounded-lg text-[11px]"
                          onClick={() => onViewChange(item.id)}
                        >
                          <Icon 
                            size={20} 
                            weight={isActive ? 'fill' : 'regular'}
                          />
                          <span className="leading-none">{item.label.split(' ')[0]}</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>{item.label}</p>
                      </TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </TooltipProvider>
  )
}
