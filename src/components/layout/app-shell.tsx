'use client'

import { usePathname } from 'next/navigation'
import { MainLayout } from './main-layout'
import { CommandPalette } from '@/components/command-palette'

const AUTH_PATHS = ['/sign-in', '/sign-up', '/onboarding']

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = AUTH_PATHS.some((p) => pathname?.startsWith(p))

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <>
      <MainLayout>{children}</MainLayout>
      <CommandPalette />
    </>
  )
}
