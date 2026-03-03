'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  MessageSquare,
  Bell,
  FileText,
  Calendar,
  CalendarDays,
  Sparkles,
  Settings,
  ClipboardCheck,
  Network,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useMobileNav } from '@/providers/mobile-nav-provider'
import { useFeatures } from '@/hooks/use-features'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import type { FeatureId } from '@/lib/features/registry'

const navigation: Array<{ featureId: FeatureId; name: string; href: string; icon: typeof LayoutDashboard }> = [
  { featureId: 'dashboard', name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { featureId: 'people', name: 'People', href: '/people', icon: Users },
  { featureId: 'interactions', name: 'Interactions', href: '/interactions', icon: MessageSquare },
  { featureId: 'follow-ups', name: 'Follow-Ups', href: '/follow-ups', icon: Bell },
  { featureId: 'papers', name: 'Papers', href: '/papers', icon: FileText },
  { featureId: 'events', name: 'Events', href: '/events', icon: Calendar },
  { featureId: 'calendar', name: 'Calendar', href: '/calendar', icon: CalendarDays },
  { featureId: 'network-map', name: 'Network Map', href: '/relationship-map', icon: Network },
  { featureId: 'ai-studio', name: 'AI Studio', href: '/ai-studio', icon: Sparkles },
  { featureId: 'weekly-review', name: 'Weekly Review', href: '/weekly-review', icon: ClipboardCheck },
  { featureId: 'settings', name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { isOpen, close } = useMobileNav()
  const { isFeatureEnabled } = useFeatures()

  const visibleNavigation = navigation.filter((item) =>
    isFeatureEnabled(item.featureId)
  )

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-64 border-r border-border bg-background transition-transform duration-300 ease-in-out',
          'lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-border px-6">
            {/* <h1 className="text-xl font-medium">Orbit</h1> */}
            <Link href="/">
              <Image src="/orbit-logo.png" alt="Orbit" width={128} height={128} />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={close}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
            {visibleNavigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => {
                    // Close mobile nav when navigating
                    if (window.innerWidth < 1024) {
                      close()
                    }
                  }}
                  className={cn(
                    'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </aside>
    </>
  )
}
