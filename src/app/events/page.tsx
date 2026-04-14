'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Plus, Edit, Trash2, Calendar as CalendarIcon, Download } from 'lucide-react'
import { useEvents, useDeleteEvent } from '@/hooks/use-events'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { toast } from 'sonner'
import { EventFormDialog } from '@/components/events/event-form-dialog'

export default function EventsPage() {
  const router = useRouter()
  const [rsvpFilter, setRsvpFilter] = useState<string | undefined>(undefined)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<any>(null)

  const { data: events, isLoading } = useEvents({
    rsvpStatus: rsvpFilter,
  })
  const deleteEvent = useDeleteEvent()

  const handleEdit = (event: any) => {
    setEditingEvent(event)
    setDialogOpen(true)
  }

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) return

    try {
      await deleteEvent.mutateAsync(eventId)
      toast.success('Event deleted')
    } catch (error) {
      toast.error('Failed to delete event')
    }
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setEditingEvent(null)
  }

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading events...</p>
      </div>
    )
  }

  // Sort events by date (most recent first)
  const sortedEvents = events
    ? [...events].sort(
        (a, b) =>
          new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()
      )
    : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-foreground">Events</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage meetups, talks, and community events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              window.location.href = '/api/events/ics?upcoming=true'
            }}
            disabled={!events || events.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export to Calendar
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={rsvpFilter} onValueChange={setRsvpFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All events" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All events</SelectItem>
            <SelectItem value="INTERESTED">Interested</SelectItem>
            <SelectItem value="GOING">Going</SelectItem>
            <SelectItem value="WENT">Went</SelectItem>
            <SelectItem value="NOT_GOING">Not Going</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Events Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Host</TableHead>
              <TableHead>Date/Time</TableHead>
              <TableHead>RSVP Status</TableHead>
              <TableHead>People Met</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedEvents.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-8"
                >
                  No events found. Add your first event to get started.
                </TableCell>
              </TableRow>
            ) : (
              sortedEvents.map((event: any) => (
                <TableRow
                  key={event.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/events/${event.id}`)}
                >
                  <TableCell className="font-medium">{event.title}</TableCell>
                  <TableCell>{event.host || '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        {format(new Date(event.dateTime), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRSVPStatusColor(event.rsvpStatus)}>
                      {formatRSVPStatus(event.rsvpStatus)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {event.attendees?.length || 0} people
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit(event)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(event.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <EventFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        event={editingEvent}
      />
    </div>
  )
}
