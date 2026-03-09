'use client'

import { useCallback, useMemo } from 'react'
import { useAuth } from './use-auth'
import { usePlanQuery } from './use-plan-query'
import { useCheckinsQuery, buildCheckinSet, useToggleCheckinMutation } from './use-checkins-query'
import { useAppStore } from '@/stores/app-store'
import { getPeriodStart } from '@/lib/date-utils'
import type { GeneratedPlan } from '@/lib/coaching/types'
import type { PillarId, ActionFrequency } from '@/types'

export interface DashboardData {
  plan: GeneratedPlan | null
  scores: Record<PillarId, number> | null
  isLoading: boolean
  isChecked: (actionId: string, frequency: ActionFrequency) => boolean
  toggleCheckin: (
    actionId: string,
    frequency: ActionFrequency,
    periodStart: string
  ) => void
  /** Only available when using Supabase — maps composite IDs to DB UUIDs */
  actionIdMap: Record<string, string>
}

/**
 * Bridge hook: uses Supabase when authenticated, Zustand when not.
 * Keeps all page components agnostic to the data source.
 */
export function useDashboardData(): DashboardData {
  const { user, isLoading: authLoading } = useAuth()
  const userId = user?.id

  // Supabase path
  const planQuery = usePlanQuery(userId)
  const checkinsQuery = useCheckinsQuery(userId)
  const toggleMutation = useToggleCheckinMutation(userId)

  // Zustand path (fallback)
  const localPlan = useAppStore((s) => s.plan)
  const localScores = useAppStore((s) => s.confirmedScores)
  const localCheckins = useAppStore((s) => s.checkins)
  const localToggle = useAppStore((s) => s.toggleCheckin)

  // Build check-in set from Supabase data
  const checkinSet = useMemo(
    () => buildCheckinSet(checkinsQuery.data ?? []),
    [checkinsQuery.data]
  )

  // IMPORTANT: All hooks must be called before any conditional return.
  // This useCallback must run on every render to satisfy React's rules of hooks.
  const localIsChecked = useCallback(
    (actionId: string, frequency: ActionFrequency) => {
      const periodStart = getPeriodStart(frequency)
      const key = `${actionId}::${frequency}::${periodStart}`
      return !!localCheckins[key]
    },
    [localCheckins]
  )

  if (userId) {
    // === Supabase path ===
    const actionIdMap = planQuery.data?.actionIdMap ?? {}

    return {
      plan: planQuery.data?.plan ?? null,
      scores: planQuery.data?.scores ?? null,
      isLoading: authLoading || planQuery.isLoading,
      actionIdMap,

      isChecked: (actionId: string, frequency: ActionFrequency) => {
        const dbId = actionIdMap[actionId]
        if (!dbId) return false
        const periodStart = getPeriodStart(frequency)
        return checkinSet.has(`${dbId}::${frequency}::${periodStart}`)
      },

      toggleCheckin: (actionId: string, frequency: ActionFrequency, periodStart: string) => {
        const dbId = actionIdMap[actionId]
        if (!dbId) return
        const currentlyChecked = checkinSet.has(`${dbId}::${frequency}::${periodStart}`)
        toggleMutation.mutate({
          actionDbId: dbId,
          completed: !currentlyChecked,
          periodType: frequency,
          periodStart,
        })
      },
    }
  }

  // === Zustand path (dev / not logged in) ===
  return {
    plan: localPlan,
    scores: localScores,
    isLoading: authLoading,
    actionIdMap: {},

    isChecked: localIsChecked,

    toggleCheckin: localToggle,
  }
}
