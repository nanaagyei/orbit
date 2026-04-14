'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useCreatePerson, useUpdatePerson } from '@/hooks/use-people'
import { createPersonSchema, type CreatePersonInput } from '@/lib/validations/person'
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

interface PersonFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  person?: any
}

export function PersonFormDialog({
  open,
  onOpenChange,
  person,
}: PersonFormDialogProps) {
  const isEditing = !!person
  const createPerson = useCreatePerson()
  const updatePerson = useUpdatePerson(person?.id || '')

  const form = useForm<CreatePersonInput>({
    resolver: zodResolver(createPersonSchema),
    defaultValues: {
      name: '',
      headline: '',
      company: '',
      location: '',
      linkedinUrl: '',
      stage: 'NEW',
      notes: '',
      tags: [],
    },
  })

  useEffect(() => {
    if (person) {
      form.reset({
        name: person.name || '',
        headline: person.headline || '',
        company: person.company || '',
        location: person.location || '',
        linkedinUrl: person.linkedinUrl || '',
        stage: person.stage || 'NEW',
        notes: person.notes || '',
        tags: person.tags?.map((pt: any) => pt.tag.name) || [],
      })
    } else {
      form.reset({
        name: '',
        headline: '',
        company: '',
        location: '',
        linkedinUrl: '',
        stage: 'NEW',
        notes: '',
        tags: [],
      })
    }
  }, [person, form])

  const onSubmit = async (data: CreatePersonInput) => {
    try {
      if (isEditing) {
        await updatePerson.mutateAsync(data)
        toast.success('Person updated successfully')
      } else {
        await createPerson.mutateAsync(data)
        toast.success('Person added successfully')
      }
      onOpenChange(false)
      form.reset()
    } catch (error) {
      toast.error(isEditing ? 'Failed to update person' : 'Failed to add person')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Person' : 'Add Person'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update person details and relationship information.'
              : 'Add a new person to your ML network.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="headline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Headline</FormLabel>
                    <FormControl>
                      <Input placeholder="ML Research Scientist" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="OpenAI" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="San Francisco, CA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="linkedinUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://linkedin.com/in/..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="stage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship Stage</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a stage" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="NEW">New</SelectItem>
                      <SelectItem value="CONNECTED">Connected</SelectItem>
                      <SelectItem value="CHATTED">Chatted</SelectItem>
                      <SelectItem value="ONGOING">Ongoing</SelectItem>
                      <SelectItem value="INNER_CIRCLE">Inner Circle</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter tags separated by commas (e.g., researcher, NLP, transformers)"
                      value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                      onChange={(e) => {
                        const tags = e.target.value
                          .split(',')
                          .map((tag) => tag.trim())
                          .filter((tag) => tag.length > 0)
                        field.onChange(tags)
                      }}
                    />
                  </FormControl>
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
                      placeholder="Additional notes about this person..."
                      className="min-h-[100px]"
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
                disabled={createPerson.isPending || updatePerson.isPending}
              >
                {createPerson.isPending || updatePerson.isPending
                  ? 'Saving...'
                  : isEditing
                  ? 'Update Person'
                  : 'Add Person'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
