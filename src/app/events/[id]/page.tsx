'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { format, formatDistanceToNow, isPast } from 'date-fns'
import {
  ArrowLeft,
  Edit,
  ExternalLink,
  MapPin,
  Calendar,
  User,
  Users,
  Trash2,
} from 'lucide-react'
import { useEvent, useDeleteEvent, useUpdateEvent } from '@/hooks/use-events'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { EventFormDialog } from '@/components/events/event-form-dialog'

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const eventId = params.id as string
  const { data: event, isLoading } = useEvent(eventId)
  const deleteEvent = useDeleteEvent()
  const updateEvent = useUpdateEvent(eventId)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const getRSVPStatusColor = (status: string) => {
    switch (status) {
      case 'INTERESTED':
        return 'bg-gray-100 text-gray-800'
      case 'GOING':
        return 'bg-blue-100 text-blue-800'
      case 'WENT':
        return 'bg-green-100 text-green-800'
      case 'NOT_GOING':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatRSVPStatus = (status: string) => {
    return status
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ')
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'NEW':
        return 'bg-gray-100 text-gray-800'
      case 'CONNECTED':
        return 'bg-blue-100 text-blue-800'
      case 'CHATTED':
        return 'bg-green-100 text-green-800'
      case 'ONGOING':
        return 'bg-teal-100 text-teal-800'
      case 'INNER_CIRCLE':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatStage = (stage: string) => {
    return stage
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ')
  }

  const handleRSVPChange = async (newStatus: string) => {
    try {
      await updateEvent.mutateAsync({ rsvpStatus: newStatus as any })
      toast.success('RSVP status updated')
    } catch (error) {
      toast.error('Failed to update RSVP status')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      await deleteEvent.mutateAsync(eventId)
      toast.success('Event deleted')
      router.push('/events')
    } catch (error) {
      toast.error('Failed to delete event')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Event not found</p>
        <Button onClick={() => router.push('/events')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>
      </div>
    )
  }

  const eventDate = new Date(event.dateTime)
  const isEventPast = isPast(eventDate)

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/events')}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Events
      </Button>

      <div className="border rounded-lg p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-medium text-foreground">
              {event.title}
            </h1>
            {event.host && (
              <p className="text-base text-muted-foreground mt-1">
                Hosted by {event.host}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditDialogOpen(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="outline" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(eventDate, 'EEEE, MMMM d, yyyy')}</span>
            <span className="text-muted-foreground">at</span>
            <span>{format(eventDate, 'h:mm a')}</span>
          </div>

          {event.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{event.location}</span>
            </div>
          )}

          {event.link && (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0"
              onClick={() => window.open(event.link, '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Event Link
            </Button>
          )}
        </div>

        <div className="flex items-center gap-4 pt-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">RSVP:</span>
            <Select
              value={event.rsvpStatus}
              onValueChange={handleRSVPChange}
            >
              <SelectTrigger className="w-[140px] h-8">
                <SelectValue>
                  <Badge className={getRSVPStatusColor(event.rsvpStatus)}>
                    {formatRSVPStatus(event.rsvpStatus)}
                  </Badge>
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INTERESTED">Interested</SelectItem>
                <SelectItem value="GOING">Going</SelectItem>
                <SelectItem value="WENT">Went</SelectItem>
                <SelectItem value="NOT_GOING">Not Going</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-muted-foreground">
            {isEventPast ? (
              <span>{formatDistanceToNow(eventDate, { addSuffix: true })}</span>
            ) : (
              <span>In {formatDistanceToNow(eventDate)}</span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {event.notes && (
            <div className="border rounded-lg p-6">
              <h2 className="text-lg font-medium text-foreground mb-4">
                Notes
              </h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {event.notes}
              </p>
            </div>
          )}

          <div className="border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-foreground">
                People Met
              </h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{event.attendees?.length || 0} people</span>
              </div>
            </div>

            {event.attendees && event.attendees.length > 0 ? (
              <div className="space-y-3">
                {event.attendees.map((attendance: any) => (
                  <div
                    key={attendance.person.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() =>
                      router.push(`/people/${attendance.person.id}`)
                    }
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {attendance.person.name}
                        </p>
                        {attendance.person.company && (
                          <p className="text-sm text-muted-foreground">
                            {attendance.person.headline ||
                              attendance.person.company}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge className={getStageColor(attendance.person.stage)}>
                      {formatStage(attendance.person.stage)}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No people linked to this event yet.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Edit the event to add people you met.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-foreground mb-3">
              Event Details
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge className={getRSVPStatusColor(event.rsvpStatus)}>
                  {formatRSVPStatus(event.rsvpStatus)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">
                  {format(eventDate, 'MMM d, yyyy')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time</span>
                <span className="font-medium">
                  {format(eventDate, 'h:mm a')}
                </span>
              </div>
              {event.host && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Host</span>
                  <span className="font-medium">{event.host}</span>
                </div>
              )}
              {event.location && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium text-right max-w-[150px] truncate">
                    {event.location}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">People Met</span>
                <span className="font-medium">
                  {event.attendees?.length || 0}
                </span>
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-foreground mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => setEditDialogOpen(true)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Event
              </Button>
              {event.link && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => window.open(event.link, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Event Link
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <EventFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        event={event}
      />
    </div>
  )
}
