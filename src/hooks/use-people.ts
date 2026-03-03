import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { CreatePersonInput, UpdatePersonInput } from '@/lib/validations/person'

interface UsePeopleFilters {
  stage?: string
  tag?: string
  search?: string
}

export function usePeople(filters?: UsePeopleFilters) {
  const params = new URLSearchParams()
  if (filters?.stage) params.set('stage', filters.stage)
  if (filters?.tag) params.set('tag', filters.tag)
  if (filters?.search) params.set('search', filters.search)

  return useQuery({
    queryKey: ['people', filters],
    queryFn: async () => {
      const res = await fetch(`/api/people?${params}`)
      if (!res.ok) throw new Error('Failed to fetch people')
      return res.json()
    },
  })
}

export function usePerson(id: string) {
  return useQuery({
    queryKey: ['people', id],
    queryFn: async () => {
      const res = await fetch(`/api/people/${id}`)
      if (!res.ok) throw new Error('Failed to fetch person')
      return res.json()
    },
    enabled: !!id,
  })
}

export function useCreatePerson() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreatePersonInput) => {
      const res = await fetch('/api/people', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to create person')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] })
    },
  })
}

export function useUpdatePerson(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdatePersonInput) => {
      const res = await fetch(`/api/people/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to update person')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] })
      queryClient.invalidateQueries({ queryKey: ['people', id] })
    },
  })
}

export function useDeletePerson() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/people/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete person')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['people'] })
    },
  })
}
