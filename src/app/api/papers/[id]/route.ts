import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updatePaperSchema, updatePaperReflectionSchema } from '@/lib/validations/paper'
import { requireSession } from '@/lib/auth-utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireSession()
    const { id } = await params

    const paper = await prisma.paper.findFirst({
      where: { id, userId: session.user.id },
      include: {
        tags: { include: { tag: true } },
        people: { include: { person: { select: { id: true, name: true, company: true } } } },
      },
    })

    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 })
    }

    return NextResponse.json(paper)
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching paper:', error)
    return NextResponse.json(
      { error: 'Failed to fetch paper' },
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

    // Try to parse as full update first, then as reflection update
    let validated
    let isReflectionOnly = false

    try {
      validated = updatePaperSchema.parse(body)
    } catch {
      validated = updatePaperReflectionSchema.parse(body)
      isReflectionOnly = true
    }

    const { tags, ...paperData } = validated as any

    const paper = await prisma.paper.update({
      where: { id },
      data: {
        ...paperData,
        ...(!isReflectionOnly && tags && {
          tags: {
            deleteMany: {},
            create: tags.map((tagName: string) => ({
              tag: {
                connectOrCreate: {
                  where: { name: tagName },
                  create: { name: tagName },
                },
              },
            })),
          },
        }),
      },
      include: {
        tags: { include: { tag: true } },
      },
    })

    return NextResponse.json(paper)
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error updating paper:', error)
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to update paper' },
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

    await prisma.paper.delete({
      where: { id, userId: session.user.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error deleting paper:', error)
    return NextResponse.json(
      { error: 'Failed to delete paper' },
      { status: 500 }
    )
  }
}
