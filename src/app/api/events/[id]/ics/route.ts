import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createEvent, DateArray } from 'ics'
import { requireSession } from '@/lib/auth-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession()
    const { id } = await params

    const event = await prisma.event.findFirst({
      where: { id, userId: session.user.id },
      include: {
        attendees: {
          include: {
            person: {
              select: { name: true, company: true },
            },
          },
        },
      },
    })

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const eventDate = new Date(event.dateTime)
    const start: DateArray = [
      eventDate.getFullYear(),
      eventDate.getMonth() + 1,
      eventDate.getDate(),
      eventDate.getHours(),
      eventDate.getMinutes(),
    ]

    // Build description with attendees and notes
    let description = ''
    if (event.host) {
      description += `Host: ${event.host}\n\n`
    }
    if (event.attendees.length > 0) {
      description += 'Attendees:\n'
      event.attendees.forEach((a) => {
        description += `- ${a.person.name}`
        if (a.person.company) description += ` (${a.person.company})`
        description += '\n'
      })
      description += '\n'
    }
    if (event.notes) {
      description += `Notes:\n${event.notes}`
    }

    const { error, value } = createEvent({
      start,
      duration: { hours: 1 },
      title: event.title,
      description: description.trim(),
      location: event.location || undefined,
      url: event.link || undefined,
      status: event.rsvpStatus === 'GOING' || event.rsvpStatus === 'WENT' ? 'CONFIRMED' : 'TENTATIVE',
      organizer: event.host ? { name: event.host } : undefined,
      productId: 'orbit/ics',
    })

    if (error) {
      console.error('ICS generation error:', error)
      return NextResponse.json({ error: 'Failed to generate ICS' }, { status: 500 })
    }

    const filename = `${event.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.ics`

    const headers = new Headers()
    headers.set('Content-Type', 'text/calendar; charset=utf-8')
    headers.set('Content-Disposition', `attachment; filename="${filename}"`)

    return new NextResponse(value, { headers })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error exporting event to ICS:', error)
    return NextResponse.json(
      { error: 'Failed to export event' },
      { status: 500 }
    )
  }
}
