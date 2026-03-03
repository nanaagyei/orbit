import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { parseICSFile } from '@/lib/calendar/ics-parser'
import { requireSession } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession()
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!file.name.endsWith('.ics')) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a .ics file' },
        { status: 400 }
      )
    }

    // Parse ICS file
    const parseResult = await parseICSFile(file)

    if (!parseResult.success || parseResult.events.length === 0) {
      return NextResponse.json(
        {
          error: 'Failed to parse ICS file or no events found',
          errors: parseResult.errors,
        },
        { status: 400 }
      )
    }

    // Import events
    const created: string[] = []
    const skipped: string[] = []
    const errors: string[] = []

    for (const event of parseResult.events) {
      try {
        // Check for duplicates (same title and date within 1 hour)
        const existingEvent = await prisma.event.findFirst({
          where: {
            userId: session.user.id,
            title: event.title,
            dateTime: {
              gte: new Date(event.start.getTime() - 60 * 60 * 1000),
              lte: new Date(event.start.getTime() + 60 * 60 * 1000),
            },
          },
        })

        if (existingEvent) {
          skipped.push(event.title)
          continue
        }

        // Create event
        const newEvent = await prisma.event.create({
          data: {
            userId: session.user.id,
            title: event.title,
            dateTime: event.start,
            location: event.location || null,
            link: event.url || null,
            notes: event.description || null,
            rsvpStatus: 'INTERESTED',
          },
        })

        created.push(newEvent.id)
      } catch (error) {
        errors.push(
          `Failed to import "${event.title}": ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: `Imported ${created.length} event${created.length !== 1 ? 's' : ''}`,
      created: created.length,
      skipped: skipped.length,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error importing calendar:', error)
    return NextResponse.json(
      { error: 'Failed to import calendar file' },
      { status: 500 }
    )
  }
}
