'use client'

import { Search, Download, Menu, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useCommandPalette } from '@/providers/command-palette-provider'
import { useMobileNav } from '@/providers/mobile-nav-provider'
import { signOut } from '@/lib/auth-client'

export function Topbar() {
  const router = useRouter()
  const { setOpen: setCommandPaletteOpen } = useCommandPalette()
  const { toggle: toggleMobileNav } = useMobileNav()

  const handleSignOut = async () => {
    await signOut()
    router.push('/sign-in')
    router.refresh()
  }

  return (
    <header className="fixed left-0 lg:left-64 right-0 top-0 z-30 h-16 border-b border-border bg-background">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={toggleMobileNav}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            {/* Page title will be rendered here dynamically */}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCommandPaletteOpen(true)}
          >
            <Search className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="icon">
            <Download className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            title="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
