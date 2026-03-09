'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="es">
      <body className="bg-neutral-950 text-neutral-100">
        <div className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="text-lg font-semibold">Algo salió mal</h2>
          <pre className="max-w-md overflow-auto rounded-lg bg-neutral-900 p-4 text-left text-xs text-red-400">
            {error.message}
            {error.stack && (
              <>
                {'\n\n'}
                {error.stack}
              </>
            )}
          </pre>
          {error.digest && (
            <p className="text-xs text-neutral-500">Digest: {error.digest}</p>
          )}
          <button
            onClick={reset}
            className="mt-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white"
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  )
}
