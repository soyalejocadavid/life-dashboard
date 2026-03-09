import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { PillarId, ActionFrequency } from '@/types'
import type { GeneratedPlan } from '@/lib/coaching/types'
import { getPeriodStart, getTodayISO } from '@/lib/date-utils'

// ============================================================================
// Journal Entry (local, pre-Supabase)
// ============================================================================

export interface LocalJournalEntry {
  id: string
  date: string // YYYY-MM-DD
  content: string
  createdAt: string
  updatedAt: string
}

// ============================================================================
// Diagnostic Progress (persisted to resume onboarding)
// ============================================================================

export interface DiagnosticProgress {
  currentPillarIndex: number
  currentQuestionIndex: number
  responses: Record<string, string | number | string[]>
  scores: Partial<Record<PillarId, number>>
  completedPillars: PillarId[]
  savedAt: string
}

// ============================================================================
// App State
// ============================================================================

interface AppState {
  // === Onboarding (transient, not persisted) ===
  currentPillarIndex: number
  pillarScores: Partial<Record<PillarId, number>>
  setCurrentPillarIndex: (index: number) => void
  setPillarScore: (pillarId: PillarId, score: number) => void
  resetOnboarding: () => void

  // === Diagnostic Progress (persisted) ===
  diagnosticProgress: DiagnosticProgress | null
  saveDiagnosticProgress: (progress: DiagnosticProgress) => void
  clearDiagnosticProgress: () => void

  // === Plan (persisted) ===
  plan: GeneratedPlan | null
  confirmedScores: Record<PillarId, number> | null
  setPlan: (plan: GeneratedPlan, scores: Record<PillarId, number>) => void

  // === Check-ins (persisted) ===
  // Key format: `${subGoalPos}-${actionPos}::${frequency}::${periodStart}`
  checkins: Record<string, { checkedAt: string }>
  toggleCheckin: (
    actionId: string,
    periodType: ActionFrequency,
    periodStart: string
  ) => void
  isChecked: (
    actionId: string,
    periodType: ActionFrequency
  ) => boolean

  // === Journal (persisted) ===
  journalEntries: LocalJournalEntry[]
  addJournalEntry: (content: string, date: string) => void
  updateJournalEntry: (id: string, content: string) => void

  // === Streak (persisted) ===
  currentStreak: number
  lastCheckinDate: string | null

  // === Hydration ===
  _hasHydrated: boolean
  setHasHydrated: (v: boolean) => void
}

// ============================================================================
// Store with persist middleware
// ============================================================================

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // --- Onboarding ---
      currentPillarIndex: 0,
      pillarScores: {},

      setCurrentPillarIndex: (index) => set({ currentPillarIndex: index }),

      setPillarScore: (pillarId, score) =>
        set((state) => ({
          pillarScores: { ...state.pillarScores, [pillarId]: score },
        })),

      resetOnboarding: () =>
        set({ currentPillarIndex: 0, pillarScores: {}, diagnosticProgress: null }),

      // --- Diagnostic Progress ---
      diagnosticProgress: null,

      saveDiagnosticProgress: (progress) =>
        set({ diagnosticProgress: { ...progress, savedAt: new Date().toISOString() } }),

      clearDiagnosticProgress: () =>
        set({ diagnosticProgress: null }),

      // --- Plan ---
      plan: null,
      confirmedScores: null,

      setPlan: (plan, scores) =>
        set({
          plan,
          confirmedScores: scores,
          // Reset checkins when a new plan is set
          checkins: {},
          currentStreak: 0,
          lastCheckinDate: null,
          // Clear diagnostic progress — onboarding complete
          diagnosticProgress: null,
        }),

      // --- Check-ins ---
      checkins: {},

      toggleCheckin: (actionId, periodType, periodStart) =>
        set((state) => {
          const key = `${actionId}::${periodType}::${periodStart}`
          const newCheckins = { ...state.checkins }
          const today = getTodayISO()

          if (newCheckins[key]) {
            // Uncheck
            delete newCheckins[key]
          } else {
            // Check
            newCheckins[key] = { checkedAt: new Date().toISOString() }
          }

          // Update streak
          let { currentStreak, lastCheckinDate } = state
          if (!newCheckins[key]) {
            // We unchecked — don't break streak, just update checkins
          } else {
            if (lastCheckinDate === today) {
              // Already checked in today, streak unchanged
            } else if (lastCheckinDate) {
              const lastDate = new Date(lastCheckinDate + 'T12:00:00')
              const todayDate = new Date(today + 'T12:00:00')
              const diffDays = Math.floor(
                (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
              )
              if (diffDays === 1) {
                currentStreak += 1
              } else if (diffDays > 1) {
                currentStreak = 1
              }
            } else {
              currentStreak = 1
            }
            lastCheckinDate = today
          }

          return {
            checkins: newCheckins,
            currentStreak,
            lastCheckinDate,
          }
        }),

      isChecked: (actionId, periodType) => {
        const periodStart = getPeriodStart(periodType)
        const key = `${actionId}::${periodType}::${periodStart}`
        return !!get().checkins[key]
      },

      // --- Journal ---
      journalEntries: [],

      addJournalEntry: (content, date) =>
        set((state) => ({
          journalEntries: [
            ...state.journalEntries,
            {
              id: crypto.randomUUID(),
              date,
              content,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
        })),

      updateJournalEntry: (id, content) =>
        set((state) => ({
          journalEntries: state.journalEntries.map((entry) =>
            entry.id === id
              ? { ...entry, content, updatedAt: new Date().toISOString() }
              : entry
          ),
        })),

      // --- Streak ---
      currentStreak: 0,
      lastCheckinDate: null,

      // --- Hydration ---
      _hasHydrated: false,
      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: 'life-dashboard-storage',
      partialize: (state) => ({
        plan: state.plan,
        confirmedScores: state.confirmedScores,
        checkins: state.checkins,
        journalEntries: state.journalEntries,
        currentStreak: state.currentStreak,
        lastCheckinDate: state.lastCheckinDate,
        diagnosticProgress: state.diagnosticProgress,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
