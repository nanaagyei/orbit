import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface UsePositioningFilters {
  type?: string
}

export function usePositioning(filters?: UsePositioningFilters) {
  const params = new URLSearchParams()
  if (filters?.type) params.set('type', filters.type)

  return useQuery({
    queryKey: ['positioning', filters],
    queryFn: async () => {
      const res = await fetch(`/api/positioning?${params}`)
      if (!res.ok) throw new Error('Failed to fetch positioning')
      return res.json()
    },
  })
}

export function useCreatePositioning() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { type: string; content: string }) => {
      const res = await fetch('/api/positioning', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create positioning')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positioning'] })
    },
  })
}

export function useUpdatePositioning(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { content?: string; isActive?: boolean }) => {
      const res = await fetch(`/api/positioning/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update positioning')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positioning'] })
    },
  })
}

export function useDeletePositioning() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/positioning/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete positioning')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['positioning'] })
    },
  })
}
