import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import type { Session } from '@/lib/auth'

export async function getSession(): Promise<Session | null> {
  return auth.api.getSession({
    headers: await headers(),
  })
}

export async function requireSession(): Promise<Session> {
  const session = await getSession()
  if (!session) {
    throw new Error('UNAUTHORIZED')
  }
  return session
}
