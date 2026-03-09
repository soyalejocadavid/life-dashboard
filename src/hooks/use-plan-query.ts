'use client'

import { useQuery } from '@tanstack/react-query'
import { getActivePlan } from '@/lib/supabase/data-service'
import {
  transformDbPlanToGenerated,
  extractScoresFromPlan,
  buildActionIdMap,
} from '@/lib/supabase/transforms'
import type { GeneratedPlan } from '@/lib/coaching/types'
import type { PillarId } from '@/types'

interface PlanQueryResult {
  plan: GeneratedPlan | null
  scores: Record<PillarId, number> | null
  actionIdMap: Record<string, string> // compositeKey → UUID
}

export function usePlanQuery(userId: string | undefined) {
  return useQuery<PlanQueryResult>({
    queryKey: ['plan', userId],
    queryFn: async () => {
      if (!userId) return { plan: null, scores: null, actionIdMap: {} }

      const dbPlan = await getActivePlan(userId)
      if (!dbPlan) return { plan: null, scores: null, actionIdMap: {} }

      return {
        plan: transformDbPlanToGenerated(dbPlan),
        scores: extractScoresFromPlan(dbPlan),
        actionIdMap: buildActionIdMap(dbPlan),
      }
    },
    enabled: !!userId,
    staleTime: 60_000,
  })
}
