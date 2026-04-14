'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { useCreatePaper, useUpdatePaper } from '@/hooks/use-papers'
import { createPaperSchema, type CreatePaperInput } from '@/lib/validations/paper'
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
import { Button } from '@/components/ui/button'

interface PaperFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  paper?: any
}

export function PaperFormDialog({
  open,
  onOpenChange,
  paper,
}: PaperFormDialogProps) {
  const isEditing = !!paper
  const createPaper = useCreatePaper()
  const updatePaper = useUpdatePaper(paper?.id || '')

  const form = useForm<CreatePaperInput>({
    resolver: zodResolver(createPaperSchema),
    defaultValues: {
      title: '',
      authors: '',
      year: undefined,
      venue: '',
      url: '',
      status: 'PLANNED',
      tags: [],
    },
  })

  useEffect(() => {
    if (paper) {
      form.reset({
        title: paper.title || '',
        authors: paper.authors || '',
        year: paper.year || undefined,
        venue: paper.venue || '',
        url: paper.url || '',
        status: paper.status || 'PLANNED',
        tags: paper.tags?.map((pt: any) => pt.tag.name) || [],
      })
    } else {
      form.reset({
        title: '',
        authors: '',
        year: undefined,
        venue: '',
        url: '',
        status: 'PLANNED',
        tags: [],
      })
    }
  }, [paper, form])

  const onSubmit = async (data: CreatePaperInput) => {
    try {
      if (isEditing) {
        await updatePaper.mutateAsync(data)
        toast.success('Paper updated successfully')
      } else {
        await createPaper.mutateAsync(data)
        toast.success('Paper added successfully')
      }
      onOpenChange(false)
      form.reset()
    } catch (error) {
      toast.error(isEditing ? 'Failed to update paper' : 'Failed to add paper')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Paper' : 'Add Paper'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update paper details.'
              : 'Add a new ML paper to track your reading journey.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Attention Is All You Need"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="authors"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Authors</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Vaswani et al."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Year</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="2017"
                        {...field}
                        value={field.value || ''}
                        onChange={(e) => {
                          const value = e.target.value
                          field.onChange(value ? parseInt(value, 10) : undefined)
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="venue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Venue</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="NeurIPS, ICML, arXiv, etc."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PLANNED">Planned</SelectItem>
                        <SelectItem value="READING">Reading</SelectItem>
                        <SelectItem value="READ">Read</SelectItem>
                        <SelectItem value="IMPLEMENTED">Implemented</SelectItem>
                        <SelectItem value="REVISITED">Revisited</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://arxiv.org/abs/..."
                      {...field}
                    />
                  </FormControl>
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
                      placeholder="Enter tags separated by commas (e.g., transformers, NLP, attention)"
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
                disabled={createPaper.isPending || updatePaper.isPending}
              >
                {createPaper.isPending || updatePaper.isPending
                  ? 'Saving...'
                  : isEditing
                  ? 'Update Paper'
                  : 'Add Paper'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
