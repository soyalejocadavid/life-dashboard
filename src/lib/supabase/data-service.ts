import { createClient } from './client'
import type {
  PillarId,
  ActionFrequency,
  PlanWithDetails,
  JournalEntry,
  ActionCheckin,
} from '@/types'

const supabase = () => createClient()

// ============================================================================
// Onboarding — save diagnostic + plan in one flow
// ============================================================================

export async function saveOnboardingData(params: {
  userId: string
  scores: Record<PillarId, number>
  responses: Record<
    string,
    {
      pillarId: PillarId
      questionType: 'scale' | 'multiple-choice' | 'text'
      response: string | number | string[]
    }
  >
  plan: {
    centralGoal: string
    coachingRationale: string
    subGoals: Array<{
      pillarId: PillarId
      title: string
      currentScore: number
      targetScore: number
      rationale: string
      position: number
      actions: Array<{
        title: string
        frequency: ActionFrequency
        position: number
      }>
    }>
  }
}) {
  const db = supabase()
  const { userId, scores, responses, plan } = params

  // 1. Create diagnostic
  const { data: diagnostic, error: diagError } = await db
    .from('diagnostics')
    .insert({
      user_id: userId,
      status: 'completed',
      current_pillar_index: 7,
      completed_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (diagError || !diagnostic) throw diagError ?? new Error('Failed to create diagnostic')

  // 2. Insert pillar scores
  const scoreRows = Object.entries(scores).map(([pillarId, score]) => ({
    diagnostic_id: diagnostic.id,
    pillar_id: pillarId as PillarId,
    score,
  }))

  const { error: scoresError } = await db.from('pillar_scores').insert(scoreRows)
  if (scoresError) throw scoresError

  // 3. Insert diagnostic responses
  const responseRows = Object.entries(responses).map(([questionId, r]) => ({
    diagnostic_id: diagnostic.id,
    pillar_id: r.pillarId,
    question_id: questionId,
    question_type: r.questionType,
    response_text: typeof r.response === 'string' ? r.response : null,
    response_number: typeof r.response === 'number' ? r.response : null,
    response_array: Array.isArray(r.response) ? r.response : null,
  }))

  if (responseRows.length > 0) {
    const { error: respError } = await db.from('diagnostic_responses').insert(responseRows)
    if (respError) throw respError
  }

  // 4. Create plan
  const { data: planRecord, error: planError } = await db
    .from('plans')
    .insert({
      user_id: userId,
      diagnostic_id: diagnostic.id,
      central_goal: plan.centralGoal,
      coaching_rationale: plan.coachingRationale,
      status: 'confirmed',
      confirmed_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (planError || !planRecord) throw planError ?? new Error('Failed to create plan')

  // 5. Insert sub-goals and collect IDs
  for (const sg of plan.subGoals) {
    const { data: subGoal, error: sgError } = await db
      .from('sub_goals')
      .insert({
        plan_id: planRecord.id,
        pillar_id: sg.pillarId,
        title: sg.title,
        current_score: sg.currentScore,
        target_score: sg.targetScore,
        rationale: sg.rationale,
        position: sg.position,
      })
      .select('id')
      .single()

    if (sgError || !subGoal) throw sgError ?? new Error('Failed to create sub-goal')

    // 6. Insert actions for this sub-goal
    const actionRows = sg.actions.map((a) => ({
      sub_goal_id: subGoal.id,
      title: a.title,
      frequency: a.frequency,
      position: a.position,
      is_active: true,
    }))

    const { error: actError } = await db.from('actions').insert(actionRows)
    if (actError) throw actError
  }

  // 7. Mark onboarding complete
  const { error: profileError } = await db
    .from('profiles')
    .update({ has_completed_onboarding: true })
    .eq('id', userId)

  if (profileError) throw profileError

  return { diagnosticId: diagnostic.id, planId: planRecord.id }
}

// ============================================================================
// Plan — fetch active plan with sub-goals & actions
// ============================================================================

export async function getActivePlan(userId: string): Promise<PlanWithDetails | null> {
  const db = supabase()

  const { data: plan, error } = await db
    .from('plans')
    .select(`
      *,
      sub_goals (
        *,
        actions (*)
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'confirmed')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw error
  if (!plan) return null

  // Sort sub_goals by position, actions by position
  plan.sub_goals.sort((a: { position: number }, b: { position: number }) => a.position - b.position)
  for (const sg of plan.sub_goals) {
    sg.actions.sort((a: { position: number }, b: { position: number }) => a.position - b.position)
  }

  return plan as PlanWithDetails
}

// ============================================================================
// Check-ins
// ============================================================================

export async function getCheckins(
  userId: string,
  periodStart: string
): Promise<ActionCheckin[]> {
  const db = supabase()

  const { data, error } = await db
    .from('action_checkins')
    .select('*')
    .eq('user_id', userId)
    .gte('period_start', periodStart)

  if (error) throw error
  return (data ?? []) as ActionCheckin[]
}

export async function upsertCheckin(params: {
  userId: string
  actionId: string // UUID from DB
  completed: boolean
  periodType: ActionFrequency
  periodStart: string
}): Promise<void> {
  const db = supabase()

  const { error } = await db
    .from('action_checkins')
    .upsert(
      {
        user_id: params.userId,
        action_id: params.actionId,
        completed: params.completed,
        period_type: params.periodType,
        period_start: params.periodStart,
        checked_at: params.completed ? new Date().toISOString() : null,
      },
      {
        onConflict: 'user_id,action_id,period_type,period_start',
      }
    )

  if (error) throw error
}

// ============================================================================
// Journal
// ============================================================================

export async function getJournalEntries(userId: string): Promise<JournalEntry[]> {
  const db = supabase()

  const { data, error } = await db
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false })

  if (error) throw error
  return (data ?? []) as JournalEntry[]
}

export async function upsertJournalEntry(params: {
  userId: string
  content: string
  date: string
}): Promise<JournalEntry> {
  const db = supabase()

  const { data, error } = await db
    .from('journal_entries')
    .upsert(
      {
        user_id: params.userId,
        content: params.content,
        date: params.date,
      },
      {
        onConflict: 'user_id,date',
      }
    )
    .select()
    .single()

  if (error) throw error
  return data as JournalEntry
}
