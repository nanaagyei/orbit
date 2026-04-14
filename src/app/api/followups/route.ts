import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createFollowUpSchema } from '@/lib/validations/followup'
import { requireSession } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession()
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const personId = searchParams.get('personId')

    const followUps = await prisma.followUp.findMany({
      where: {
        userId: session.user.id,
        ...(status && { status: status as any }),
        ...(personId && { personId }),
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
      orderBy: { dueDate: 'asc' },
    })

    return NextResponse.json(followUps)
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching follow-ups:', error)
    return NextResponse.json(
      { error: 'Failed to fetch follow-ups' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession()
    const body = await request.json()
    const validated = createFollowUpSchema.parse(body)

    const followUp = await prisma.followUp.create({
      data: {
        ...validated,
        userId: session.user.id,
        dueDate: new Date(validated.dueDate),
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

    return NextResponse.json(followUp, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error creating follow-up:', error)
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create follow-up' },
      { status: 500 }
    )
  }
}
