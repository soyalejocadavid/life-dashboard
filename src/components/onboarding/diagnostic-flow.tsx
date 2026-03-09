'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { DIAGNOSTIC_QUESTIONS } from '@/data/diagnostic-questions'
import { getRandomQuote } from '@/data/quotes'
import { PILLAR_CONFIG } from '@/data/pillars'
import { calculatePillarScore } from '@/lib/scoring'
import { useAppStore, type DiagnosticProgress } from '@/stores/app-store'
import type { PillarId } from '@/types'
import { PILLARS } from '@/types'

import { CoachMessage } from './coach-message'
import { QuoteCard } from './quote-card'
import { QuestionScale } from './question-scale'
import { QuestionMultipleChoice } from './question-multiple-choice'
import { QuestionText } from './question-text'
import { PillarProgress } from './pillar-progress'
import { PillarRadar } from '@/components/radar/pillar-radar'

// Each "step" in the conversation
type StepType =
  | { kind: 'coach'; message: string }
  | { kind: 'quote'; pillarId: PillarId }
  | { kind: 'question'; pillarIndex: number; questionIndex: number }
  | { kind: 'pillar-score'; pillarId: PillarId; score: number }
  | { kind: 'complete' }

interface DiagnosticFlowProps {
  onComplete: (data: {
    scores: Record<PillarId, number>
    responses: Record<string, string | number | string[]>
  }) => void
}

