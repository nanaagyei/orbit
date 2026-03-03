import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { startOfWeek, endOfWeek, subWeeks, subMonths } from 'date-fns'
import { requireSession } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession()
    const searchParams = request.nextUrl.searchParams
    const weekOffset = parseInt(searchParams.get('weekOffset') || '0')

    // Calculate week boundaries (Monday to Sunday)
    const now = new Date()
    const targetDate = weekOffset ? subWeeks(now, Math.abs(weekOffset)) : now
    const weekStart = startOfWeek(targetDate, { weekStartsOn: 1 }) // Monday
    const weekEnd = endOfWeek(targetDate, { weekStartsOn: 1 }) // Sunday

    // Stats for the week
    const interactionsThisWeek = await prisma.interaction.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
      include: {
        person: {
          select: {
            id: true,
            name: true,
            company: true,
            headline: true,
            stage: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    })

    const coffeeChatCount = interactionsThisWeek.filter(
      (i) => i.type === 'COFFEE_CHAT'
    ).length

    const papersReadThisWeek = await prisma.paper.findMany({
      where: {
        userId: session.user.id,
        status: {
          in: ['READ', 'IMPLEMENTED', 'REVISITED'],
        },
        updatedAt: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
      select: {
        id: true,
        title: true,
        authors: true,
        status: true,
      },
    })

    const eventsThisWeek = await prisma.event.findMany({
      where: {
        userId: session.user.id,
        dateTime: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
      include: {
        attendees: {
          include: {
            person: {
              select: {
                id: true,
                name: true,
                company: true,
              },
            },
          },
        },
      },
      orderBy: { dateTime: 'asc' },
    })

    const followUpsCompletedThisWeek = await prisma.followUp.count({
      where: {
        userId: session.user.id,
        status: 'DONE',
        updatedAt: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
    })

    // Follow-ups needed: auto-generated heuristics
    const twoWeeksAgo = subWeeks(now, 2)
    const oneMonthAgo = subMonths(now, 1)

    // People chatted with >2 weeks ago who might need follow-up
    const peopleNeedingFollowUp = await prisma.person.findMany({
      where: {
        userId: session.user.id,
        stage: {
          in: ['CHATTED', 'CONNECTED'],
        },
        interactions: {
          some: {
            date: {
              lt: twoWeeksAgo,
            },
          },
        },
        // Exclude those with open follow-ups already
        followUps: {
          none: {
            status: 'OPEN',
          },
        },
      },
      select: {
        id: true,
        name: true,
        company: true,
        stage: true,
        interactions: {
          orderBy: { date: 'desc' },
          take: 1,
          select: {
            date: true,
            type: true,
          },
        },
      },
      take: 10,
    })

    // Ongoing relationships >1 month without interaction
    const ongoingNeedingReconnect = await prisma.person.findMany({
      where: {
        userId: session.user.id,
        stage: {
          in: ['ONGOING', 'INNER_CIRCLE'],
        },
        interactions: {
          every: {
            date: {
              lt: oneMonthAgo,
            },
          },
        },
        followUps: {
          none: {
            status: 'OPEN',
          },
        },
      },
      select: {
        id: true,
        name: true,
        company: true,
        stage: true,
        interactions: {
          orderBy: { date: 'desc' },
          take: 1,
          select: {
            date: true,
            type: true,
          },
        },
      },
      take: 10,
    })

    // Get current weekly reflection and focus
    const currentReflection = await prisma.positioning.findFirst({
      where: {
        userId: session.user.id,
        type: 'weekly_reflection',
        isActive: true,
      },
      orderBy: { updatedAt: 'desc' },
    })

    const currentFocus = await prisma.positioning.findFirst({
      where: {
        userId: session.user.id,
        type: 'weekly_focus',
        isActive: true,
      },
      orderBy: { updatedAt: 'desc' },
    })

    // Get last completed review timestamp
    const lastReview = await prisma.positioning.findFirst({
      where: {
        userId: session.user.id,
        type: 'weekly_reflection',
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
      stats: {
        coffeeChats: coffeeChatCount,
        totalInteractions: interactionsThisWeek.length,
        papersRead: papersReadThisWeek.length,
        eventsAttended: eventsThisWeek.filter((e) => e.rsvpStatus === 'WENT')
          .length,
        followUpsCompleted: followUpsCompletedThisWeek,
      },
      interactions: interactionsThisWeek,
      papers: papersReadThisWeek,
      events: eventsThisWeek,
      suggestedFollowUps: {
        needsReconnect: peopleNeedingFollowUp,
        ongoingNeedsAttention: ongoingNeedingReconnect,
      },
      currentReflection: currentReflection?.content || '',
      currentFocus: currentFocus?.content || '',
      lastReviewDate: lastReview?.createdAt || null,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching weekly review data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch weekly review data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession()
    const body = await request.json()
    const { reflection, focus } = body

    // Save weekly reflection
    if (reflection !== undefined) {
      // Deactivate all existing weekly_reflection positioning
      await prisma.positioning.updateMany({
        where: { userId: session.user.id, type: 'weekly_reflection' },
        data: { isActive: false },
      })

      // Create new weekly reflection
      await prisma.positioning.create({
        data: {
          userId: session.user.id,
          type: 'weekly_reflection',
          content: reflection,
          isActive: true,
        },
      })
    }

    // Save weekly focus
    if (focus !== undefined) {
      // Deactivate all existing weekly_focus positioning
      await prisma.positioning.updateMany({
        where: { userId: session.user.id, type: 'weekly_focus' },
        data: { isActive: false },
      })

      // Create new weekly focus
      await prisma.positioning.create({
        data: {
          userId: session.user.id,
          type: 'weekly_focus',
          content: focus,
          isActive: true,
        },
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error saving weekly review:', error)
    return NextResponse.json(
      { error: 'Failed to save weekly review' },
      { status: 500 }
    )
  }
}
