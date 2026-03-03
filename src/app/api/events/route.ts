import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createEventSchema } from '@/lib/validations/event'
import { requireSession } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession()
    const searchParams = request.nextUrl.searchParams
    const rsvpStatus = searchParams.get('rsvpStatus')
    const personId = searchParams.get('personId')

    const events = await prisma.event.findMany({
      where: {
        userId: session.user.id,
        ...(rsvpStatus && rsvpStatus !== 'all' ? { rsvpStatus: rsvpStatus as any } : {}),
        ...(personId ? { attendees: { some: { personId } } } : {}),
      },
      include: {
        attendees: {
          include: {
            person: {
              select: {
                id: true,
                name: true,
                company: true,
              },
            },
          },
        },
        _count: {
          select: { attendees: true },
        },
      },
      orderBy: { dateTime: 'desc' },
    })

    return NextResponse.json(events)
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession()
    const body = await request.json()
    const validated = createEventSchema.parse(body)

    const { attendees, ...eventData } = validated

    const event = await prisma.event.create({
      data: {
        ...eventData,
        dateTime: new Date(eventData.dateTime),
        attendees: attendees
          ? {
              create: attendees.map((personId) => ({
                person: { connect: { id: personId } },
              })),
            }
          : undefined,
      },
      include: {
        attendees: {
          include: {
            person: {
              select: {
                id: true,
                name: true,
                company: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error creating event:', error)
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    )
  }
}
