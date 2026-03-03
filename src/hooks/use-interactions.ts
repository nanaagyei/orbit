import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  CreateInteractionInput,
  UpdateInteractionInput,
} from '@/lib/validations/interaction'

interface UseInteractionsFilters {
  personId?: string
  type?: string
  search?: string
}

export function useInteractions(filters?: UseInteractionsFilters) {
  const params = new URLSearchParams()
  if (filters?.personId) params.set('personId', filters.personId)
  if (filters?.type) params.set('type', filters.type)
  if (filters?.search) params.set('search', filters.search)

  return useQuery({
    queryKey: ['interactions', filters],
    queryFn: async () => {
      const res = await fetch(`/api/interactions?${params}`)
      if (!res.ok) throw new Error('Failed to fetch interactions')
      return res.json()
    },
  })
}

export function useCreateInteraction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateInteractionInput) => {
      const res = await fetch('/api/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create interaction')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions'] })
      queryClient.invalidateQueries({ queryKey: ['people'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdateInteraction(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateInteractionInput) => {
      const res = await fetch(`/api/interactions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update interaction')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions'] })
    },
  })
}

export function useDeleteInteraction() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/interactions/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete interaction')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interactions'] })
    },
  })
}
