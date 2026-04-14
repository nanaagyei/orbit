'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useCreateEvent, useUpdateEvent } from '@/hooks/use-events'
import { usePeople } from '@/hooks/use-people'
import { createEventSchema, type CreateEventInput } from '@/lib/validations/event'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { X } from 'lucide-react'

interface EventFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  event?: any
}

export function EventFormDialog({
  open,
  onOpenChange,
  event,
}: EventFormDialogProps) {
  const isEditing = !!event
  const createEvent = useCreateEvent()
  const updateEvent = useUpdateEvent(event?.id || '')
  const { data: people } = usePeople()
  const [selectedPeople, setSelectedPeople] = useState<any[]>([])

  const form = useForm<CreateEventInput>({
    resolver: zodResolver(createEventSchema),
    defaultValues: {
      title: '',
      host: '',
      dateTime: new Date().toISOString().slice(0, 16),
      location: '',
      link: '',
      rsvpStatus: 'INTERESTED',
      notes: '',
      attendees: [],
    },
  })

  useEffect(() => {
    if (event) {
      form.reset({
        title: event.title || '',
        host: event.host || '',
        dateTime: new Date(event.dateTime).toISOString().slice(0, 16),
        location: event.location || '',
        link: event.link || '',
        rsvpStatus: event.rsvpStatus || 'INTERESTED',
        notes: event.notes || '',
        attendees: event.attendees?.map((a: any) => a.personId) || [],
      })
      setSelectedPeople(
        event.attendees?.map((a: any) => ({
          id: a.personId,
          name: a.person.name,
        })) || []
      )
    } else {
      form.reset({
        title: '',
        host: '',
        dateTime: new Date().toISOString().slice(0, 16),
        location: '',
        link: '',
        rsvpStatus: 'INTERESTED',
        notes: '',
        attendees: [],
      })
      setSelectedPeople([])
    }
  }, [event, form])

  const handleAddPerson = (personId: string) => {
    const person = people?.find((p: any) => p.id === personId)
    if (person && !selectedPeople.find((p) => p.id === person.id)) {
      const newPeople = [...selectedPeople, { id: person.id, name: person.name }]
      setSelectedPeople(newPeople)
      form.setValue(
        'attendees',
        newPeople.map((p) => p.id)
      )
    }
  }

  const handleRemovePerson = (personId: string) => {
    const newPeople = selectedPeople.filter((p) => p.id !== personId)
    setSelectedPeople(newPeople)
    form.setValue(
      'attendees',
      newPeople.map((p) => p.id)
    )
  }

  const onSubmit = async (data: CreateEventInput) => {
    try {
      // Convert datetime-local to ISO string
      const dateTime = new Date(data.dateTime).toISOString()

      if (isEditing) {
        await updateEvent.mutateAsync({
          ...data,
          dateTime,
        })
        toast.success('Event updated successfully')
      } else {
        await createEvent.mutateAsync({
          ...data,
          dateTime,
        })
        toast.success('Event added successfully')
      }
      onOpenChange(false)
      form.reset()
      setSelectedPeople([])
    } catch (error) {
      toast.error(isEditing ? 'Failed to update event' : 'Failed to add event')
    }
  }

  const formatRSVPStatus = (status: string) => {
    return status
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Event' : 'Add Event'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update event details.'
              : 'Add a new event to track your networking.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="NeurIPS 2025 Meetup" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="host"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Host</FormLabel>
                    <FormControl>
                      <Input placeholder="ML Community" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date/Time *</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                        value={typeof field.value === 'string' ? field.value : field.value?.toISOString?.().slice(0, 16) ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="San Francisco, CA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="rsvpStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RSVP Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="INTERESTED">
                          {formatRSVPStatus('INTERESTED')}
                        </SelectItem>
                        <SelectItem value="GOING">
                          {formatRSVPStatus('GOING')}
                        </SelectItem>
                        <SelectItem value="WENT">
                          {formatRSVPStatus('WENT')}
                        </SelectItem>
                        <SelectItem value="NOT_GOING">
                          {formatRSVPStatus('NOT_GOING')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="link"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Link</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://eventbrite.com/..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional notes about this event..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* People Met */}
            <div className="space-y-2">
              <FormLabel>People Met</FormLabel>
              <Select onValueChange={handleAddPerson}>
                <SelectTrigger>
                  <SelectValue placeholder="Add people you met at this event" />
                </SelectTrigger>
                <SelectContent>
                  {people
                    ?.filter((p: any) => !selectedPeople.find((sp) => sp.id === p.id))
                    .map((person: any) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name}
                        {person.company && ` • ${person.company}`}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              {selectedPeople.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedPeople.map((person) => (
                    <Badge key={person.id} variant="secondary">
                      {person.name}
                      <button
                        type="button"
                        onClick={() => handleRemovePerson(person.id)}
                        className="ml-1 hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createEvent.isPending || updateEvent.isPending}
              >
                {createEvent.isPending || updateEvent.isPending
                  ? 'Saving...'
                  : isEditing
                  ? 'Update Event'
                  : 'Add Event'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
