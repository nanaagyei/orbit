'use client'

import { Calendar, Bell, MessageSquare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface CalendarEventCardProps {
  title: string
  type: 'event' | 'followup' | 'interaction'
  time?: string
  onClick?: () => void
  className?: string
}

export function CalendarEventCard({
  title,
  type,
  time,
  onClick,
  className,
}: CalendarEventCardProps) {
  const getIcon = () => {
    switch (type) {
      case 'event':
        return <Calendar className="h-3 w-3" />
      case 'followup':
        return <Bell className="h-3 w-3" />
      case 'interaction':
        return <MessageSquare className="h-3 w-3" />
    }
  }

  const getColor = () => {
    switch (type) {
      case 'event':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/30'
      case 'followup':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/30'
      case 'interaction':
        return 'bg-green-500/10 text-green-600 border-green-500/30'
    }
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-2 py-1 rounded text-xs cursor-pointer hover:opacity-80 transition-opacity border',
        getColor(),
        className
      )}
    >
      {getIcon()}
      <span className="truncate flex-1">{title}</span>
      {time && <span className="text-xs opacity-70">{time}</span>}
    </div>
  )
}
