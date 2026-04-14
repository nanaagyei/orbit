import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateFollowUpSchema } from '@/lib/validations/followup'
import { requireSession } from '@/lib/auth-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession()
    const { id } = await params

    const followUp = await prisma.followUp.findFirst({
      where: { id, userId: session.user.id },
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

    if (!followUp) {
      return NextResponse.json(
        { error: 'Follow-up not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(followUp)
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching follow-up:', error)
    return NextResponse.json(
      { error: 'Failed to fetch follow-up' },
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
    const validated = updateFollowUpSchema.parse(body)

    const followUp = await prisma.followUp.update({
      where: { id, userId: session.user.id },
      data: {
        ...validated,
        ...(validated.dueDate && { dueDate: new Date(validated.dueDate) }),
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

    return NextResponse.json(followUp)
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error updating follow-up:', error)
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update follow-up' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession()
    const { id } = await params

    await prisma.followUp.delete({
      where: { id, userId: session.user.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error deleting follow-up:', error)
    return NextResponse.json(
      { error: 'Failed to delete follow-up' },
      { status: 500 }
    )
  }
}
