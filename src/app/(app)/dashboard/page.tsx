'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string>('Loading...')

  useEffect(() => {
    setMounted(true)

    // Step-by-step debug: test each import/hook independently
    const steps: string[] = []

    try {
      // Step 1: Check Supabase env vars
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      steps.push(`✅ Env vars: URL=${url ? 'set' : 'MISSING'}, Key=${key ? 'set' : 'MISSING'}`)
    } catch (e: unknown) {
      steps.push(`❌ Env vars: ${e instanceof Error ? e.message : String(e)}`)
    }

    try {
      // Step 2: Check localStorage
      const stored = localStorage.getItem('life-dashboard-storage')
      steps.push(`✅ localStorage: ${stored ? `${stored.length} chars` : 'empty'}`)
    } catch (e: unknown) {
      steps.push(`❌ localStorage: ${e instanceof Error ? e.message : String(e)}`)
    }

    try {
      // Step 3: Check Supabase client
      const { createClient } = require('@/lib/supabase/client')
      const client = createClient()
      steps.push(`✅ Supabase client created`)

      // Step 4: Check auth
      client.auth.getSession().then(({ data, error }: { data: { session: unknown }; error: unknown }) => {
        if (error) {
          steps.push(`❌ Auth session: ${error}`)
        } else {
          steps.push(`✅ Auth session: ${data.session ? 'active' : 'null'}`)
        }
        setDebugInfo(steps.join('\n'))
      })
    } catch (e: unknown) {
      steps.push(`❌ Supabase client: ${e instanceof Error ? e.message : String(e)}`)
    }

    setDebugInfo(steps.join('\n'))
  }, [])

  if (!mounted) {
    return <div className="p-6 text-center">Cargando...</div>
  }

  return (
    <div className="mx-auto max-w-lg p-6">
      <h1 className="mb-4 text-2xl font-bold">🔍 Dashboard Debug</h1>
      <pre className="mb-6 overflow-auto rounded-lg bg-muted p-4 text-xs whitespace-pre-wrap">
        {debugInfo}
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
