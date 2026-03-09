'use client'

import { useCallback, useEffect, useState } from 'react'

type NotificationPermission = 'default' | 'granted' | 'denied'

export function useNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    const supported = typeof window !== 'undefined' && 'Notification' in window
    setIsSupported(supported)
    if (supported) {
      setPermission(Notification.permission as NotificationPermission)
    }
  }, [])

  const requestPermission = useCallback(async () => {
    if (!isSupported) return 'denied' as NotificationPermission

    const result = await Notification.requestPermission()
    setPermission(result as NotificationPermission)

    if (result === 'granted') {
      // Show a welcome notification
      new Notification('Life Dashboard', {
        body: '¡Notificaciones activadas! Te recordaremos tus acciones diarias.',
        icon: '/icons/icon-192.png',
      })

      // Schedule daily reminder
      scheduleDailyReminder()
    }

    return result as NotificationPermission
  }, [isSupported])

  const dismissBanner = useCallback(() => {
    // Save dismissal to localStorage so we don't ask again
    localStorage.setItem('ld-notification-dismissed', 'true')
  }, [])

  const wasDismissed = typeof window !== 'undefined'
    ? localStorage.getItem('ld-notification-dismissed') === 'true'
    : false

  const shouldShowBanner =
    isSupported && permission === 'default' && !wasDismissed

  return {
    permission,
    isSupported,
    shouldShowBanner,
    requestPermission,
    dismissBanner,
  }
}

/**
 * Schedule a daily reminder notification.
 * Uses setTimeout to fire at approximately 9:00 AM.
 * Re-schedules itself after firing.
 */
function scheduleDailyReminder() {
  const now = new Date()
  const target = new Date()
  target.setHours(9, 0, 0, 0)

  // If it's past 9 AM today, schedule for tomorrow
  if (now.getTime() > target.getTime()) {
    target.setDate(target.getDate() + 1)
  }

  const delay = target.getTime() - now.getTime()

  setTimeout(() => {
    if (Notification.permission === 'granted') {
      new Notification('¡Buenos días! ☀️', {
        body: 'Tus acciones de hoy te esperan. Cada pequeño paso cuenta.',
        icon: '/icons/icon-192.png',
        tag: 'daily-reminder', // Prevents duplicate notifications
      })
    }
    // Re-schedule for tomorrow
    scheduleDailyReminder()
  }, delay)
}
