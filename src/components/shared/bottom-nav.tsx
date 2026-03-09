'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Grid3X3, BookOpen } from 'lucide-react'
import { motion } from 'framer-motion'
import { ThemeToggle } from './theme-toggle'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Inicio', icon: LayoutDashboard },
  { href: '/plan', label: 'Plan', icon: Grid3X3 },
  { href: '/journal', label: 'Diario', icon: BookOpen },
] as const

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Navegación principal" className="fixed inset-x-0 bottom-0 z-50 border-t border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-lg items-center px-4">
        {/* Nav items */}
        <div className="flex flex-1 items-center justify-around">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname.startsWith(item.href)
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                aria-current={isActive ? 'page' : undefined}
                className="relative flex flex-col items-center gap-1 px-4 py-2"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-2 h-0.5 w-8 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <Icon
                  className={`h-5 w-5 transition-colors ${
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                />
                <span
                  className={`text-[11px] font-medium transition-colors ${
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
        {/* Theme toggle */}
        <div className="flex items-center pl-2">
          <ThemeToggle />
        </div>
      </div>
      {/* Safe area for iOS home indicator */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}
