'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { PILLAR_CONFIG } from '@/data/pillars'
import type { GeneratedPlan, GeneratedSubGoal } from '@/lib/coaching/types'

interface OpenWindowMatrixProps {
  plan: GeneratedPlan
  interactive?: boolean
}

export function OpenWindowMatrix({
  plan,
  interactive = true,
}: OpenWindowMatrixProps) {
  const [selectedSubGoal, setSelectedSubGoal] =
    useState<GeneratedSubGoal | null>(null)

  // The Open Window 64 is a 3x3 grid:
  // Positions 1-3 on top, 4 (center = central goal), 5-6 middle, 7-8 bottom
  // But for a cleaner layout, we use a radial layout:
  // Center = Central Goal, 8 sub-goals around it in a grid

  // Grid layout: 3x3 with center being the central goal
  const gridPositions = [
    plan.subGoals[0], // top-left
    plan.subGoals[1], // top-center
    plan.subGoals[2], // top-right
    plan.subGoals[3], // middle-left
    null, // center = central goal
    plan.subGoals[4], // middle-right
    plan.subGoals[5], // bottom-left
    plan.subGoals[6], // bottom-center
    plan.subGoals[7], // bottom-right (integrative)
  ]

  return (
    <div className="w-full">
      {/* Matrix grid */}
      <div className="grid grid-cols-3 gap-2">
        {gridPositions.map((subGoal, index) => {
          if (index === 4) {
            // Center cell — Central Goal
            return (
              <motion.div
                key="central"
                className="flex min-h-[100px] items-center justify-center rounded-xl border-2 border-primary/30 bg-primary/10 p-2"
                whileHover={interactive ? { scale: 1.02 } : undefined}
              >
                <p className="text-center text-[11px] font-semibold leading-tight text-primary">
                  {plan.centralGoal}
                </p>
              </motion.div>
            )
          }

          if (!subGoal) return <div key={`empty-${index}`} />

          const pillarConfig = PILLAR_CONFIG[subGoal.pillarId]
          const isSelected = selectedSubGoal?.position === subGoal.position
          const completedActions = 0 // Will come from check-ins
          const totalActions = subGoal.actions.length

          return (
            <motion.button
              key={subGoal.position}
              onClick={() =>
                interactive &&
                setSelectedSubGoal(isSelected ? null : subGoal)
              }
              aria-label={`Sub-meta: ${subGoal.title}`}
              aria-expanded={isSelected}
              className={`relative flex min-h-[100px] flex-col items-center justify-center rounded-xl border p-2 text-center transition-all ${
                isSelected
                  ? 'ring-2'
                  : 'border-border/50 hover:border-border'
              }`}
              style={{
                borderColor: isSelected ? pillarConfig.color : undefined,
                outlineColor: isSelected ? pillarConfig.color : undefined,
                backgroundColor: isSelected
                  ? `${pillarConfig.color}10`
                  : undefined,
                // @ts-expect-error -- Tailwind ring via CSS custom property
                '--tw-ring-color': isSelected ? pillarConfig.color : undefined,
              }}
              whileHover={interactive ? { scale: 1.02 } : undefined}
              whileTap={interactive ? { scale: 0.98 } : undefined}
            >
              {/* Pillar color dot */}
              <div
                className="mb-1 h-2 w-2 rounded-full"
                style={{ backgroundColor: pillarConfig.color }}
              />
              {/* Score (below dot, before title) */}
              <div className="mb-1 flex items-center gap-1">
                <span
                  className="text-[11px] font-bold"
                  style={{ color: pillarConfig.color }}
                >
                  {subGoal.currentScore.toFixed(1)}
                </span>
                <span className="text-[11px] text-muted-foreground">→</span>
                <span className="text-[11px] font-bold text-foreground">
                  {subGoal.targetScore.toFixed(1)}
                </span>
              </div>
              {/* Sub-goal title (full text, no truncation) */}
              <p className="text-[11px] font-medium leading-tight text-foreground">
                {subGoal.title}
              </p>
              {/* Mini progress */}
              <div className="mt-1 h-1 w-full rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${totalActions > 0 ? (completedActions / totalActions) * 100 : 0}%`,
                    backgroundColor: pillarConfig.color,
                  }}
                />
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Expanded sub-goal detail */}
      <AnimatePresence>
        {selectedSubGoal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 overflow-hidden"
          >
            <SubGoalDetail
              subGoal={selectedSubGoal}
              onClose={() => setSelectedSubGoal(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ============================================================================
// Sub-goal detail panel showing the 8 actions
// ============================================================================

function SubGoalDetail({
  subGoal,
  onClose,
}: {
  subGoal: GeneratedSubGoal
  onClose: () => void
}) {
  const pillarConfig = PILLAR_CONFIG[subGoal.pillarId]

  const frequencyLabels: Record<string, string> = {
    daily: 'Diario',
    weekly: 'Semanal',
    monthly: 'Mensual',
    quarterly: 'Trimestral',
  }

  const frequencyColors: Record<string, string> = {
    daily: 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400',
    weekly: 'bg-blue-500/20 text-blue-600 dark:text-blue-400',
    monthly: 'bg-amber-500/20 text-amber-600 dark:text-amber-400',
    quarterly: 'bg-purple-500/20 text-purple-600 dark:text-purple-400',
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: pillarConfig.color }}
            />
            <span className="text-xs font-medium text-muted-foreground">
              {pillarConfig.name}
            </span>
          </div>
          <h3 className="text-sm font-semibold">{subGoal.title}</h3>
        </div>
        <button
          onClick={onClose}
          aria-label="Cerrar detalle de sub-meta"
          className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Rationale */}
      <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
        {subGoal.rationale}
      </p>

      {/* Score targets */}
      <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Actual:</span>
          <span
            className="text-sm font-bold"
            style={{ color: pillarConfig.color }}
          >
            {subGoal.currentScore.toFixed(1)}
          </span>
        </div>
        <div className="h-px flex-1 bg-border" />
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Meta:</span>
          <span className="text-sm font-bold text-foreground">
            {subGoal.targetScore.toFixed(1)}
          </span>
        </div>
      </div>

      {/* 8 Actions */}
      <div className="space-y-2">
        {subGoal.actions.map((action) => (
          <div
            key={action.position}
            className="flex items-center gap-3 rounded-lg bg-background/50 px-3 py-2"
          >
            <span className="text-[11px] font-bold text-muted-foreground">
              {action.position}
            </span>
            <p className="flex-1 text-xs leading-relaxed">{action.title}</p>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${frequencyColors[action.frequency]}`}
            >
              {frequencyLabels[action.frequency]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
