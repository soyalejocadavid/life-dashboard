'use client'

import { useCallback, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { DiagnosticFlow } from '@/components/onboarding/diagnostic-flow'
import { DiagnosticComplete } from '@/components/onboarding/diagnostic-complete'
import { PlanReview } from '@/components/onboarding/plan-review'
import { generateMockPlan } from '@/lib/coaching'
import { useAppStore } from '@/stores/app-store'
import { useAuth } from '@/hooks/use-auth'
import { saveOnboardingData } from '@/lib/supabase/data-service'
import type { GeneratedPlan } from '@/lib/coaching/types'
import type { PillarId } from '@/types'

async function generatePlanFromAPI(
  scores: Record<PillarId, number>,
  responses: Record<string, string | number | string[]>
): Promise<GeneratedPlan> {
  const res = await fetch('/api/coaching', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pillarScores: scores, responses }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `API error: ${res.status}`)
  }

  const data = await res.json()
  return data.plan as GeneratedPlan
}

type OnboardingPhase =
  | 'diagnostic'
  | 'results'
  | 'generating-plan'
  | 'plan-review'

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [phase, setPhase] = useState<OnboardingPhase>('diagnostic')
  const [diagnosticData, setDiagnosticData] = useState<{
    scores: Record<PillarId, number>
    responses: Record<string, string | number | string[]>
  } | null>(null)
  const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null)

  const handleDiagnosticComplete = useCallback(
    (data: {
      scores: Record<PillarId, number>
      responses: Record<string, string | number | string[]>
    }) => {
      setDiagnosticData(data)
      setPhase('results')

      // TODO: Persist diagnostic to Supabase
      // - Create diagnostic record
      // - Save pillar_scores
      // - Save diagnostic_responses
    },
    []
  )

  const handleGeneratePlan = useCallback(async () => {
    if (!diagnosticData) return
    setPhase('generating-plan')

    try {
      // Call real coaching engine API (Claude Sonnet)
      const plan = await generatePlanFromAPI(
        diagnosticData.scores,
        diagnosticData.responses
      )
      setGeneratedPlan(plan)
      setPhase('plan-review')
    } catch (err) {
      console.error('Coaching API failed, falling back to mock:', err)
      // Fallback to mock generator
      const plan = generateMockPlan({
        pillarScores: diagnosticData.scores,
        diagnosticResponses: {},
      })
      setGeneratedPlan(plan)
      setPhase('plan-review')
    }
  }, [diagnosticData])

  const handleConfirmPlan = useCallback(async () => {
    if (!generatedPlan || !diagnosticData) return

    // Persist plan and scores to Zustand store (localStorage)
    // This bridges onboarding → dashboard — without it, plan data is lost on navigation
    useAppStore.getState().setPlan(generatedPlan, diagnosticData.scores)

    // Also persist to Supabase when authenticated
    if (user) {
      try {
        await saveOnboardingData({
          userId: user.id,
          scores: diagnosticData.scores,
          responses: {},
          plan: {
            centralGoal: generatedPlan.centralGoal,
            coachingRationale: generatedPlan.coachingRationale,
            subGoals: generatedPlan.subGoals.map((sg) => ({
              pillarId: sg.pillarId,
              title: sg.title,
              currentScore: sg.currentScore,
              targetScore: sg.targetScore,
              rationale: sg.rationale,
              position: sg.position,
              actions: sg.actions.map((a) => ({
                title: a.title,
                frequency: a.frequency,
                position: a.position,
              })),
            })),
          },
        })
      } catch (err) {
        console.error('Failed to save onboarding to Supabase:', err)
        // Continue anyway — local data is saved
      }
    }

    router.push('/dashboard')
  }, [router, generatedPlan, diagnosticData, user])

  return (
    <AnimatePresence mode="wait">
      {phase === 'diagnostic' && (
        <motion.div
          key="diagnostic"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <DiagnosticFlow onComplete={handleDiagnosticComplete} />
        </motion.div>
      )}

      {phase === 'results' && diagnosticData && (
        <motion.div
          key="results"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <DiagnosticComplete
            scores={diagnosticData.scores}
            onContinue={handleGeneratePlan}
          />
        </motion.div>
      )}

      {phase === 'generating-plan' && (
        <motion.div
          key="generating"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex min-h-svh flex-col items-center justify-center gap-4 p-6"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent"
          />
          <p className="text-center text-muted-foreground">
            Generando tu plan personalizado...
          </p>
          <p className="text-center text-xs text-muted-foreground/60">
            El coaching engine está diseñando tu meta central, 8 sub-metas y 64
            acciones usando el método Harada
          </p>
        </motion.div>
      )}

      {phase === 'plan-review' && generatedPlan && diagnosticData && (
        <motion.div
          key="plan-review"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <PlanReview
            plan={generatedPlan}
            scores={diagnosticData.scores}
            onConfirm={handleConfirmPlan}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
