'use client'

import { Flame, CheckCircle2, Target } from 'lucide-react'
import { motion } from 'framer-motion'

interface QuickStatsProps {
  streak: number
  completedToday: number
  totalToday: number
}

export function QuickStats({
  streak,
  completedToday,
  totalToday,
}: QuickStatsProps) {
  const streakColor =
    streak >= 30
      ? 'text-violet-500 dark:text-violet-400'
      : streak >= 7
        ? 'text-emerald-500 dark:text-emerald-400'
        : streak >= 3
          ? 'text-amber-500 dark:text-amber-400'
          : 'text-muted-foreground'

  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Streak */}
      <div className="flex flex-col items-center gap-1 rounded-xl border border-border/50 bg-card p-3">
        <Flame className={`h-5 w-5 ${streakColor}`} />
        <motion.span
          key={streak}
          initial={{ scale: 1.2 }}
          animate={{ scale: 1 }}
          className="text-lg font-bold tabular-nums"
        >
          {streak}
        </motion.span>
        <span className="text-[11px] text-muted-foreground">
          {streak === 1 ? 'día' : 'días'}
        </span>
      </div>

      {/* Completed today */}
      <div className="flex flex-col items-center gap-1 rounded-xl border border-border/50 bg-card p-3">
        <CheckCircle2 className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
        <span className="text-lg font-bold tabular-nums">
          {completedToday}
          <span className="text-sm font-normal text-muted-foreground">
            /{totalToday}
          </span>
        </span>
        <span className="text-[11px] text-muted-foreground">Hoy</span>
      </div>

      {/* Total actions */}
      <div className="flex flex-col items-center gap-1 rounded-xl border border-border/50 bg-card p-3">
        <Target className="h-5 w-5 text-blue-500 dark:text-blue-400" />
        <span className="text-lg font-bold tabular-nums">64</span>
        <span className="text-[11px] text-muted-foreground">Acciones</span>
      </div>
    </div>
  )
}
