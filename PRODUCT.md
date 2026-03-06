# Life Dashboard — Coach Digital de Desarrollo Personal

## Problema

Las personas tienen metas ambiciosas de desarrollo personal pero carecen de un sistema que integre diagnóstico, planificación y seguimiento diario de forma holística. Life Dashboard transforma metas a 1 año en acciones concretas y medibles usando el método Harada, guiado por un coach digital con inteligencia artificial que conecta patrones entre 7 pilares de vida: salud mental, bienestar físico, relaciones, espiritualidad, economía, desarrollo intelectual y propósito.

## Usuarios

- **MVP**: Uso personal — el creador y su esposa (2 usuarios).
- **Visión futura**: Abrir la plataforma a más personas para que hagan su diagnóstico y creen un plan personalizado.

## Diferenciadores Competitivos

Estos son los diferenciadores que el MVP debe hacer brillar:

1. **Metodología Harada (Open Window 64)** — Ningún competidor usa un framework estructurado de goal-setting. El flujo meta central → 8 sub-metas → 64 acciones es el corazón del producto. La visualización del Open Window 64 como matriz interactiva es lo que nos hace únicos estructuralmente.
2. **Onboarding conversacional que conecta patrones** — Nos separa de Remente y Wheel of Life (formularios estáticos). Los micro-insights que conectan pilares entre sí son el momento "wow" del producto.
3. **Coach AI que piensa sistémicamente** — El coaching engine no trata cada pilar como issue aislado. Explica por qué calibra ciertos puntajes objetivo con contexto real del usuario. Inteligencia contextual que ningún Rocky.ai o Purpose.app ofrece.
4. **Plan de acción personalizado generado por AI** — Las 64 acciones no son un template fijo. Se generan basadas en las respuestas específicas del diagnóstico de cada usuario.
5. **Enfoque holístico con familia** — Pilares de relación de pareja y paternidad que ningún competidor ofrece. No somos una app de productividad individual — somos un coach de vida personal Y familiar.
6. **Estética premium dark mode** — UI tipo Linear/Oura vs la estética genérica/anticuada de la competencia.

## MVP — Features Core

### 1. Diagnóstico Conversacional (Prioridad #1)
Entry point obligatorio y primera impresión del producto. Un onboarding tipo conversación con un coach empático (no un formulario) que evalúa los 7 pilares de vida. Incluye:
- Coach guía pilar por pilar con preguntas contextuales
- Quotes y reflexiones relevantes al pilar que se está explorando
- Micro-insights entre pilares conectando patrones (generados por el coaching engine)
- Radar SVG que se construye en tiempo real conforme avanza el diagnóstico
- Inputs: selección múltiple, escalas, texto libre

### 2. Coaching Engine (Versión Fundacional)
El cerebro del producto. Un motor de IA basado en Claude que contextualiza la información del usuario y genera intervenciones inteligentes. Para el MVP:
- System prompt robusto de coaching con método Harada, principios de coaching de desarrollo personal, y contexto específico del usuario
- Acceso al diagnóstico completo del usuario
- Genera micro-insights durante el onboarding conectando patrones entre pilares
- Genera el plan Harada personalizado al finalizar el diagnóstico: meta central + 8 sub-metas con puntajes objetivo calibrados + 64 acciones con frecuencias
- Explica por qué calibra ciertos puntajes objetivo (ej: "propongo meta de 6 en bienestar físico y no 8 porque vienes de 1.5 — subir 4.5 puntos en un año es ambicioso pero realista")
- Genera acciones específicas basadas en las respuestas del diagnóstico (ej: si el usuario menciona inflamación en muñecas, las acciones de bienestar físico incluyen pausas activas para eso)
- Las llamadas a la API se ejecutan desde Supabase Edge Functions (API key nunca expuesta al cliente)

### 3. Visualización del Open Window 64
Matriz interactiva 8x8 del método Harada. Es el framework diferenciador y debe ser visible desde el día 1:
- Meta central en el centro
- 8 sub-metas alrededor con puntajes objetivo calibrados
- 64 acciones organizadas en la matriz con frecuencias
- Navegación intuitiva: tap en sub-meta expande sus 8 acciones
- Visual que comunica la estructura y profundidad del plan

### 4. Dashboard con Check-in Diario
Seguimiento diario del progreso. En el MVP es funcional sin intervención activa del coach:
- Radar SVG de los 7 pilares con puntajes actuales
- Checkboxes persistentes de las 64 acciones organizadas por pilar
- Progreso visual por pilar
- Máximo 2 taps para marcar cualquier acción (inspirado en Streaks)
- Animaciones satisfactorias al completar acciones (Framer Motion)

### 5. Journal de Reflexión
Espacio íntimo tipo Day One para escritura libre:
- Tipografía impecable que invite a la reflexión
- Metadatos automáticos (fecha)
- Interfaz limpia, sin distracciones

### Flujo del MVP
Usuario entra → Diagnóstico conversacional (coach guía pilar por pilar con quotes e insights) → Radar completo con hallazgos → Coaching engine genera plan personalizado (meta + sub-metas + 64 acciones) → Visualización del Open Window 64 → Usuario revisa y confirma → Se desbloquea el dashboard con check-in diario y journal.

## Fuera de Scope (v1)

### Iteración 2 (mes 2-3)
- Coach activo en el check-in diario con insights contextuales
- Revisión semanal y mensual guiada por el coach
- Gráficos de tendencia de puntajes por pilar a lo largo del tiempo
- Re-evaluación mensual de puntajes con comparativa vs mes anterior

### Iteración 3 (mes 3-4)
- Notificaciones inteligentes (push contextual basada en datos reales)
- Detección de patrones y alertas de estancamiento
- Celebración de rachas y logros
- Modo pareja: dashboard compartido con progreso mutuo
- Onboarding multi-idioma (español e inglés)

