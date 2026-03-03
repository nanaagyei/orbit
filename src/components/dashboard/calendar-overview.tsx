'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, isToday, addDays } from 'date-fns'
import { CalendarDays, ChevronRight } from 'lucide-react'
import { useEvents } from '@/hooks/use-events'
import { useFollowUps } from '@/hooks/use-followups'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function CalendarOverview() {
  const router = useRouter()
  const currentDate = new Date()
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  
  const { data: events } = useEvents()
  const { data: followUps } = useFollowUps()

  // Get upcoming events (next 7 days)
  const upcomingEvents = useMemo(() => {
    if (!events) return []
    const today = new Date()
    const nextWeek = addDays(today, 7)
    
    return events
      .filter((event: any) => {
        const eventDate = new Date(event.dateTime)
        return eventDate >= today && eventDate <= nextWeek
      })
      .sort((a: any, b: any) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
      .slice(0, 5) // Show max 5 upcoming events
  }, [events])

  // Get upcoming follow-ups (next 7 days)
  const upcomingFollowUps = useMemo(() => {
    if (!followUps) return []
    const today = new Date()
    const nextWeek = addDays(today, 7)
    
    return followUps
      .filter((followUp: any) => {
        const dueDate = new Date(followUp.dueDate)
        return dueDate >= today && dueDate <= nextWeek && followUp.status === 'OPEN'
      })
      .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 3) // Show max 3 upcoming follow-ups
  }, [followUps])

  // Get all days in the month
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get events for each day
  const getEventsForDay = (day: Date) => {
    const dayEvents = events?.filter((event: any) => {
      const eventDate = new Date(event.dateTime)
      return isSameDay(eventDate, day)
    }) || []
    
    const dayFollowUps = followUps?.filter((followUp: any) => {
      const dueDate = new Date(followUp.dueDate)
      return isSameDay(dueDate, day) && followUp.status === 'OPEN'
    }) || []

    return { events: dayEvents, followUps: dayFollowUps }
  }

  // Get day of week for first day of month
  const firstDayOfWeek = monthStart.getDay()
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="border rounded-lg p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          Calendar Overview
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/calendar')}
        >
          View Full
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Mini Calendar */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-foreground">
          {format(currentDate, 'MMMM yyyy')}
        </div>
        
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-1 text-xs text-muted-foreground text-center">
          {weekDays.map((day) => (
            <div key={day} className="p-1 font-medium">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          
          {/* Days of the month */}
          {daysInMonth.map((day) => {
            const dayData = getEventsForDay(day)
            const hasEvents = dayData.events.length > 0 || dayData.followUps.length > 0
            
            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'aspect-square p-1 rounded text-xs cursor-pointer hover:bg-accent transition-colors',
                  isToday(day) && 'bg-primary/10 border border-primary',
                  !isSameMonth(day, currentDate) && 'opacity-30'
                )}
                onClick={() => router.push(`/calendar?date=${format(day, 'yyyy-MM-dd')}`)}
              >
                <div className="flex flex-col items-center justify-center h-full">
                  <span className={cn(
                    'text-center',
                    isToday(day) && 'font-bold text-primary'
                  )}>
                    {format(day, 'd')}
                  </span>
                  {hasEvents && (
                    <div className="flex gap-0.5 mt-0.5">
                      {dayData.events.length > 0 && (
                        <div className="w-1 h-1 rounded-full bg-blue-500" />
                      )}
                      {dayData.followUps.length > 0 && (
                        <div className="w-1 h-1 rounded-full bg-amber-500" />
                      )}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Events</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Follow-Ups</span>
          </div>
        </div>
      </div>

      {/* Upcoming Events */}
      {(upcomingEvents.length > 0 || upcomingFollowUps.length > 0) && (
        <div className="space-y-3 pt-4 border-t">
          <h3 className="text-sm font-medium text-foreground">Upcoming</h3>
          
          <div className="space-y-2">
            {upcomingEvents.map((event: any) => (
              <div
                key={event.id}
                onClick={() => router.push(`/events/${event.id}`)}
                className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {event.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(event.dateTime), 'MMM d, h:mm a')}
                  </p>
                </div>
              </div>
            ))}
            
            {upcomingFollowUps.map((followUp: any) => (
              <div
                key={followUp.id}
                onClick={() => router.push('/follow-ups')}
                className="flex items-center gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    Follow-up: {followUp.person?.name || 'General'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Due {format(new Date(followUp.dueDate), 'MMM d')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {upcomingEvents.length === 0 && upcomingFollowUps.length === 0 && (
        <div className="pt-4 border-t text-center">
          <p className="text-sm text-muted-foreground">
            No upcoming events or follow-ups
          </p>
        </div>
      )}
    </div>
  )
}
