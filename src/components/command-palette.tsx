'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import {
  CalendarDays,
  ClipboardCheck,
  FileText,
  Home,
  MessageSquare,
  Network,
  Plus,
  Search,
  Settings,
  Sparkles,
  User,
  Users,
  Bell,
  BookOpen,
} from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { PersonFormDialog } from '@/components/people/person-form-dialog'
import { PaperFormDialog } from '@/components/papers/paper-form-dialog'
import { InteractionFormDialog } from '@/components/interactions/interaction-form-dialog'
import { FollowUpFormDialog } from '@/components/follow-ups/follow-up-form-dialog'
import { EventFormDialog } from '@/components/events/event-form-dialog'
import { useDebounce } from '@/hooks/use-debounce'
import { useCommandPalette } from '@/providers/command-palette-provider'
import { useFeatures } from '@/hooks/use-features'

interface SearchResults {
  people: Array<{
    id: string
    name: string
    company: string | null
    headline: string | null
    stage: string
  }>
  papers: Array<{
    id: string
    title: string
    authors: string | null
    status: string
    year: number | null
  }>
  events: Array<{
    id: string
    title: string
    host: string | null
    dateTime: string
    rsvpStatus: string
  }>
  interactions: Array<{
    id: string
    type: string
    date: string
    summary: string | null
    person: { id: string; name: string }
  }>
}

