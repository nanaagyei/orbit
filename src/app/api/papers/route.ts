import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createPaperSchema } from '@/lib/validations/paper'
import { requireSession } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession()
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')
    const tag = searchParams.get('tag')
    const search = searchParams.get('search')

    const papers = await prisma.paper.findMany({
      where: {
        userId: session.user.id,
        ...(status && { status: status as any }),
        ...(tag && { tags: { some: { tag: { name: tag, userId: session.user.id } } } }),
        ...(search && {
          OR: [
            { title: { contains: search } },
            { authors: { contains: search } },
            { venue: { contains: search } },
          ],
        }),
      },
      include: {
        tags: { include: { tag: true } },
        people: { include: { person: { select: { id: true, name: true } } } },
        _count: {
          select: { tags: true, people: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(papers)
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching papers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch papers' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession()
    const body = await request.json()
    const validated = createPaperSchema.parse(body)

    const { tags, ...paperData } = validated

    const paper = await prisma.paper.create({
      data: {
        ...paperData,
        userId: session.user.id,
        tags: tags
          ? {
              create: tags.map((tagName) => ({
                tag: {
                  connectOrCreate: {
                    where: { userId_name: { userId: session.user.id, name: tagName } },
                    create: { userId: session.user.id, name: tagName },
                  },
                },
              })),
            }
          : undefined,
      },
      include: {
        tags: { include: { tag: true } },
      },
    })

    return NextResponse.json(paper, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error creating paper:', error)
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create paper' },
      { status: 500 }
    )
  }
}
