import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreateFollowUpInput, UpdateFollowUpInput } from '@/lib/validations/followup'

interface UseFollowUpsFilters {
  status?: string
  personId?: string
}

export function useFollowUps(filters?: UseFollowUpsFilters) {
  const params = new URLSearchParams()
  if (filters?.status) params.set('status', filters.status)
  if (filters?.personId) params.set('personId', filters.personId)

  return useQuery({
    queryKey: ['followups', filters],
    queryFn: async () => {
      const res = await fetch(`/api/followups?${params}`)
      if (!res.ok) throw new Error('Failed to fetch follow-ups')
      return res.json()
    },
  })
}

export function useCreateFollowUp() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateFollowUpInput) => {
      const res = await fetch('/api/followups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create follow-up')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateFollowUp(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateFollowUpInput) => {
      const res = await fetch(`/api/followups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update follow-up')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useDeleteFollowUp() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/followups/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete follow-up')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useMarkFollowUpDone() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/followups/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'DONE' }),
      })
      if (!res.ok) throw new Error('Failed to mark follow-up as done')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
