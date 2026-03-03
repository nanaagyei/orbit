'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format, formatDistanceToNow } from 'date-fns'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MessageCircle,
  Coffee,
  Users,
  Mail,
  Phone,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useInteractions, useDeleteInteraction } from '@/hooks/use-interactions'
import { usePeople } from '@/hooks/use-people'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { InteractionFormDialog } from '@/components/interactions/interaction-form-dialog'

export default function InteractionsPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string | undefined>()
  const [personFilter, setPersonFilter] = useState<string | undefined>()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingInteraction, setEditingInteraction] = useState<any>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data: interactions, isLoading } = useInteractions({
    search: search || undefined,
    type: typeFilter === 'all' ? undefined : typeFilter,
    personId: personFilter === 'all' ? undefined : personFilter,
  })
  const { data: people } = usePeople()
  const deleteInteraction = useDeleteInteraction()

  const handleEdit = (interaction: any) => {
    setEditingInteraction(interaction)
    setDialogOpen(true)
  }

  const handleDelete = async (interactionId: string) => {
    if (!confirm('Are you sure you want to delete this interaction?')) return

    try {
      await deleteInteraction.mutateAsync(interactionId)
      toast.success('Interaction deleted')
    } catch (error) {
      toast.error('Failed to delete interaction')
    }
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setEditingInteraction(null)
  }

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'COFFEE_CHAT':
        return <Coffee className="h-4 w-4" />
      case 'MEETUP':
        return <Users className="h-4 w-4" />
      case 'DM':
        return <MessageCircle className="h-4 w-4" />
      case 'EMAIL':
        return <Mail className="h-4 w-4" />
      case 'CALL':
        return <Phone className="h-4 w-4" />
      default:
        return <MessageCircle className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'COFFEE_CHAT':
        return 'bg-amber-100 text-amber-800'
      case 'MEETUP':
        return 'bg-blue-100 text-blue-800'
      case 'DM':
        return 'bg-purple-100 text-purple-800'
      case 'EMAIL':
        return 'bg-green-100 text-green-800'
      case 'CALL':
        return 'bg-teal-100 text-teal-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatInteractionType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading interactions...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-foreground">Interactions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View all coffee chats, meetups, and conversations
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Log Interaction
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search interactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="COFFEE_CHAT">Coffee Chat</SelectItem>
            <SelectItem value="MEETUP">Meetup</SelectItem>
            <SelectItem value="DM">DM</SelectItem>
            <SelectItem value="EMAIL">Email</SelectItem>
            <SelectItem value="CALL">Call</SelectItem>
          </SelectContent>
        </Select>
        <Select value={personFilter} onValueChange={setPersonFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All people" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All people</SelectItem>
            {people?.map((person: any) => (
              <SelectItem key={person.id} value={person.id}>
                {person.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {interactions && interactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border rounded-lg">
          <MessageCircle className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground text-center">
            {search || typeFilter || personFilter
              ? 'No interactions match your filters.'
              : 'No interactions logged yet. Record your first coffee chat or conversation to get started.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {interactions?.map((interaction: any) => {
            const isExpanded = expandedId === interaction.id
            const hasDetails =
              interaction.keyInsights ||
              interaction.advice ||
              interaction.nextSteps

            return (
              <div
                key={interaction.id}
                className="border rounded-lg overflow-hidden hover:bg-muted/30 transition-colors"
              >
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            router.push(`/people/${interaction.person.id}`)
                          }
                          className="text-base font-medium text-foreground hover:underline"
                        >
                          {interaction.person.name}
                        </button>
                        <Badge className={getTypeColor(interaction.type)}>
                          <span className="mr-1">
                            {getTypeIcon(interaction.type)}
                          </span>
                          {formatInteractionType(interaction.type)}
                        </Badge>
                      </div>

                      {interaction.person.company && (
                        <p className="text-sm text-muted-foreground">
                          {interaction.person.company}
                        </p>
                      )}

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{format(new Date(interaction.date), 'MMM d, yyyy')}</span>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(interaction.date), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(interaction)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(interaction.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {interaction.summary && (
                    <p className="text-sm text-foreground">{interaction.summary}</p>
                  )}

                  {hasDetails && (
                    <button
                      onClick={() => toggleExpand(interaction.id)}
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          Hide details
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          Show details
                        </>
                      )}
                    </button>
                  )}
                </div>

                {isExpanded && hasDetails && (
                  <div className="px-4 pb-4 space-y-3 border-t pt-3 bg-muted/20">
                    {interaction.keyInsights && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Key Insights
                        </p>
                        <p className="text-sm text-foreground">
                          {interaction.keyInsights}
                        </p>
                      </div>
                    )}

                    {interaction.advice && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Advice Received
                        </p>
                        <p className="text-sm text-foreground">
                          {interaction.advice}
                        </p>
                      </div>
                    )}

                    {interaction.nextSteps && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-1">
                          Next Steps
                        </p>
                        <p className="text-sm text-foreground">
                          {interaction.nextSteps}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <InteractionFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        interaction={editingInteraction}
      />
    </div>
  )
}
