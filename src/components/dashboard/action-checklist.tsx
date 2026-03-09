'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { PillarGroup } from '@/hooks/use-todays-actions'
import type { ActionFrequency } from '@/types'

// ============================================================================
// Frequency badge config
// ============================================================================

const FREQ_CONFIG: Record<
  ActionFrequency,
  { label: string; className: string }
> = {
  daily: { label: 'Diario', className: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
  weekly: { label: 'Semanal', className: 'bg-blue-500/15 text-blue-600 dark:text-blue-400' },
  monthly: { label: 'Mensual', className: 'bg-amber-500/15 text-amber-600 dark:text-amber-400' },
  quarterly: {
    label: 'Trimestral',
    className: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
  },
}

// ============================================================================
// Main component
// ============================================================================

interface ActionChecklistProps {
  groups: PillarGroup[]
  onToggle: (actionId: string, frequency: ActionFrequency, periodStart: string) => void
}

export function ActionChecklist({ groups, onToggle }: ActionChecklistProps) {
  if (groups.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        No hay acciones para hoy.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {groups.map((group, groupIdx) => (
        <motion.div
          key={group.pillarId}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: groupIdx * 0.05 }}
        >
          {/* Pillar header */}
          <div className="mb-3 flex items-center gap-2">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: group.pillarColor }}
            />
            <span className="flex-1 text-sm font-semibold">
              {group.pillarName}
            </span>
            <span className="text-xs tabular-nums text-muted-foreground">
              {group.completedCount}/{group.totalCount}
            </span>
          </div>

          {/* Mini progress bar */}
          <div className="mb-3 h-1 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: group.pillarColor }}
              initial={{ width: 0 }}
              animate={{
                width:
                  group.totalCount > 0
                    ? `${(group.completedCount / group.totalCount) * 100}%`
                    : '0%',
              }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          {/* Actions */}
          <div className="space-y-1">
            {group.actions.map((action) => (
              <ActionItem
                key={action.actionId}
                actionId={action.actionId}
                title={action.title}
                frequency={action.frequency}
                isChecked={action.isChecked}
                periodStart={action.periodStart}
                pillarColor={group.pillarColor}
                onToggle={onToggle}
              />
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

// ============================================================================
// Action item with animated checkbox
// ============================================================================

interface ActionItemProps {
  actionId: string
  title: string
  frequency: ActionFrequency
  isChecked: boolean
  periodStart: string
  pillarColor: string
  onToggle: (actionId: string, frequency: ActionFrequency, periodStart: string) => void
}

function ActionItem({
  actionId,
  title,
  frequency,
  isChecked,
  periodStart,
  pillarColor,
  onToggle,
}: ActionItemProps) {
  const freq = FREQ_CONFIG[frequency]

  const handleToggle = () => {
    onToggle(actionId, frequency, periodStart)
  }

  return (
    <motion.button
      onClick={handleToggle}
      whileTap={{ scale: 0.98 }}
      aria-label={`${isChecked ? 'Desmarcar' : 'Marcar'}: ${title}`}
      aria-pressed={isChecked}
      className="flex w-full items-start gap-3 rounded-lg px-2 py-2.5 text-left transition-colors hover:bg-muted/50"
    >
      {/* Animated checkbox */}
      <div className="mt-0.5 flex-shrink-0">
        <motion.div
          className="flex h-5 w-5 items-center justify-center rounded-full border-2"
          style={{
            borderColor: pillarColor,
            backgroundColor: isChecked ? pillarColor : 'transparent',
          }}
          animate={{
            scale: isChecked ? [1, 1.15, 1] : 1,
          }}
          transition={{ duration: 0.25 }}
        >
          <AnimatePresence>
            {isChecked && (
              <motion.svg
                viewBox="0 0 24 24"
                className="h-3 w-3"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.path
                  d="M5 13l4 4L19 7"
                  fill="none"
                  stroke="#f5f5f4"
                  strokeWidth={3}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.25, delay: 0.05 }}
                />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Title + frequency badge */}
      <div className="flex-1 min-w-0">
        <motion.span
          className={`block text-[13px] leading-snug ${
            isChecked
              ? 'text-muted-foreground line-through'
              : 'text-foreground'
          }`}
          animate={{ opacity: isChecked ? 0.5 : 1 }}
          transition={{ duration: 0.2 }}
        >
          {title}
        </motion.span>
      </div>

      {/* Frequency badge — only for non-daily */}
      {frequency !== 'daily' && (
        <span
          className={`mt-0.5 flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${freq.className}`}
        >
          {freq.label}
        </span>
      )}
    </motion.button>
  )
}
