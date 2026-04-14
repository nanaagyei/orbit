'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search } from 'lucide-react'
import { usePeople } from '@/hooks/use-people'
import { useTags } from '@/hooks/use-tags'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { PersonFormDialog } from '@/components/people/person-form-dialog'

export default function PeoplePage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState<string | undefined>()
  const [tagFilter, setTagFilter] = useState<string | undefined>()
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: people, isLoading } = usePeople({
    search: search || undefined,
    stage: stageFilter,
    tag: tagFilter,
  })
  const { data: tags } = useTags()

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-foreground">People</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your ML network and relationships
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Person
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search people..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All stages</SelectItem>
            <SelectItem value="NEW">New</SelectItem>
            <SelectItem value="CONNECTED">Connected</SelectItem>
            <SelectItem value="CHATTED">Chatted</SelectItem>
            <SelectItem value="ONGOING">Ongoing</SelectItem>
            <SelectItem value="INNER_CIRCLE">Inner Circle</SelectItem>
          </SelectContent>
        </Select>
        <Select value={tagFilter} onValueChange={setTagFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All tags" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All tags</SelectItem>
            {tags?.map((tag: any) => (
              <SelectItem key={tag.id} value={tag.id}>
                {tag.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role / Company</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Stage</TableHead>
              <TableHead className="text-right">Interactions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : people && people.length > 0 ? (
              people.map((person: any) => (
                <TableRow
                  key={person.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/people/${person.id}`)}
                >
                  <TableCell className="font-medium">{person.name}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      {person.headline && (
                        <span className="text-sm">{person.headline}</span>
                      )}
                      {person.company && (
                        <span className="text-sm text-muted-foreground">
                          {person.company}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {person.tags?.slice(0, 3).map((pt: any) => (
                        <Badge key={pt.tag.id} variant="outline" className="text-xs">
                          {pt.tag.name}
                        </Badge>
                      ))}
                      {person.tags?.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{person.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStageColor(person.stage)}>
                      {formatStage(person.stage)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {person._count?.interactions || 0}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No people found. Add your first connection to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <PersonFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
