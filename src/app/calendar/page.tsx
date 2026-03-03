'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { CalendarDays } from 'lucide-react'
import { useEvents } from '@/hooks/use-events'
import { useFollowUps } from '@/hooks/use-followups'
import { useInteractions } from '@/hooks/use-interactions'
import { CalendarView } from '@/components/calendar/calendar-view'
import { Loader2 } from 'lucide-react'

export default function CalendarPage() {
  const router = useRouter()
  const { data: events, isLoading: eventsLoading } = useEvents()
  const { data: followUps, isLoading: followUpsLoading } = useFollowUps()
  const { data: interactions, isLoading: interactionsLoading } = useInteractions()

  const calendarEvents = useMemo(() => {
    const allEvents: Array<{
      id: string
      title: string
      start: Date
      end: Date
      type: 'event' | 'followup' | 'interaction'
      resource?: any
    }> = []

    // Add events
    if (events) {
      events.forEach((event: any) => {
        const start = new Date(event.dateTime)
        const end = new Date(start.getTime() + 60 * 60 * 1000) // 1 hour default
        allEvents.push({
          id: event.id,
          title: event.title,
          start,
          end,
          type: 'event',
          resource: { ...event, type: 'event' },
        })
      })
    }

    // Add follow-ups
    if (followUps) {
      followUps.forEach((followUp: any) => {
        const start = new Date(followUp.dueDate)
        const end = new Date(start.getTime() + 30 * 60 * 1000) // 30 minutes default
        allEvents.push({
          id: followUp.id,
          title: `Follow-up: ${followUp.person?.name || 'General'}`,
          start,
          end,
          type: 'followup',
          resource: { ...followUp, type: 'followup' },
        })
      })
    }

    // Add interactions
    if (interactions) {
      interactions.forEach((interaction: any) => {
        const start = new Date(interaction.date)
        const end = new Date(start.getTime() + 30 * 60 * 1000) // 30 minutes default
        allEvents.push({
          id: interaction.id,
          title: `Interaction: ${interaction.person?.name || 'Unknown'}`,
          start,
          end,
          type: 'interaction',
          resource: { ...interaction, type: 'interaction' },
        })
      })
    }

    return allEvents
  }, [events, followUps, interactions])

  const handleSelectEvent = (event: any) => {
    const resource = event.resource
    if (!resource) return

    switch (resource.type) {
      case 'event':
        router.push(`/events/${resource.id}`)
        break
      case 'followup':
        router.push(`/follow-ups`)
        break
      case 'interaction':
        if (resource.personId) {
          router.push(`/people/${resource.personId}`)
        }
        break
    }
  }

  if (eventsLoading || followUpsLoading || interactionsLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-medium text-foreground flex items-center gap-2">
          <CalendarDays className="h-6 w-6 text-primary" />
          Calendar
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          View your events, follow-ups, and interactions in a calendar format
        </p>
      </div>

      {/* Calendar View */}
      <div className="border rounded-lg p-4 md:p-6 bg-background">
        <CalendarView
          events={calendarEvents}
          onSelectEvent={handleSelectEvent}
        />
      </div>
    </div>
  )
}
