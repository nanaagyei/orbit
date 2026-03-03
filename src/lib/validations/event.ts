import { z } from 'zod'

export const eventRSVPStatusEnum = z.enum([
  'INTERESTED',
  'GOING',
  'WENT',
  'NOT_GOING',
])

export const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  host: z.string().optional(),
  dateTime: z.string().datetime().or(z.date()),
  location: z.string().optional(),
  link: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  rsvpStatus: eventRSVPStatusEnum,
  notes: z.string().optional(),
  attendees: z.array(z.string().cuid()).optional(), // Array of person IDs
})

export const updateEventSchema = createEventSchema.partial()

export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
