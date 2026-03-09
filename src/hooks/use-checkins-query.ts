'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getCheckins, upsertCheckin } from '@/lib/supabase/data-service'
import { getPeriodStart } from '@/lib/date-utils'
import type { ActionFrequency, ActionCheckin } from '@/types'

/**
 * Fetches all check-ins for the current periods (daily from today, weekly from this Monday, etc.)
 */
export function useCheckinsQuery(userId: string | undefined) {
  // Fetch from the earliest possible period start (quarterly)
  const quarterStart = getPeriodStart('quarterly')

  return useQuery<ActionCheckin[]>({
    queryKey: ['checkins', userId, quarterStart],
    queryFn: async () => {
      if (!userId) return []
      return getCheckins(userId, quarterStart)
    },
    enabled: !!userId,
    staleTime: 30_000,
  })
}

/**
 * Returns a set of "actionUUID::frequency::periodStart" keys that are completed.
 * This matches the Zustand format but uses real DB UUIDs.
 */
export function buildCheckinSet(checkins: ActionCheckin[]): Set<string> {
  const set = new Set<string>()
  for (const c of checkins) {
    if (c.completed) {
      set.add(`${c.action_id}::${c.period_type}::${c.period_start}`)
    }
  }
  return set
}

/**
 * Mutation to toggle a check-in (upsert to Supabase + optimistic update).
 */
export function useToggleCheckinMutation(userId: string | undefined) {
  const queryClient = useQueryClient()
  const quarterStart = getPeriodStart('quarterly')

  return useMutation({
    mutationFn: async (params: {
      actionDbId: string
      completed: boolean
      periodType: ActionFrequency
      periodStart: string
    }) => {
      if (!userId) throw new Error('Not authenticated')
      await upsertCheckin({
        userId,
        actionId: params.actionDbId,
        completed: params.completed,
        periodType: params.periodType,
        periodStart: params.periodStart,
      })
    },
    onMutate: async (params) => {
      // Cancel any outgoing queries
      await queryClient.cancelQueries({
        queryKey: ['checkins', userId, quarterStart],
      })

      // Snapshot previous value
      const previous = queryClient.getQueryData<ActionCheckin[]>([
        'checkins',
        userId,
        quarterStart,
      ])

      // Optimistically update
      queryClient.setQueryData<ActionCheckin[]>(
        ['checkins', userId, quarterStart],
        (old = []) => {
          const key = `${params.actionDbId}::${params.periodType}::${params.periodStart}`
          const existing = old.find(
            (c) =>
              c.action_id === params.actionDbId &&
              c.period_type === params.periodType &&
              c.period_start === params.periodStart
          )

          if (existing) {
            return old.map((c) =>
              c.id === existing.id
                ? { ...c, completed: params.completed, checked_at: params.completed ? new Date().toISOString() : null }
                : c
            )
          }

          // Add new check-in optimistically
          return [
            ...old,
            {
              id: `temp-${key}`,
              user_id: userId!,
              action_id: params.actionDbId,
              completed: params.completed,
              period_type: params.periodType,
              period_start: params.periodStart,
              checked_at: params.completed ? new Date().toISOString() : null,
              created_at: new Date().toISOString(),
            },
          ]
        }
      )

      return { previous }
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(
          ['checkins', userId, quarterStart],
          context.previous
        )
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({
        queryKey: ['checkins', userId, quarterStart],
      })
    },
  })
}
