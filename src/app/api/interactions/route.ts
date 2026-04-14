import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createInteractionSchema } from '@/lib/validations/interaction'
import { requireSession } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession()
    const searchParams = request.nextUrl.searchParams
    const personId = searchParams.get('personId')
    const type = searchParams.get('type')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = { userId: session.user.id }

    if (personId) {
      where.personId = personId
    }

    if (type) {
      where.type = type
    }

    if (search) {
      where.OR = [
        { summary: { contains: search } },
        { keyInsights: { contains: search } },
        { advice: { contains: search } },
        { nextSteps: { contains: search } },
        { person: { name: { contains: search } } },
      ]
    }

    const interactions = await prisma.interaction.findMany({
      where,
      include: {
        person: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(interactions)
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching interactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch interactions' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession()
    const body = await request.json()
    const validated = createInteractionSchema.parse(body)

    const interaction = await prisma.interaction.create({
      data: {
        ...validated,
        userId: session.user.id,
        date: new Date(validated.date),
      },
      include: {
        person: {
          select: {
            id: true,
            name: true,
            company: true,
          },
        },
      },
    })

    return NextResponse.json(interaction, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error creating interaction:', error)
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create interaction' },
      { status: 500 }
    )
  }
}
