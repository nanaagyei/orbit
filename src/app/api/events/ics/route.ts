import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createEvents, DateArray, EventAttributes } from 'ics'
import { requireSession } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession()
    const searchParams = request.nextUrl.searchParams
    const rsvpStatus = searchParams.get('rsvpStatus')
    const upcoming = searchParams.get('upcoming') === 'true'

    const events = await prisma.event.findMany({
      where: {
        userId: session.user.id,
        ...(rsvpStatus && { rsvpStatus: rsvpStatus as any }),
        ...(upcoming && { dateTime: { gte: new Date() } }),
      },
      include: {
        attendees: {
          include: {
            person: {
              select: { name: true, company: true },
            },
          },
        },
      },
      orderBy: { dateTime: 'asc' },
    })

    if (events.length === 0) {
      return NextResponse.json(
        { error: 'No events to export' },
        { status: 404 }
      )
    }

    const icsEvents: EventAttributes[] = events.map((event) => {
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

      return {
        uid: event.id,
        start,
        duration: { hours: 1 },
        title: event.title,
        description: description.trim() || undefined,
        location: event.location || undefined,
        url: event.link || undefined,
        status:
          event.rsvpStatus === 'GOING' || event.rsvpStatus === 'WENT'
            ? 'CONFIRMED'
            : 'TENTATIVE',
        organizer: event.host ? { name: event.host } : undefined,
      }
    })

    const { error, value } = createEvents(icsEvents, {
      productId: 'orbit/ics',
    })

    if (error) {
      console.error('ICS generation error:', error)
      return NextResponse.json(
        { error: 'Failed to generate ICS' },
        { status: 500 }
      )
    }

    const filename = `orbit-events-${new Date().toISOString().split('T')[0]}.ics`

    const headers = new Headers()
    headers.set('Content-Type', 'text/calendar; charset=utf-8')
    headers.set('Content-Disposition', `attachment; filename="${filename}"`)

    return new NextResponse(value, { headers })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error exporting events to ICS:', error)
    return NextResponse.json(
      { error: 'Failed to export events' },
      { status: 500 }
    )
  }
}
