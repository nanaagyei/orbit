import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCalendarEvents } from '@/lib/calendar/google-calendar'
import { requireSession } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession()
    const sync = await prisma.calendarSync.findUnique({
      where: { userId_provider: { userId: session.user.id, provider: 'google' } },
    })

    if (!sync || !sync.syncEnabled) {
      return NextResponse.json(
        { error: 'Google Calendar sync not configured or disabled' },
        { status: 400 }
      )
    }

    if (!sync.accessToken) {
      return NextResponse.json(
        { error: 'No access token found' },
        { status: 400 }
      )
    }

    // Fetch events from Google Calendar (last 30 days and next 90 days)
    const timeMin = new Date()
    timeMin.setDate(timeMin.getDate() - 30)
    const timeMax = new Date()
    timeMax.setDate(timeMax.getDate() + 90)

    const googleEvents = await getCalendarEvents(
      sync.accessToken,
      sync.refreshToken,
      sync.calendarId || 'primary',
      timeMin,
      timeMax
    )

    let created = 0
    let updated = 0
    let skipped = 0
    const errors: string[] = []

    for (const googleEvent of googleEvents) {
      try {
        if (!googleEvent.summary || !googleEvent.start) {
          skipped++
          continue
        }

        // Parse start date
        let startDate: Date
        if (typeof googleEvent.start === 'string') {
          startDate = new Date(googleEvent.start)
        } else if ('dateTime' in googleEvent.start) {
          startDate = new Date(googleEvent.start.dateTime)
        } else if ('date' in googleEvent.start) {
          startDate = new Date(googleEvent.start.date)
        } else {
          skipped++
          continue
        }

        // Check for existing event (match by title and date within 1 hour)
        const existingEvent = await prisma.event.findFirst({
          where: {
            title: googleEvent.summary,
            dateTime: {
              gte: new Date(startDate.getTime() - 60 * 60 * 1000),
              lte: new Date(startDate.getTime() + 60 * 60 * 1000),
            },
          },
        })

        const eventData = {
          userId: session.user.id,
          title: googleEvent.summary,
          dateTime: startDate,
          location: googleEvent.location || null,
          link: googleEvent.htmlLink || null,
          notes: googleEvent.description || null,
          rsvpStatus: 'INTERESTED' as const,
        }

        if (existingEvent) {
          // Update existing event
          await prisma.event.update({
            where: { id: existingEvent.id },
            data: eventData,
          })
          updated++
        } else {
          // Create new event
          await prisma.event.create({
            data: eventData,
          })
          created++
        }
      } catch (error) {
        errors.push(
          `Failed to sync event "${googleEvent.summary}": ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    }

    // Update last sync time
    await prisma.calendarSync.update({
      where: { id: sync.id },
      data: { lastSyncAt: new Date() },
    })

    return NextResponse.json({
      success: true,
      message: `Synced ${created} new events, updated ${updated} existing events`,
      created,
      updated,
      skipped,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error syncing Google Calendar:', error)
    return NextResponse.json(
      { error: 'Failed to sync Google Calendar' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession()
    const sync = await prisma.calendarSync.findUnique({
      where: { userId_provider: { userId: session.user.id, provider: 'google' } },
      select: {
        id: true,
        provider: true,
        calendarId: true,
        lastSyncAt: true,
        syncEnabled: true,
        createdAt: true,
      },
    })

    if (!sync) {
      return NextResponse.json({ connected: false })
    }

    return NextResponse.json({
      connected: true,
      ...sync,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error fetching sync status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sync status' },
      { status: 500 }
    )
  }
}
