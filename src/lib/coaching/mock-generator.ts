import { PILLAR_CONFIG } from '@/data/pillars'
import { PILLARS, type ActionFrequency, type PillarId } from '@/types'
import type { CoachingInput, GeneratedPlan, GeneratedSubGoal } from './types'

/**
 * Mock plan generator for development.
 * Produces a realistic Harada plan based on diagnostic scores.
 *
 * ⚠️  This will be replaced by the real coaching engine (Claude API)
 *     once the system prompt is finalized.
 */
export function generateMockPlan(input: CoachingInput): GeneratedPlan {
  const { pillarScores } = input

  // Sort pillars by score (lowest = most opportunity)
  const sortedPillars = [...PILLARS].sort(
    (a, b) => (pillarScores[a] ?? 5) - (pillarScores[b] ?? 5)
  )
  const weakest = sortedPillars[0]
  const strongest = sortedPillars[sortedPillars.length - 1]

  const centralGoal = getCentralGoal(weakest, strongest, pillarScores)

  const subGoals: GeneratedSubGoal[] = PILLARS.map((pillarId, index) => {
    const currentScore = pillarScores[pillarId] ?? 5
    const targetScore = calibrateTarget(currentScore)

    return {
      pillarId,
      title: getSubGoalTitle(pillarId, currentScore),
      currentScore,
      targetScore,
      rationale: getRationale(pillarId, currentScore, targetScore),
      position: index + 1,
      actions: generateActions(pillarId, currentScore),
    }
  })

  // Add an 8th integrative sub-goal
  subGoals.push({
    pillarId: weakest,
    title: `Integración: conectar ${PILLAR_CONFIG[weakest].name} con ${PILLAR_CONFIG[strongest].name}`,
    currentScore: pillarScores[weakest] ?? 3,
    targetScore: calibrateTarget(pillarScores[weakest] ?? 3),
    rationale: `Este sub-objetivo conecta tu pilar más fuerte con el que más necesita atención, creando un efecto multiplicador.`,
    position: 8,
    actions: generateIntegrativeActions(weakest, strongest),
  })

  return {
    centralGoal,
    coachingRationale: `Tu diagnóstico muestra que ${PILLAR_CONFIG[weakest].name} es donde más oportunidad hay (${pillarScores[weakest]?.toFixed(1)}), mientras que ${PILLAR_CONFIG[strongest].name} es tu pilar más fuerte (${pillarScores[strongest]?.toFixed(1)}). El plan está diseñado para elevar los pilares más bajos sin descuidar tus fortalezas, y conectar patrones entre áreas.`,
    subGoals,
  }
}

function calibrateTarget(current: number): number {
  // Realistic target: improve by 2-4 points max in a year
  if (current <= 3) return Math.min(current + 3, 10)
  if (current <= 5) return Math.min(current + 2.5, 10)
  if (current <= 7) return Math.min(current + 2, 10)
  return Math.min(current + 1, 10)
}

function getCentralGoal(
  weakest: PillarId,
  strongest: PillarId,
  scores: Record<PillarId, number>
): string {
  const avg =
    PILLARS.reduce((sum, p) => sum + (scores[p] ?? 5), 0) / PILLARS.length

  if (avg < 4) {
    return 'Construir una base sólida de bienestar integral, priorizando los pilares más urgentes y creando hábitos sostenibles en cada área de vida.'
  }
  if (avg < 6) {
    return `Elevar mi calidad de vida de forma equilibrada, con foco especial en ${PILLAR_CONFIG[weakest].name.toLowerCase()} como palanca de transformación para todo lo demás.`
  }
  return `Llevar mi vida al siguiente nivel de excelencia, refinando ${PILLAR_CONFIG[weakest].name.toLowerCase()} y profundizando en ${PILLAR_CONFIG[strongest].name.toLowerCase()}.`
}

