import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/60 text-2xl font-bold text-primary-foreground">
        LD
      </div>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Life Dashboard</h1>
        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
          Coach digital de desarrollo personal. Transforma metas a 1 año en
          acciones concretas usando el método Harada.
        </p>
      </div>
      <Link
        href="/login"
        className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        Comenzar
      </Link>
    </div>
  )
}
