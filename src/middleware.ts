import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/sign-in', '/sign-up', '/onboarding']

// Default Better Auth session cookie (prefix.session_token)
const SESSION_COOKIE_NAME = 'better-auth.session_token'

function hasSessionCookie(request: NextRequest): boolean {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)
  return Boolean(cookie?.value)
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    if (hasSessionCookie(request)) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  if (!hasSessionCookie(request)) {
    return NextResponse.redirect(new URL('/sign-in', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|orbit-logo.png).*)',
  ],
}
