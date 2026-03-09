'use client'

import { motion } from 'framer-motion'
import { PILLAR_CONFIG, PILLAR_LIST } from '@/data/pillars'
import type { PillarId } from '@/types'

interface PillarRadarProps {
  scores: Partial<Record<PillarId, number>>
  size?: number
  animated?: boolean
  showLabels?: boolean
  activePillar?: PillarId | null
}

export function PillarRadar({
  scores,
  size = 280,
  animated = true,
  showLabels = true,
  activePillar = null,
}: PillarRadarProps) {
  const center = size / 2
  const radius = size * 0.35
  const pillars = PILLAR_LIST
  const angleStep = (2 * Math.PI) / pillars.length
  // Start from top (12 o'clock = -π/2)
  const startAngle = -Math.PI / 2

  // Generate points for a given set of scores
  function getPoints(pillarScores: Partial<Record<PillarId, number>>): string {
    return pillars
      .map((pillar, i) => {
        const score = pillarScores[pillar.id] ?? 0
        const normalizedScore = score / 10
        const angle = startAngle + i * angleStep
        const x = center + radius * normalizedScore * Math.cos(angle)
        const y = center + radius * normalizedScore * Math.sin(angle)
        return `${x},${y}`
      })
      .join(' ')
  }

  // Generate grid rings
  function getGridRing(level: number): string {
    const normalizedLevel = level / 10
    return pillars
      .map((_, i) => {
        const angle = startAngle + i * angleStep
        const x = center + radius * normalizedLevel * Math.cos(angle)
        const y = center + radius * normalizedLevel * Math.sin(angle)
        return `${x},${y}`
      })
      .join(' ')
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="select-none"
      role="img"
      aria-label="Gráfico radar de pilares de vida"
    >
      {/* Background grid rings */}
      {[2, 4, 6, 8, 10].map((level) => (
        <polygon
          key={`grid-${level}`}
          points={getGridRing(level)}
          fill="none"
          stroke="currentColor"
          strokeWidth={level === 10 ? 1.5 : 0.75}
          className="text-border"
          opacity={level === 10 ? 0.6 : 0.35}
        />
      ))}

      {/* Axis lines from center to each vertex */}
      {pillars.map((_, i) => {
        const angle = startAngle + i * angleStep
        const x = center + radius * Math.cos(angle)
        const y = center + radius * Math.sin(angle)
        return (
          <line
            key={`axis-${i}`}
            x1={center}
            y1={center}
            x2={x}
            y2={y}
            stroke="currentColor"
            strokeWidth={0.75}
            className="text-border"
            opacity={0.45}
          />
        )
      })}

      {/* Score polygon */}
      {Object.keys(scores).length > 0 && (
        <motion.polygon
          points={getPoints(scores)}
          fill="url(#radarGradient)"
          stroke="url(#radarStroke)"
          strokeWidth={2}
          strokeLinejoin="round"
          initial={animated ? { opacity: 0, scale: 0.8 } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      )}

      {/* Score dots on vertices */}
      {pillars.map((pillar, i) => {
        const score = scores[pillar.id]
        if (score === undefined) return null
        const angle = startAngle + i * angleStep
        const normalizedScore = score / 10
        const x = center + radius * normalizedScore * Math.cos(angle)
        const y = center + radius * normalizedScore * Math.sin(angle)
        const isActive = activePillar === pillar.id

        return (
          <motion.circle
            key={`dot-${pillar.id}`}
            cx={x}
            cy={y}
            r={isActive ? 5 : 3.5}
            fill={PILLAR_CONFIG[pillar.id].color}
            className="stroke-background"
            strokeWidth={2}
            initial={animated ? { opacity: 0, scale: 0 } : false}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 * i }}
          />
        )
      })}

      {/* Labels */}
      {showLabels &&
        pillars.map((pillar, i) => {
          const angle = startAngle + i * angleStep
          const labelRadius = radius + 24
          const x = center + labelRadius * Math.cos(angle)
          const y = center + labelRadius * Math.sin(angle)
          const score = scores[pillar.id]
          const isActive = activePillar === pillar.id

          return (
            <g key={`label-${pillar.id}`}>
              <text
                x={x}
                y={y - 6}
                textAnchor="middle"
                dominantBaseline="middle"
                className={`text-[11px] font-medium ${
                  isActive
                    ? 'fill-foreground'
                    : score !== undefined
                      ? 'fill-muted-foreground'
                      : 'fill-muted-foreground/40'
                }`}
              >
                {PILLAR_CONFIG[pillar.id].name}
              </text>
              {score !== undefined && (
                <text
                  x={x}
                  y={y + 8}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-[11px] font-bold"
                  fill={PILLAR_CONFIG[pillar.id].color}
                >
                  {score.toFixed(1)}
                </text>
              )}
            </g>
          )
        })}

      {/* Gradient definitions */}
      <defs>
        <linearGradient id="radarGradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.15} />
          <stop offset="50%" stopColor="#3B82F6" stopOpacity={0.1} />
          <stop offset="100%" stopColor="#EC4899" stopOpacity={0.15} />
        </linearGradient>
        <linearGradient id="radarStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="50%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
      </defs>
    </svg>
  )
}