function getSubGoalTitle(pillarId: PillarId, score: number): string {
  const titles: Record<PillarId, Record<string, string>> = {
    'mental-health': {
      low: 'Recuperar la paz mental y desarrollar herramientas de gestión emocional',
      mid: 'Fortalecer la claridad mental y reducir el ruido interior',
      high: 'Cultivar una mente resiliente y ecuánime ante cualquier circunstancia',
    },
    'physical-wellbeing': {
      low: 'Construir hábitos básicos de movimiento, descanso y alimentación',
      mid: 'Establecer una rutina consistente de ejercicio y nutrición consciente',
      high: 'Optimizar la vitalidad física como base para rendimiento máximo',
    },
    relationships: {
      low: 'Reconstruir la conexión con las personas más importantes',
      mid: 'Profundizar las relaciones clave y cultivar vulnerabilidad',
      high: 'Crear un ecosistema relacional que nutra y desafíe a todos',
    },
    spirituality: {
      low: 'Encontrar una práctica de conexión interior que resuene',
      mid: 'Desarrollar una vida interior que dé sentido y dirección',
      high: 'Integrar la espiritualidad como guía en cada decisión cotidiana',
    },
    finances: {
      low: 'Ordenar las finanzas y crear un fondo de emergencia básico',
      mid: 'Construir estabilidad financiera con sistema de ahorro e inversión',
      high: 'Avanzar hacia libertad financiera con ingresos diversificados',
    },
    'intellectual-growth': {
      low: 'Reactivar la curiosidad y crear un hábito de aprendizaje',
      mid: 'Dominar una habilidad clave y mantener un sistema de aprendizaje activo',
      high: 'Convertirse en referente en un área y enseñar a otros',
    },
    purpose: {
      low: 'Explorar qué le da sentido a mi vida y definir una dirección',
      mid: 'Alinear mis acciones diarias con mis valores y visión',
      high: 'Vivir con propósito claro y contribuir activamente al mundo',
    },
  }

  const level = score <= 4 ? 'low' : score <= 7 ? 'mid' : 'high'
  return titles[pillarId][level]
}

function getRationale(
  pillarId: PillarId,
  current: number,
  target: number
): string {
  const diff = target - current
  const name = PILLAR_CONFIG[pillarId].name.toLowerCase()

  if (current <= 3) {
    return `Propongo meta de ${target.toFixed(1)} en ${name} (estás en ${current.toFixed(1)}). Subir ${diff.toFixed(1)} puntos en un año es ambicioso pero realista — significa pasar de emergencia a estabilidad. Las acciones están diseñadas para ser progresivas.`
  }
  if (current <= 6) {
    return `Meta de ${target.toFixed(1)} en ${name} (actual: ${current.toFixed(1)}). Una mejora de ${diff.toFixed(1)} puntos te lleva de "aceptable" a "sólido". El foco es consistencia sobre intensidad.`
  }
  return `Meta de ${target.toFixed(1)} en ${name} (actual: ${current.toFixed(1)}). Ya tienes una buena base. El trabajo ahora es de refinamiento — subir ${diff.toFixed(1)} puntos en este rango alto requiere intencionalidad.`
}

const ACTION_TEMPLATES: Record<
  PillarId,
  { title: string; frequency: ActionFrequency }[]
