'use client'

import { usePathname } from 'next/navigation'
import { BottomNav } from '@/components/shared/bottom-nav'

const NAV_ROUTES = ['/dashboard', '/plan', '/journal']

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const showNav = NAV_ROUTES.some((route) => pathname.startsWith(route))

  return (
    <div className="flex min-h-svh flex-col">
      <main className={showNav ? 'flex-1 pb-20' : 'flex-1'}>{children}</main>
      {showNav && <BottomNav />}
    </div>
  )
}
