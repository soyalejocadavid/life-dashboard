'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [results, setResults] = useState<string[]>(['Testing imports...'])

  useEffect(() => {
    setMounted(true)

    const steps: string[] = []

    // Test each import individually via dynamic import()
    Promise.resolve()
      .then(async () => {
        try {
          await import('@/types')
          steps.push('✅ @/types')
        } catch (e: unknown) {
          steps.push(`❌ @/types: ${e instanceof Error ? e.message : String(e)}`)
        }
        setResults([...steps])
      })
      .then(async () => {
        try {
          await import('@/data/pillars')
          steps.push('✅ @/data/pillars')
        } catch (e: unknown) {
          steps.push(`❌ @/data/pillars: ${e instanceof Error ? e.message : String(e)}`)
        }
        setResults([...steps])
      })
      .then(async () => {
        try {
          await import('@/lib/date-utils')
          steps.push('✅ @/lib/date-utils')
        } catch (e: unknown) {
          steps.push(`❌ @/lib/date-utils: ${e instanceof Error ? e.message : String(e)}`)
        }
        setResults([...steps])
      })
      .then(async () => {
        try {
          await import('@/lib/supabase/client')
          steps.push('✅ @/lib/supabase/client')
        } catch (e: unknown) {
          steps.push(`❌ @/lib/supabase/client: ${e instanceof Error ? e.message : String(e)}`)
        }
        setResults([...steps])
      })
      .then(async () => {
        try {
          await import('@/lib/supabase/data-service')
          steps.push('✅ @/lib/supabase/data-service')
        } catch (e: unknown) {
          steps.push(`❌ @/lib/supabase/data-service: ${e instanceof Error ? e.message : String(e)}`)
        }
        setResults([...steps])
      })
      .then(async () => {
        try {
          await import('@/lib/supabase/transforms')
          steps.push('✅ @/lib/supabase/transforms')
        } catch (e: unknown) {
          steps.push(`❌ @/lib/supabase/transforms: ${e instanceof Error ? e.message : String(e)}`)
        }
        setResults([...steps])
      })
      .then(async () => {
        try {
          await import('@/stores/app-store')
          steps.push('✅ @/stores/app-store')
        } catch (e: unknown) {
          steps.push(`❌ @/stores/app-store: ${e instanceof Error ? e.message : String(e)}`)
        }
        setResults([...steps])
      })
      .then(async () => {
        try {
          await import('@/hooks/use-auth')
          steps.push('✅ @/hooks/use-auth')
        } catch (e: unknown) {
          steps.push(`❌ @/hooks/use-auth: ${e instanceof Error ? e.message : String(e)}`)
        }
        setResults([...steps])
      })
      .then(async () => {
        try {
          await import('@/hooks/use-plan-query')
          steps.push('✅ @/hooks/use-plan-query')
        } catch (e: unknown) {
          steps.push(`❌ @/hooks/use-plan-query: ${e instanceof Error ? e.message : String(e)}`)
        }
        setResults([...steps])
      })
      .then(async () => {
        try {
          await import('@/hooks/use-checkins-query')
          steps.push('✅ @/hooks/use-checkins-query')
        } catch (e: unknown) {
          steps.push(`❌ @/hooks/use-checkins-query: ${e instanceof Error ? e.message : String(e)}`)
        }
        setResults([...steps])
      })
      .then(async () => {
        try {
          await import('@/hooks/use-dashboard-data')
          steps.push('✅ @/hooks/use-dashboard-data')
        } catch (e: unknown) {
          steps.push(`❌ @/hooks/use-dashboard-data: ${e instanceof Error ? e.message : String(e)}`)
        }
        setResults([...steps])
      })
      .then(async () => {
        try {
          await import('@/hooks/use-todays-actions')
          steps.push('✅ @/hooks/use-todays-actions')
        } catch (e: unknown) {
          steps.push(`❌ @/hooks/use-todays-actions: ${e instanceof Error ? e.message : String(e)}`)
        }
        setResults([...steps])
      })
      .then(() => {
        steps.push('\n🏁 All imports tested')
        setResults([...steps])
      })
  }, [])

  if (!mounted) {
    return <div className="p-6 text-center">Cargando...</div>
  }

  return (
    <div className="mx-auto max-w-lg p-6">
      <h1 className="mb-4 text-2xl font-bold">🔍 Import Debug</h1>
      <pre className="mb-6 overflow-auto rounded-lg bg-muted p-4 text-xs whitespace-pre-wrap">
        {results.join('\n')}
      </pre>
      <Link
        href="/onboarding"
        className="inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground"
      >
        Ir a Onboarding
      </Link>
    </div>
  )
}
