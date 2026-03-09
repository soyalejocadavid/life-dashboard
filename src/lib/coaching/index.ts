// ============================================================================
// Coaching Engine — Public API
// ============================================================================
//
// Current: Uses mock generator for development
// Future: Will call Claude API via Supabase Edge Functions
// ============================================================================

export { generateMockPlan } from './mock-generator'
export { COACHING_SYSTEM_PROMPT, INSIGHT_PROMPT } from './system-prompt'
export type {
  CoachingInput,
  CoachingInsight,
  GeneratedAction,
  GeneratedPlan,
  GeneratedSubGoal,
} from './types'
