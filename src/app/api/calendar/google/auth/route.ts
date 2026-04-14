import { NextRequest, NextResponse } from 'next/server'
import { getAuthUrl } from '@/lib/calendar/google-calendar'
import { requireSession } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    await requireSession()
    const authUrl = getAuthUrl()
    return NextResponse.json({ authUrl })
  } catch (error) {
    if (error instanceof Error && error.message === 'UNAUTHORIZED') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Error generating auth URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate auth URL. Please configure Google OAuth credentials.' },
      { status: 500 }
    )
  }
}
