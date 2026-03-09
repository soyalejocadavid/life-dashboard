'use client'

import { motion } from 'framer-motion'
import type { PillarId } from '@/types'
import type { GeneratedPlan } from '@/lib/coaching/types'
import { OpenWindowMatrix } from '@/components/open-window/open-window-matrix'
import { PillarRadar } from '@/components/radar/pillar-radar'

interface PlanReviewProps {
  plan: GeneratedPlan
  scores: Record<PillarId, number>
  onConfirm: () => void
}

export function PlanReview({ plan, scores, onConfirm }: PlanReviewProps) {
  // Build target scores map from sub-goals
  const targetScores: Partial<Record<PillarId, number>> = {}
  plan.subGoals.forEach((sg) => {
    if (!targetScores[sg.pillarId] || sg.targetScore > targetScores[sg.pillarId]!) {
      targetScores[sg.pillarId] = sg.targetScore
    }
  })

  const totalActions = plan.subGoals.reduce(
    (sum, sg) => sum + sg.actions.length,
    0
  )

  return (
    <div className="flex min-h-svh flex-col px-4 py-8">
      <div className="mx-auto w-full max-w-lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center"
        >
          <h1 className="text-2xl font-bold tracking-tight">
            Tu Plan de Acción
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Método Harada — Open Window 64
          </p>
        </motion.div>

        {/* Central Goal */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4"
        >
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-primary/70">
            Meta Central a 1 Año
          </p>
          <p className="text-sm font-medium leading-relaxed">
            {plan.centralGoal}
          </p>
        </motion.div>

        {/* Coach rationale */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6 flex gap-3"
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500">
            <span className="text-xs font-bold text-gray-50">LD</span>
          </div>
          <div className="rounded-2xl rounded-tl-md bg-card px-4 py-3 text-[13px] leading-relaxed text-muted-foreground">
            {plan.coachingRationale}
          </div>
        </motion.div>

        {/* Radar: Current vs Target */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-2 flex flex-col items-center"
        >
          <div className="relative">
            {/* Target scores radar (faded) */}
            <div className="absolute inset-0 opacity-20">
              <PillarRadar
                scores={targetScores as Record<PillarId, number>}
                size={240}
                showLabels={false}
                animated={false}
              />
            </div>
            {/* Current scores radar */}
            <PillarRadar scores={scores} size={240} showLabels={true} />
          </div>
          <div className="mt-1 flex items-center gap-4 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-violet-500" />
              Actual
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-violet-500/20" />
              Meta a 1 año
            </span>
          </div>
        </motion.div>

        {/* Open Window 64 Matrix */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <h2 className="mb-3 text-center text-sm font-semibold">
            Open Window 64
          </h2>
          <p className="mb-4 text-center text-xs text-muted-foreground">
            Toca cualquier sub-meta para ver sus 8 acciones
          </p>
          <OpenWindowMatrix plan={plan} interactive={true} />
        </motion.div>

        {/* Stats summary */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mb-8 flex justify-center gap-6"
        >
          <div className="text-center">
            <p className="text-lg font-bold">{plan.subGoals.length}</p>
            <p className="text-[11px] text-muted-foreground">Sub-metas</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">{totalActions}</p>
            <p className="text-[11px] text-muted-foreground">Acciones</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold">1 año</p>
            <p className="text-[11px] text-muted-foreground">Horizonte</p>
          </div>
        </motion.div>

        {/* Confirm CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex flex-col gap-3 pb-8"
        >
          <button
            onClick={onConfirm}
            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Confirmar plan y empezar
          </button>
          <p className="text-center text-[11px] text-muted-foreground">
            Podrás ajustar acciones y metas en cualquier momento
          </p>
        </motion.div>
      </div>
    </div>
  )
}
