import { z } from 'zod'

export const paperStatusEnum = z.enum([
  'PLANNED',
  'READING',
  'READ',
  'IMPLEMENTED',
  'REVISITED',
])

export const createPaperSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  authors: z.string().optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  venue: z.string().optional(),
  url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  status: paperStatusEnum,
  tags: z.array(z.string()).optional(),
})

export const updatePaperSchema = createPaperSchema.partial()

export const updatePaperReflectionSchema = z.object({
  whyRead: z.string().optional(),
  coreIdea: z.string().optional(),
  keyConcepts: z.string().optional(),
  implementationNotes: z.string().optional(),
  surprises: z.string().optional(),
  thinkingShift: z.string().optional(),
  followUps: z.string().optional(),
})

export type CreatePaperInput = z.infer<typeof createPaperSchema>
export type UpdatePaperInput = z.infer<typeof updatePaperSchema>
export type UpdatePaperReflectionInput = z.infer<typeof updatePaperReflectionSchema>
