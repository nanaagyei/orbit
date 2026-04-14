import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/auth-utils'

interface GraphNode {
  id: string
  label: string
  data: {
    name: string
    company: string | null
    headline: string | null
    stage: string
    tags: string[]
    interactionCount: number
    lastInteraction: string | null
  }
}

interface GraphEdge {
  id: string
  source: string
  target: string
  label: string
  data: {
    type: 'event' | 'company' | 'tag' | 'paper'
    context: string
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession()
    const searchParams = request.nextUrl.searchParams
    const stage = searchParams.get('stage')
    const tag = searchParams.get('tag')
    const daysBack = parseInt(searchParams.get('daysBack') || '365', 10)

    const dateFilter = new Date()
    dateFilter.setDate(dateFilter.getDate() - daysBack)

    // Fetch all people with their relationships
    const people = await prisma.person.findMany({
      where: {
        userId: session.user.id,
        ...(stage && { stage: stage as any }),
        ...(tag && { tags: { some: { tag: { name: tag, userId: session.user.id } } } }),
      },
      include: {
        tags: { include: { tag: true } },
        interactions: {
          orderBy: { date: 'desc' },
          take: 1,
        },
        events: {
          include: { event: true },
          where: {
            event: {
              dateTime: { gte: dateFilter },
            },
          },
        },
        papers: {
          include: { paper: true },
        },
        _count: {
          select: { interactions: true },
        },
      },
    })

    // Build nodes
    const nodes: GraphNode[] = people.map((person) => ({
      id: person.id,
      label: person.name,
      data: {
        name: person.name,
        company: person.company,
        headline: person.headline,
        stage: person.stage,
        tags: person.tags.map((pt) => pt.tag.name),
        interactionCount: person._count.interactions,
        lastInteraction: person.interactions[0]?.date?.toISOString() || null,
      },
    }))

    // Build edges based on shared connections
    const edges: GraphEdge[] = []
    const edgeSet = new Set<string>()

    // Helper to add edge without duplicates
    const addEdge = (
      source: string,
      target: string,
      type: GraphEdge['data']['type'],
      context: string
    ) => {
      const edgeKey = [source, target].sort().join('-') + '-' + type
      if (!edgeSet.has(edgeKey) && source !== target) {
        edgeSet.add(edgeKey)
        edges.push({
          id: edgeKey,
          source,
          target,
          label: type,
          data: { type, context },
        })
      }
    }

    // Find shared events
    const eventAttendees = new Map<string, string[]>()
    people.forEach((person) => {
      person.events.forEach((ea) => {
        const eventId = ea.event.id
        if (!eventAttendees.has(eventId)) {
          eventAttendees.set(eventId, [])
        }
        eventAttendees.get(eventId)!.push(person.id)
      })
    })

    eventAttendees.forEach((attendees, eventId) => {
      for (let i = 0; i < attendees.length; i++) {
        for (let j = i + 1; j < attendees.length; j++) {
          const event = people
            .find((p) => p.id === attendees[i])
            ?.events.find((e) => e.event.id === eventId)?.event
          addEdge(attendees[i], attendees[j], 'event', event?.title || 'Event')
        }
      }
    })

    // Find shared companies
    const companyPeople = new Map<string, string[]>()
    people.forEach((person) => {
      if (person.company) {
        const company = person.company.toLowerCase().trim()
        if (!companyPeople.has(company)) {
          companyPeople.set(company, [])
        }
        companyPeople.get(company)!.push(person.id)
      }
    })

    companyPeople.forEach((peopleIds, company) => {
      for (let i = 0; i < peopleIds.length; i++) {
        for (let j = i + 1; j < peopleIds.length; j++) {
          addEdge(peopleIds[i], peopleIds[j], 'company', company)
        }
      }
    })

    // Find shared tags
    const tagPeople = new Map<string, string[]>()
    people.forEach((person) => {
      person.tags.forEach((pt) => {
        const tagName = pt.tag.name
        if (!tagPeople.has(tagName)) {
          tagPeople.set(tagName, [])
        }
        tagPeople.get(tagName)!.push(person.id)
      })
    })

    tagPeople.forEach((peopleIds, tagName) => {
      // Only connect if there are 2-5 people with the tag (avoid too many edges)
      if (peopleIds.length >= 2 && peopleIds.length <= 5) {
        for (let i = 0; i < peopleIds.length; i++) {
          for (let j = i + 1; j < peopleIds.length; j++) {
            addEdge(peopleIds[i], peopleIds[j], 'tag', tagName)
          }
        }
      }
    })

    // Find shared paper discussions
    const paperPeople = new Map<string, string[]>()
    people.forEach((person) => {
      person.papers.forEach((pp) => {
        const paperId = pp.paper.id
        if (!paperPeople.has(paperId)) {
          paperPeople.set(paperId, [])
        }
        paperPeople.get(paperId)!.push(person.id)
      })
    })

    paperPeople.forEach((peopleIds, paperId) => {
      for (let i = 0; i < peopleIds.length; i++) {
        for (let j = i + 1; j < peopleIds.length; j++) {
          const paper = people
            .find((p) => p.id === peopleIds[i])
            ?.papers.find((pp) => pp.paper.id === paperId)?.paper
          addEdge(peopleIds[i], peopleIds[j], 'paper', paper?.title || 'Paper')
        }
      }
    })

    return NextResponse.json({
      nodes,
      edges,
      stats: {
        totalPeople: nodes.length,
        totalConnections: edges.length,
        connectionTypes: {
          event: edges.filter((e) => e.data.type === 'event').length,
          company: edges.filter((e) => e.data.type === 'company').length,
          tag: edges.filter((e) => e.data.type === 'tag').length,
          paper: edges.filter((e) => e.data.type === 'paper').length,
        },
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error building relationship graph:', error)
    return NextResponse.json(
      { error: 'Failed to build relationship graph' },
      { status: 500 }
    )
  }
}
