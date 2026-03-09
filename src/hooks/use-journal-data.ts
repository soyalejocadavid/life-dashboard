'use client'

import { useAuth } from './use-auth'
import { useJournalQuery, useUpsertJournalMutation } from './use-journal-query'
import { useAppStore, type LocalJournalEntry } from '@/stores/app-store'

export interface JournalData {
  entries: Array<{
    id: string
    date: string
    content: string
    updatedAt: string
  }>
  isLoading: boolean
  saveEntry: (content: string, date: string) => void
}

/**
 * Bridge hook for journal: Supabase when authenticated, Zustand when not.
 */
export function useJournalData(): JournalData {
  const { user, isLoading: authLoading } = useAuth()
  const userId = user?.id

  // Supabase path
  const journalQuery = useJournalQuery(userId)
  const upsertMutation = useUpsertJournalMutation(userId)

  // Zustand path
  const localEntries = useAppStore((s) => s.journalEntries)
  const localAdd = useAppStore((s) => s.addJournalEntry)
  const localUpdate = useAppStore((s) => s.updateJournalEntry)

  if (userId) {
    // === Supabase path ===
    return {
      entries: (journalQuery.data ?? []).map((e) => ({
        id: e.id,
        date: e.date,
        content: e.content,
        updatedAt: e.updated_at,
      })),
      isLoading: authLoading || journalQuery.isLoading,
      saveEntry: (content: string, date: string) => {
        upsertMutation.mutate({ content, date })
      },
    }
  }

  // === Zustand path ===
  return {
    entries: localEntries
      .map((e: LocalJournalEntry) => ({
        id: e.id,
        date: e.date,
        content: e.content,
        updatedAt: e.updatedAt,
      }))
      .sort((a, b) => b.date.localeCompare(a.date)),
    isLoading: authLoading,
    saveEntry: (content: string, date: string) => {
      const existing = localEntries.find((e: LocalJournalEntry) => e.date === date)
      if (existing) {
        localUpdate(existing.id, content)
      } else {
        localAdd(content, date)
      }
    },
  }
}
