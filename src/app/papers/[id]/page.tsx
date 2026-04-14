'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, ExternalLink, Edit } from 'lucide-react'
import { usePaper, useUpdatePaperReflection } from '@/hooks/use-papers'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PaperReflection } from '@/components/papers/paper-reflection'
import { PaperFormDialog } from '@/components/papers/paper-form-dialog'
import { PaperPeopleLinks } from '@/components/papers/paper-people-links'

export default function PaperDetailPage() {
  const params = useParams()
  const router = useRouter()
  const paperId = params.id as string
  const { data: paper, isLoading } = usePaper(paperId)
  const [editDialogOpen, setEditDialogOpen] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return 'bg-gray-100 text-gray-800'
      case 'READING':
        return 'bg-blue-100 text-blue-800'
      case 'READ':
        return 'bg-green-100 text-green-800'
      case 'IMPLEMENTED':
        return 'bg-purple-100 text-purple-800'
      case 'REVISITED':
        return 'bg-amber-100 text-amber-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatStatus = (status: string) => {
    return status.charAt(0) + status.slice(1).toLowerCase()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading paper...</p>
      </div>
    )
  }

  if (!paper) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-muted-foreground">Paper not found</p>
        <Button onClick={() => router.push('/papers')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Papers
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
        onClick={() => router.push('/papers')}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Papers
      </Button>

      {/* Main layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Sidebar - Metadata */}
        <div className="lg:col-span-1 space-y-4">
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="text-sm font-medium text-foreground">Metadata</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditDialogOpen(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>

            {/* Title */}
            <div>
              <p className="text-xs text-muted-foreground mb-1">Title</p>
              <h2 className="text-base font-medium text-foreground">
                {paper.title}
              </h2>
            </div>

            {/* Authors */}
            {paper.authors && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Authors</p>
                <p className="text-sm text-foreground">{paper.authors}</p>
              </div>
            )}

            {/* Year / Venue */}
            <div className="grid grid-cols-2 gap-4">
              {paper.year && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Year</p>
                  <p className="text-sm text-foreground">{paper.year}</p>
                </div>
              )}
              {paper.venue && (
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Venue</p>
                  <p className="text-sm text-foreground">{paper.venue}</p>
                </div>
              )}
            </div>

            {/* Status */}
            <div>
              <p className="text-xs text-muted-foreground mb-2">Status</p>
              <Badge className={getStatusColor(paper.status)}>
                {formatStatus(paper.status)}
              </Badge>
            </div>

            {/* Tags */}
            {paper.tags && paper.tags.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Tags</p>
                <div className="flex flex-wrap gap-1">
                  {paper.tags.map((pt: any) => (
                    <Badge key={pt.tag.id} variant="outline" className="text-xs">
                      {pt.tag.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* External Link */}
            {paper.url && (
              <div className="pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => window.open(paper.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View PDF
                </Button>
              </div>
            )}
          </div>

          {/* People Links */}
          <div className="border rounded-lg p-4">
            <h3 className="text-sm font-medium text-foreground mb-4">People</h3>
            <PaperPeopleLinks
              paperId={paperId}
              linkedPeople={paper.people || []}
            />
          </div>
        </div>

        {/* Main Content - Structured Reflection */}
        <div className="lg:col-span-3">
          <PaperReflection paper={paper} />
        </div>
      </div>

      <PaperFormDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        paper={paper}
      />
    </div>
  )
}
