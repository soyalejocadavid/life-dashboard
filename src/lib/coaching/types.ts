import type { ActionFrequency, PillarId } from '@/types'

// Input to the coaching engine
export interface CoachingInput {
  pillarScores: Record<PillarId, number>
  diagnosticResponses: Record<
    string,
    {
      pillarId: PillarId
      questionText: string
      questionType: string
      response: string | number | string[]
    }
  >
}

// Output from the coaching engine
export interface GeneratedPlan {
  centralGoal: string
  coachingRationale: string // Overall explanation of the plan
  subGoals: GeneratedSubGoal[]
}

export interface GeneratedSubGoal {
  pillarId: PillarId
  title: string
  currentScore: number
  targetScore: number
  rationale: string // Why this target was calibrated
  position: number // 1-8 in Open Window 64
  actions: GeneratedAction[]
}

export interface GeneratedAction {
  title: string
  frequency: ActionFrequency
  position: number // 1-8 within sub-goal
}

// Insight generated during onboarding
export interface CoachingInsight {
  text: string
  connectedPillars: PillarId[]
}
