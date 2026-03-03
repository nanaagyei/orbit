import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/dashboard')
      if (!res.ok) throw new Error('Failed to fetch dashboard data')
      return res.json()
    },
  })
}

export function useUpdateWeeklyFocus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (weeklyFocus: string) => {
      const res = await fetch('/api/dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weeklyFocus }),
      })
      if (!res.ok) throw new Error('Failed to update weekly focus')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
