'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addDays, addWeeks, addMonths, format } from 'date-fns'
import { toast } from 'sonner'
import { useCreateFollowUp, useUpdateFollowUp } from '@/hooks/use-followups'
import { usePeople } from '@/hooks/use-people'
import {
  createFollowUpSchema,
  type CreateFollowUpInput,
} from '@/lib/validations/followup'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface FollowUpFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  followUp?: any
  preselectedPersonId?: string
}

export function FollowUpFormDialog({
  open,
  onOpenChange,
  followUp,
  preselectedPersonId,
}: FollowUpFormDialogProps) {
  const isEditing = !!followUp
  const createFollowUp = useCreateFollowUp()
  const updateFollowUp = useUpdateFollowUp(followUp?.id || '')
  const { data: people } = usePeople()
  const [searchTerm, setSearchTerm] = useState('')

  const form = useForm<CreateFollowUpInput>({
    resolver: zodResolver(createFollowUpSchema),
    defaultValues: {
      personId: preselectedPersonId || undefined,
      type: 'CHECK_IN',
      dueDate: addWeeks(new Date(), 2).toISOString().split('T')[0],
      notes: '',
      context: '',
    },
  })

  useEffect(() => {
    if (followUp) {
      form.reset({
        personId: followUp.personId || undefined,
        type: followUp.type,
        dueDate: new Date(followUp.dueDate).toISOString().split('T')[0],
        notes: followUp.notes || '',
        context: followUp.context || '',
      })
    } else if (preselectedPersonId) {
      form.setValue('personId', preselectedPersonId)
    } else {
      form.reset({
        personId: undefined,
        type: 'CHECK_IN',
        dueDate: addWeeks(new Date(), 2).toISOString().split('T')[0],
        notes: '',
        context: '',
      })
    }
  }, [followUp, preselectedPersonId, form])

  const onSubmit = async (data: CreateFollowUpInput) => {
    try {
      // Convert date string to ISO datetime string
      const dateTime = new Date(data.dueDate).toISOString()

      if (isEditing) {
        await updateFollowUp.mutateAsync({
          ...data,
          dueDate: dateTime,
        })
        toast.success('Follow-up updated successfully')
      } else {
        await createFollowUp.mutateAsync({
          ...data,
          dueDate: dateTime,
        })
        toast.success('Follow-up created successfully')
      }
      onOpenChange(false)
      form.reset()
    } catch (error) {
      toast.error(isEditing ? 'Failed to update follow-up' : 'Failed to create follow-up')
    }
  }

  const formatFollowUpType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ')
  }

  const setDatePreset = (preset: 'two_weeks' | 'one_month' | 'three_months') => {
    let newDate: Date
    switch (preset) {
      case 'two_weeks':
        newDate = addWeeks(new Date(), 2)
        break
      case 'one_month':
        newDate = addMonths(new Date(), 1)
        break
      case 'three_months':
        newDate = addMonths(new Date(), 3)
        break
    }
    form.setValue('dueDate', newDate.toISOString().split('T')[0])
  }

  // Filter people by search term
  const filteredPeople = people
    ? people.filter((person: any) =>
        person.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Follow-Up' : 'Add Follow-Up'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update your follow-up reminder.'
              : 'Create a reminder to follow up with someone.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="personId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Person (Optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a person (or leave blank for general follow-up)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <div className="p-2">
                        <Input
                          placeholder="Search people..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="mb-2"
                        />
                      </div>
                      <SelectItem value="none">No one (General)</SelectItem>
                      {filteredPeople.length > 0 ? (
                        filteredPeople.map((person: any) => (
                          <SelectItem key={person.id} value={person.id}>
                            {person.name}
                            {person.company && ` • ${person.company}`}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="p-2 text-sm text-muted-foreground">
                          No people found
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select follow-up type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="THANK_YOU">
                        {formatFollowUpType('THANK_YOU')}
                      </SelectItem>
                      <SelectItem value="NUDGE">
                        {formatFollowUpType('NUDGE')}
                      </SelectItem>
                      <SelectItem value="VALUE_RECONNECT">
                        {formatFollowUpType('VALUE_RECONNECT')}
                      </SelectItem>
                      <SelectItem value="CHECK_IN">
                        {formatFollowUpType('CHECK_IN')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date *</FormLabel>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDatePreset('two_weeks')}
                      >
                        In 2 weeks
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDatePreset('one_month')}
                      >
                        In 1 month
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDatePreset('three_months')}
                      >
                        In 3 months
                      </Button>
                    </div>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={typeof field.value === 'string' ? field.value : field.value?.toISOString?.().split('T')[0] ?? ''}
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What should you follow up about?"
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="context"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Context</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Additional context or background for this follow-up..."
                      className="min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createFollowUp.isPending || updateFollowUp.isPending}
              >
                {createFollowUp.isPending || updateFollowUp.isPending
                  ? 'Saving...'
                  : isEditing
                  ? 'Update Follow-Up'
                  : 'Create Follow-Up'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
