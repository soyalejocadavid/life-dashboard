'use client'

import { motion } from 'framer-motion'
import { PILLAR_CONFIG } from '@/data/pillars'
import { PILLARS, type PillarId } from '@/types'
import { PillarRadar } from '@/components/radar/pillar-radar'

interface DiagnosticCompleteProps {
  scores: Record<PillarId, number>
  onContinue: () => void
}

export function DiagnosticComplete({
  scores,
  onContinue,
}: DiagnosticCompleteProps) {
  // Sort pillars by score (lowest first — most opportunity)
  const sortedPillars = [...PILLARS].sort(
    (a, b) => (scores[a] ?? 0) - (scores[b] ?? 0)
  )
  const average =
    PILLARS.reduce((sum, p) => sum + (scores[p] ?? 0), 0) / PILLARS.length

  return (
    <div className="flex min-h-svh flex-col items-center px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 text-center"
        >
          <h1 className="text-2xl font-bold tracking-tight">
            Tu diagnóstico de vida
          </h1>
          <p className="mt-1 text-muted-foreground">
            Puntaje promedio:{' '}
            <span className="font-semibold text-foreground">
              {average.toFixed(1)}/10
            </span>
          </p>
        </motion.div>

        {/* Radar chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center"
        >
          <PillarRadar scores={scores} size={320} showLabels={true} />
        </motion.div>

        {/* Pillar scores list */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 space-y-3"
        >
          {sortedPillars.map((pillarId, index) => {
            const config = PILLAR_CONFIG[pillarId]
            const score = scores[pillarId] ?? 0
            const percentage = score * 10

            return (
              <motion.div
                key={pillarId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.08 }}
                className="flex items-center gap-3"
              >
                <div
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: config.color }}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{config.name}</span>
                    <span
                      className="text-sm font-bold"
                      style={{ color: config.color }}
                    >
                      {score.toFixed(1)}
                    </span>
                  </div>
                  <div className="mt-1 h-1.5 w-full rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: config.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{
                        duration: 0.8,
                        delay: 0.8 + index * 0.08,
                        ease: 'easeOut',
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </motion.div>

        {/* Insight placeholder */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-8 rounded-xl border border-border/50 bg-card/50 p-4"
        >
          <p className="text-sm leading-relaxed text-muted-foreground">
            {/* Placeholder insight — will be replaced by AI coaching engine */}
            {average < 4
              ? 'Tu diagnóstico muestra que hay varias áreas con oportunidad significativa de crecimiento. No te preocupes — tener conciencia de dónde estás es el primer paso más valioso. Vamos a construir un plan realista y progresivo.'
              : average < 7
                ? 'Tu vida tiene una base sólida en algunos pilares, y hay áreas claras donde invertir energía puede generar un cambio importante. Vamos a crear un plan que potencie tus fortalezas y atienda lo que más necesita atención.'
                : 'Tus puntajes reflejan un nivel alto de bienestar general. El trabajo ahora es de refinamiento y profundización — llevar lo bueno a excelente. Vamos a diseñar un plan que te rete a tu siguiente nivel.'}
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="mt-8 flex justify-center pb-8"
        >
          <button
            onClick={onContinue}
            className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Generar mi plan de acción
          </button>
        </motion.div>
      </div>
    </div>
  )
}
