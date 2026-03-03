'use client'

import { useState } from 'react'
import { X, UserPlus, BookOpen, MessageCircle } from 'lucide-react'
import { usePeople } from '@/hooks/use-people'
import { useLinkPersonToPaper, useUnlinkPersonFromPaper } from '@/hooks/use-papers'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { toast } from 'sonner'

interface PaperPerson {
  personId: string
  context: string | null
  person: {
    id: string
    name: string
    company: string | null
    headline: string | null
  }
}

interface PaperPeopleLinksProps {
  paperId: string
  linkedPeople: PaperPerson[]
}

export function PaperPeopleLinks({ paperId, linkedPeople }: PaperPeopleLinksProps) {
  const [isAddingPerson, setIsAddingPerson] = useState(false)
  const [selectedPersonId, setSelectedPersonId] = useState<string>('')
  const [selectedContext, setSelectedContext] = useState<'recommended_by' | 'discussed_with'>('recommended_by')

  const { data: allPeople } = usePeople()
  const linkPerson = useLinkPersonToPaper(paperId)
  const unlinkPerson = useUnlinkPersonFromPaper(paperId)

  // Filter out already linked people
  const linkedPersonIds = new Set(linkedPeople.map((p) => p.personId))
  const availablePeople = allPeople?.filter((p: any) => !linkedPersonIds.has(p.id)) || []

  const recommendedBy = linkedPeople.filter((p) => p.context === 'recommended_by')
  const discussedWith = linkedPeople.filter((p) => p.context === 'discussed_with')

  const handleAddPerson = async () => {
    if (!selectedPersonId) return

    try {
      await linkPerson.mutateAsync({
        personId: selectedPersonId,
        context: selectedContext,
      })
      toast.success('Person linked successfully')
      setSelectedPersonId('')
      setIsAddingPerson(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to link person')
    }
  }

  const handleRemovePerson = async (personId: string) => {
    try {
      await unlinkPerson.mutateAsync(personId)
      toast.success('Person unlinked')
    } catch (error) {
      toast.error('Failed to unlink person')
    }
  }

  return (
    <div className="space-y-4">
      {/* Recommended By Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-medium text-foreground">Recommended By</h4>
        </div>
        {recommendedBy.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {recommendedBy.map((pp) => (
              <Badge
                key={pp.personId}
                variant="secondary"
                className="flex items-center gap-1 pr-1"
              >
                <a
                  href={`/people/${pp.person.id}`}
                  className="hover:underline"
                >
                  {pp.person.name}
                </a>
                <button
                  onClick={() => handleRemovePerson(pp.personId)}
                  className="ml-1 hover:bg-muted rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No one yet</p>
        )}
      </div>

      {/* Discussed With Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4 w-4 text-muted-foreground" />
          <h4 className="text-sm font-medium text-foreground">Discussed With</h4>
        </div>
        {discussedWith.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {discussedWith.map((pp) => (
              <Badge
                key={pp.personId}
                variant="secondary"
                className="flex items-center gap-1 pr-1"
              >
                <a
                  href={`/people/${pp.person.id}`}
                  className="hover:underline"
                >
                  {pp.person.name}
                </a>
                <button
                  onClick={() => handleRemovePerson(pp.personId)}
                  className="ml-1 hover:bg-muted rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No one yet</p>
        )}
      </div>

      {/* Add Person Button */}
      <Popover open={isAddingPerson} onOpenChange={setIsAddingPerson}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <UserPlus className="h-4 w-4 mr-2" />
            Link Person
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Person</label>
              <Select value={selectedPersonId} onValueChange={setSelectedPersonId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a person..." />
                </SelectTrigger>
                <SelectContent>
                  {availablePeople.length > 0 ? (
                    availablePeople.map((person: any) => (
                      <SelectItem key={person.id} value={person.id}>
                        {person.name}
                        {person.company && (
                          <span className="text-muted-foreground ml-1">
                            ({person.company})
                          </span>
                        )}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="py-2 px-2 text-sm text-muted-foreground">
                      No people available to link
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Relationship</label>
              <Select
                value={selectedContext}
                onValueChange={(v) => setSelectedContext(v as 'recommended_by' | 'discussed_with')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recommended_by">Recommended by</SelectItem>
                  <SelectItem value="discussed_with">Discussed with</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddingPerson(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAddPerson}
                disabled={!selectedPersonId || linkPerson.isPending}
              >
                {linkPerson.isPending ? 'Adding...' : 'Add'}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
