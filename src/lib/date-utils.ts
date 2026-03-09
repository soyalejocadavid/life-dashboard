import type { ActionFrequency } from '@/types'

// ============================================================================
// Date utilities for check-in periods and display formatting
// ============================================================================

/**
 * Returns the ISO date string (YYYY-MM-DD) for the start of the current period.
 * Used as part of the check-in key to track completion per period.
 */
export function getPeriodStart(
  frequency: ActionFrequency,
  date: Date = new Date()
): string {
  const d = new Date(date)

  switch (frequency) {
    case 'daily':
      return toISO(d)

    case 'weekly': {
      // Most recent Monday
      const day = d.getDay()
      const diff = day === 0 ? 6 : day - 1 // Sunday=6 back, else day-1
      d.setDate(d.getDate() - diff)
      return toISO(d)
    }

    case 'monthly':
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`

    case 'quarterly': {
      const quarterMonth = Math.floor(d.getMonth() / 3) * 3
      return `${d.getFullYear()}-${pad(quarterMonth + 1)}-01`
    }

    default:
      return toISO(d)
  }
}

/**
 * Returns whether an action with a given frequency should show today.
 * - daily: always
 * - weekly: on Mondays (but remains checkable all week)
 * - monthly: on the 1st
 * - quarterly: on Jan 1, Apr 1, Jul 1, Oct 1
 *
 * NOTE: For a better UX, weekly/monthly/quarterly actions show every day
 * but are only "fresh" on their trigger day. We show all frequencies
 * so users can always see and check their full action set.
 */
export function shouldShowToday(
  frequency: ActionFrequency,
  _date: Date = new Date()
): boolean {
  // Show all actions every day for MVP — users should see their full set
  // The frequency badge indicates the intended cadence
  return true
}

/**
 * Returns whether this is the "trigger day" for a frequency
 * (the day when the action resets / becomes fresh)
 */
export function isTriggerDay(
  frequency: ActionFrequency,
  date: Date = new Date()
): boolean {
  switch (frequency) {
    case 'daily':
      return true
    case 'weekly':
      return date.getDay() === 1 // Monday
    case 'monthly':
      return date.getDate() === 1
    case 'quarterly':
      return date.getDate() === 1 && date.getMonth() % 3 === 0
    default:
      return true
  }
}

/**
 * Format date in Spanish: "Viernes 6 de marzo"
 */
export function formatDateSpanish(date: Date = new Date()): string {
  const days = [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
  ]
  const months = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre',
  ]

  return `${days[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]}`
}

/**
 * Get greeting based on time of day
 */
export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Buenos días'
  if (hour < 18) return 'Buenas tardes'
  return 'Buenas noches'
}

/**
 * Format date for journal list: "Hoy", "Ayer", or "Lunes 3 de marzo"
 */
export function formatRelativeDate(dateStr: string): string {
  const today = new Date()
  const date = new Date(dateStr + 'T12:00:00') // Noon to avoid timezone issues

  const todayISO = toISO(today)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayISO = toISO(yesterday)

  if (dateStr === todayISO) return 'Hoy'
  if (dateStr === yesterdayISO) return 'Ayer'

  return formatDateSpanish(date)
}

/**
 * Get today's date as ISO string (YYYY-MM-DD)
 */
export function getTodayISO(): string {
  return toISO(new Date())
}

// ============================================================================
// Helpers
// ============================================================================

function toISO(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

function pad(n: number): string {
  return n.toString().padStart(2, '0')
}
