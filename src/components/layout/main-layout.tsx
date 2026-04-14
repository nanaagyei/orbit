'use client'

import { Sidebar } from './sidebar'
import { Topbar } from './topbar'

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <Topbar />
      <main className="ml-0 lg:ml-64 mt-16 p-4 lg:p-6">
        <div className="mx-auto max-w-7xl">
          {children}
        </div>
      </main>
    </div>
  )
}
