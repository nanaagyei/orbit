'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow, format } from 'date-fns'
import { CheckCircle2, AlertCircle, Coffee, FileText, Calendar } from 'lucide-react'
import { useDashboard, useUpdateWeeklyFocus } from '@/hooks/use-dashboard'
import { useMarkFollowUpDone } from '@/hooks/use-followups'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { CalendarOverview } from '@/components/dashboard/calendar-overview'
import { toast } from 'sonner'

export default function Dashboard() {
  const router = useRouter()
  const { data: dashboardData, isLoading } = useDashboard()
  const markFollowUpDone = useMarkFollowUpDone()
  const updateWeeklyFocus = useUpdateWeeklyFocus()
  const [weeklyFocusText, setWeeklyFocusText] = useState('')

  useEffect(() => {
    if (dashboardData?.weeklyFocus) {
      setWeeklyFocusText(dashboardData.weeklyFocus)
    }
  }, [dashboardData?.weeklyFocus])

  // Autosave weekly focus with debounce
  useEffect(() => {
    if (weeklyFocusText === dashboardData?.weeklyFocus) return

    const timer = setTimeout(() => {
      if (weeklyFocusText !== undefined && weeklyFocusText !== dashboardData?.weeklyFocus) {
        updateWeeklyFocus.mutate(weeklyFocusText)
      }
    }, 1000)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weeklyFocusText, dashboardData?.weeklyFocus])

  const handleMarkDone = async (followUpId: string) => {
    try {
      await markFollowUpDone.mutateAsync(followUpId)
      toast.success('Follow-up marked as done')
    } catch (error) {
      toast.error('Failed to mark follow-up as done')
    }
  }

  const getFollowUpTypeColor = (type: string) => {
    switch (type) {
      case 'THANK_YOU':
        return 'bg-green-100 text-green-800'
      case 'NUDGE':
        return 'bg-amber-100 text-amber-800'
      case 'VALUE_RECONNECT':
        return 'bg-blue-100 text-blue-800'
      case 'CHECK_IN':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatFollowUpType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    )
  }

  const { followUps, recentActivity, weeklyFocus } = dashboardData || {}
  const { overdue = [], dueToday = [], dueThisWeek = [] } = followUps || {}
  const { coffeeChatCount = 0, papersReadCount = 0, eventsAttendedCount = 0 } =
    recentActivity || {}

  const totalFollowUps = overdue.length + dueToday.length + dueThisWeek.length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-medium text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Your ML career momentum at a glance
        </p>
      </div>

      {/* Next Actions Section */}
      <div className="border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-foreground">Next Actions</h2>
          {totalFollowUps > 0 && (
            <Badge variant="outline">{totalFollowUps} pending</Badge>
          )}
        </div>

        {totalFollowUps === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <CheckCircle2 className="h-12 w-12 text-green-500/30 mb-3" />
            <p className="text-sm text-muted-foreground text-center">
              No follow-ups due today. You&apos;re all caught up!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Overdue */}
            {overdue.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <h3 className="text-sm font-medium text-destructive">
                    Overdue ({overdue.length})
                  </h3>
                </div>
                {overdue.map((followUp: any) => (
                  <FollowUpCard
                    key={followUp.id}
                    followUp={followUp}
                    onMarkDone={handleMarkDone}
                    getFollowUpTypeColor={getFollowUpTypeColor}
                    formatFollowUpType={formatFollowUpType}
                    router={router}
                  />
                ))}
              </div>
            )}

            {/* Due Today */}
            {dueToday.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <h3 className="text-sm font-medium text-foreground">
                    Due Today ({dueToday.length})
                  </h3>
                </div>
                {dueToday.map((followUp: any) => (
                  <FollowUpCard
                    key={followUp.id}
                    followUp={followUp}
                    onMarkDone={handleMarkDone}
                    getFollowUpTypeColor={getFollowUpTypeColor}
                    formatFollowUpType={formatFollowUpType}
                    router={router}
                  />
                ))}
              </div>
            )}

            {/* Due This Week */}
            {dueThisWeek.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <h3 className="text-sm font-medium text-foreground">
                    Due This Week ({dueThisWeek.length})
                  </h3>
                </div>
                {dueThisWeek.map((followUp: any) => (
                  <FollowUpCard
                    key={followUp.id}
                    followUp={followUp}
                    onMarkDone={handleMarkDone}
                    getFollowUpTypeColor={getFollowUpTypeColor}
                    formatFollowUpType={formatFollowUpType}
                    router={router}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Three-column layout for Recent Momentum, Calendar Overview, and Weekly Focus */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Momentum */}
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-medium text-foreground mb-4">
            Recent Momentum
          </h2>
          <p className="text-xs text-muted-foreground mb-4">Last 14 days</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-amber-100">
                  <Coffee className="h-4 w-4 text-amber-800" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  Coffee Chats
                </span>
              </div>
              <span className="text-xl font-medium text-foreground">
                {coffeeChatCount}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-blue-100">
                  <FileText className="h-4 w-4 text-blue-800" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  Papers Read
                </span>
              </div>
              <span className="text-xl font-medium text-foreground">
                {papersReadCount}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-purple-100">
                  <Calendar className="h-4 w-4 text-purple-800" />
                </div>
                <span className="text-sm font-medium text-foreground">
                  Events Attended
                </span>
              </div>
              <span className="text-xl font-medium text-foreground">
                {eventsAttendedCount}
              </span>
            </div>
          </div>
        </div>

        {/* Calendar Overview */}
        <CalendarOverview />

        {/* Weekly Focus */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-foreground">
              This Week&apos;s Focus
            </h2>
            {updateWeeklyFocus.isPending && (
              <span className="text-xs text-muted-foreground">Saving...</span>
            )}
          </div>
          <Textarea
            placeholder="What are you focusing on this week? What do you want to accomplish?"
            value={weeklyFocusText}
            onChange={(e) => setWeeklyFocusText(e.target.value)}
            className="min-h-[200px] resize-none"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Auto-saves as you type
          </p>
        </div>
      </div>
    </div>
  )
}

interface FollowUpCardProps {
  followUp: any
  onMarkDone: (id: string) => void
  getFollowUpTypeColor: (type: string) => string
  formatFollowUpType: (type: string) => string
  router: any
}

function FollowUpCard({
  followUp,
  onMarkDone,
  getFollowUpTypeColor,
  formatFollowUpType,
  router,
}: FollowUpCardProps) {
  return (
    <div className="flex items-start justify-between p-3 bg-muted/30 rounded-md border border-border">
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          {followUp.person ? (
            <button
              onClick={() => router.push(`/people/${followUp.person.id}`)}
              className="text-sm font-medium text-foreground hover:underline"
            >
              {followUp.person.name}
            </button>
          ) : (
            <span className="text-sm font-medium text-muted-foreground">
              General Follow-Up
            </span>
          )}
          <Badge className={getFollowUpTypeColor(followUp.type)}>
            {formatFollowUpType(followUp.type)}
          </Badge>
        </div>

        {followUp.person?.company && (
          <p className="text-xs text-muted-foreground">
            {followUp.person.company}
          </p>
        )}

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Due {format(new Date(followUp.dueDate), 'MMM d')}</span>
          <span>•</span>
          <span>{formatDistanceToNow(new Date(followUp.dueDate))} ago</span>
        </div>

        {followUp.notes && (
          <p className="text-sm text-muted-foreground">{followUp.notes}</p>
        )}

        {followUp.context && (
          <p className="text-xs text-muted-foreground italic">
            Context: {followUp.context}
          </p>
        )}
      </div>

      <Button
        size="sm"
        variant="outline"
        onClick={() => onMarkDone(followUp.id)}
        className="ml-4"
      >
        <CheckCircle2 className="h-4 w-4 mr-1" />
        Done
      </Button>
    </div>
  )
}
