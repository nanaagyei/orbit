import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession()
    const tags = await prisma.tag.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: {
            people: true,
            papers: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(tags)
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching tags:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    )
  }
}
