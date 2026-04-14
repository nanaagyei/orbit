import { z } from 'zod'

export const relationshipStageEnum = z.enum([
  'NEW',
  'CONNECTED',
  'CHATTED',
  'ONGOING',
  'INNER_CIRCLE',
])

export const createPersonSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  headline: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  linkedinUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  stage: relationshipStageEnum,
  notes: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export const updatePersonSchema = createPersonSchema.partial()

export type CreatePersonInput = z.infer<typeof createPersonSchema>
export type UpdatePersonInput = z.infer<typeof updatePersonSchema>
