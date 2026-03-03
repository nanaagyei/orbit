import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type {
  CreatePaperInput,
  UpdatePaperInput,
  UpdatePaperReflectionInput,
} from '@/lib/validations/paper'

interface UsePapersFilters {
  status?: string
  tag?: string
  search?: string
}

export function usePapers(filters?: UsePapersFilters) {
  const params = new URLSearchParams()
  if (filters?.status) params.set('status', filters.status)
  if (filters?.tag) params.set('tag', filters.tag)
  if (filters?.search) params.set('search', filters.search)

  return useQuery({
    queryKey: ['papers', filters],
    queryFn: async () => {
      const res = await fetch(`/api/papers?${params}`)
      if (!res.ok) throw new Error('Failed to fetch papers')
      return res.json()
    },
  })
}

export function usePaper(id: string) {
  return useQuery({
    queryKey: ['papers', id],
    queryFn: async () => {
      const res = await fetch(`/api/papers/${id}`)
      if (!res.ok) throw new Error('Failed to fetch paper')
      return res.json()
    },
    enabled: !!id,
  })
}

export function useCreatePaper() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreatePaperInput) => {
      const res = await fetch('/api/papers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create paper')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['papers'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdatePaper(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdatePaperInput) => {
      const res = await fetch(`/api/papers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update paper')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['papers'] })
      queryClient.invalidateQueries({ queryKey: ['papers', id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdatePaperReflection(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdatePaperReflectionInput) => {
      const res = await fetch(`/api/papers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update paper reflection')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['papers', id] })
    },
  })
}

export function useDeletePaper() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/papers/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete paper')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['papers'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

export function useUpdatePaperStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const res = await fetch(`/api/papers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Failed to update paper status')
      return res.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['papers'] })
      queryClient.invalidateQueries({ queryKey: ['papers', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}

// Paper-Person linking hooks
export function useLinkPersonToPaper(paperId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ personId, context }: { personId: string; context: 'recommended_by' | 'discussed_with' }) => {
      const res = await fetch(`/api/papers/${paperId}/people`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personId, context }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to link person')
      }
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['papers', paperId] })
      queryClient.invalidateQueries({ queryKey: ['people'] })
    },
  })
}

export function useUnlinkPersonFromPaper(paperId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (personId: string) => {
      const res = await fetch(`/api/papers/${paperId}/people?personId=${personId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to unlink person')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['papers', paperId] })
      queryClient.invalidateQueries({ queryKey: ['people'] })
    },
  })
}
