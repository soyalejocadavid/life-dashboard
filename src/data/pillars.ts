import { type Pillar, type PillarId } from '@/types'

export const PILLAR_CONFIG: Record<PillarId, Pillar> = {
  'mental-health': {
    id: 'mental-health',
    name: 'Salud Mental',
    description: 'Claridad mental, manejo del estrés, equilibrio emocional',
    icon: 'Brain',
    color: '#8B5CF6', // violet
  },
  'physical-wellbeing': {
    id: 'physical-wellbeing',
    name: 'Bienestar Físico',
    description: 'Ejercicio, nutrición, descanso, energía corporal',
    icon: 'Heart',
    color: '#EF4444', // red
  },
  relationships: {
    id: 'relationships',
    name: 'Relaciones',
    description: 'Pareja, familia, amistades, comunidad',
    icon: 'Users',
    color: '#F59E0B', // amber
  },
  spirituality: {
    id: 'spirituality',
    name: 'Espiritualidad',
    description: 'Conexión interior, meditación, valores, trascendencia',
    icon: 'Sparkles',
    color: '#06B6D4', // cyan
  },
  finances: {
    id: 'finances',
    name: 'Economía',
    description: 'Ingresos, ahorro, inversiones, libertad financiera',
    icon: 'TrendingUp',
    color: '#22C55E', // green
  },
  'intellectual-growth': {
    id: 'intellectual-growth',
    name: 'Desarrollo Intelectual',
    description: 'Aprendizaje, lectura, habilidades, crecimiento profesional',
    icon: 'BookOpen',
    color: '#3B82F6', // blue
  },
  purpose: {
    id: 'purpose',
    name: 'Propósito',
    description: 'Misión de vida, legado, contribución al mundo',
    icon: 'Compass',
    color: '#EC4899', // pink
  },
}

export const PILLAR_LIST = Object.values(PILLAR_CONFIG)
