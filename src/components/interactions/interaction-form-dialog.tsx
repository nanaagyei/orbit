'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useCreateInteraction, useUpdateInteraction } from '@/hooks/use-interactions'
import { usePeople } from '@/hooks/use-people'
import {
  createInteractionSchema,
  type CreateInteractionInput,
} from '@/lib/validations/interaction'
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

interface InteractionFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  personId?: string
  personName?: string
  interaction?: any
}

export function InteractionFormDialog({
  open,
  onOpenChange,
  personId,
  personName,
  interaction,
}: InteractionFormDialogProps) {
  const isEditing = !!interaction
  const createInteraction = useCreateInteraction()
  const updateInteraction = useUpdateInteraction(interaction?.id || '')
  const { data: people } = usePeople()
  const [searchTerm, setSearchTerm] = useState('')

  const form = useForm<CreateInteractionInput>({
    resolver: zodResolver(createInteractionSchema),
    defaultValues: {
      personId: personId || '',
      type: 'COFFEE_CHAT',
      date: new Date().toISOString().split('T')[0],
      summary: '',
      keyInsights: '',
      advice: '',
      nextSteps: '',
    },
  })

  useEffect(() => {
    if (interaction) {
      form.reset({
        personId: interaction.personId,
        type: interaction.type,
        date: new Date(interaction.date).toISOString().split('T')[0],
        summary: interaction.summary || '',
        keyInsights: interaction.keyInsights || '',
        advice: interaction.advice || '',
        nextSteps: interaction.nextSteps || '',
      })
    } else if (personId) {
      form.setValue('personId', personId)
    } else {
      form.reset({
        personId: '',
        type: 'COFFEE_CHAT',
        date: new Date().toISOString().split('T')[0],
        summary: '',
        keyInsights: '',
        advice: '',
        nextSteps: '',
      })
    }
  }, [interaction, personId, form])

  const onSubmit = async (data: CreateInteractionInput) => {
    try {
      const dateTime = new Date(data.date).toISOString()

      if (isEditing) {
        await updateInteraction.mutateAsync({
          type: data.type,
          date: dateTime,
          summary: data.summary,
          keyInsights: data.keyInsights,
          advice: data.advice,
          nextSteps: data.nextSteps,
        })
        toast.success('Interaction updated successfully')
      } else {
        await createInteraction.mutateAsync({
          ...data,
          date: dateTime,
        })
        toast.success('Interaction logged successfully')
      }
      onOpenChange(false)
      form.reset()
    } catch (error) {
      toast.error(isEditing ? 'Failed to update interaction' : 'Failed to log interaction')
    }
  }

  const formatInteractionType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ')
  }

  const filteredPeople = people
    ? people.filter((person: any) =>
        person.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : []

  const showPersonSelector = !personId && !isEditing

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Interaction' : 'Log Interaction'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the details of this interaction.'
              : personName
              ? `Record your interaction with ${personName}.`
              : 'Record a conversation, meeting, or message exchange.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {showPersonSelector && (
              <FormField
                control={form.control}
                name="personId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Person *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a person" />
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
                        {filteredPeople.length > 0 ? (
                          filteredPeople.map((person: any) => (
                            <SelectItem key={person.id} value={person.id}>
                              {person.name}
                              {person.company && ` @ ${person.company}`}
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
            )}

            <div className="grid grid-cols-2 gap-4">
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
                          <SelectValue placeholder="Select interaction type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="COFFEE_CHAT">
                          {formatInteractionType('COFFEE_CHAT')}
                        </SelectItem>
                        <SelectItem value="MEETUP">
                          {formatInteractionType('MEETUP')}
                        </SelectItem>
                        <SelectItem value="DM">
                          {formatInteractionType('DM')}
                        </SelectItem>
                        <SelectItem value="EMAIL">
                          {formatInteractionType('EMAIL')}
                        </SelectItem>
                        <SelectItem value="CALL">
                          {formatInteractionType('CALL')}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date *</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={typeof field.value === 'string' ? field.value : field.value?.toISOString?.().split('T')[0] ?? ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Summary</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief overview of the interaction..."
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
              name="keyInsights"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key Insights</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What did you learn? What stood out?"
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
              name="advice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Advice Received</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any advice or recommendations they gave you?"
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
              name="nextSteps"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Next Steps</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What should you do as a follow-up?"
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
                disabled={createInteraction.isPending || updateInteraction.isPending}
              >
                {createInteraction.isPending || updateInteraction.isPending
                  ? 'Saving...'
                  : isEditing
                  ? 'Update Interaction'
                  : 'Log Interaction'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
