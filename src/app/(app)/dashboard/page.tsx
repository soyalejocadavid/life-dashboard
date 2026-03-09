'use client'

import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useQueryClient } from '@tanstack/react-query'
import { PillarRadar } from '@/components/radar/pillar-radar'
import { ActionChecklist } from '@/components/dashboard/action-checklist'
import { QuickStats } from '@/components/dashboard/quick-stats'
import { PullToRefresh } from '@/components/shared/pull-to-refresh'
import { NotificationBanner } from '@/components/shared/notification-banner'
import { useAppStore } from '@/stores/app-store'
import { useDashboardData } from '@/hooks/use-dashboard-data'
import { useTodaysActions } from '@/hooks/use-todays-actions'
import { formatDateSpanish, getGreeting } from '@/lib/date-utils'
import type { PillarId } from '@/types'

export default function DashboardPage() {
  const { plan, scores, isLoading, isChecked, toggleCheckin } = useDashboardData()
  const currentStreak = useAppStore((s) => s.currentStreak)
  const hasHydrated = useAppStore((s) => s._hasHydrated)
  const queryClient = useQueryClient()
  const { groups = [], totalActions = 0, completedActions = 0, overallPercentage = 0 } =
    useTodaysActions(plan, isChecked) ?? {}

  // Avoid hydration mismatch — wait for localStorage to load
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries()
  }, [queryClient])

  if (!mounted || !hasHydrated || isLoading) {
    return <DashboardSkeleton />
  }

  if (!plan || !scores) {
    return <DashboardEmptyState />
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="mx-auto w-full max-w-lg px-4 py-6">
      {/* Greeting + Date */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold tracking-tight">{getGreeting()}</h1>
        <p className="text-sm text-muted-foreground">{formatDateSpanish()}</p>
      </motion.div>

      {/* Mini Radar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-6 flex justify-center"
      >
        <PillarRadar
          scores={scores as Record<PillarId, number>}
          size={200}
          showLabels={false}
        />
      </motion.div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-6"
      >
        <QuickStats
          streak={currentStreak}
          completedToday={completedActions}
          totalToday={totalActions}
        />
      </motion.div>

      {/* Overall progress bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-6"
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium">Progreso de hoy</span>
          <span className="text-sm font-bold text-primary">
            {overallPercentage}%
          </span>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={overallPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progreso de hoy: ${overallPercentage}%`}
        >
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${overallPercentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </motion.div>

      {/* Notification Banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mb-6"
      >
        <NotificationBanner />
      </motion.div>

      {/* Today's Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="mb-4 text-lg font-semibold">Acciones de hoy</h2>
        <ActionChecklist groups={groups} onToggle={toggleCheckin} />
      </motion.div>

      {/* Spacer for bottom nav */}
      <div className="h-4" />
    </div>
    </PullToRefresh>
  )
}

// ============================================================================
// Empty + Skeleton states
// ============================================================================

function DashboardEmptyState() {
  return (
    <div className="flex min-h-[80svh] flex-col items-center justify-center gap-4 p-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <span className="text-3xl">🌱</span>
      </div>
      <h2 className="text-lg font-semibold">Comienza tu camino</h2>
      <p className="max-w-xs text-center text-sm text-muted-foreground">
        Completa el diagnóstico para generar tu plan de acción personalizado con
        el método Harada.
      </p>
      <Link
        href="/onboarding"
        className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Comenzar diagnóstico
      </Link>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-lg animate-pulse px-4 py-6">
      <div className="mb-6">
        <div className="mb-2 h-7 w-40 rounded bg-muted" />
        <div className="h-4 w-52 rounded bg-muted" />
      </div>
      <div className="mb-6 flex justify-center">
        <div className="h-[200px] w-[200px] rounded-full bg-muted" />
      </div>
      <div className="mb-6 grid grid-cols-3 gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-muted" />
        ))}
      </div>
      <div className="mb-6">
        <div className="mb-2 h-4 w-32 rounded bg-muted" />
        <div className="h-2 w-full rounded-full bg-muted" />
      </div>
    </div>
  )
}
