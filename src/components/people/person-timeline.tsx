'use client'

import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { Coffee, Mail, Phone, Calendar, FileText, MessageSquare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface PersonTimelineProps {
  personId: string
}

export function PersonTimeline({ personId }: PersonTimelineProps) {
  const { data: interactions, isLoading: isLoadingInteractions } = useQuery({
    queryKey: ['interactions', { personId }],
    queryFn: async () => {
      const res = await fetch(`/api/interactions?personId=${personId}`)
      if (!res.ok) throw new Error('Failed to fetch interactions')
      return res.json()
    },
  })

  const { data: events, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['events', { personId }],
    queryFn: async () => {
      const res = await fetch(`/api/events?personId=${personId}`)
      if (!res.ok) throw new Error('Failed to fetch events')
      return res.json()
    },
  })

  const isLoading = isLoadingInteractions || isLoadingEvents

  // Merge and sort timeline items
  const timelineItems = [
    ...(interactions || []).map((item: any) => ({
      ...item,
      itemType: 'interaction',
      sortDate: new Date(item.date),
    })),
    ...(events || []).map((item: any) => ({
      ...item,
      itemType: 'event',
      sortDate: new Date(item.dateTime),
    })),
  ].sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime())

  const getInteractionIcon = (type: string) => {
    switch (type) {
      case 'COFFEE_CHAT':
        return <Coffee className="h-4 w-4" />
      case 'EMAIL':
        return <Mail className="h-4 w-4" />
      case 'CALL':
        return <Phone className="h-4 w-4" />
      case 'MEETUP':
        return <Calendar className="h-4 w-4" />
      case 'DM':
        return <MessageSquare className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const getInteractionColor = (type: string) => {
    switch (type) {
      case 'COFFEE_CHAT':
        return 'bg-amber-100 text-amber-800'
      case 'EMAIL':
        return 'bg-blue-100 text-blue-800'
      case 'CALL':
        return 'bg-green-100 text-green-800'
      case 'MEETUP':
        return 'bg-purple-100 text-purple-800'
      case 'DM':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatInteractionType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-muted-foreground">Loading timeline...</p>
      </div>
    )
  }

  if (!timelineItems || timelineItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FileText className="h-12 w-12 text-muted-foreground/30 mb-3" />
        <p className="text-sm text-muted-foreground text-center">
          No interactions or events yet. Start building this relationship by logging your first interaction.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {timelineItems.map((item: any) => (
        <div
          key={item.id}
          className="relative pl-8 pb-4 border-l-2 border-border last:border-l-0 last:pb-0"
        >
          {/* Timeline dot */}
          <div className="absolute left-[-9px] top-0 w-4 h-4 rounded-full bg-background border-2 border-border flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-primary" />
          </div>

          {/* Content */}
          <div className="space-y-2">
            {item.itemType === 'interaction' ? (
              <>
                <div className="flex items-center gap-2">
                  <Badge className={getInteractionColor(item.type)}>
                    <span className="flex items-center gap-1">
                      {getInteractionIcon(item.type)}
                      {formatInteractionType(item.type)}
                    </span>
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(item.date), 'MMM d, yyyy')}
                  </span>
                </div>

                {item.summary && (
                  <p className="text-sm text-foreground">{item.summary}</p>
                )}

                {item.keyInsights && (
                  <div className="mt-2 p-3 bg-muted/50 rounded-md">
                    <p className="text-xs font-medium text-foreground mb-1">
                      Key Insights
                    </p>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                      {item.keyInsights}
                    </p>
                  </div>
                )}

                {item.advice && (
                  <div className="mt-2 p-3 bg-muted/50 rounded-md">
                    <p className="text-xs font-medium text-foreground mb-1">
                      Advice Received
                    </p>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                      {item.advice}
                    </p>
                  </div>
                )}

                {item.nextSteps && (
                  <div className="mt-2 p-3 bg-primary/5 rounded-md border border-primary/10">
                    <p className="text-xs font-medium text-foreground mb-1">
                      Next Steps
                    </p>
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                      {item.nextSteps}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Badge className="bg-indigo-100 text-indigo-800">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Event
                    </span>
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(item.dateTime), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>

                <p className="text-sm font-medium text-foreground">{item.title}</p>

                {item.host && (
                  <p className="text-xs text-muted-foreground">Hosted by {item.host}</p>
                )}

                {item.location && (
                  <p className="text-xs text-muted-foreground">📍 {item.location}</p>
                )}

                {item.notes && (
                  <div className="mt-2 p-3 bg-muted/50 rounded-md">
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                      {item.notes}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
