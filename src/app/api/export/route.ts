import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession()
    const searchParams = request.nextUrl.searchParams
    const format = searchParams.get('format') || 'json'
    const entity = searchParams.get('entity')

    if (format === 'csv' && entity) {
      return exportCSV(entity, session.user.id)
    }

    // Full JSON backup
    const [people, interactions, followUps, events, papers, tags, positioning] =
      await Promise.all([
        prisma.person.findMany({
          where: { userId: session.user.id },
          include: {
            tags: { include: { tag: true } },
            interactions: true,
            followUps: true,
            events: { include: { event: true } },
            papers: { include: { paper: true } },
          },
        }),
        prisma.interaction.findMany({
          where: { userId: session.user.id },
          include: { person: { select: { id: true, name: true } } },
        }),
        prisma.followUp.findMany({
          where: { userId: session.user.id },
          include: { person: { select: { id: true, name: true } } },
        }),
        prisma.event.findMany({
          where: { userId: session.user.id },
          include: { attendees: { include: { person: true } } },
        }),
        prisma.paper.findMany({
          where: { userId: session.user.id },
          include: {
            tags: { include: { tag: true } },
            people: { include: { person: true } },
          },
        }),
        prisma.tag.findMany({ where: { userId: session.user.id } }),
        prisma.positioning.findMany({ where: { userId: session.user.id } }),
      ])

    const backup = {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      data: {
        people,
        interactions,
        followUps,
        events,
        papers,
        tags,
        positioning,
      },
    }

    const headers = new Headers()
    headers.set('Content-Type', 'application/json')
    headers.set(
      'Content-Disposition',
      `attachment; filename="orbit-backup-${new Date().toISOString().split('T')[0]}.json"`
    )

    return new NextResponse(JSON.stringify(backup, null, 2), { headers })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error exporting data:', error)
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 })
  }
}

async function exportCSV(entity: string) {
  let data: any[] = []
  let headers: string[] = []
  let filename = ''

  switch (entity) {
    case 'people':
      data = await prisma.person.findMany({
        include: { tags: { include: { tag: true } } },
      })
      headers = [
        'id',
        'name',
        'headline',
        'company',
        'location',
        'linkedinUrl',
        'stage',
        'notes',
        'tags',
        'createdAt',
        'updatedAt',
      ]
      filename = 'orbit-people'
      data = data.map((p) => ({
        ...p,
        tags: p.tags.map((t: any) => t.tag.name).join(', '),
      }))
      break

    case 'papers':
      data = await prisma.paper.findMany({
        where: { userId },
        include: { tags: { include: { tag: true } } },
      })
      headers = [
        'id',
        'title',
        'authors',
        'year',
        'venue',
        'url',
        'status',
        'whyRead',
        'coreIdea',
        'keyConcepts',
        'implementationNotes',
        'surprises',
        'thinkingShift',
        'followUps',
        'tags',
        'createdAt',
        'updatedAt',
      ]
      filename = 'orbit-papers'
      data = data.map((p) => ({
        ...p,
        tags: p.tags.map((t: any) => t.tag.name).join(', '),
      }))
      break

    case 'events':
      data = await prisma.event.findMany()
      headers = [
        'id',
        'title',
        'host',
        'dateTime',
        'location',
        'link',
        'rsvpStatus',
        'notes',
        'createdAt',
        'updatedAt',
      ]
      filename = 'orbit-events'
      break

    case 'interactions':
      data = await prisma.interaction.findMany({
        where: { userId },
        include: { person: { select: { name: true } } },
      })
      headers = [
        'id',
        'personId',
        'personName',
        'type',
        'date',
        'summary',
        'keyInsights',
        'advice',
        'nextSteps',
        'createdAt',
        'updatedAt',
      ]
      filename = 'orbit-interactions'
      data = data.map((i) => ({
        ...i,
        personName: i.person.name,
      }))
      break

    case 'followups':
      data = await prisma.followUp.findMany({
        where: { userId },
        include: { person: { select: { name: true } } },
      })
      headers = [
        'id',
        'personId',
        'personName',
        'dueDate',
        'type',
        'status',
        'notes',
        'context',
        'createdAt',
        'updatedAt',
      ]
      filename = 'orbit-followups'
      data = data.map((f) => ({
        ...f,
        personName: f.person?.name || '',
      }))
      break

    default:
      return NextResponse.json(
        { error: 'Invalid entity. Valid options: people, papers, events, interactions, followups' },
        { status: 400 }
      )
  }

  const csvContent = convertToCSV(data, headers)

  const responseHeaders = new Headers()
  responseHeaders.set('Content-Type', 'text/csv')
  responseHeaders.set(
    'Content-Disposition',
    `attachment; filename="${filename}-${new Date().toISOString().split('T')[0]}.csv"`
  )

  return new NextResponse(csvContent, { headers: responseHeaders })
}

function convertToCSV(data: any[], headers: string[]): string {
  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return ''
    const str = String(value)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }

  const headerRow = headers.join(',')
  const rows = data.map((item) =>
    headers.map((header) => escapeCSV(item[header])).join(',')
  )

  return [headerRow, ...rows].join('\n')
}