### Iteración 4 (mes 4-6)
- Biblioteca de contenido curado por pilar (libros, artículos, podcasts, ejercicios — posiblemente curado con AI)
- Temas y personalización visual del dashboard
- Exportar reportes de progreso como PDF
- Integración con Google Calendar para bloquear tiempo de acciones
- Integración con wearables y apps de salud (Google Fit, Apple Health)

### Visión a largo plazo (6-12 meses)
- Marketplace de plantillas de pilares (frameworks compartidos por usuarios)
- Comunidad: grupos de accountability
- Sesiones de coaching en video/audio (coach de voz)
- App mobile nativa (iOS/Android)
- Dashboard para coaches profesionales
- API pública para integraciones con apps de salud, meditación, ejercicio
- Multi-idioma ampliado (30+ idiomas)

## Plataforma

- **MVP**: Web responsive en el navegador, diseño mobile-first (80% del uso será en celular)
- **PWA**: Progressive Web App desde el inicio — instalable en home screen, pantalla completa, acceso offline básico al último check-in
- **Deploy**: Vercel (frontend) + Supabase (backend)
- **Mobile nativo**: En roadmap largo, solo cuando haya masa crítica de usuarios o se necesiten APIs del dispositivo (HealthKit, sensores)

## Datos y APIs

### Fuentes de datos
1. **Input del usuario**: Respuestas del diagnóstico (selección múltiple, escalas, texto libre), check-ins diarios (checkboxes), entradas del journal (texto libre), actualizaciones de puntajes
2. **Generado por el coaching engine**: Micro-insights, meta central, 8 sub-metas con puntajes objetivo, 64 acciones personalizadas con frecuencias

### Servicios externos (MVP)
- **Anthropic API (Claude Sonnet 4.6)**: Cerebro del coaching engine. ~7-8 llamadas por onboarding, ~$0.05-$0.10 por usuario. Llamadas desde Supabase Edge Functions.
- **Supabase**: Auth (email + Google OAuth), PostgreSQL, Edge Functions, Row Level Security.
- **Vercel**: Hosting y deploy del frontend Next.js.

### Contenido curado
- Dataset estático en JSON de quotes y frases motivacionales, organizado por pilar y por situación (onboarding, logro, estancamiento). Sin CMS en V1.

### Costos estimados
- Costo mensual para uso personal: < $1 USD
- Tier 1 de Anthropic ($100/mes spend limit) cubre el MVP con margen amplio

### Optimizaciones previstas para escalar
- Prompt caching (hasta 90% ahorro en input tokens repetidos)
- Batch API (50% descuento para generación no-realtime)
- Model routing: Haiku para tareas simples, Sonnet para coaching real

## Referencia de Diseño

### Apps de referencia
| App | Referencia |
|-----|-----------|
| **Headspace** | Onboarding conversacional, tono cálido y humano |
| **Oura Ring** | Visualización de scores, dark mode elegante |
| **Streaks** | Check-in diario simple y satisfactorio (2 taps) |
| **Day One** | Experiencia de journaling íntima, tipografía impecable |
| **Linear** | Estética dark mode del dashboard, densidad sin ruido |

### Principios de diseño
- Dark mode como default
- Mobile-first
- Onboarding conversacional (no formularios)
- Scores simples en superficie, profundos al explorar
- Check-in de máximo 2 taps con animaciones satisfactorias
- Journal como espacio íntimo con tipografía cuidada
- Animaciones sutiles pero presentes (Framer Motion)
- Colores de acento consistentes por pilar en toda la app

## Stack Técnico

### Core
- **Framework**: Next.js 14+ (App Router) con TypeScript
- **Deploy**: Vercel
- **Backend/DB/Auth**: Supabase (PostgreSQL + Auth + Edge Functions + RLS)
- **AI**: Anthropic API (Claude Sonnet 4.6)

### UI y Styling
- **Componentes**: Shadcn/ui (headless + Tailwind)
- **Styling**: Tailwind CSS
- **Iconos**: Lucide React
- **Animaciones**: Framer Motion

### Visualizaciones
- **Gráficos**: Recharts (progreso y tendencias)
- **Radar**: SVG custom (más control que librerías de charts)

### Estado y Data
- **Estado global**: Zustand
- **Server state**: TanStack Query (React Query)
- **Formularios**: React Hook Form + Zod

### PWA
- next-pwa o Serwist (service worker + manifest)

### Testing (post-MVP)
- Vitest (unit) + Playwright (e2e)

### Explícitamente excluido
- Redux, CSS-in-JS, Material UI / Chakra / Ant Design, Firebase, GraphQL, Prisma, MongoDB, Electron

## Próximos Pasos

1. Inicializar proyecto Next.js con TypeScript, Tailwind, Shadcn/ui, Framer Motion, Zustand, TanStack Query, React Hook Form + Zod, y configuración de PWA
2. Configurar Supabase: esquema de base de datos (usuarios, diagnósticos, pilares, planes, sub-metas, acciones, check-ins, journal), auth con email + Google OAuth, y Row Level Security
3. Diseñar y construir el flujo de diagnóstico conversacional con el dataset de quotes por pilar y micro-insights
4. Implementar el coaching engine: system prompt de coaching, Edge Function que recibe el diagnóstico y genera el plan Harada personalizado (meta + sub-metas con puntajes calibrados + 64 acciones específicas)
5. Construir la visualización del Open Window 64 como matriz interactiva
6. Construir el dashboard con radar de pilares, check-in diario (checkboxes persistentes, progreso por pilar, animaciones tipo Streaks) y journal de reflexión
