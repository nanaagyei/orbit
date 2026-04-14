'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Search, List, LayoutGrid, ExternalLink } from 'lucide-react'
import { DndContext, DragEndEvent, DragOverlay, closestCenter } from '@dnd-kit/core'
import { usePapers, useUpdatePaperStatus } from '@/hooks/use-papers'
import { useTags } from '@/hooks/use-tags'
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
import { PaperFormDialog } from '@/components/papers/paper-form-dialog'

const STATUSES = [
  { value: 'PLANNED', label: 'Planned', color: 'bg-gray-100 text-gray-800' },
  { value: 'READING', label: 'Reading', color: 'bg-blue-100 text-blue-800' },
  { value: 'READ', label: 'Read', color: 'bg-green-100 text-green-800' },
  { value: 'IMPLEMENTED', label: 'Implemented', color: 'bg-purple-100 text-purple-800' },
  { value: 'REVISITED', label: 'Revisited', color: 'bg-amber-100 text-amber-800' },
]

export default function PapersPage() {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState<string | undefined>()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activePaper, setActivePaper] = useState<any>(null)

  const { data: papers, isLoading } = usePapers({
    search: search || undefined,
    tag: tagFilter,
  })
  const { data: tags } = useTags()
  const updatePaperStatus = useUpdatePaperStatus()

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      setActivePaper(null)
      return
    }

    const paperId = active.id as string
    const newStatus = over.id as string

    try {
      await updatePaperStatus.mutateAsync({ id: paperId, status: newStatus })
      toast.success('Paper status updated')
    } catch (error) {
      toast.error('Failed to update paper status')
    }

    setActivePaper(null)
  }

  const handleDragStart = (event: any) => {
    const paper = papers?.find((p: any) => p.id === event.active.id)
    setActivePaper(paper)
  }

  const getPapersByStatus = (status: string) => {
    return papers?.filter((paper: any) => paper.status === status) || []
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading papers...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-foreground">Papers</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track ML papers with structured reflection
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Paper
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search papers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
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

      {/* Kanban Board */}
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
        onDragStart={handleDragStart}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {STATUSES.map((status) => {
            const statusPapers = getPapersByStatus(status.value)

            return (
              <div key={status.value} className="flex flex-col">
                {/* Column Header */}
                <div className="p-3 bg-muted/50 rounded-t-lg border border-b-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-foreground">
                      {status.label}
                    </h3>
                    <Badge variant="outline" className="text-xs">
                      {statusPapers.length}
                    </Badge>
                  </div>
                </div>

                {/* Droppable Column */}
                <div
                  id={status.value}
                  className="flex-1 p-3 bg-muted/20 rounded-b-lg border border-t-0 min-h-[400px] space-y-3"
                >
                  {statusPapers.length === 0 ? (
                    <p className="text-xs text-muted-foreground text-center py-8">
                      No papers
                    </p>
                  ) : (
                    statusPapers.map((paper: any) => (
                      <PaperCard
                        key={paper.id}
                        paper={paper}
                        status={status}
                        onClick={() => router.push(`/papers/${paper.id}`)}
                      />
                    ))
                  )}
                </div>
              </div>
            )
          })}
        </div>

        <DragOverlay>
          {activePaper ? (
            <PaperCard
              paper={activePaper}
              status={STATUSES.find((s) => s.value === activePaper.status)!}
              isDragging
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <PaperFormDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}

interface PaperCardProps {
  paper: any
  status: { value: string; label: string; color: string }
  onClick?: () => void
  isDragging?: boolean
}

function PaperCard({ paper, status, onClick, isDragging }: PaperCardProps) {
  return (
    <div
      className={`p-3 bg-background border rounded-lg cursor-pointer hover:shadow-md transition-all ${
        isDragging ? 'opacity-50' : ''
      }`}
      onClick={onClick}
    >
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-foreground line-clamp-2">
          {paper.title}
        </h4>

        {paper.authors && (
          <p className="text-xs text-muted-foreground line-clamp-1">
            {paper.authors}
          </p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          {paper.year && (
            <span className="text-xs text-muted-foreground">{paper.year}</span>
          )}
          {paper.venue && (
            <>
              {paper.year && <span className="text-xs text-muted-foreground">•</span>}
              <span className="text-xs text-muted-foreground line-clamp-1">
                {paper.venue}
              </span>
            </>
          )}
        </div>

        {paper.tags && paper.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {paper.tags.slice(0, 2).map((pt: any) => (
              <Badge key={pt.tag.id} variant="outline" className="text-xs">
                {pt.tag.name}
              </Badge>
            ))}
            {paper.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{paper.tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        {paper.url && (
          <div className="flex items-center gap-1 text-xs text-primary">
            <ExternalLink className="h-3 w-3" />
            <span>PDF</span>
          </div>
        )}
      </div>
    </div>
  )
}
