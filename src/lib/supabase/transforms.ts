import type { PlanWithDetails, PillarId } from '@/types'
import type { GeneratedPlan } from '@/lib/coaching/types'

// ============================================================================
// DB → UI transforms
// ============================================================================

/**
 * Transform a PlanWithDetails (DB shape with UUIDs) into a GeneratedPlan (UI shape).
 * The UI uses position-based composite keys ("1-3"), while the DB uses UUIDs.
 */
export function transformDbPlanToGenerated(plan: PlanWithDetails): GeneratedPlan {
  return {
    centralGoal: plan.central_goal,
    coachingRationale: plan.coaching_rationale ?? '',
    subGoals: plan.sub_goals.map((sg) => ({
      pillarId: sg.pillar_id as PillarId,
      title: sg.title,
      currentScore: Number(sg.current_score),
      targetScore: Number(sg.target_score),
      rationale: sg.rationale ?? '',
      position: sg.position,
      actions: sg.actions.map((a) => ({
        title: a.title,
        frequency: a.frequency,
        position: a.position,
      })),
    })),
  }
}

/**
 * Extract pillar scores from a DB plan's sub_goals (current_score per pillar).
 */
export function extractScoresFromPlan(
  plan: PlanWithDetails
): Record<PillarId, number> {
  const scores = {} as Record<PillarId, number>
  for (const sg of plan.sub_goals) {
    scores[sg.pillar_id as PillarId] = Number(sg.current_score)
  }
  return scores
}

/**
 * Build a mapping from composite action IDs ("subGoalPos-actionPos") to real DB UUIDs.
 * Used to translate check-in toggles from UI → DB.
 */
export function buildActionIdMap(
  plan: PlanWithDetails
): Record<string, string> {
  const map: Record<string, string> = {}
  for (const sg of plan.sub_goals) {
    for (const action of sg.actions) {
      const compositeKey = `${sg.position}-${action.position}`
      map[compositeKey] = action.id
    }
  }
  return map
}

/**
 * Reverse mapping: DB action UUID → composite key.
 * Used to translate DB check-ins into the UI format.
 */
export function buildReverseActionIdMap(
  plan: PlanWithDetails
): Record<string, string> {
  const map: Record<string, string> = {}
  for (const sg of plan.sub_goals) {
    for (const action of sg.actions) {
      map[action.id] = `${sg.position}-${action.position}`
    }
  }
  return map
}
