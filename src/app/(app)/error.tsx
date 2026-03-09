'use client'

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[80svh] flex-col items-center justify-center gap-4 p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
        <span className="text-3xl">⚠️</span>
      </div>
      <h2 className="text-lg font-semibold">Error en la aplicación</h2>
      <pre className="max-w-md overflow-auto rounded-lg bg-muted p-4 text-left text-xs text-red-500">
        {error.message}
      </pre>
      {error.digest && (
        <p className="text-xs text-muted-foreground">Digest: {error.digest}</p>
      )}
      <button
        onClick={reset}
        className="mt-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground"
      >
        Reintentar
      </button>
    </div>
  )
}
