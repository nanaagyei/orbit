import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateInteractionSchema } from '@/lib/validations/interaction'
import { requireSession } from '@/lib/auth-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession()
    const { id } = await params

    const interaction = await prisma.interaction.findFirst({
      where: { id, userId: session.user.id },
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

    if (!interaction) {
      return NextResponse.json(
        { error: 'Interaction not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(interaction)
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching interaction:', error)
    return NextResponse.json(
      { error: 'Failed to fetch interaction' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession()
    const { id } = await params
    const body = await request.json()
    const validated = updateInteractionSchema.parse(body)

    const interaction = await prisma.interaction.update({
      where: { id, userId: session.user.id },
      data: {
        ...validated,
        date: validated.date ? new Date(validated.date) : undefined,
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

    return NextResponse.json(interaction)
  } catch (error) {
    console.error('Error updating interaction:', error)
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update interaction' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.interaction.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error deleting interaction:', error)
    return NextResponse.json(
      { error: 'Failed to delete interaction' },
      { status: 500 }
    )
  }
}
