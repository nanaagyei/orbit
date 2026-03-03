import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession()
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')

    const positions = await prisma.positioning.findMany({
      where: { userId: session.user.id, ...(type ? { type } : {}) },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(positions)
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching positioning:', error)
    return NextResponse.json(
      { error: 'Failed to fetch positioning' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession()
    const body = await request.json()
    const { type, content } = body

    if (!type || !content) {
      return NextResponse.json(
        { error: 'Type and content are required' },
        { status: 400 }
      )
    }

    const position = await prisma.positioning.create({
      data: {
        userId: session.user.id,
        type,
        content,
        isActive: true,
      },
    })

    return NextResponse.json(position, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error creating positioning:', error)
    return NextResponse.json(
      { error: 'Failed to create positioning' },
      { status: 500 }
    )
  }
}