> = {
  'mental-health': [
    { title: 'Meditación de 10 minutos al despertar', frequency: 'daily' },
    { title: 'Escribir 3 preocupaciones y su acción concreta', frequency: 'daily' },
    { title: 'Ejercicio de respiración 4-7-8 antes de dormir', frequency: 'daily' },
    { title: 'Desconexión digital 1 hora antes de dormir', frequency: 'daily' },
    { title: 'Sesión de journaling de gratitud', frequency: 'weekly' },
    { title: 'Caminata contemplativa sin teléfono (30 min)', frequency: 'weekly' },
    { title: 'Revisar y actualizar mis límites emocionales', frequency: 'monthly' },
    { title: 'Evaluación profunda: ¿qué me está quitando paz?', frequency: 'quarterly' },
  ],
  'physical-wellbeing': [
    { title: 'Ejercicio de fuerza o cardio (45 min mínimo)', frequency: 'daily' },
    { title: 'Preparar comida saludable para el día', frequency: 'daily' },
    { title: 'Hidratación: 2.5 litros de agua', frequency: 'daily' },
    { title: 'Stretching o movilidad (15 min)', frequency: 'daily' },
    { title: 'Dormir 7+ horas (acostarse antes de las 11pm)', frequency: 'daily' },
    { title: 'Actividad al aire libre (caminata, deporte, naturaleza)', frequency: 'weekly' },
    { title: 'Chequeo médico o seguimiento de salud', frequency: 'monthly' },
    { title: 'Evaluación de hábitos físicos y ajuste de rutina', frequency: 'quarterly' },
  ],
  relationships: [
    { title: 'Conversación profunda con mi pareja (sin pantallas)', frequency: 'daily' },
    { title: 'Expresar aprecio o gratitud a alguien cercano', frequency: 'daily' },
    { title: 'Tiempo de calidad con hijos/familia (actividad juntos)', frequency: 'daily' },
    { title: 'Enviar mensaje a un amigo que no he contactado', frequency: 'weekly' },
    { title: 'Date night o actividad especial con pareja', frequency: 'weekly' },
    { title: 'Llamar a familia extendida', frequency: 'weekly' },
    { title: 'Revisión: ¿cómo están mis relaciones más importantes?', frequency: 'monthly' },
    { title: 'Planear experiencia significativa con personas clave', frequency: 'quarterly' },
  ],
  spirituality: [
    { title: 'Momento de silencio o oración al iniciar el día', frequency: 'daily' },
    { title: 'Lectura espiritual o filosófica (15 min)', frequency: 'daily' },
    { title: 'Práctica de gratitud: 3 cosas específicas', frequency: 'daily' },
    { title: 'Reflexión antes de dormir: ¿viví alineado hoy?', frequency: 'daily' },
    { title: 'Tiempo en naturaleza con intención contemplativa', frequency: 'weekly' },
    { title: 'Práctica espiritual comunitaria o compartida', frequency: 'weekly' },
    { title: 'Retiro personal de medio día (reflexión profunda)', frequency: 'monthly' },
    { title: 'Revisión de valores: ¿están guiando mis decisiones?', frequency: 'quarterly' },
  ],
  finances: [
    { title: 'Registrar todos los gastos del día', frequency: 'daily' },
    { title: 'Revisar balance y estado de cuentas', frequency: 'weekly' },
    { title: 'Transferir monto fijo a cuenta de ahorro', frequency: 'weekly' },
    { title: 'Educación financiera: leer/escuchar 30 min', frequency: 'weekly' },
    { title: 'Revisar presupuesto mensual vs gastos reales', frequency: 'monthly' },
    { title: 'Evaluar oportunidades de ingreso adicional', frequency: 'monthly' },
    { title: 'Revisar inversiones y ajustar portafolio', frequency: 'monthly' },
    { title: 'Planificación financiera trimestral y metas', frequency: 'quarterly' },
  ],
  'intellectual-growth': [
    { title: 'Lectura enfocada (30 min mínimo)', frequency: 'daily' },
    { title: 'Practicar la habilidad que estoy desarrollando', frequency: 'daily' },
    { title: 'Tomar notas de lo aprendido (aprendizaje activo)', frequency: 'daily' },
    { title: 'Consumir contenido de profundidad (podcast/curso)', frequency: 'weekly' },
    { title: 'Escribir resumen de lo aprendido en la semana', frequency: 'weekly' },
    { title: 'Compartir conocimiento (enseñar a alguien)', frequency: 'weekly' },
    { title: 'Completar un módulo o capítulo de curso/libro', frequency: 'monthly' },
    { title: 'Evaluar progreso en habilidad clave y ajustar plan', frequency: 'quarterly' },
  ],
  purpose: [
    { title: 'Revisar mi misión personal al iniciar el día', frequency: 'daily' },
    { title: 'Dedicar 1 hora a mi proyecto de propósito', frequency: 'daily' },
    { title: 'Acto de servicio o contribución (pequeño o grande)', frequency: 'weekly' },
    { title: 'Journaling: ¿estoy viviendo alineado con mi propósito?', frequency: 'weekly' },
    { title: 'Conectar con alguien que comparta mi visión', frequency: 'weekly' },
    { title: 'Invertir en una causa que me importa', frequency: 'monthly' },
    { title: 'Revisar y refinar mi declaración de propósito', frequency: 'monthly' },
    { title: 'Evaluar: ¿mi vida se acerca a mi visión de legado?', frequency: 'quarterly' },
  ],
}

function generateActions(
  pillarId: PillarId,
  _score: number
): { title: string; frequency: ActionFrequency; position: number }[] {
  const templates = ACTION_TEMPLATES[pillarId]
  return templates.map((t, i) => ({
    title: t.title,
    frequency: t.frequency,
    position: i + 1,
  }))
}

function generateIntegrativeActions(
  weakest: PillarId,
  strongest: PillarId
): { title: string; frequency: ActionFrequency; position: number }[] {
  const weakName = PILLAR_CONFIG[weakest].name.toLowerCase()
  const strongName = PILLAR_CONFIG[strongest].name.toLowerCase()

  return [
    {
      title: `Reflexión: ¿cómo mi ${strongName} puede potenciar mi ${weakName}?`,
      frequency: 'daily' as ActionFrequency,
      position: 1,
    },
    {
      title: `Aplicar una fortaleza de ${strongName} a un reto de ${weakName}`,
      frequency: 'daily' as ActionFrequency,
      position: 2,
    },
    {
      title: `Journaling: patrones que conectan ${weakName} y ${strongName}`,
      frequency: 'weekly' as ActionFrequency,
      position: 3,
    },
    {
      title: `Diseñar una actividad que combine ambos pilares`,
      frequency: 'weekly' as ActionFrequency,
      position: 4,
    },
    {
      title: `Identificar un bloqueo en ${weakName} que afecta ${strongName}`,
      frequency: 'weekly' as ActionFrequency,
      position: 5,
    },
    {
      title: `Pedir feedback a alguien de confianza sobre ambos pilares`,
      frequency: 'monthly' as ActionFrequency,
      position: 6,
    },
    {
      title: `Revisar si el progreso en ${weakName} está mejorando ${strongName}`,
      frequency: 'monthly' as ActionFrequency,
      position: 7,
    },
    {
      title: `Evaluación integrada: ¿cómo se están nutriendo mutuamente?`,
      frequency: 'quarterly' as ActionFrequency,
      position: 8,
    },
  ]
}
