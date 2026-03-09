'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface QuestionScaleProps {
  question: string
  labels: { min: string; max: string }
  accentColor: string
  onAnswer: (value: number) => void
  delay?: number
}

export function QuestionScale({
  question,
  labels,
  accentColor,
  onAnswer,
  delay = 0,
}: QuestionScaleProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  const handleSelect = (value: number) => {
    if (confirmed) return
    setSelected(value)
  }

  const handleConfirm = () => {
    if (selected === null) return
    setConfirmed(true)
    onAnswer(selected)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="space-y-4"
    >
      <p className="px-3 text-[15px] leading-relaxed text-foreground">
        {question}
      </p>

      {/* Scale selector */}
      <div className="px-3">
        <div className="flex justify-between gap-1.5">
          {Array.from({ length: 10 }, (_, i) => i + 1).map((value) => (
            <button
              key={value}
              onClick={() => handleSelect(value)}
              disabled={confirmed}
              aria-label={`Puntuación ${value} de 10`}
              aria-pressed={selected === value}
              className="relative flex h-10 w-full items-center justify-center rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor:
                  selected === value
                    ? accentColor
                    : selected !== null && value <= selected
                      ? `${accentColor}20`
                      : undefined,
                color: selected === value ? '#f5f5f4' : undefined,
              }}
            >
              <span
                className={
                  selected === null || (selected !== null && value > selected)
                    ? 'text-muted-foreground'
                    : ''
                }
              >
                {value}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-2 flex justify-between px-1">
          <span className="text-[11px] text-muted-foreground">
            {labels.min}
          </span>
          <span className="text-[11px] text-muted-foreground">
            {labels.max}
          </span>
        </div>
      </div>

      {/* Confirm button */}
      {selected !== null && !confirmed && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-end px-3"
        >
          <button
            onClick={handleConfirm}
            className="rounded-full px-5 py-2 text-sm font-medium text-gray-50 transition-colors"
            style={{ backgroundColor: accentColor }}
          >
            Continuar
          </button>
        </motion.div>
      )}
    </motion.div>
  )
}
