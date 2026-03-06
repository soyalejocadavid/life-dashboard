# Prompt para Claude Code — Proyecto de Vida Dashboard

## Prompt inicial (copia y pega esto en Claude Code):

---

Quiero crear un dashboard web llamado "Proyecto de Vida" basado en el método Harada (Open Window 64) para desarrollo personal y familiar.

En la carpeta `/docs` tienes dos archivos de referencia:
- `proyecto_de_vida_harada.docx` — el plan completo con diagnóstico, 7 pilares, 8 sub-metas y 64 acciones
- `harada_dashboard.jsx` — un prototipo React funcional que sirve como referencia de estructura de datos, lógica y diseño visual

Lee ambos archivos antes de empezar. El .docx es la fuente de verdad del contenido. El .jsx es referencia de UX/UI y estructura de datos, pero vamos a reconstruirlo como un proyecto real.

## Stack tecnológico:
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Supabase (auth + base de datos + real-time)
- Shadcn/ui para componentes base
- Recharts para visualizaciones
- Desplegado en Vercel

## Arquitectura de la app:

### Módulos principales:
1. **Dashboard Overview** — Radar de 7 pilares, promedio general, progreso del día, meta central
2. **Check-in Diario** — Lista de acciones diarias agrupadas por pilar, con checkboxes persistentes
3. **Open Window 64** — Visualización de la matriz 8x8 con las sub-metas y sus acciones
4. **Detalle por Pilar** — Vista individual con puntaje actual vs meta, slider para actualizar, historial de puntajes, y las 8 acciones del pilar
5. **Journal / Diario** — Entrada de texto libre diaria + historial
6. **Revisión Semanal** — Resumen de la semana, porcentaje de cumplimiento por pilar, reflexión semanal
7. **Progreso** — Gráficos de tendencia de puntajes por pilar a lo largo del tiempo

### Modelo de datos (Supabase):
- `users` — autenticación y perfil
- `pillars` — los 7 pilares con puntaje actual, meta, diagnóstico
- `sub_goals` — las 8 sub-metas con descripción y estado
- `actions` — las 64 acciones con frecuencia (daily/weekly/monthly/quarterly), pilar asociado
- `check_ins` — registro diario de acciones completadas (user_id, action_id, date, completed)
- `pillar_scores` — historial de puntajes por pilar (user_id, pillar_id, score, date)
- `journal_entries` — entradas del diario (user_id, date, content, mood_score)
- `weekly_reviews` — revisiones semanales (user_id, week_start, reflection, highlights, blockers)

### Diseño:
- Dark mode por defecto (fondo oscuro #0a0a0f)
- Cada pilar tiene un color asignado consistente en toda la app
- Mobile-first, responsive
- Animaciones sutiles con framer-motion
- Tipografía limpia, espaciado generoso
- El tono visual debe sentirse como una herramienta personal premium, no como una app corporativa

### Datos iniciales:
Precarga la app con los datos de mi diagnóstico:
- Salud Mental: 5.5/10, meta 8.0
- Bienestar Físico: 1.5/10, meta 6.0
- Relación de Pareja: 1.5/10, meta 7.0
- Conexión Espiritual: 1.5/10, meta 5.5
- Bienestar Económico: 7.5/10, meta 9.0
- Desarrollo Intelectual: 5.5/10, meta 8.0
- Propósito: 3.5/10, meta 7.0
- Integración Familia/Social: 5.5/10, meta 7.5

Las 64 acciones con sus frecuencias están en el documento .docx.

## Prioridad de desarrollo:
1. Setup del proyecto (Next.js + Tailwind + Shadcn + Supabase)
2. Modelo de datos y migraciones de Supabase
3. Auth básico
4. Dashboard Overview con radar
5. Check-in diario funcional
6. Vista de pilar individual
7. Journal
8. Open Window 64
9. Revisión semanal
10. Gráficos de progreso

Comienza con el setup del proyecto usando el skill de nuevo-proyecto, y luego avancemos paso a paso.

---

## Notas adicionales:

- Si el skill nuevo-proyecto te pide decisiones sobre stack, usa las indicaciones de arriba
- Puedes usar `npx create-next-app@latest` con TypeScript, ESLint, Tailwind, App Router, y sin src/ directory
- Para Supabase puedes empezar con `npx supabase init` y definir las migraciones localmente
- El prompt es largo a propósito — dale todo el contexto de una vez para que Claude Code pueda planificar bien
