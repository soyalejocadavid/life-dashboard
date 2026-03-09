'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

type LoginState = 'idle' | 'sending' | 'sent' | 'error'

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [state, setState] = useState<LoginState>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // Check for auth error from callback redirect
  useEffect(() => {
    if (searchParams.get('error') === 'auth') {
      setState('error')
      setErrorMsg('Error de autenticación. Por favor intenta de nuevo.')
    }
  }, [searchParams])

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setState('sending')
    setErrorMsg('')

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/callback`,
      },
    })

    if (error) {
      setState('error')
      setErrorMsg(error.message)
    } else {
      setState('sent')
    }
  }

  const handleGoogleOAuth = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/callback`,
      },
    })
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Logo / Branding */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-xl font-bold text-primary-foreground">
            LD
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">
              Life Dashboard
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Tu coach digital de desarrollo personal
            </p>
          </div>
        </div>

        {/* Success state */}
        {state === 'sent' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-6 text-center"
          >
            <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-emerald-500 dark:text-emerald-400" />
            <h2 className="mb-1 text-lg font-semibold">Revisa tu correo</h2>
            <p className="text-sm text-muted-foreground">
              Enviamos un enlace de acceso a{' '}
              <span className="font-medium text-foreground">{email}</span>
            </p>
            <button
              onClick={() => {
                setState('idle')
                setEmail('')
              }}
              className="mt-4 text-sm text-primary hover:underline"
            >
              Usar otro correo
            </button>
          </motion.div>
        ) : (
          <>
            {/* Google OAuth */}
            <button
              onClick={handleGoogleOAuth}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3 text-sm font-medium transition-colors hover:bg-muted/50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Continuar con Google
            </button>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-border/50" />
              <span className="text-xs text-muted-foreground">
                o continuar con
              </span>
              <div className="h-px flex-1 bg-border/50" />
            </div>

            {/* Email magic link form */}
            <form onSubmit={handleMagicLink} className="space-y-3">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="tu@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={state === 'sending'}
                  aria-label="Correo electrónico"
                  className="h-12 w-full rounded-xl border border-border/50 bg-card pl-10 pr-4 text-sm placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                />
              </div>
              <button
                type="submit"
                disabled={state === 'sending' || !email.trim()}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
              >
                {state === 'sending' ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                    className="h-4 w-4 rounded-full border-2 border-primary-foreground border-t-transparent"
                  />
                ) : (
                  <>
                    Enviar enlace de acceso
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Error message */}
            {state === 'error' && errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-sm text-red-600 dark:text-red-400"
              >
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {errorMsg}
              </motion.div>
            )}
          </>
        )}

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-muted-foreground/50">
          Al continuar, aceptas los términos de uso
        </p>
      </motion.div>
    </div>
  )
}
