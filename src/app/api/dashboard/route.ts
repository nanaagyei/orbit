import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const endOfWeek = new Date(today)
    endOfWeek.setDate(today.getDate() + 7)

    const twoWeeksAgo = new Date(today)
    twoWeeksAgo.setDate(today.getDate() - 14)

    // Get follow-ups due today
    const dueToday = await prisma.followUp.findMany({
      where: {
        userId: session.user.id,
        status: 'OPEN',
        dueDate: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        },
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

    // Get follow-ups due this week
    const dueThisWeek = await prisma.followUp.findMany({
      where: {
        userId: session.user.id,
        status: 'OPEN',
        dueDate: {
          gt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          lt: endOfWeek,
        },
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

    // Get overdue follow-ups
    const overdue = await prisma.followUp.findMany({
      where: {
        userId: session.user.id,
        status: 'OPEN',
        dueDate: {
          lt: today,
        },
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

    // Get recent activity counts (last 7-14 days)
    const coffeeChatCount = await prisma.interaction.count({
      where: {
        userId: session.user.id,
        type: 'COFFEE_CHAT',
        date: {
          gte: twoWeeksAgo,
        },
      },
    })

    const papersReadCount = await prisma.paper.count({
      where: {
        userId: session.user.id,
        status: {
          in: ['READ', 'IMPLEMENTED', 'REVISITED'],
        },
        updatedAt: {
          gte: twoWeeksAgo,
        },
      },
    })

    const eventsAttendedCount = await prisma.event.count({
      where: {
        userId: session.user.id,
        rsvpStatus: 'WENT',
        dateTime: {
          gte: twoWeeksAgo,
        },
      },
    })

    // Get weekly focus (most recent active positioning with type weekly_focus)
    const weeklyFocus = await prisma.positioning.findFirst({
      where: {
        userId: session.user.id,
        type: 'weekly_focus',
        isActive: true,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    })

    return NextResponse.json({
      followUps: {
        dueToday,
        dueThisWeek,
        overdue,
      },
      recentActivity: {
        coffeeChatCount,
        papersReadCount,
        eventsAttendedCount,
      },
      weeklyFocus: weeklyFocus?.content || null,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession()
    const body = await request.json()
    const { weeklyFocus } = body

    // Deactivate all existing weekly_focus positioning
    await prisma.positioning.updateMany({
      where: { userId: session.user.id, type: 'weekly_focus' },
      data: { isActive: false },
    })

    // Create new weekly focus
    const newWeeklyFocus = await prisma.positioning.create({
      data: {
        userId: session.user.id,
        type: 'weekly_focus',
        content: weeklyFocus,
        isActive: true,
      },
    })

    return NextResponse.json(newWeeklyFocus)
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error updating weekly focus:', error)
    return NextResponse.json(
      { error: 'Failed to update weekly focus' },
      { status: 500 }
    )
  }
}
