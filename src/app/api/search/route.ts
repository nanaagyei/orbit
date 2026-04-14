import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession()
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json({
        people: [],
        papers: [],
        events: [],
        interactions: [],
      })
    }

    const searchTerm = query.toLowerCase()

    // Search people
    const people = await prisma.person.findMany({
      where: {
        userId: session.user.id,
        OR: [
          { name: { contains: searchTerm } },
          { company: { contains: searchTerm } },
          { headline: { contains: searchTerm } },
          { notes: { contains: searchTerm } },
        ],
      },
      select: {
        id: true,
        name: true,
        company: true,
        headline: true,
        stage: true,
      },
      take: 5,
      orderBy: { updatedAt: 'desc' },
    })

    // Search papers
    const papers = await prisma.paper.findMany({
      where: {
        userId: session.user.id,
        OR: [
          { title: { contains: searchTerm } },
          { authors: { contains: searchTerm } },
          { venue: { contains: searchTerm } },
          { whyRead: { contains: searchTerm } },
          { coreIdea: { contains: searchTerm } },
        ],
      },
      select: {
        id: true,
        title: true,
        authors: true,
        status: true,
        year: true,
      },
      take: 5,
      orderBy: { updatedAt: 'desc' },
    })

    // Search events
    const events = await prisma.event.findMany({
      where: {
        userId: session.user.id,
        OR: [
          { title: { contains: searchTerm } },
          { host: { contains: searchTerm } },
          { location: { contains: searchTerm } },
          { notes: { contains: searchTerm } },
        ],
      },
      select: {
        id: true,
        title: true,
        host: true,
        dateTime: true,
        rsvpStatus: true,
      },
      take: 5,
      orderBy: { dateTime: 'desc' },
    })

    // Search interactions
    const interactions = await prisma.interaction.findMany({
      where: {
        userId: session.user.id,
        OR: [
          { summary: { contains: searchTerm } },
          { keyInsights: { contains: searchTerm } },
          { advice: { contains: searchTerm } },
          { nextSteps: { contains: searchTerm } },
          { person: { name: { contains: searchTerm } } },
        ],
      },
      select: {
        id: true,
        type: true,
        date: true,
        summary: true,
        person: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: 5,
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({
      people,
      papers,
      events,
      interactions,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error searching:', error)
    return NextResponse.json(
      { error: 'Failed to search' },
      { status: 500 }
    )
  }
}
