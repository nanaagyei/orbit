import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateEventInput, UpdateEventInput } from '@/lib/validations/event'

interface UseEventsFilters {
  rsvpStatus?: string
}

export function useEvents(filters?: UseEventsFilters) {
  const params = new URLSearchParams()
  if (filters?.rsvpStatus) params.set('rsvpStatus', filters.rsvpStatus)

  return useQuery({
    queryKey: ['events', filters],
    queryFn: async () => {
      const res = await fetch(`/api/events?${params}`)
      if (!res.ok) throw new Error('Failed to fetch events')
      return res.json()
    },
  })
}

export function useEvent(id: string) {
  return useQuery({
    queryKey: ['events', id],
    queryFn: async () => {
      const res = await fetch(`/api/events/${id}`)
      if (!res.ok) throw new Error('Failed to fetch event')
      return res.json()
    },
    enabled: !!id,
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateEventInput) => {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create event')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateEvent(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateEventInput) => {
      const res = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update event')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['events', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete event')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
