'use client'

import { motion } from 'framer-motion'

interface CoachMessageProps {
  message: string
  delay?: number
}

export function CoachMessage({ message, delay = 0 }: CoachMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="flex gap-3"
    >
      {/* Coach avatar */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-blue-500">
        <span className="text-xs font-bold text-gray-50">LD</span>
      </div>
      {/* Message bubble */}
      <div className="max-w-[85%] rounded-2xl rounded-tl-md bg-card px-4 py-3 text-[15px] leading-relaxed text-foreground">
        {message}
      </div>
    </motion.div>
  )
}
