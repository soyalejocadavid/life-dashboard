# UX Polish — Plan de Implementación

## Resumen
5 features de UX polish: theme toggle, tab transitions, pull-to-refresh, onboarding persistence, notificaciones.

---

## 1. Dark/Light Mode Toggle (Light default)

**Archivos:**
- `package.json` — instalar `next-themes`
- `src/lib/providers.tsx` — wrappear con `ThemeProvider` de next-themes (`defaultTheme="light"`, `attribute="class"`)
- `src/app/layout.tsx` — quitar `className="dark"` hardcodeado, agregar `suppressHydrationWarning` al `<html>`
- `src/app/globals.css` — cambiar selector dark de `.dark` a `@custom-variant dark (&:is(.dark *))` (ya existe, compatible con next-themes)
- `src/components/shared/theme-toggle.tsx` — **NUEVO** botón Sun/Moon con animación de rotación
- `src/components/shared/bottom-nav.tsx` — agregar el toggle a la esquina del nav
- `public/manifest.json` — cambiar colores a light (`#ffffff`)
- `src/app/layout.tsx` viewport — themeColor `#ffffff`

**Lógica:** next-themes maneja la clase `dark` en `<html>`, persiste en localStorage, previene flash con script inyectado.

---

## 2. Tab Transition Animations

**Archivos:**
- `src/app/(app)/template.tsx` — **NUEVO** wrapper con Framer Motion

**Lógica:** En Next.js App Router, `template.tsx` se re-monta en cada navegación dentro del route group. Envolvemos `{children}` con `motion.div` con fade sutil (opacity 0→1, duration ~200ms). Ligero, no bloqueante.

---

## 3. Pull-to-Refresh

**Archivos:**
- `src/components/shared/pull-to-refresh.tsx` — **NUEVO** componente wrapper que detecta pull-down en touch devices
- `src/app/(app)/dashboard/page.tsx` — envolver contenido con `PullToRefresh` que invalida TanStack Query
- `src/app/(app)/journal/page.tsx` — mismo patrón

**Lógica:** Detectar `touchstart` → `touchmove` (solo cuando scroll está en top) → `touchend`. Si delta Y > threshold (60px), disparar callback. Mostrar indicador circular animado. El callback ejecuta `queryClient.invalidateQueries()`.

---

## 4. Onboarding Progress Persistence

**Archivos:**
- `src/stores/app-store.ts` — agregar `diagnosticProgress` al estado persistido con: `{ currentPillarIndex, responses, scores, completedPillars }`
- `src/components/onboarding/diagnostic-flow.tsx` — al responder, guardar progreso en store. Al montar, verificar si hay progreso guardado y resumir.
- `src/app/(app)/onboarding/page.tsx` — limpiar progreso al confirmar plan

**Lógica:** Cada vez que el usuario responde una pregunta, guardamos en Zustand (que persiste a localStorage). Si sale y vuelve, detectamos progreso guardado y ofrecemos "Continuar donde te quedaste" vs "Empezar de nuevo".

---

## 5. Notificaciones Push (Recordatorios diarios)

**Archivos:**
- `src/hooks/use-notifications.ts` — **NUEVO** hook para pedir permiso + programar notificaciones
- `src/components/shared/notification-banner.tsx` — **NUEVO** banner sutil para pedir permiso de notificaciones
- `src/app/(app)/dashboard/page.tsx` — mostrar banner si permiso no ha sido decidido

**Lógica:** Usamos la Notification API del browser. Al hacer grant, programamos un recordatorio diario (vía `setTimeout` calculando horas hasta las 9am del día siguiente). El SW maneja `self.registration.showNotification()`. Para MVP, es recordatorio local básico — no requiere push server.

---

## Orden de implementación
1. Theme toggle (base para todo lo visual)
2. Tab transitions (rápido, 1 archivo)
3. Pull-to-refresh (componente reutilizable)
4. Onboarding persistence (store + diagnostic-flow)
5. Notificaciones (feature independiente)

## Archivos nuevos: 5
## Archivos modificados: ~8
