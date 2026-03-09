import type { PillarId } from '@/types'

export interface Quote {
  text: string
  author: string
}

// Quotes shown during onboarding, one per pillar introduction
export const PILLAR_QUOTES: Record<PillarId, Quote[]> = {
  'mental-health': [
    {
      text: 'La mente es un excelente sirviente pero un terrible amo.',
      author: 'David Foster Wallace',
    },
    {
      text: 'No eres tus pensamientos. Eres quien los observa.',
      author: 'Eckhart Tolle',
    },
    {
      text: 'La calma mental no es la ausencia de conflicto, sino la habilidad de lidiar con él.',
      author: 'Desconocido',
    },
  ],
  'physical-wellbeing': [
    {
      text: 'Cuida tu cuerpo. Es el único lugar que tienes para vivir.',
      author: 'Jim Rohn',
    },
    {
      text: 'El movimiento es una medicina para crear el cambio físico, emocional y mental.',
      author: 'Carol Welch',
    },
    {
      text: 'Tu cuerpo escucha todo lo que tu mente dice.',
      author: 'Naomi Judd',
    },
  ],
  relationships: [
    {
      text: 'La calidad de tu vida es la calidad de tus relaciones.',
      author: 'Tony Robbins',
    },
    {
      text: 'Ser profundamente amado te da fuerza. Amar profundamente te da coraje.',
      author: 'Lao Tzu',
    },
    {
      text: 'Las personas más felices no tienen lo mejor de todo. Hacen lo mejor de todo lo que tienen.',
      author: 'Desconocido',
    },
  ],
  spirituality: [
    {
      text: 'El sentido de la vida es encontrar tu don. El propósito de la vida es regalarlo.',
      author: 'Pablo Picasso',
    },
    {
      text: 'La vida sin examen no merece ser vivida.',
      author: 'Sócrates',
    },
    {
      text: 'No somos seres humanos teniendo una experiencia espiritual. Somos seres espirituales teniendo una experiencia humana.',
      author: 'Pierre Teilhard de Chardin',
    },
  ],
  finances: [
    {
      text: 'No se trata de cuánto dinero ganas, sino de cuánto conservas y cómo trabaja para ti.',
      author: 'Robert Kiyosaki',
    },
    {
      text: 'La riqueza no es su salario. La riqueza es lo que queda cuando dejas de trabajar.',
      author: 'Naval Ravikant',
    },
    {
      text: 'El dinero es un amplificador. Amplifica lo que ya eres.',
      author: 'Desconocido',
    },
  ],
  'intellectual-growth': [
    {
      text: 'La inversión en conocimiento siempre paga el mejor interés.',
      author: 'Benjamin Franklin',
    },
    {
      text: 'El día que dejas de aprender es el día que empiezas a morir.',
      author: 'Albert Einstein',
    },
    {
      text: 'No tengo talentos especiales. Solo soy apasionadamente curioso.',
      author: 'Albert Einstein',
    },
  ],
  purpose: [
    {
      text: 'El que tiene un porqué para vivir puede soportar casi cualquier cómo.',
      author: 'Friedrich Nietzsche',
    },
    {
      text: 'Tu trabajo va a llenar gran parte de tu vida. La única manera de estar verdaderamente satisfecho es hacer lo que crees que es un gran trabajo.',
      author: 'Steve Jobs',
    },
    {
      text: 'No es lo que obtienes lo que te hace feliz. Es en quién te conviertes.',
      author: 'Jim Rohn',
    },
  ],
}

// Get a random quote for a pillar
export function getRandomQuote(pillarId: PillarId): Quote {
  const quotes = PILLAR_QUOTES[pillarId]
  return quotes[Math.floor(Math.random() * quotes.length)]
}
