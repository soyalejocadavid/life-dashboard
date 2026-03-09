'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { OpenWindowMatrix } from '@/components/open-window/open-window-matrix'
import { PillarRadar } from '@/components/radar/pillar-radar'
import { useAppStore } from '@/stores/app-store'
import { useDashboardData } from '@/hooks/use-dashboard-data'
import type { PillarId } from '@/types'

export default function PlanPage() {
  const { plan, scores: confirmedScores, isLoading } = useDashboardData()
  const hasHydrated = useAppStore((s) => s._hasHydrated)

  // Avoid hydration mismatch
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted || !hasHydrated || isLoading) {
    return <PlanSkeleton />
  }

  if (!plan || !confirmedScores) {
    return <PlanEmptyState />
  }

  // Build target scores from sub-goals
  const targetScores: Partial<Record<PillarId, number>> = {}
  for (const sg of plan.subGoals) {
    const existing = targetScores[sg.pillarId]
    if (!existing || sg.targetScore > existing) {
      targetScores[sg.pillarId] = sg.targetScore
    }
  }

  const totalActions = plan.subGoals.reduce(
    (sum, sg) => sum + sg.actions.length,
    0
  )

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 text-center"
      >
        <h1 className="text-2xl font-bold tracking-tight">Mi Plan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Open Window 64 — Método Harada
        </p>
      </motion.div>

      {/* Central Goal card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4"
      >
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-primary/70">
          Meta Central a 1 Año
        </p>
        <p className="text-sm font-medium leading-relaxed">
          {plan.centralGoal}
        </p>
      </motion.div>

      {/* Dual Radar: current vs target */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-2 flex flex-col items-center"
      >
        <div className="relative">
          {/* Target scores as faint background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-20">
            <PillarRadar
              scores={targetScores as Record<PillarId, number>}
              size={220}
              showLabels={false}
              animated={false}
            />
          </div>
          {/* Current scores as main */}
          <PillarRadar
            scores={confirmedScores as Record<PillarId, number>}
            size={220}
            showLabels
          />
        </div>
        <div className="mt-1 flex items-center gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-primary" />
            Actual
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-primary/20" />
            Meta a 1 año
          </span>
        </div>
      </motion.div>

      {/* Open Window 64 Matrix */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <OpenWindowMatrix plan={plan} interactive />
      </motion.div>

      {/* Stats footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 flex justify-center gap-8 pb-4"
      >
        <div className="text-center">
          <p className="text-xl font-bold">{plan.subGoals.length}</p>
          <p className="text-[11px] text-muted-foreground">Sub-metas</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold">{totalActions}</p>
          <p className="text-[11px] text-muted-foreground">Acciones</p>
        </div>
        <div className="text-center">
          <p className="text-xl font-bold">1 año</p>
          <p className="text-[11px] text-muted-foreground">Horizonte</p>
        </div>
      </motion.div>
    </div>
  )
}

// ============================================================================
// Empty + Skeleton states
// ============================================================================

function PlanEmptyState() {
  return (
    <div className="flex min-h-[80svh] flex-col items-center justify-center gap-4 p-6">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <span className="text-3xl">🎯</span>
      </div>
      <h2 className="text-lg font-semibold">Sin plan activo</h2>
      <p className="max-w-xs text-center text-sm text-muted-foreground">
        Completa el diagnóstico para generar tu plan Open Window 64
        personalizado.
      </p>
      <Link
        href="/onboarding"
        className="mt-2 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Comenzar diagnóstico
      </Link>
    </div>
  )
}

function PlanSkeleton() {
  return (
    <div className="mx-auto w-full max-w-lg animate-pulse px-4 py-6">
      <div className="mb-4 flex flex-col items-center gap-2">
        <div className="h-7 w-32 rounded bg-muted" />
        <div className="h-4 w-52 rounded bg-muted" />
      </div>
      <div className="mb-6 h-20 rounded-xl bg-muted" />
      <div className="mb-6 flex justify-center">
        <div className="h-[220px] w-[220px] rounded-full bg-muted" />
      </div>
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  )
}
