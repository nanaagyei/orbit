'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ExternalLink, Mail, ArrowLeft, Edit, MessageSquare, BookOpen, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { usePerson } from '@/hooks/use-people'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PersonFormDialog } from '@/components/people/person-form-dialog'
import { PersonTimeline } from '@/components/people/person-timeline'
import { InteractionFormDialog } from '@/components/interactions/interaction-form-dialog'
import { FollowUpFormDialog } from '@/components/follow-ups/follow-up-form-dialog'

export default function PersonDetailPage() {
  const params = useParams()
  const router = useRouter()
  const personId = params.id as string
  const { data: person, isLoading } = usePerson(personId)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [interactionDialogOpen, setInteractionDialogOpen] = useState(false)
  const [followUpDialogOpen, setFollowUpDialogOpen] = useState(false)

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

  const formatStage = (stage: string) => {
    return stage.split('_').map(word =>
      word.charAt(0) + word.slice(1).toLowerCase()
    ).join(' ')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!person) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Person not found</p>
        <Button onClick={() => router.push('/people')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to People
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/people')}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to People
      </Button>

      {/* Header */}
      <div className="border rounded-lg p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-medium text-foreground">{person.name}</h1>
            {person.headline && (
              <p className="text-base text-muted-foreground mt-1">
                {person.headline}
              </p>
            )}
            {person.company && (
              <p className="text-sm text-muted-foreground mt-1">
                {person.company}
                {person.location && ` • ${person.location}`}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditDialogOpen(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            {person.linkedinUrl && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(person.linkedinUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                LinkedIn
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Stage:</span>
            <Badge className={getStageColor(person.stage)}>
              {formatStage(person.stage)}
            </Badge>
          </div>

          {person.tags && person.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Tags:</span>
              {person.tags.map((pt: any) => (
                <Badge key={pt.tag.id} variant="outline" className="text-xs">
                  {pt.tag.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {person.notes && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {person.notes}
            </p>
          </div>
        )}
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline - Takes up 2 columns on large screens */}
        <div className="lg:col-span-2">
          <div className="border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-foreground">Timeline</h2>
              <Button size="sm" onClick={() => setInteractionDialogOpen(true)}>
                <MessageSquare className="h-4 w-4 mr-2" />
                Log Interaction
              </Button>
            </div>
            <PersonTimeline personId={personId} />
          </div>
        </div>

        {/* Sidebar - Takes up 1 column on large screens */}
        <div className="space-y-4">
          {/* Next Follow-up card */}
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-foreground mb-3">
              Next Follow-Up
            </h3>
            <p className="text-sm text-muted-foreground">
              No upcoming follow-ups
            </p>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-3"
              onClick={() => setFollowUpDialogOpen(true)}
            >
              Add Follow-Up
            </Button>
          </div>

          {/* Quick Actions */}
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-foreground mb-3">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => router.push(`/ai-studio?person=${personId}`)}
              >
                <Mail className="h-4 w-4 mr-2" />
                Generate Message
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-foreground mb-3">Stats</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Interactions</span>
                <span className="font-medium">
                  {person._count?.interactions || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Follow-ups</span>
                <span className="font-medium">
                  {person._count?.followUps || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Papers</span>
                <span className="font-medium">
                  {person._count?.papers || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Linked Papers */}
          {person.papers && person.papers.length > 0 && (
            <div className="border rounded-lg p-4">
              <h3 className="text-sm font-medium text-foreground mb-3">
                Papers Discussed
              </h3>
              <div className="space-y-3">
                {person.papers.map((pp: any) => (
                  <div key={pp.paper.id} className="space-y-1">
                    <Link
                      href={`/papers/${pp.paper.id}`}
                      className="text-sm font-medium text-foreground hover:text-primary line-clamp-2"
                    >
                      {pp.paper.title}
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {pp.context === 'recommended_by' ? (
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-3 w-3" />
                          Recommended
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          Discussed
                        </span>
                      )}
                      {pp.paper.year && <span>{pp.paper.year}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <PersonFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        person={person}
      />

      <InteractionFormDialog
        open={interactionDialogOpen}
        onOpenChange={setInteractionDialogOpen}
        personId={personId}
        personName={person?.name}
      />

      <FollowUpFormDialog
        open={followUpDialogOpen}
        onOpenChange={setFollowUpDialogOpen}
        preselectedPersonId={personId}
      />
    </div>
  )
}
