import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useTags() {
  return useQuery({
    queryKey: ['tags'],
    queryFn: async () => {
      const res = await fetch('/api/tags')
      if (!res.ok) throw new Error('Failed to fetch tags')
      return res.json()
    },
  })
}

export function useDeleteTag() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tags/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error('Failed to delete tag')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      queryClient.invalidateQueries({ queryKey: ['people'] })
      queryClient.invalidateQueries({ queryKey: ['papers'] })
    },
  })
}
