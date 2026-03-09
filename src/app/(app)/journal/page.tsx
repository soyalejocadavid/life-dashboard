'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, Plus, PenLine } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useAppStore } from '@/stores/app-store'
import { useJournalData } from '@/hooks/use-journal-data'
import { PullToRefresh } from '@/components/shared/pull-to-refresh'
import {
  formatDateSpanish,
  formatRelativeDate,
  getTodayISO,
} from '@/lib/date-utils'

interface JournalEntryItem {
  id: string
  date: string
  content: string
  updatedAt: string
}

export default function JournalPage() {
  const { entries, isLoading: journalLoading, saveEntry } = useJournalData()
  const hasHydrated = useAppStore((s) => s._hasHydrated)
  const queryClient = useQueryClient()

  const [view, setView] = useState<'list' | 'editor'>('list')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [content, setContent] = useState('')

  // Avoid hydration mismatch
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const todayISO = getTodayISO()
  const todayEntry = entries.find((e) => e.date === todayISO)

  // Already sorted by bridge hook
  const sortedEntries = entries

  const handleSave = () => {
    if (!content.trim()) return
    const date = editingId
      ? sortedEntries.find((e) => e.id === editingId)?.date ?? todayISO
      : todayISO
    saveEntry(content.trim(), date)
    setView('list')
    setContent('')
    setEditingId(null)
  }

  const handleNewOrEdit = () => {
    if (todayEntry) {
      setEditingId(todayEntry.id)
      setContent(todayEntry.content)
    } else {
      setEditingId(null)
      setContent('')
    }
    setView('editor')
  }

  const handleSelectEntry = (entry: JournalEntryItem) => {
    setEditingId(entry.id)
    setContent(entry.content)
    setView('editor')
  }

  const handleBack = () => {
    setView('list')
    setContent('')
    setEditingId(null)
  }

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries()
  }, [queryClient])

  if (!mounted || !hasHydrated || journalLoading) {
    return <JournalSkeleton />
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
    <div className="mx-auto w-full max-w-lg px-4 py-6">
      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <JournalList
              entries={sortedEntries}
              todayEntry={todayEntry}
              onNewEntry={handleNewOrEdit}
              onSelectEntry={handleSelectEntry}
            />
          </motion.div>
        ) : (
          <motion.div
            key="editor"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <JournalEditor
              content={content}
              setContent={setContent}
              onSave={handleSave}
              onBack={handleBack}
              isEditing={!!editingId}
              date={
                editingId
                  ? sortedEntries.find((e) => e.id === editingId)?.date ??
                    todayISO
                  : todayISO
              }
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </PullToRefresh>
  )
}

// ============================================================================
// Journal List
// ============================================================================

function JournalList({
  entries,
  todayEntry,
  onNewEntry,
  onSelectEntry,
}: {
  entries: JournalEntryItem[]
  todayEntry: JournalEntryItem | undefined
  onNewEntry: () => void
  onSelectEntry: (entry: JournalEntryItem) => void
}) {
  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Diario</h1>
        <p className="text-sm text-muted-foreground">{formatDateSpanish()}</p>
      </div>

      {/* Today's entry CTA */}
      <motion.button
        onClick={onNewEntry}
        whileTap={{ scale: 0.98 }}
        className="mb-6 flex w-full items-center gap-3 rounded-xl border border-border/50 bg-card p-4 text-left transition-colors hover:bg-muted/50"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          {todayEntry ? (
            <PenLine className="h-5 w-5 text-primary" />
          ) : (
            <Plus className="h-5 w-5 text-primary" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">
            {todayEntry ? 'Continuar reflexión de hoy' : 'Escribir reflexión de hoy'}
          </p>
          <p className="text-xs text-muted-foreground">
            {todayEntry
              ? `${todayEntry.content.slice(0, 60)}${todayEntry.content.length > 60 ? '...' : ''}`
              : 'Tómate un momento para reflexionar'}
          </p>
        </div>
      </motion.button>

      {/* Past entries */}
      {entries.length > 0 ? (
        <div>
          <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
            Entradas anteriores
          </h2>
          <div className="space-y-2">
            {entries.map((entry, idx) => (
              <motion.button
                key={entry.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                onClick={() => onSelectEntry(entry)}
                whileTap={{ scale: 0.98 }}
                className="flex w-full flex-col gap-1 rounded-lg px-3 py-3 text-left transition-colors hover:bg-muted/50"
              >
                <span className="text-xs font-medium text-muted-foreground">
                  {formatRelativeDate(entry.date)}
                </span>
                <span className="line-clamp-2 text-sm leading-relaxed text-foreground/80">
                  {entry.content}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
            <PenLine className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            Tus reflexiones aparecerán aquí
          </p>
        </div>
      )}
    </>
  )
}

// ============================================================================
// Journal Editor
// ============================================================================

function JournalEditor({
  content,
  setContent,
  onSave,
  onBack,
  isEditing,
  date,
}: {
  content: string
  setContent: (v: string) => void
  onSave: () => void
  onBack: () => void
  isEditing: boolean
  date: string
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // Auto-focus the textarea
    setTimeout(() => textareaRef.current?.focus(), 100)
  }, [])

  return (
    <>
      {/* Editor header */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          Volver
        </button>
        <button
          onClick={onSave}
          disabled={!content.trim()}
          className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-40"
        >
          Guardar
        </button>
      </div>

      {/* Date display */}
      <p className="mb-4 text-sm text-muted-foreground">
        {formatRelativeDate(date)} — {formatDateSpanish(new Date(date + 'T12:00:00'))}
      </p>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escribe tu reflexión..."
        aria-label="Reflexión del diario"
        className="min-h-[50vh] w-full resize-none bg-transparent text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
      />
    </>
  )
}

// ============================================================================
// Skeleton
// ============================================================================

function JournalSkeleton() {
  return (
    <div className="mx-auto w-full max-w-lg animate-pulse px-4 py-6">
      <div className="mb-6">
        <div className="mb-2 h-7 w-24 rounded bg-muted" />
        <div className="h-4 w-40 rounded bg-muted" />
      </div>
      <div className="mb-6 h-20 rounded-xl bg-muted" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  )
}
