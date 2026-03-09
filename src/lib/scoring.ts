import type { DiagnosticQuestion } from '@/data/diagnostic-questions'

/**
 * Calculate a pillar score from diagnostic responses.
 *
 * Scoring logic:
 * - Scale (1-10): Used directly as the value
 * - Multiple-choice: Mapped to 1-5 based on option index, then scaled to 1-10
 * - Text: Not scored (weight redistributed to other questions)
 *
 * Returns a score from 0 to 10 (one decimal).
 */
export function calculatePillarScore(
  questions: DiagnosticQuestion[],
  responses: Record<string, string | number | string[]>
): number {
  let totalWeight = 0
  let weightedSum = 0

  for (const question of questions) {
    const response = responses[question.id]
    if (response === undefined || response === null) continue

    // Skip text questions in scoring
    if (question.type === 'text') continue

    let value = 0

    if (question.type === 'scale') {
      // Scale is already 1-10
      value = typeof response === 'number' ? response : parseFloat(String(response))
      if (isNaN(value)) continue
    } else if (question.type === 'multiple-choice') {
      // Map option index to 1-10 scale
      const optionIndex =
        typeof response === 'number'
          ? response
          : question.options?.indexOf(String(response)) ?? -1
      if (optionIndex < 0) continue
      const totalOptions = question.options?.length ?? 5
      // Map 0-based index to 2-10 scale (first option = 2, last = 10)
      value = 2 + (optionIndex / (totalOptions - 1)) * 8
    }

    totalWeight += question.weight
    weightedSum += value * question.weight
  }

  if (totalWeight === 0) return 0

  const score = weightedSum / totalWeight
  // Round to 1 decimal
  return Math.round(score * 10) / 10
}