export function DiagnosticFlow({ onComplete }: DiagnosticFlowProps) {
  const [steps, setSteps] = useState<StepType[]>([])
  const [currentPillarIndex, setCurrentPillarIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(-1)
  const [phase, setPhase] = useState<'greeting' | 'quote' | 'questions' | 'score' | 'complete' | 'resume-prompt'>('greeting')
  const [scores, setScores] = useState<Partial<Record<PillarId, number>>>({})
  const [responses, setResponses] = useState<Record<string, string | number | string[]>>({})
  const [completedPillars, setCompletedPillars] = useState<PillarId[]>([])
  const [showRadar, setShowRadar] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const hasInitialized = useRef(false)
  const answeredQuestions = useRef(new Set<string>())

  const saveDiagnosticProgress = useAppStore((s) => s.saveDiagnosticProgress)
  const clearDiagnosticProgress = useAppStore((s) => s.clearDiagnosticProgress)
  const savedProgress = useAppStore((s) => s.diagnosticProgress)
  const hasHydrated = useAppStore((s) => s._hasHydrated)

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, 100)
  }, [])

  // Save progress after every answer
  const persistProgress = useCallback(
    (
      pillarIdx: number,
      questionIdx: number,
      allResponses: Record<string, string | number | string[]>,
      allScores: Partial<Record<PillarId, number>>,
      allCompleted: PillarId[]
    ) => {
      saveDiagnosticProgress({
        currentPillarIndex: pillarIdx,
        currentQuestionIndex: questionIdx,
        responses: allResponses,
        scores: allScores,
        completedPillars: allCompleted,
        savedAt: new Date().toISOString(),
      })
    },
    [saveDiagnosticProgress]
  )

  // Initialize flow
  useEffect(() => {
    if (!hasHydrated || hasInitialized.current) return
    hasInitialized.current = true

    // Check for saved progress
    if (savedProgress && savedProgress.completedPillars.length > 0) {
      setPhase('resume-prompt')
      return
    }

    // Start fresh
    startFresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated])

  function startFresh() {
    clearDiagnosticProgress()
    const timer = setTimeout(() => {
      setSteps([
        {
          kind: 'coach',
          message:
            'Bienvenido a tu diagnóstico de vida. Vamos a explorar juntos 7 pilares fundamentales de tu desarrollo personal: Salud Mental, Bienestar Físico, Relaciones, Espiritualidad, Economía, Desarrollo Intelectual y Propósito.',
        },
      ])

      setTimeout(() => {
        setSteps((prev) => [
          ...prev,
          {
            kind: 'coach',
            message:
              'Por cada pilar, te haré algunas preguntas. No hay respuestas correctas — solo tu honestidad. Tomate tu tiempo.',
          },
        ])
        setTimeout(() => startPillar(0), 1500)
      }, 1500)
    }, 500)

    return () => clearTimeout(timer)
  }

  function resumeFromProgress(progress: DiagnosticProgress) {
    // Restore state from saved progress
    setResponses(progress.responses)
    setScores(progress.scores)
    setCompletedPillars(progress.completedPillars)

    // Mark all previously answered questions so edits don't re-advance
    for (let pi = 0; pi < progress.completedPillars.length; pi++) {
      const pillar = DIAGNOSTIC_QUESTIONS[pi]
      if (pillar) {
        for (let qi = 0; qi < pillar.questions.length; qi++) {
          answeredQuestions.current.add(`${pi}-${qi}`)
        }
      }
    }

    const nextPillarIndex = progress.completedPillars.length
    if (nextPillarIndex >= PILLARS.length) {
      // All pillars were completed — jump to complete
      setPhase('complete')
      setShowRadar(true)
      setSteps([{ kind: 'complete' }])
      return
    }

    // Show score cards for completed pillars + resume message
    const resumeSteps: StepType[] = []

    resumeSteps.push({
      kind: 'coach',
      message: `¡Bienvenido de vuelta! Ya completaste ${progress.completedPillars.length} de 7 pilares. Retomemos donde te quedaste.`,
    })

    // Show completed scores
    for (const pillarId of progress.completedPillars) {
      const score = progress.scores[pillarId]
      if (score !== undefined) {
        resumeSteps.push({ kind: 'pillar-score', pillarId, score })
      }
    }

    setSteps(resumeSteps)
    setShowRadar(true)
    setPhase('greeting')

    // Start the next pillar
    setTimeout(() => {
      startPillar(nextPillarIndex)
    }, 1500)
  }

  useEffect(() => {
    scrollToBottom()
  }, [steps, phase, scrollToBottom])

  const currentPillar = DIAGNOSTIC_QUESTIONS[currentPillarIndex]
  const currentPillarConfig = currentPillar
    ? PILLAR_CONFIG[currentPillar.pillarId]
    : null

  function startPillar(pillarIndex: number) {
    const pillar = DIAGNOSTIC_QUESTIONS[pillarIndex]
    if (!pillar) {
      // All pillars complete
      setPhase('complete')
      setSteps((prev) => [...prev, { kind: 'complete' }])
      return
    }

    setCurrentPillarIndex(pillarIndex)
    setCurrentQuestionIndex(-1)
    setPhase('greeting')

    // Add pillar greeting
    setSteps((prev) => [
      ...prev,
      { kind: 'coach', message: pillar.coachGreeting },
    ])

    // Show quote after greeting
    setTimeout(() => {
      setPhase('quote')
      setSteps((prev) => [
        ...prev,
        { kind: 'quote', pillarId: pillar.pillarId },
      ])
      // Start first question after quote
      setTimeout(() => {
        startQuestion(pillarIndex, 0)
      }, 2000)
    }, 1500)
  }

  function startQuestion(pillarIndex: number, questionIndex: number) {
    const pillar = DIAGNOSTIC_QUESTIONS[pillarIndex]
    const question = pillar?.questions[questionIndex]
    if (!question) {
      // All questions for this pillar done — calculate score
      finishPillar(pillarIndex)
      return
    }

    setCurrentQuestionIndex(questionIndex)
    setPhase('questions')

    // If question has a coach intro, show it first
    if (question.coachIntro) {
      setSteps((prev) => [
        ...prev,
        { kind: 'coach', message: question.coachIntro! },
      ])
      setTimeout(() => {
        setSteps((prev) => [
          ...prev,
          { kind: 'question', pillarIndex, questionIndex },
        ])
      }, 1000)
    } else {
      setSteps((prev) => [
        ...prev,
        { kind: 'question', pillarIndex, questionIndex },
      ])
    }
  }

  function handleAnswer(
    pillarIndex: number,
    questionIndex: number,
    value: string | number | string[]
  ) {
    const question = DIAGNOSTIC_QUESTIONS[pillarIndex]?.questions[questionIndex]
    if (!question) return

    const questionKey = `${pillarIndex}-${questionIndex}`
    const isReAnswer = answeredQuestions.current.has(questionKey)

    // Save response
    const newResponses = { ...responses, [question.id]: value }
    setResponses(newResponses)

    // Persist progress after each answer
    persistProgress(pillarIndex, questionIndex, newResponses, scores, completedPillars)

    // Only advance to next question on first answer (not on edits)
    if (!isReAnswer) {
      answeredQuestions.current.add(questionKey)
      setTimeout(() => {
        startQuestion(pillarIndex, questionIndex + 1)
      }, 600)
    }
  }

  function finishPillar(pillarIndex: number) {
    const pillar = DIAGNOSTIC_QUESTIONS[pillarIndex]
    if (!pillar) return

    // Calculate score
    const pillarResponses: Record<string, string | number | string[]> = {}
    for (const q of pillar.questions) {
      if (responses[q.id] !== undefined) {
        pillarResponses[q.id] = responses[q.id]
      }
    }
    const score = calculatePillarScore(pillar.questions, pillarResponses)

    // Update scores
    const newScores = { ...scores, [pillar.pillarId]: score }
    setScores(newScores)
    const newCompleted = [...completedPillars, pillar.pillarId]
    setCompletedPillars(newCompleted)
    setPhase('score')
    setShowRadar(true)

    // Persist progress with updated scores
    persistProgress(pillarIndex + 1, -1, responses, newScores, newCompleted)

    // Show score message
    setSteps((prev) => [
      ...prev,
      { kind: 'pillar-score', pillarId: pillar.pillarId, score },
    ])

    // Move to next pillar after a pause
    setTimeout(() => {
      startPillar(pillarIndex + 1)
    }, 2500)
  }

  // Handle completion
  useEffect(() => {
    if (phase === 'complete' && Object.keys(scores).length === PILLARS.length) {
      // Clear saved progress — onboarding done
      clearDiagnosticProgress()
      // Small delay to let the user see the complete radar
      const timer = setTimeout(() => {
        onComplete({
          scores: scores as Record<PillarId, number>,
          responses,
        })
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [phase, scores, responses, onComplete, clearDiagnosticProgress])

  // Resume prompt UI
  if (phase === 'resume-prompt' && savedProgress) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center gap-4 text-center"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <span className="text-3xl">📋</span>
          </div>
          <h2 className="text-lg font-semibold">Diagnóstico en progreso</h2>
          <p className="max-w-xs text-sm text-muted-foreground">
            Completaste {savedProgress.completedPillars.length} de 7 pilares.
            ¿Quieres continuar donde te quedaste?
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col gap-3 w-full max-w-xs"
        >
          <button
            onClick={() => resumeFromProgress(savedProgress)}
            className="h-11 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Continuar diagnóstico
          </button>
          <button
            onClick={() => {
              setPhase('greeting')
              startFresh()
            }}
            className="h-11 rounded-xl border border-border px-6 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:bg-muted/50"
          >
            Empezar de nuevo
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh flex-col">
      {/* Top bar with progress */}
      <div className="sticky top-0 z-10 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <PillarProgress
          currentIndex={currentPillarIndex}
          completedPillars={completedPillars}
        />
        {currentPillarConfig && phase !== 'complete' && (
          <div className="flex items-center justify-center gap-2 pb-2">
            <div
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: currentPillarConfig.color }}
            />
            <span className="text-xs font-medium text-muted-foreground">
              {currentPillarConfig.name}
            </span>
          </div>
        )}
      </div>

      {/* Conversation area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-6"
      >
        <div className="mx-auto max-w-lg space-y-5">
          <AnimatePresence mode="sync">
            {steps.map((step, index) => (
              <div key={index}>
                {step.kind === 'coach' && (
                  <CoachMessage message={step.message} />
                )}

                {step.kind === 'quote' && (
                  <QuoteCard
                    quote={getRandomQuote(step.pillarId)}
                    accentColor={PILLAR_CONFIG[step.pillarId].color}
                    delay={0.3}
                  />
                )}

                {step.kind === 'question' && (() => {
                  const pillar = DIAGNOSTIC_QUESTIONS[step.pillarIndex]
                  const question = pillar?.questions[step.questionIndex]
                  if (!question) return null
                  const color = PILLAR_CONFIG[pillar.pillarId].color

                  return (
                    <div>
                      {question.type === 'scale' && question.scaleLabels && (
                        <QuestionScale
                          question={question.text}
                          labels={question.scaleLabels}
                          accentColor={color}
                          onAnswer={(value) =>
                            handleAnswer(step.pillarIndex, step.questionIndex, value)
                          }
                        />
                      )}
                      {question.type === 'multiple-choice' && question.options && (
                        <QuestionMultipleChoice
                          question={question.text}
                          options={question.options}
                          accentColor={color}
                          onAnswer={(optionIndex) =>
                            handleAnswer(
                              step.pillarIndex,
                              step.questionIndex,
                              optionIndex
                            )
                          }
                        />
                      )}
                      {question.type === 'text' && (
                        <QuestionText
                          question={question.text}
                          placeholder={question.placeholder}
                          accentColor={color}
                          onAnswer={(text) =>
                            handleAnswer(step.pillarIndex, step.questionIndex, text)
                          }
                        />
                      )}
                    </div>
                  )
                })()}

                {step.kind === 'pillar-score' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center gap-3 py-4"
                  >
                    <div
                      className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold text-gray-50"
                      style={{
                        backgroundColor: PILLAR_CONFIG[step.pillarId].color,
                      }}
                    >
                      {step.score.toFixed(1)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {PILLAR_CONFIG[step.pillarId].name} —{' '}
                      {step.score >= 7
                        ? 'Vas muy bien'
                        : step.score >= 4
                          ? 'Hay oportunidad de crecimiento'
                          : 'Aquí hay trabajo importante por hacer'}
                    </p>
                  </motion.div>
                )}

                {step.kind === 'complete' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col items-center gap-4 py-6"
                  >
                    <CoachMessage message="Has completado tu diagnóstico. Este es tu mapa de vida actual. Cada pilar muestra dónde estás hoy — y de aquí construiremos tu plan de acción." />
                  </motion.div>
                )}
              </div>
            ))}
          </AnimatePresence>

          {/* Scroll anchor */}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Floating radar (appears after first pillar scored) */}
      {showRadar && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="sticky bottom-0 flex justify-center border-t border-border/50 bg-background/90 pb-4 pt-2 backdrop-blur-lg"
        >
          <PillarRadar
            scores={scores}
            size={200}
            activePillar={
              currentPillarIndex < PILLARS.length
                ? PILLARS[currentPillarIndex]
                : null
            }
            showLabels={false}
          />
        </motion.div>
      )}
    </div>
  )
}
