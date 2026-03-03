import type { Metadata } from 'next'
import { Manrope } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/providers/query-provider'
import { CommandPaletteProvider } from '@/providers/command-palette-provider'
import { MobileNavProvider } from '@/providers/mobile-nav-provider'
import { AppShell } from '@/components/layout/app-shell'
import { Toaster } from '@/components/ui/sonner'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Orbit',
  description: 'A local-first system for building ML relationships and career momentum',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} font-sans antialiased`}>
        <QueryProvider>
          <CommandPaletteProvider>
            <MobileNavProvider>
              <AppShell>{children}</AppShell>
              <Toaster />
            </MobileNavProvider>
          </CommandPaletteProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
