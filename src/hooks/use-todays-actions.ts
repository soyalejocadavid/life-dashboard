import { useMemo } from 'react'
import { PILLAR_CONFIG } from '@/data/pillars'
import { PILLARS, type ActionFrequency, type PillarId } from '@/types'
import { getPeriodStart, shouldShowToday } from '@/lib/date-utils'
import type { GeneratedPlan } from '@/lib/coaching/types'

// ============================================================================
// Types
// ============================================================================

export interface TodayAction {
  /** Composite ID: `${subGoalPosition}-${actionPosition}` */
  actionId: string
  title: string
  frequency: ActionFrequency
  pillarId: PillarId
  subGoalTitle: string
  isChecked: boolean
  /** Full checkin key for toggle */
  checkinKey: string
  periodStart: string
}

export interface PillarGroup {
  pillarId: PillarId
  pillarName: string
  pillarColor: string
  actions: TodayAction[]
  completedCount: number
  totalCount: number
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Derives today's actions from the given plan and isChecked function.
 * Data-source agnostic — works with both Zustand and Supabase backends.
 */
export function useTodaysActions(
  plan: GeneratedPlan | null,
  isChecked: (actionId: string, frequency: ActionFrequency) => boolean
) {
  return useMemo(() => {
    if (!plan) {
      return {
        groups: [] as PillarGroup[],
        totalActions: 0,
        completedActions: 0,
        overallPercentage: 0,
      }
    }

    // Build actions grouped by pillar
    const pillarMap = new Map<PillarId, TodayAction[]>()

    for (const subGoal of plan.subGoals) {
      for (const action of subGoal.actions) {
        if (!shouldShowToday(action.frequency)) continue

        const actionId = `${subGoal.position}-${action.position}`
        const periodStart = getPeriodStart(action.frequency)
        const checkinKey = `${actionId}::${action.frequency}::${periodStart}`
        const checked = isChecked(actionId, action.frequency)

        const todayAction: TodayAction = {
          actionId,
          title: action.title,
          frequency: action.frequency,
          pillarId: subGoal.pillarId,
          subGoalTitle: subGoal.title,
          isChecked: checked,
          checkinKey,
          periodStart,
        }

        const existing = pillarMap.get(subGoal.pillarId) ?? []
        existing.push(todayAction)
        pillarMap.set(subGoal.pillarId, existing)
      }
    }

    // Build ordered groups following PILLARS order
    const groups: PillarGroup[] = []
    let totalActions = 0
    let completedActions = 0

    for (const pillarId of PILLARS) {
      const actions = pillarMap.get(pillarId)
      if (!actions || actions.length === 0) continue

      const completed = actions.filter((a) => a.isChecked).length
      totalActions += actions.length
      completedActions += completed

      groups.push({
        pillarId,
        pillarName: PILLAR_CONFIG[pillarId].name,
        pillarColor: PILLAR_CONFIG[pillarId].color,
        actions,
        completedCount: completed,
        totalCount: actions.length,
      })
    }

    const overallPercentage =
      totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0

    return { groups, totalActions, completedActions, overallPercentage }
  }, [plan, isChecked])
}
