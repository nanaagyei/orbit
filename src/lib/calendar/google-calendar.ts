import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'

export function getGoogleOAuthClient(): OAuth2Client {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/calendar/google/callback'

  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured')
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri)
}

export function getAuthUrl(): string {
  const oauth2Client = getGoogleOAuthClient()
  
  const scopes = [
    'https://www.googleapis.com/auth/calendar.readonly',
  ]

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  })
}

export async function getTokensFromCode(code: string) {
  const oauth2Client = getGoogleOAuthClient()
  const { tokens } = await oauth2Client.getToken(code)
  return tokens
}

export async function getCalendarEvents(
  accessToken: string,
  refreshToken: string | null,
  calendarId: string = 'primary',
  timeMin?: Date,
  timeMax?: Date
) {
  const oauth2Client = getGoogleOAuthClient()
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken || undefined,
  })

  // Refresh token if needed
  if (refreshToken) {
    try {
      await oauth2Client.refreshAccessToken()
      const credentials = oauth2Client.credentials
      if (credentials.access_token) {
        accessToken = credentials.access_token
      }
    } catch (error) {
      console.error('Failed to refresh token:', error)
    }
  }

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

  const response = await calendar.events.list({
    calendarId,
    timeMin: timeMin?.toISOString(),
    timeMax: timeMax?.toISOString(),
    maxResults: 2500,
    singleEvents: true,
    orderBy: 'startTime',
  })

  return response.data.items || []
}

export interface GoogleCalendarEvent {
  id: string
  summary: string
  start: string | { dateTime: string; timeZone?: string } | { date: string }
  end?: string | { dateTime: string; timeZone?: string } | { date: string }
  location?: string
  description?: string
  htmlLink?: string
}
