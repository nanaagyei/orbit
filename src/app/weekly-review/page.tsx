'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { format, formatDistanceToNow } from 'date-fns'
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Coffee,
  FileText,
  MessageSquare,
  Users,
  User,
  Plus,
  Sparkles,
} from 'lucide-react'
import { useWeeklyReview, useSaveWeeklyReview } from '@/hooks/use-weekly-review'
import { useCreateFollowUp } from '@/hooks/use-followups'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/use-debounce'

export default function WeeklyReviewPage() {
  const router = useRouter()
  const [weekOffset, setWeekOffset] = useState(0)
  const { data, isLoading } = useWeeklyReview(weekOffset)
  const saveReview = useSaveWeeklyReview()
  const createFollowUp = useCreateFollowUp()

  const [reflection, setReflection] = useState('')
  const [focus, setFocus] = useState('')
  const [expandedInteractions, setExpandedInteractions] = useState<Set<string>>(
    new Set()
  )
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())

  // Track if we've initialized from server data
  const initializedRef = useRef(false)

  // Initialize form values from server data
  useEffect(() => {
    if (data && !initializedRef.current) {
      setReflection(data.currentReflection || '')
      setFocus(data.currentFocus || '')
      initializedRef.current = true
    }
  }, [data])

  // Debounced autosave
  const debouncedReflection = useDebounce(reflection, 1000)
  const debouncedFocus = useDebounce(focus, 1000)

  // Autosave reflection when it changes
  useEffect(() => {
    if (initializedRef.current && debouncedReflection && data?.currentReflection !== debouncedReflection) {
      saveReview.mutate({ reflection: debouncedReflection })
    }
  }, [debouncedReflection]) // eslint-disable-line react-hooks/exhaustive-deps

  // Autosave focus when it changes
  useEffect(() => {
    if (initializedRef.current && debouncedFocus && data?.currentFocus !== debouncedFocus) {
      saveReview.mutate({ focus: debouncedFocus })
    }
  }, [debouncedFocus]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleInteraction = (id: string) => {
    setExpandedInteractions((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const toggleEvent = (id: string) => {
    setExpandedEvents((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleCreateFollowUp = async (personId: string, personName: string) => {
    try {
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + 7)
      await createFollowUp.mutateAsync({
        personId,
        type: 'CHECK_IN',
        dueDate: dueDate.toISOString(),
        notes: `Follow up from weekly review`,
      })
      toast.success(`Follow-up created for ${personName}`)
    } catch {
      toast.error('Failed to create follow-up')
    }
  }

  const handleCompleteReview = () => {
    saveReview.mutate(
      { reflection, focus },
      {
        onSuccess: () => {
          toast.success('Weekly review completed!')
          router.push('/')
        },
      }
    )
  }

  const formatInteractionType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ')
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'NEW':
        return 'bg-gray-100 text-gray-800'
      case 'CONNECTED':
        return 'bg-blue-100 text-blue-800'
      case 'CHATTED':
        return 'bg-green-100 text-green-800'
      case 'ONGOING':
        return 'bg-teal-100 text-teal-800'
      case 'INNER_CIRCLE':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Failed to load weekly review</p>
        <Button onClick={() => router.push('/')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>
    )
  }

  const weekStartDate = new Date(data.weekStart)
  const weekEndDate = new Date(data.weekEnd)

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-foreground">Weekly Review</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Reflect on your week and set intentions for the next one
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekOffset(weekOffset + 1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-[180px] text-center">
            {format(weekStartDate, 'MMM d')} - {format(weekEndDate, 'MMM d, yyyy')}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setWeekOffset(Math.max(0, weekOffset - 1))}
            disabled={weekOffset === 0}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="border rounded-lg p-6">
        <h2 className="text-lg font-medium text-foreground mb-4">
          Week in Review
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <Coffee className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
            <p className="text-2xl font-medium">{data.stats.coffeeChats}</p>
            <p className="text-xs text-muted-foreground">Coffee Chats</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <MessageSquare className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
            <p className="text-2xl font-medium">{data.stats.totalInteractions}</p>
            <p className="text-xs text-muted-foreground">Interactions</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <FileText className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
            <p className="text-2xl font-medium">{data.stats.papersRead}</p>
            <p className="text-xs text-muted-foreground">Papers Read</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <Calendar className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
            <p className="text-2xl font-medium">{data.stats.eventsAttended}</p>
            <p className="text-xs text-muted-foreground">Events Attended</p>
          </div>
          <div className="text-center p-4 bg-muted/30 rounded-lg">
            <Check className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
            <p className="text-2xl font-medium">{data.stats.followUpsCompleted}</p>
            <p className="text-xs text-muted-foreground">Follow-Ups Done</p>
          </div>
        </div>
      </div>

      {/* People You Talked To */}
      <div className="border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-foreground">
            People You Talked To
          </h2>
          <span className="text-sm text-muted-foreground">
            {data.interactions.length} interactions
          </span>
        </div>

        {data.interactions.length > 0 ? (
          <div className="space-y-3">
            {data.interactions.map((interaction) => (
              <div key={interaction.id} className="border rounded-lg">
                <button
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  onClick={() => toggleInteraction(interaction.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{interaction.person.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatInteractionType(interaction.type)} -{' '}
                        {format(new Date(interaction.date), 'EEE, MMM d')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStageColor(interaction.person.stage)}>
                      {interaction.person.stage.replace('_', ' ')}
                    </Badge>
                    {expandedInteractions.has(interaction.id) ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>
                {expandedInteractions.has(interaction.id) && (
                  <div className="px-4 pb-4 space-y-3 border-t pt-3">
                    {interaction.summary && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                          Summary
                        </p>
                        <p className="text-sm">{interaction.summary}</p>
                      </div>
                    )}
                    {interaction.keyInsights && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                          Key Insights
                        </p>
                        <p className="text-sm">{interaction.keyInsights}</p>
                      </div>
                    )}
                    {interaction.advice && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                          Advice
                        </p>
                        <p className="text-sm">{interaction.advice}</p>
                      </div>
                    )}
                    {interaction.nextSteps && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase mb-1">
                          Next Steps
                        </p>
                        <p className="text-sm">{interaction.nextSteps}</p>
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        router.push(`/people/${interaction.person.id}`)
                      }
                    >
                      View Profile
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">
              No interactions logged this week.
            </p>
          </div>
        )}
      </div>

      {/* Events This Week */}
      {data.events.length > 0 && (
        <div className="border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-foreground">
              Events This Week
            </h2>
            <span className="text-sm text-muted-foreground">
              {data.events.length} events
            </span>
          </div>

          <div className="space-y-3">
            {data.events.map((event) => (
              <div key={event.id} className="border rounded-lg">
                <button
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors"
                  onClick={() => toggleEvent(event.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(event.dateTime), 'EEE, MMM d')}
                        {event.host && ` - ${event.host}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={
                        event.rsvpStatus === 'WENT'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {event.rsvpStatus.replace('_', ' ')}
                    </Badge>
                    {expandedEvents.has(event.id) ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>
                {expandedEvents.has(event.id) && event.attendees.length > 0 && (
                  <div className="px-4 pb-4 border-t pt-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase mb-2">
                      People Met ({event.attendees.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {event.attendees.map((attendance) => (
                        <Button
                          key={attendance.person.id}
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            router.push(`/people/${attendance.person.id}`)
                          }
                        >
                          <User className="h-3 w-3 mr-1" />
                          {attendance.person.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Follow-Ups Needed */}
      {(data.suggestedFollowUps.needsReconnect.length > 0 ||
        data.suggestedFollowUps.ongoingNeedsAttention.length > 0) && (
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-medium text-foreground mb-4">
            Follow-Ups Needed
          </h2>

          {data.suggestedFollowUps.needsReconnect.length > 0 && (
            <div className="mb-6">
              <p className="text-sm font-medium text-muted-foreground mb-3">
                Haven&apos;t talked in 2+ weeks
              </p>
              <div className="space-y-2">
                {data.suggestedFollowUps.needsReconnect.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{person.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Last:{' '}
                          {person.interactions[0]
                            ? formatDistanceToNow(
                                new Date(person.interactions[0].date),
                                { addSuffix: true }
                              )
                            : 'Never'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCreateFollowUp(person.id, person.name)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Follow-up
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {data.suggestedFollowUps.ongoingNeedsAttention.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-3">
                Ongoing relationships needing attention (1+ month)
              </p>
              <div className="space-y-2">
                {data.suggestedFollowUps.ongoingNeedsAttention.map((person) => (
                  <div
                    key={person.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{person.name}</p>
                        <p className="text-xs text-muted-foreground">
                          <Badge
                            className={`${getStageColor(person.stage)} mr-2`}
                          >
                            {person.stage.replace('_', ' ')}
                          </Badge>
                          Last:{' '}
                          {person.interactions[0]
                            ? formatDistanceToNow(
                                new Date(person.interactions[0].date),
                                { addSuffix: true }
                              )
                            : 'Never'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCreateFollowUp(person.id, person.name)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Follow-up
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Papers Read */}
      {data.papers.length > 0 && (
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-medium text-foreground mb-4">
            Papers Read This Week
          </h2>
          <div className="space-y-2">
            {data.papers.map((paper) => (
              <div
                key={paper.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => router.push(`/papers/${paper.id}`)}
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{paper.title}</p>
                    {paper.authors && (
                      <p className="text-xs text-muted-foreground">
                        {paper.authors}
                      </p>
                    )}
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  {paper.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reflection Section */}
      <div className="border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-medium text-foreground">
            What Did You Build or Learn?
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Take a moment to reflect on your accomplishments and learnings this week.
          What experiments did you run? What insights did you gain?
        </p>
        <Textarea
          placeholder="This week I worked on... I learned that... An interesting insight was..."
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          className="min-h-[150px] resize-none"
        />
        <p className="text-xs text-muted-foreground mt-2">
          {saveReview.isPending ? 'Saving...' : 'Auto-saved'}
        </p>
      </div>

      {/* Next Week's Focus */}
      <div className="border rounded-lg p-6">
        <div className="flex items-center gap-2 mb-4">
          <ArrowRight className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-medium text-foreground">
            Next Week&apos;s Focus
          </h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Set an intention for the coming week. What do you want to accomplish?
          Who do you want to connect with? What do you want to learn?
        </p>
        <Textarea
          placeholder="Next week I want to focus on... I plan to reach out to... My learning goal is..."
          value={focus}
          onChange={(e) => setFocus(e.target.value)}
          className="min-h-[120px] resize-none"
        />
        <p className="text-xs text-muted-foreground mt-2">
          {saveReview.isPending ? 'Saving...' : 'Auto-saved'}
        </p>
      </div>

      {/* Complete Button */}
      <div className="flex justify-end">
        <Button size="lg" onClick={handleCompleteReview}>
          <Check className="h-4 w-4 mr-2" />
          Complete Review
        </Button>
      </div>
    </div>
  )
}
