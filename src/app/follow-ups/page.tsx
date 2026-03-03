'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDistanceToNow, format, isPast, isToday } from 'date-fns'
import { Plus, CheckCircle2, Edit, Trash2, FileText } from 'lucide-react'
import { useFollowUps, useMarkFollowUpDone, useDeleteFollowUp } from '@/hooks/use-followups'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { FollowUpFormDialog } from '@/components/follow-ups/follow-up-form-dialog'

export default function FollowUpsPage() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState<string>('OPEN')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingFollowUp, setEditingFollowUp] = useState<any>(null)

  const { data: followUps, isLoading } = useFollowUps({
    status: statusFilter === 'ALL' ? undefined : statusFilter,
  })
  const markFollowUpDone = useMarkFollowUpDone()
  const deleteFollowUp = useDeleteFollowUp()

  const handleMarkDone = async (followUpId: string) => {
    try {
      await markFollowUpDone.mutateAsync(followUpId)
      toast.success('Follow-up marked as done')
    } catch (error) {
      toast.error('Failed to mark follow-up as done')
    }
  }

  const handleEdit = (followUp: any) => {
    setEditingFollowUp(followUp)
    setDialogOpen(true)
  }

  const handleDelete = async (followUpId: string) => {
    if (!confirm('Are you sure you want to delete this follow-up?')) return

    try {
      await deleteFollowUp.mutateAsync(followUpId)
      toast.success('Follow-up deleted')
    } catch (error) {
      toast.error('Failed to delete follow-up')
    }
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setEditingFollowUp(null)
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

  const getDueDateStatus = (dueDate: Date) => {
    if (isPast(dueDate) && !isToday(dueDate)) {
      return { text: 'Overdue', color: 'text-destructive' }
    }
    if (isToday(dueDate)) {
      return { text: 'Due Today', color: 'text-destructive' }
    }
    return { text: `Due ${format(dueDate, 'MMM d')}`, color: 'text-muted-foreground' }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading follow-ups...</p>
      </div>
    )
  }

  // Sort follow-ups by due date (earliest first)
  const sortedFollowUps = followUps
    ? [...followUps].sort(
        (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      )
    : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-foreground">Follow-Ups</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and manage follow-up reminders
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Follow-Up
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="DONE">Done</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Follow-ups List */}
      {sortedFollowUps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border rounded-lg">
          <FileText className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground text-center">
            {statusFilter === 'OPEN'
              ? 'No open follow-ups. Create one to stay on top of your relationships.'
              : statusFilter === 'DONE'
              ? 'No completed follow-ups yet.'
              : 'No follow-ups yet. Add your first one to get started.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedFollowUps.map((followUp: any) => {
            const dueDate = new Date(followUp.dueDate)
            const dueDateStatus = getDueDateStatus(dueDate)

            return (
              <div
                key={followUp.id}
                className="border rounded-lg p-4 space-y-3 hover:bg-muted/30 transition-colors"
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {followUp.person ? (
                        <button
                          onClick={() => router.push(`/people/${followUp.person.id}`)}
                          className="text-base font-medium text-foreground hover:underline"
                        >
                          {followUp.person.name}
                        </button>
                      ) : (
                        <span className="text-base font-medium text-muted-foreground">
                          General Follow-Up
                        </span>
                      )}
                      <Badge className={getFollowUpTypeColor(followUp.type)}>
                        {formatFollowUpType(followUp.type)}
                      </Badge>
                      {followUp.status === 'DONE' && (
                        <Badge variant="outline" className="bg-green-50">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Done
                        </Badge>
                      )}
                    </div>

                    {followUp.person?.company && (
                      <p className="text-sm text-muted-foreground">
                        {followUp.person.company}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-sm">
                      <span className={dueDateStatus.color}>
                        {dueDateStatus.text}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">
                        {formatDistanceToNow(dueDate, { addSuffix: true })}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {followUp.status === 'OPEN' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMarkDone(followUp.id)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Done
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(followUp)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(followUp.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Notes */}
                {followUp.notes && (
                  <p className="text-sm text-foreground">{followUp.notes}</p>
                )}

                {/* Context */}
                {followUp.context && (
                  <div className="p-3 bg-muted/50 rounded-md">
                    <p className="text-xs font-medium text-foreground mb-1">
                      Context
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {followUp.context}
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <FollowUpFormDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        followUp={editingFollowUp}
      />
    </div>
  )
}
