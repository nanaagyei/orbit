import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createPersonSchema } from '@/lib/validations/person'
import { requireSession } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession()
    const searchParams = request.nextUrl.searchParams
    const stage = searchParams.get('stage')
    const tag = searchParams.get('tag')
    const search = searchParams.get('search')

    const people = await prisma.person.findMany({
      where: {
        userId: session.user.id,
        ...(stage && { stage: stage as any }),
        ...(tag && { tags: { some: { tag: { name: tag, userId: session.user.id } } } }),
        ...(search && {
          OR: [
            { name: { contains: search } },
            { company: { contains: search } },
            { headline: { contains: search } },
            { notes: { contains: search } },
          ],
        }),
      },
      include: {
        tags: { include: { tag: true } },
        _count: {
          select: { interactions: true, followUps: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json(people)
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching people:', error)
    return NextResponse.json(
      { error: 'Failed to fetch people' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession()
    const body = await request.json()
    const validated = createPersonSchema.parse(body)

    const { tags, ...personData } = validated

    const person = await prisma.person.create({
      data: {
        ...personData,
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

    return NextResponse.json(person, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error creating person:', error)
    if (error instanceof Error && 'issues' in error) {
      return NextResponse.json(
        { error: 'Validation failed', details: error },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create person' },
      { status: 500 }
    )
  }
}
