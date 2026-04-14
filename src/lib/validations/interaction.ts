import { z } from 'zod'

export const interactionTypeEnum = z.enum([
  'COFFEE_CHAT',
  'MEETUP',
  'DM',
  'EMAIL',
  'CALL',
])

export const createInteractionSchema = z.object({
  personId: z.string().cuid('Invalid person ID'),
  type: interactionTypeEnum,
  date: z.string().datetime().or(z.date()),
  summary: z.string().optional(),
  keyInsights: z.string().optional(),
  advice: z.string().optional(),
  nextSteps: z.string().optional(),
})

export const updateInteractionSchema = createInteractionSchema.partial().omit({ personId: true })

export type CreateInteractionInput = z.infer<typeof createInteractionSchema>
export type UpdateInteractionInput = z.infer<typeof updateInteractionSchema>
