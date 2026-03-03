import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/auth-utils'

export async function POST(request: NextRequest) {
  try {
    const session = await requireSession()
    await prisma.calendarSync.deleteMany({
      where: { userId: session.user.id, provider: 'google' },
    })

    return NextResponse.json({ success: true, message: 'Google Calendar disconnected' })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error disconnecting Google Calendar:', error)
    return NextResponse.json(
      { error: 'Failed to disconnect Google Calendar' },
      { status: 500 }
    )
  }
}
