import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/auth-utils'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession()
    const { id } = await params
    const body = await request.json()
    const { content, isActive } = body

    const position = await prisma.positioning.update({
      where: { id, userId: session.user.id },
      data: {
        content,
        isActive,
      },
    })

    return NextResponse.json(position)
  } catch (error) {
    console.error('Error updating positioning:', error)
    return NextResponse.json(
      { error: 'Failed to update positioning' },
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

    await prisma.positioning.delete({
      where: { id, userId: session.user.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error deleting positioning:', error)
    return NextResponse.json(
      { error: 'Failed to delete positioning' },
      { status: 500 }
    )
  }
}
