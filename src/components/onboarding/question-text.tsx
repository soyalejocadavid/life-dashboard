'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface QuestionTextProps {
  question: string
  placeholder?: string
  accentColor: string
  onAnswer: (text: string) => void
  delay?: number
}

export function QuestionText({
  question,
  placeholder,
  accentColor,
  onAnswer,
  delay = 0,
}: QuestionTextProps) {
  const [text, setText] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  const handleConfirm = () => {
    if (!text.trim()) return
    setConfirmed(true)
    onAnswer(text.trim())
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

      <div className="px-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={confirmed}
          placeholder={placeholder}
          rows={3}
          aria-label={question}
          className="w-full resize-none rounded-xl border border-border bg-card px-4 py-3 text-[14px] leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 disabled:opacity-60"
          style={{ focusRingColor: accentColor } as React.CSSProperties}
          onFocus={(e) => {
            e.target.style.borderColor = accentColor
          }}
          onBlur={(e) => {
            e.target.style.borderColor = ''
          }}
        />
      </div>

      {text.trim().length > 0 && !confirmed && (
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
