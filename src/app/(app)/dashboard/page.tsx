'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

// Import hooks one by one to isolate the crash
import { useAppStore } from '@/stores/app-store'
import { useDashboardData } from '@/hooks/use-dashboard-data'
import { useTodaysActions } from '@/hooks/use-todays-actions'

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // === Hook 1: Zustand store ===
  let storeOk = false
  try {
    const hasHydrated = useAppStore((s) => s._hasHydrated)
    const currentStreak = useAppStore((s) => s.currentStreak)
    storeOk = true
  } catch (e: unknown) {
    if (!error) setError(`Zustand crash: ${e instanceof Error ? e.message : String(e)}`)
  }

  // === Hook 2: Dashboard data (auth + Supabase queries) ===
  let dashOk = false
  let plan: ReturnType<typeof useDashboardData>['plan'] = null
  let scores: ReturnType<typeof useDashboardData>['scores'] = null
  let isLoading = true
  let isChecked: ReturnType<typeof useDashboardData>['isChecked'] = () => false
  try {
    const data = useDashboardData()
    plan = data.plan
    scores = data.scores
    isLoading = data.isLoading
    isChecked = data.isChecked
    dashOk = true
  } catch (e: unknown) {
    if (!error) setError(`useDashboardData crash: ${e instanceof Error ? e.message : String(e)}`)
  }

  // === Hook 3: Today's actions ===
  let todaysOk = false
  try {
    const result = useTodaysActions(plan, isChecked)
    todaysOk = true
  } catch (e: unknown) {
    if (!error) setError(`useTodaysActions crash: ${e instanceof Error ? e.message : String(e)}`)
  }

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="p-6 text-center">Cargando...</div>
  }

  return (
    <div className="mx-auto max-w-lg p-6">
      <h1 className="mb-4 text-2xl font-bold">🔍 Hook Debug</h1>
      <div className="mb-6 space-y-2 rounded-lg bg-muted p-4 text-sm">
        <p>{storeOk ? '✅' : '❌'} Zustand store</p>
        <p>{dashOk ? '✅' : '❌'} useDashboardData (plan={plan ? 'exists' : 'null'}, loading={String(isLoading)})</p>
        <p>{todaysOk ? '✅' : '❌'} useTodaysActions</p>
      </div>
      {error && (
        <pre className="mb-6 overflow-auto rounded-lg bg-red-500/10 p-4 text-xs text-red-600">
          {error}
        </pre>
      )}
      <Link
        href="/onboarding"
        className="inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground"
      >
        Ir a Onboarding
      </Link>
    </div>
  )
}
