'use client'

import { motion } from 'framer-motion'
import { PILLAR_CONFIG } from '@/data/pillars'
import type { PillarId } from '@/types'
import { PILLARS } from '@/types'

interface PillarProgressProps {
  currentIndex: number
  completedPillars: PillarId[]
}

export function PillarProgress({
  currentIndex,
  completedPillars,
}: PillarProgressProps) {
  return (
    <div className="flex items-center justify-center gap-2 px-4 py-3">
      {PILLARS.map((pillarId, index) => {
        const config = PILLAR_CONFIG[pillarId]
        const isCompleted = completedPillars.includes(pillarId)
        const isCurrent = index === currentIndex
        const isFuture = index > currentIndex

        return (
          <motion.div
            key={pillarId}
            className="relative flex flex-col items-center"
            initial={false}
            animate={{
              scale: isCurrent ? 1.15 : 1,
              opacity: isFuture ? 0.3 : 1,
            }}
            transition={{ duration: 0.3 }}
          >
            <div
              className={`h-2 w-8 rounded-full transition-colors duration-500 ${
                !isCompleted && !isCurrent ? 'bg-muted' : ''
              }`}
              style={{
                backgroundColor:
                  isCompleted || isCurrent ? config.color : undefined,
              }}
            />
          </motion.div>
        )
      })}
    </div>
  )
}
