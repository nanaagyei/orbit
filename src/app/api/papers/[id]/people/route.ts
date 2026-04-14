import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/auth-utils'

// GET - List people linked to a paper
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession()
    const { id } = await params

    const paper = await prisma.paper.findFirst({
      where: { id, userId: session.user.id },
    })
    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 })
    }

    const paperPeople = await prisma.paperPerson.findMany({
      where: { paperId: id },
      include: {
        person: {
          select: {
            id: true,
            name: true,
            company: true,
            headline: true,
          },
        },
      },
    })

    return NextResponse.json(paperPeople)
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching paper people:', error)
    return NextResponse.json(
      { error: 'Failed to fetch paper people' },
      { status: 500 }
    )
  }
}

// POST - Link a person to a paper
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession()
    const { id: paperId } = await params

    const paper = await prisma.paper.findFirst({
      where: { id: paperId, userId: session.user.id },
    })
    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 })
    }
    const body = await request.json()
    const { personId, context } = body

    if (!personId) {
      return NextResponse.json(
        { error: 'personId is required' },
        { status: 400 }
      )
    }

    if (!context || !['recommended_by', 'discussed_with'].includes(context)) {
      return NextResponse.json(
        { error: 'context must be "recommended_by" or "discussed_with"' },
        { status: 400 }
      )
    }

    // Check if link already exists
    const existing = await prisma.paperPerson.findUnique({
      where: {
        paperId_personId: {
          paperId,
          personId,
        },
      },
    })

    if (existing) {
      // Update context if different
      if (existing.context !== context) {
        const updated = await prisma.paperPerson.update({
          where: {
            paperId_personId: {
              paperId,
              personId,
            },
          },
          data: { context },
          include: {
            person: {
              select: {
                id: true,
                name: true,
                company: true,
                headline: true,
              },
            },
          },
        })
        return NextResponse.json(updated)
      }
      return NextResponse.json(
        { error: 'Link already exists' },
        { status: 409 }
      )
    }

    const paperPerson = await prisma.paperPerson.create({
      data: {
        paperId,
        personId,
        context,
      },
      include: {
        person: {
          select: {
            id: true,
            name: true,
            company: true,
            headline: true,
          },
        },
      },
    })

    return NextResponse.json(paperPerson, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error linking person to paper:', error)
    return NextResponse.json(
      { error: 'Failed to link person to paper' },
      { status: 500 }
    )
  }
}

// DELETE - Unlink a person from a paper
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession()
    const { id: paperId } = await params

    const paper = await prisma.paper.findFirst({
      where: { id: paperId, userId: session.user.id },
    })
    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 })
    }
    const { searchParams } = new URL(request.url)
    const personId = searchParams.get('personId')

    if (!personId) {
      return NextResponse.json(
        { error: 'personId query parameter is required' },
        { status: 400 }
      )
    }

    await prisma.paperPerson.delete({
      where: {
        paperId_personId: {
          paperId,
          personId,
        },
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error unlinking person from paper:', error)
    return NextResponse.json(
      { error: 'Failed to unlink person from paper' },
      { status: 500 }
    )
  }
}
