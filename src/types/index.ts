// ============================================================================
// Life Dashboard — Core Types
// Aligned with Supabase schema (supabase/migrations/00001_initial_schema.sql)
// ============================================================================

// 7 Pillars of Life
export const PILLARS = [
  'mental-health',
  'physical-wellbeing',
  'relationships',
  'spirituality',
  'finances',
  'intellectual-growth',
  'purpose',
] as const

export type PillarId = (typeof PILLARS)[number]

export interface Pillar {
  id: PillarId
  name: string
  description: string
  icon: string
  color: string
}

// User profile (maps to public.profiles)
export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  has_completed_onboarding: boolean
  created_at: string
  updated_at: string
}

// Diagnostic summary (maps to public.diagnostics)
export interface Diagnostic {
  id: string
  user_id: string
  status: 'in_progress' | 'completed'
  current_pillar_index: number
  insights: string[]
  created_at: string
  completed_at: string | null
}

// Individual pillar score (maps to public.pillar_scores)
export interface PillarScore {
  id: string
  diagnostic_id: string
  pillar_id: PillarId
  score: number
  created_at: string
}

// Granular response per question (maps to public.diagnostic_responses)
export type QuestionType = 'scale' | 'multiple-choice' | 'text'

export interface DiagnosticResponse {
  id: string
  diagnostic_id: string
  pillar_id: PillarId
  question_id: string
  question_type: QuestionType
  response_text: string | null
  response_number: number | null
  response_array: string[] | null
  created_at: string
}

// Harada plan (maps to public.plans)
export interface Plan {
  id: string
  user_id: string
  diagnostic_id: string
  central_goal: string
  status: 'draft' | 'confirmed'
  coaching_rationale: string | null
  created_at: string
  confirmed_at: string | null
}

// Sub-goal (maps to public.sub_goals)
export interface SubGoal {
  id: string
  plan_id: string
  pillar_id: PillarId
  title: string
  current_score: number
  target_score: number
  rationale: string | null
  position: number // 1-8 in Open Window 64
}

// Action (maps to public.actions)
export type ActionFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly'

export interface Action {
  id: string
  sub_goal_id: string
  title: string
  frequency: ActionFrequency
  position: number // 1-8 within sub-goal
  is_active: boolean
  created_at: string
}

// Check-in record (maps to public.action_checkins)
export interface ActionCheckin {
  id: string
  user_id: string
  action_id: string
  completed: boolean
  period_type: ActionFrequency
  period_start: string // ISO date
  checked_at: string | null
  created_at: string
}

// Journal entry (maps to public.journal_entries)
export interface JournalEntry {
  id: string
  user_id: string
  content: string
  date: string // ISO date
  created_at: string
  updated_at: string
}

// ============================================================================
// Composite types (for UI convenience, not direct DB maps)
// ============================================================================

// Sub-goal with its 8 actions
export interface SubGoalWithActions extends SubGoal {
  actions: Action[]
}

// Full plan with sub-goals and actions
export interface PlanWithDetails extends Plan {
  sub_goals: SubGoalWithActions[]
}

// Diagnostic with pillar scores
export interface DiagnosticWithScores extends Diagnostic {
  pillar_scores: PillarScore[]
}
