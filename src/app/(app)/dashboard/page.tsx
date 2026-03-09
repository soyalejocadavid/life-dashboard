'use client'

import { Component, useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { useAppStore } from '@/stores/app-store'
import { useDashboardData } from '@/hooks/use-dashboard-data'
import { useTodaysActions } from '@/hooks/use-todays-actions'

// === Error Boundary to catch hook crashes ===
class HookBoundary extends Component<
  { name: string; children: ReactNode },
  { error: string | null }
> {
  constructor(props: { name: string; children: ReactNode }) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error: Error) {
    return { error: error.message }
  }
  render() {
    if (this.state.error) {
      return (
        <p className="text-red-500 text-xs">
          ❌ {this.props.name}: {this.state.error}
        </p>
      )
    }
    return this.props.children
  }
}

// === Individual hook test components ===
function TestZustand() {
  const hasHydrated = useAppStore((s) => s._hasHydrated)
  const streak = useAppStore((s) => s.currentStreak)
  return <p className="text-xs">✅ Zustand (hydrated={String(hasHydrated)}, streak={streak})</p>
}

function TestDashboardData() {
  const { plan, scores, isLoading } = useDashboardData()
  return (
    <p className="text-xs">
      ✅ useDashboardData (plan={plan ? 'yes' : 'null'}, scores={scores ? 'yes' : 'null'}, loading={String(isLoading)})
    </p>
  )
}

function TestTodaysActions() {
  const { plan, isChecked } = useDashboardData()
  const result = useTodaysActions(plan, isChecked)
  return (
    <p className="text-xs">
      ✅ useTodaysActions (groups={result.groups.length}, total={result.totalActions})
    </p>
  )
}

// === Main page ===
export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="p-6 text-center">Cargando...</div>
  }

  return (
    <div className="mx-auto max-w-lg p-6">
      <h1 className="mb-4 text-2xl font-bold">🔍 Hook Execution Debug</h1>
      <div className="mb-6 space-y-2 rounded-lg bg-muted p-4">
        <HookBoundary name="Zustand">
          <TestZustand />
        </HookBoundary>

        <HookBoundary name="useDashboardData">
          <TestDashboardData />
        </HookBoundary>

        <HookBoundary name="useTodaysActions">
          <TestTodaysActions />
        </HookBoundary>
      </div>
      <Link
        href="/onboarding"
        className="inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground"
      >
        Ir a Onboarding
      </Link>
    </div>
  )
}
