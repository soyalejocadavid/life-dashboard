'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X } from 'lucide-react'
import { useNotifications } from '@/hooks/use-notifications'

export function NotificationBanner() {
  const { shouldShowBanner, requestPermission, dismissBanner } = useNotifications()

  if (!shouldShowBanner) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="overflow-hidden"
      >
        <div className="flex items-center gap-3 rounded-xl border border-border/50 bg-card p-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Bell className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">Recordatorios diarios</p>
            <p className="text-xs text-muted-foreground">
              Recibe un recordatorio para completar tus acciones
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              onClick={requestPermission}
              aria-label="Activar recordatorios diarios"
              className="rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Activar
            </button>
            <button
              onClick={dismissBanner}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Cerrar"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
