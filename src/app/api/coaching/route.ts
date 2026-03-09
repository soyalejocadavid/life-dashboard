import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { COACHING_SYSTEM_PROMPT } from '@/lib/coaching/system-prompt'
import { PILLAR_CONFIG } from '@/data/pillars'
import { DIAGNOSTIC_QUESTIONS } from '@/data/diagnostic-questions'
import type { PillarId } from '@/types'
import type { GeneratedPlan } from '@/lib/coaching/types'

// ============================================================================
// Types
// ============================================================================

interface CoachingRequestBody {
  pillarScores: Record<PillarId, number>
  responses: Record<string, string | number | string[]>
  timeHorizon?: string
}

// ============================================================================
// Build user message from diagnostic data
// ============================================================================

function buildUserMessage(
  pillarScores: Record<PillarId, number>,
  responses: Record<string, string | number | string[]>,
  timeHorizon?: string
): string {
  let message = '## DIAGNÓSTICO COMPLETO DEL USUARIO\n\n'

  if (timeHorizon) {
    message += `### Horizonte de tiempo seleccionado: ${timeHorizon}\n\n`
  }

  // Pillar scores summary
  message += '### Puntajes por pilar (escala 1-10)\n\n'
  for (const [pillarId, score] of Object.entries(pillarScores)) {
    const config = PILLAR_CONFIG[pillarId as PillarId]
    if (config) {
      message += `- **${config.name}** (${pillarId}): ${score.toFixed(1)}\n`
    }
  }

  message += '\n### Respuestas detalladas por pilar\n\n'

  // Map question IDs to their text
  for (const pillarDiag of DIAGNOSTIC_QUESTIONS) {
    const config = PILLAR_CONFIG[pillarDiag.pillarId]
    const score = pillarScores[pillarDiag.pillarId]

    message += `#### ${config.name} (puntaje: ${score?.toFixed(1) ?? 'N/A'})\n\n`

    for (const question of pillarDiag.questions) {
      const response = responses[question.id]
      if (response === undefined) continue

      message += `**P: ${question.text}**\n`

      if (question.type === 'scale') {
        const numResponse = typeof response === 'number' ? response : Number(response)
        message += `R: ${numResponse}/10`
        if (question.scaleLabels) {
          message += ` (escala: "${question.scaleLabels.min}" a "${question.scaleLabels.max}")`
        }
        message += '\n\n'
      } else if (question.type === 'multiple-choice' && question.options) {
        const optionIndex = typeof response === 'number' ? response : Number(response)
        const selectedOption = question.options[optionIndex]
        message += `R: ${selectedOption ?? response}\n\n`
      } else if (question.type === 'text') {
        message += `R: "${response}"\n\n`
      }
    }
  }

  const horizonText = timeHorizon ? ` a ${timeHorizon}` : ' a 1 año'
  message += `\n---\n\nGenera el plan Harada Open Window 64 personalizado${horizonText} basado en este diagnóstico. Responde ÚNICAMENTE con el JSON.`

  return message
}

// ============================================================================
// Validate the generated plan structure
// ============================================================================

const VALID_PILLARS = new Set([
  'mental-health', 'physical-wellbeing', 'relationships',
  'spirituality', 'finances', 'intellectual-growth', 'purpose',
])
const VALID_FREQUENCIES = new Set(['daily', 'weekly', 'monthly', 'quarterly'])

function validatePlan(plan: GeneratedPlan): string | null {
  if (!plan.centralGoal || typeof plan.centralGoal !== 'string') {
    return 'Missing or invalid centralGoal'
  }
  if (!plan.coachingRationale || typeof plan.coachingRationale !== 'string') {
    return 'Missing or invalid coachingRationale'
  }
  if (!Array.isArray(plan.subGoals) || plan.subGoals.length !== 8) {
    return `Expected 8 subGoals, got ${plan.subGoals?.length ?? 0}`
  }

  for (const sg of plan.subGoals) {
    if (!VALID_PILLARS.has(sg.pillarId)) {
      return `Invalid pillarId: ${sg.pillarId}`
    }
    if (typeof sg.currentScore !== 'number' || typeof sg.targetScore !== 'number') {
      return `Invalid scores for subGoal position ${sg.position}`
    }
    if (sg.targetScore > 10) {
      return `targetScore exceeds 10 for position ${sg.position}`
    }
    if (!Array.isArray(sg.actions) || sg.actions.length !== 8) {
      return `Expected 8 actions for subGoal ${sg.position}, got ${sg.actions?.length ?? 0}`
    }
    for (const action of sg.actions) {
      if (!VALID_FREQUENCIES.has(action.frequency)) {
        return `Invalid frequency "${action.frequency}" in subGoal ${sg.position}`
      }
    }
  }

  return null // valid
}

// ============================================================================
// POST handler
// ============================================================================

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return NextResponse.json(
      { error: 'ANTHROPIC_API_KEY not configured. Add it to .env.local' },
      { status: 500 }
    )
  }

  let body: CoachingRequestBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { pillarScores, responses, timeHorizon } = body

  if (!pillarScores || typeof pillarScores !== 'object') {
    return NextResponse.json({ error: 'Missing pillarScores' }, { status: 400 })
  }

  const anthropic = new Anthropic({ apiKey })
  const userMessage = buildUserMessage(pillarScores, responses || {}, timeHorizon)

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6-20250514',
      max_tokens: 8192,
      system: COACHING_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    })

    // Extract text content
    const textBlock = message.content.find((block) => block.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json(
        { error: 'No text response from model' },
        { status: 500 }
      )
    }

    // Parse JSON — handle possible markdown code block wrapping
    let jsonStr = textBlock.text.trim()
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    let plan: GeneratedPlan
    try {
      plan = JSON.parse(jsonStr)
    } catch (parseError) {
      console.error('Failed to parse coaching response JSON:', parseError)
      console.error('Raw response:', textBlock.text)
      return NextResponse.json(
        { error: 'Invalid JSON from coaching engine', raw: textBlock.text.slice(0, 500) },
        { status: 500 }
      )
    }

    // Validate structure
    const validationError = validatePlan(plan)
    if (validationError) {
      console.error('Plan validation failed:', validationError)
      return NextResponse.json(
        { error: `Plan validation failed: ${validationError}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ plan })
  } catch (error) {
    console.error('Coaching API error:', error)

    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error'

    return NextResponse.json(
      { error: `Coaching engine error: ${errorMessage}` },
      { status: 500 }
    )
  }
}
