'use client'

import { motion } from 'framer-motion'
import type { Quote } from '@/data/quotes'

interface QuoteCardProps {
  quote: Quote
  accentColor: string
  delay?: number
}

export function QuoteCard({ quote, accentColor, delay = 0 }: QuoteCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="mx-3 rounded-xl border border-border/50 bg-card/50 px-5 py-4"
    >
      <div
        className="mb-2 text-2xl leading-none"
        style={{ color: accentColor }}
      >
        &ldquo;
      </div>
      <p className="text-[14px] leading-relaxed italic text-muted-foreground">
        {quote.text}
      </p>
      <p
        className="mt-2 text-[12px] font-medium"
        style={{ color: accentColor }}
      >
        — {quote.author}
      </p>
    </motion.div>
  )
}
