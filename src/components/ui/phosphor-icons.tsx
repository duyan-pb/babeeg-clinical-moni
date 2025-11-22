import type { ComponentType } from 'react'
import type { IconProps } from '@phosphor-icons/react'
import {
  ArrowClockwise,
  ArrowLeft,
  ArrowRight,
  CaretDown,
  CaretLeft,
  CaretRight,
  CaretUp,
  Check,
  Circle,
  DotsSixVertical,
  DotsThreeOutline,
  MagnifyingGlass,
  Minus,
  SidebarSimple,
  Warning,
  X
} from '@phosphor-icons/react'

type PhosphorProps = IconProps & { className?: string }

const wrap = (Icon: ComponentType<PhosphorProps>) => (props: PhosphorProps) => (
  <Icon {...props} size={props.size ?? 16} className={props.className} />
)

export const AlertTriangleIcon = wrap(Warning)
export const RefreshCwIcon = wrap(ArrowClockwise)
export const MinusIcon = wrap(Minus)
export const CheckIcon = wrap(Check)
export const ChevronDownIcon = wrap(CaretDown)
export const ChevronUpIcon = wrap(CaretUp)
export const ChevronLeftIcon = wrap(CaretLeft)
export const ChevronRightIcon = wrap(CaretRight)
export const ChevronLeft = wrap(CaretLeft)
export const ChevronRight = wrap(CaretRight)
export const MoreHorizontalIcon = wrap(DotsThreeOutline)
export const MoreHorizontal = wrap(DotsThreeOutline)
export const ArrowLeftIcon = wrap(ArrowLeft)
export const ArrowRightIcon = wrap(ArrowRight)
export const ArrowLeftPhosphor = wrap(ArrowLeft)
export const ArrowRightPhosphor = wrap(ArrowRight)
export const SearchIcon = wrap(MagnifyingGlass)
export const CircleIcon = wrap(Circle)
export const GripVerticalIcon = wrap(DotsSixVertical)
export const PanelLeftIcon = wrap(SidebarSimple)
export const XIcon = wrap(X)
