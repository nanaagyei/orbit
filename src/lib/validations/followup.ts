import { z } from 'zod'

export const followUpTypeEnum = z.enum([
  'THANK_YOU',
  'NUDGE',
  'VALUE_RECONNECT',
  'CHECK_IN',
])

export const followUpStatusEnum = z.enum(['OPEN', 'DONE'])

export const createFollowUpSchema = z.object({
  personId: z.string().cuid('Invalid person ID').optional(),
  dueDate: z.string().datetime().or(z.date()),
  type: followUpTypeEnum,
  notes: z.string().optional(),
  context: z.string().optional(),
})

export const updateFollowUpSchema = z.object({
  personId: z.string().cuid('Invalid person ID').optional(),
  dueDate: z.string().datetime().or(z.date()).optional(),
  type: followUpTypeEnum.optional(),
  status: followUpStatusEnum.optional(),
  notes: z.string().optional(),
  context: z.string().optional(),
})

export type CreateFollowUpInput = z.infer<typeof createFollowUpSchema>
export type UpdateFollowUpInput = z.infer<typeof updateFollowUpSchema>