export function CommandPalette() {
  const router = useRouter()
  const { open, setOpen } = useCommandPalette()
  const { isFeatureEnabled } = useFeatures()
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  // Dialog states
  const [personDialogOpen, setPersonDialogOpen] = useState(false)
  const [paperDialogOpen, setPaperDialogOpen] = useState(false)
  const [interactionDialogOpen, setInteractionDialogOpen] = useState(false)
  const [followUpDialogOpen, setFollowUpDialogOpen] = useState(false)
  const [eventDialogOpen, setEventDialogOpen] = useState(false)

  const debouncedSearch = useDebounce(search, 300)

  // Global keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  // Search when query changes
  useEffect(() => {
    if (debouncedSearch.length < 2) {
      setSearchResults(null)
      return
    }

    const fetchResults = async () => {
      setIsSearching(true)
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(debouncedSearch)}`)
        if (res.ok) {
          const data = await res.json()
          setSearchResults(data)
        }
      } catch (error) {
        console.error('Search failed:', error)
      } finally {
        setIsSearching(false)
      }
    }

    fetchResults()
  }, [debouncedSearch])

  const runCommand = useCallback((command: () => void) => {
    setOpen(false)
    setSearch('')
    setSearchResults(null)
    command()
  }, [])

  const handleOpenChange = (open: boolean) => {
    setOpen(open)
    if (!open) {
      setSearch('')
      setSearchResults(null)
    }
  }

  const formatInteractionType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ')
  }

  const hasResults =
    searchResults &&
    (searchResults.people.length > 0 ||
      searchResults.papers.length > 0 ||
      searchResults.events.length > 0 ||
      searchResults.interactions.length > 0)

  return (
    <>
      <CommandDialog open={open} onOpenChange={handleOpenChange}>
        <CommandInput
          placeholder="Type a command or search..."
          value={search}
          onValueChange={setSearch}
        />
        <CommandList>
          <CommandEmpty>
            {isSearching ? 'Searching...' : 'No results found.'}
          </CommandEmpty>

          {/* Search Results */}
          {hasResults && (
            <>
              {searchResults.people.length > 0 && (
                <CommandGroup heading="People">
                  {searchResults.people.map((person) => (
                    <CommandItem
                      key={person.id}
                      value={`person-${person.id}-${person.name}`}
                      onSelect={() =>
                        runCommand(() => router.push(`/people/${person.id}`))
                      }
                    >
                      <User className="mr-2 h-4 w-4" />
                      <div className="flex flex-col">
                        <span>{person.name}</span>
                        {person.company && (
                          <span className="text-xs text-muted-foreground">
                            {person.headline || person.company}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {searchResults.papers.length > 0 && (
                <CommandGroup heading="Papers">
                  {searchResults.papers.map((paper) => (
                    <CommandItem
                      key={paper.id}
                      value={`paper-${paper.id}-${paper.title}`}
                      onSelect={() =>
                        runCommand(() => router.push(`/papers/${paper.id}`))
                      }
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      <div className="flex flex-col">
                        <span>{paper.title}</span>
                        {paper.authors && (
                          <span className="text-xs text-muted-foreground">
                            {paper.authors}
                            {paper.year && ` (${paper.year})`}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {searchResults.events.length > 0 && (
                <CommandGroup heading="Events">
                  {searchResults.events.map((event) => (
                    <CommandItem
                      key={event.id}
                      value={`event-${event.id}-${event.title}`}
                      onSelect={() =>
                        runCommand(() => router.push(`/events/${event.id}`))
                      }
                    >
                      <CalendarDays className="mr-2 h-4 w-4" />
                      <div className="flex flex-col">
                        <span>{event.title}</span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(event.dateTime), 'MMM d, yyyy')}
                          {event.host && ` - ${event.host}`}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              {searchResults.interactions.length > 0 && (
                <CommandGroup heading="Interactions">
                  {searchResults.interactions.map((interaction) => (
                    <CommandItem
                      key={interaction.id}
                      value={`interaction-${interaction.id}-${interaction.person.name}`}
                      onSelect={() =>
                        runCommand(() =>
                          router.push(`/people/${interaction.person.id}`)
                        )
                      }
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      <div className="flex flex-col">
                        <span>
                          {formatInteractionType(interaction.type)} with{' '}
                          {interaction.person.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(interaction.date), 'MMM d, yyyy')}
                          {interaction.summary &&
                            ` - ${interaction.summary.slice(0, 50)}...`}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}

              <CommandSeparator />
            </>
          )}

          {/* Quick Actions */}
          <CommandGroup heading="Create">
            {isFeatureEnabled('people') && (
              <CommandItem
                onSelect={() => runCommand(() => setPersonDialogOpen(true))}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Person
              </CommandItem>
            )}
            {isFeatureEnabled('papers') && (
              <CommandItem
                onSelect={() => runCommand(() => setPaperDialogOpen(true))}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Paper
              </CommandItem>
            )}
            {isFeatureEnabled('interactions') && (
              <CommandItem
                onSelect={() => runCommand(() => setInteractionDialogOpen(true))}
              >
                <Plus className="mr-2 h-4 w-4" />
                Log Interaction
              </CommandItem>
            )}
            {isFeatureEnabled('follow-ups') && (
              <CommandItem
                onSelect={() => runCommand(() => setFollowUpDialogOpen(true))}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Follow-Up
              </CommandItem>
            )}
            {isFeatureEnabled('events') && (
              <CommandItem
                onSelect={() => runCommand(() => setEventDialogOpen(true))}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Event
              </CommandItem>
            )}
          </CommandGroup>

          <CommandSeparator />

          {/* Navigation */}
          <CommandGroup heading="Navigate">
            {isFeatureEnabled('dashboard') && (
              <CommandItem onSelect={() => runCommand(() => router.push('/'))}>
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </CommandItem>
            )}
            {isFeatureEnabled('people') && (
              <CommandItem
                onSelect={() => runCommand(() => router.push('/people'))}
              >
                <Users className="mr-2 h-4 w-4" />
                People
              </CommandItem>
            )}
            {isFeatureEnabled('interactions') && (
              <CommandItem
                onSelect={() => runCommand(() => router.push('/interactions'))}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Interactions
              </CommandItem>
            )}
            {isFeatureEnabled('follow-ups') && (
              <CommandItem
                onSelect={() => runCommand(() => router.push('/follow-ups'))}
              >
                <Bell className="mr-2 h-4 w-4" />
                Follow-Ups
              </CommandItem>
            )}
            {isFeatureEnabled('papers') && (
              <CommandItem
                onSelect={() => runCommand(() => router.push('/papers'))}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Papers
              </CommandItem>
            )}
            {isFeatureEnabled('events') && (
              <CommandItem
                onSelect={() => runCommand(() => router.push('/events'))}
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                Events
              </CommandItem>
            )}
            {isFeatureEnabled('calendar') && (
              <CommandItem
                onSelect={() => runCommand(() => router.push('/calendar'))}
              >
                <CalendarDays className="mr-2 h-4 w-4" />
                Calendar
              </CommandItem>
            )}
            {isFeatureEnabled('network-map') && (
              <CommandItem
                onSelect={() => runCommand(() => router.push('/relationship-map'))}
              >
                <Network className="mr-2 h-4 w-4" />
                Network Map
              </CommandItem>
            )}
            {isFeatureEnabled('ai-studio') && (
              <CommandItem
                onSelect={() => runCommand(() => router.push('/ai-studio'))}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                AI Studio
              </CommandItem>
            )}
            {isFeatureEnabled('weekly-review') && (
              <CommandItem
                onSelect={() => runCommand(() => router.push('/weekly-review'))}
              >
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Weekly Review
              </CommandItem>
            )}
            {isFeatureEnabled('settings') && (
              <CommandItem
                onSelect={() => runCommand(() => router.push('/settings'))}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </CommandItem>
            )}
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      {/* Form Dialogs */}
      <PersonFormDialog
        open={personDialogOpen}
        onOpenChange={setPersonDialogOpen}
      />
      <PaperFormDialog
        open={paperDialogOpen}
        onOpenChange={setPaperDialogOpen}
      />
      <InteractionFormDialog
        open={interactionDialogOpen}
        onOpenChange={setInteractionDialogOpen}
      />
      <FollowUpFormDialog
        open={followUpDialogOpen}
        onOpenChange={setFollowUpDialogOpen}
      />
      <EventFormDialog
        open={eventDialogOpen}
        onOpenChange={setEventDialogOpen}
      />
    </>
  )
}
