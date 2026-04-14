import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getTokensFromCode } from '@/lib/calendar/google-calendar'
import { requireSession } from '@/lib/auth-utils'

export async function GET(request: NextRequest) {
  try {
    const session = await requireSession()
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(
        new URL(`/settings?error=${encodeURIComponent(error)}`, request.url)
      )
    }

    if (!code) {
      return NextResponse.redirect(
        new URL('/settings?error=no_code', request.url)
      )
    }

    // Exchange code for tokens
    const tokens = await getTokensFromCode(code)

    if (!tokens.access_token) {
      return NextResponse.redirect(
        new URL('/settings?error=no_access_token', request.url)
      )
    }

    // Store tokens in database
    await prisma.calendarSync.upsert({
      where: { userId_provider: { userId: session.user.id, provider: 'google' } },
      create: {
        userId: session.user.id,
        provider: 'google',
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
        calendarId: 'primary',
        syncEnabled: true,
      },
      update: {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || null,
        lastSyncAt: null, // Reset to trigger initial sync
      },
    })

    return NextResponse.redirect(
      new URL('/settings?calendar_sync=connected', request.url)
    )
  } catch (error) {
    console.error('Error in OAuth callback:', error)
    return NextResponse.redirect(
      new URL(
        `/settings?error=${encodeURIComponent('Failed to connect Google Calendar')}`,
        request.url
      )
    )
  }
}
