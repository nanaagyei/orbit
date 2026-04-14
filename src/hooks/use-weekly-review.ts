import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface WeeklyReviewStats {
  coffeeChats: number
  totalInteractions: number
  papersRead: number
  eventsAttended: number
  followUpsCompleted: number
}

interface InteractionWithPerson {
  id: string
  type: string
  date: string
  summary: string | null
  keyInsights: string | null
  advice: string | null
  nextSteps: string | null
  person: {
    id: string
    name: string
    company: string | null
    headline: string | null
    stage: string
  }
}

interface PaperSummary {
  id: string
  title: string
  authors: string | null
  status: string
}

interface EventWithAttendees {
  id: string
  title: string
  host: string | null
  dateTime: string
  location: string | null
  rsvpStatus: string
  attendees: Array<{
    person: {
      id: string
      name: string
      company: string | null
    }
  }>
}

interface PersonNeedingFollowUp {
  id: string
  name: string
  company: string | null
  stage: string
  interactions: Array<{
    date: string
    type: string
  }>
}

interface WeeklyReviewData {
  weekStart: string
  weekEnd: string
  stats: WeeklyReviewStats
  interactions: InteractionWithPerson[]
  papers: PaperSummary[]
  events: EventWithAttendees[]
  suggestedFollowUps: {
    needsReconnect: PersonNeedingFollowUp[]
    ongoingNeedsAttention: PersonNeedingFollowUp[]
  }
  currentReflection: string
  currentFocus: string
  lastReviewDate: string | null
}

export function useWeeklyReview(weekOffset: number = 0) {
  return useQuery<WeeklyReviewData>({
    queryKey: ['weekly-review', weekOffset],
    queryFn: async () => {
      const res = await fetch(`/api/weekly-review?weekOffset=${weekOffset}`)
      if (!res.ok) throw new Error('Failed to fetch weekly review')
      return res.json()
    },
  })
}

export function useSaveWeeklyReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: { reflection?: string; focus?: string }) => {
      const res = await fetch('/api/weekly-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to save weekly review')
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weekly-review'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
