'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getJournalEntries, upsertJournalEntry } from '@/lib/supabase/data-service'
import type { JournalEntry } from '@/types'

export function useJournalQuery(userId: string | undefined) {
  return useQuery<JournalEntry[]>({
    queryKey: ['journal', userId],
    queryFn: async () => {
      if (!userId) return []
      return getJournalEntries(userId)
    },
    enabled: !!userId,
    staleTime: 60_000,
  })
}

export function useUpsertJournalMutation(userId: string | undefined) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: { content: string; date: string }) => {
      if (!userId) throw new Error('Not authenticated')
      return upsertJournalEntry({
        userId,
        content: params.content,
        date: params.date,
      })
    },
    onMutate: async (params) => {
      await queryClient.cancelQueries({ queryKey: ['journal', userId] })
      const previous = queryClient.getQueryData<JournalEntry[]>(['journal', userId])

      // Optimistic update
      queryClient.setQueryData<JournalEntry[]>(
        ['journal', userId],
        (old = []) => {
          const existing = old.find((e) => e.date === params.date)
          if (existing) {
            return old.map((e) =>
              e.date === params.date
                ? { ...e, content: params.content, updated_at: new Date().toISOString() }
                : e
            )
          }
          return [
            {
              id: `temp-${params.date}`,
              user_id: userId!,
              content: params.content,
              date: params.date,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
            ...old,
          ]
        }
      )

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['journal', userId], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['journal', userId] })
    },
  })
}
