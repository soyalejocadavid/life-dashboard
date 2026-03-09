'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface QuestionMultipleChoiceProps {
  question: string
  options: string[]
  accentColor: string
  onAnswer: (optionIndex: number) => void
  delay?: number
}

export function QuestionMultipleChoice({
  question,
  options,
  accentColor,
  onAnswer,
  delay = 0,
}: QuestionMultipleChoiceProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  const handleSelect = (index: number) => {
    if (confirmed) return
    setSelected(index)
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
      className="space-y-3"
    >
      <p className="px-3 text-[15px] leading-relaxed text-foreground">
        {question}
      </p>

      <div className="space-y-2 px-3">
        {options.map((option, index) => (
          <motion.button
            key={index}
            onClick={() => handleSelect(index)}
            disabled={confirmed}
            aria-pressed={selected === index}
            whileTap={!confirmed ? { scale: 0.98 } : undefined}
            className={`w-full rounded-xl border px-4 py-3 text-left text-[14px] leading-relaxed transition-all duration-200 ${
              confirmed && selected !== index
                ? 'border-border/30 text-muted-foreground/50'
                : 'border-border text-foreground'
            }`}
            style={
              selected === index
                ? {
                    borderColor: accentColor,
                    backgroundColor: `${accentColor}15`,
                  }
                : undefined
            }
          >
            {option}
          </motion.button>
        ))}
      </div>

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
