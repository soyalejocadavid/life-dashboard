import type { PillarId, QuestionType } from '@/types'

export interface DiagnosticQuestion {
  id: string
  pillarId: PillarId
  text: string
  coachIntro?: string // What the coach says before the question
  type: QuestionType
  options?: string[] // For multiple-choice
  scaleLabels?: { min: string; max: string } // For scale
  placeholder?: string // For text
  weight: number // Weight for score calculation (0-1)
}

export interface PillarDiagnostic {
  pillarId: PillarId
  coachGreeting: string // First message when entering this pillar
  questions: DiagnosticQuestion[]
}

export const DIAGNOSTIC_QUESTIONS: PillarDiagnostic[] = [
  // =========================================================================
  // 1. SALUD MENTAL
  // =========================================================================
  {
    pillarId: 'mental-health',
    coachGreeting:
      'Empecemos por lo más fundamental: tu mundo interior. La salud mental es el lente a través del cual ves todo lo demás.',
    questions: [
      {
        id: 'mh-1',
        pillarId: 'mental-health',
        text: '¿Cómo describirías tu nivel general de paz mental en este momento?',
        type: 'scale',
        scaleLabels: { min: 'Muy agitado', max: 'En calma profunda' },
        weight: 0.25,
      },
      {
        id: 'mh-2',
        pillarId: 'mental-health',
        coachIntro: 'Ahora pensemos en lo que pasa por tu mente día a día.',
        text: '¿Con qué frecuencia te sientes abrumado por pensamientos negativos o ruido mental?',
        type: 'multiple-choice',
        options: [
          'Casi todo el tiempo — me cuesta desconectar',
          'Frecuentemente — más días malos que buenos',
          'A veces — depende de la situación',
          'Rara vez — generalmente mantengo la calma',
          'Casi nunca — tengo herramientas que me ayudan',
        ],
        weight: 0.25,
      },
      {
        id: 'mh-3',
        pillarId: 'mental-health',
        text: '¿Tienes alguna práctica activa para cuidar tu salud mental? (meditación, terapia, journaling, etc.)',
        type: 'multiple-choice',
        options: [
          'No tengo ninguna práctica',
          'Lo he intentado pero no soy consistente',
          'Tengo una práctica que mantengo a veces',
          'Tengo una práctica regular que me ayuda',
          'Tengo varias prácticas integradas en mi rutina',
        ],
        weight: 0.2,
      },
      {
        id: 'mh-4',
        pillarId: 'mental-health',
        text: '¿Cómo manejas el estrés cuando las cosas se ponen difíciles?',
        type: 'scale',
        scaleLabels: {
          min: 'Me paralizo o exploto',
          max: 'Lo gestiono con claridad',
        },
        weight: 0.2,
      },
      {
        id: 'mh-5',
        pillarId: 'mental-health',
        coachIntro:
          'Esta última es más abierta. No hay respuesta correcta — solo tu honestidad.',
        text: '¿Qué es lo que más te quita paz mental en este momento de tu vida?',
        type: 'text',
        placeholder: 'Escribe libremente lo que venga a tu mente...',
        weight: 0.1,
      },
    ],
  },

  // =========================================================================
  // 2. BIENESTAR FÍSICO
  // =========================================================================
  {
    pillarId: 'physical-wellbeing',
    coachGreeting:
      'Hablemos de tu cuerpo. No desde la estética, sino desde cómo te sientes físicamente día a día. Tu energía, tu descanso, tu vitalidad.',
    questions: [
      {
        id: 'pw-1',
        pillarId: 'physical-wellbeing',
        text: '¿Cómo es tu nivel de energía a lo largo del día?',
        type: 'scale',
        scaleLabels: {
          min: 'Agotado constantemente',
          max: 'Energía alta y sostenida',
        },
        weight: 0.2,
      },
      {
        id: 'pw-2',
        pillarId: 'physical-wellbeing',
        coachIntro: 'El movimiento es medicina. Veamos dónde estás.',
        text: '¿Con qué frecuencia haces ejercicio o actividad física intencional?',
        type: 'multiple-choice',
        options: [
          'No hago ejercicio',
          '1-2 veces por semana, irregular',
          '2-3 veces por semana con algo de consistencia',
          '3-4 veces por semana de forma regular',
          '5+ veces por semana — es parte de mi identidad',
        ],
        weight: 0.25,
      },
      {
        id: 'pw-3',
        pillarId: 'physical-wellbeing',
        text: '¿Cómo es la calidad de tu sueño?',
        type: 'scale',
        scaleLabels: {
          min: 'Duermo mal y poco',
          max: 'Descanso profundo y reparador',
        },
        weight: 0.2,
      },
      {
        id: 'pw-4',
        pillarId: 'physical-wellbeing',
        text: '¿Cómo describirías tu alimentación?',
        type: 'multiple-choice',
        options: [
          'Muy desordenada — como lo que sea, cuando sea',
          'Irregular — sé qué debería hacer pero no lo hago',
          'Aceptable — me cuido a veces',
          'Buena — como consciente la mayor parte del tiempo',
          'Excelente — tengo un plan nutricional que sigo',
        ],
        weight: 0.2,
      },
      {
        id: 'pw-5',
        pillarId: 'physical-wellbeing',
        coachIntro: 'Algo que muchos ignoran pero que marca la diferencia.',
        text: '¿Hay algún dolor físico, molestia crónica o tema de salud que estés ignorando?',
        type: 'text',
        placeholder:
          'Ej: dolor de espalda, tensión en cuello, algo que deberías chequearte...',
        weight: 0.15,
      },
    ],
  },

  // =========================================================================
  // 3. RELACIONES
  // =========================================================================
  {
    pillarId: 'relationships',
    coachGreeting:
      'Las relaciones son espejos. Cómo estás con los demás dice mucho de cómo estás contigo. Hablemos de las personas importantes en tu vida.',
    questions: [
      {
        id: 'rl-1',
        pillarId: 'relationships',
        text: '¿Cómo calificarías la calidad de tu relación de pareja en este momento?',
        type: 'scale',
        scaleLabels: {
          min: 'Distante o en conflicto',
          max: 'Profunda y conectada',
        },
        weight: 0.25,
      },
      {
        id: 'rl-2',
        pillarId: 'relationships',
        coachIntro:
          'La familia es donde se forman nuestras raíces más profundas.',
        text: '¿Cómo es tu relación con tus hijos y/o tu familia cercana?',
        type: 'scale',
        scaleLabels: {
          min: 'Desconectada o tensa',
          max: 'Presente y nutritiva',
        },
        weight: 0.25,
      },
      {
        id: 'rl-3',
        pillarId: 'relationships',
        text: '¿Tienes amistades cercanas con las que puedes ser completamente vulnerable?',
        type: 'multiple-choice',
        options: [
          'No realmente — me cuesta abrirme',
          'Tengo conocidos pero no amigos profundos',
          'Tengo 1-2 personas de confianza',
          'Tengo un círculo cercano sólido',
          'Me siento rodeado de personas que me ven como soy',
        ],
        weight: 0.2,
      },
      {
        id: 'rl-4',
        pillarId: 'relationships',
        text: '¿Sientes que das y recibes en equilibrio en tus relaciones?',
        type: 'scale',
        scaleLabels: {
          min: 'Me siento agotado o solo',
          max: 'Hay reciprocidad plena',
        },
        weight: 0.15,
      },
      {
        id: 'rl-5',
        pillarId: 'relationships',
        coachIntro: 'Esto requiere honestidad real.',
        text: '¿Qué relación necesita más atención en este momento y por qué?',
        type: 'text',
        placeholder: 'La relación que sientes que necesita trabajo...',
        weight: 0.15,
      },
    ],
  },

  // =========================================================================
  // 4. ESPIRITUALIDAD
  // =========================================================================
  {
    pillarId: 'spirituality',
    coachGreeting:
      'Espiritualidad no es solo religión. Es tu conexión contigo mismo, con algo más grande, con el sentido de las cosas. Exploremos ese espacio interior.',
    questions: [
      {
        id: 'sp-1',
        pillarId: 'spirituality',
        text: '¿Sientes que tu vida tiene un sentido o dirección clara?',
        type: 'scale',
        scaleLabels: { min: 'Perdido y sin rumbo', max: 'Claro y alineado' },
        weight: 0.25,
      },
      {
        id: 'sp-2',
        pillarId: 'spirituality',
        coachIntro:
          'La conexión interior se cultiva. Veamos cómo la cuidas.',
        text: '¿Tienes alguna práctica espiritual o contemplativa regular?',
        type: 'multiple-choice',
        options: [
          'No tengo ninguna práctica',
          'Lo he intentado pero no conecto',
          'Tengo algo esporádico (oración, meditación, naturaleza)',
          'Tengo una práctica que me sostiene',
          'Mi práctica espiritual es central en mi vida',
        ],
        weight: 0.2,
      },
      {
        id: 'sp-3',
        pillarId: 'spirituality',
        text: '¿Con qué frecuencia te detienes a reflexionar sobre tu vida, tus valores y tus decisiones?',
        type: 'scale',
        scaleLabels: { min: 'Vivo en piloto automático', max: 'Reflexiono a diario' },
        weight: 0.2,
      },
      {
        id: 'sp-4',
        pillarId: 'spirituality',
        text: '¿Sientes gratitud de forma regular por lo que tienes?',
        type: 'multiple-choice',
        options: [
          'Rara vez — estoy enfocado en lo que falta',
          'A veces, cuando algo bueno pasa',
          'Frecuentemente, aunque no siempre',
          'Casi siempre — la gratitud es natural en mí',
          'Es una práctica diaria que transformó mi perspectiva',
        ],
        weight: 0.2,
      },
      {
        id: 'sp-5',
        pillarId: 'spirituality',
        coachIntro: 'Esta es profunda. Tomate tu tiempo.',
        text: '¿Qué le da sentido a tu vida en este momento?',
        type: 'text',
        placeholder: 'Lo que te mueve, lo que te trasciende...',
        weight: 0.15,
      },
    ],
  },

  // =========================================================================
  // 5. ECONOMÍA
  // =========================================================================
  {
    pillarId: 'finances',
    coachGreeting:
      'El dinero no es el fin, pero sí es un amplificador. Cuando las finanzas están en orden, liberas energía mental para todo lo demás. Seamos honestos con los números.',
    questions: [
      {
        id: 'fn-1',
        pillarId: 'finances',
        text: '¿Cómo es tu relación emocional con el dinero?',
        type: 'scale',
        scaleLabels: {
          min: 'Ansiedad y escasez',
          max: 'Tranquilidad y abundancia',
        },
        weight: 0.2,
      },
      {
        id: 'fn-2',
        pillarId: 'finances',
        coachIntro:
          'Veamos la estructura detrás de tus finanzas.',
        text: '¿Tienes un presupuesto o sistema para manejar tus ingresos y gastos?',
        type: 'multiple-choice',
        options: [
          'No — gasto sin control y no sé a dónde va el dinero',
          'Tengo una idea general pero no lo registro',
          'Llevo un registro básico pero no lo sigo al pie',
          'Tengo un presupuesto que reviso regularmente',
          'Tengo un sistema completo con metas de ahorro e inversión',
        ],
        weight: 0.25,
      },
      {
        id: 'fn-3',
        pillarId: 'finances',
        text: '¿Tienes un fondo de emergencia que cubra al menos 3 meses de gastos?',
        type: 'multiple-choice',
        options: [
          'No tengo ahorros',
          'Tengo algo pero no cubre ni 1 mes',
          'Tengo entre 1-2 meses cubiertos',
          'Tengo 3-6 meses cubiertos',
          'Tengo más de 6 meses + inversiones',
        ],
        weight: 0.2,
      },
      {
        id: 'fn-4',
        pillarId: 'finances',
        text: '¿Tus ingresos actuales cubren tu estilo de vida sin estrés?',
        type: 'scale',
        scaleLabels: {
          min: 'Llego justo o con deudas',
          max: 'Cubro todo con margen amplio',
        },
        weight: 0.2,
      },
      {
        id: 'fn-5',
        pillarId: 'finances',
        coachIntro:
          'Más allá de los números, esto importa.',
        text: '¿Cuál es tu mayor preocupación o meta financiera en este momento?',
        type: 'text',
        placeholder: 'Ej: salir de deudas, ahorrar para X, generar ingresos pasivos...',
        weight: 0.15,
      },
    ],
  },

  // =========================================================================
  // 6. DESARROLLO INTELECTUAL
  // =========================================================================
  {
    pillarId: 'intellectual-growth',
    coachGreeting:
      'Tu mente es tu herramienta más poderosa. Hablemos de cómo la estás afilando — aprendizaje, curiosidad, crecimiento profesional.',
    questions: [
      {
        id: 'ig-1',
        pillarId: 'intellectual-growth',
        text: '¿Estás aprendiendo algo nuevo de forma intencional en este momento?',
        type: 'multiple-choice',
        options: [
          'No — estoy estancado',
          'Quisiera pero no encuentro el tiempo',
          'Consumo contenido pero sin estructura',
          'Estoy aprendiendo algo específico con cierta regularidad',
          'Tengo un plan de aprendizaje activo que sigo',
        ],
        weight: 0.25,
      },
      {
        id: 'ig-2',
        pillarId: 'intellectual-growth',
        coachIntro: 'La lectura es el atajo más subestimado.',
        text: '¿Con qué frecuencia lees libros o material de profundidad?',
        type: 'multiple-choice',
        options: [
          'No leo casi nada',
          'Un par de libros al año, si acaso',
          'Leo de forma irregular — empiezo pero no termino',
          'Leo 1-2 libros al mes',
          'La lectura es parte fundamental de mi rutina',
        ],
        weight: 0.2,
      },
      {
        id: 'ig-3',
        pillarId: 'intellectual-growth',
        text: '¿Qué tan retado te sientes intelectualmente en tu trabajo o proyectos actuales?',
        type: 'scale',
        scaleLabels: {
          min: 'Aburrido — en piloto automático',
          max: 'Estimulado y en crecimiento',
        },
        weight: 0.2,
      },
      {
        id: 'ig-4',
        pillarId: 'intellectual-growth',
        text: '¿Tienes claridad sobre las habilidades que necesitas desarrollar para tu siguiente nivel profesional?',
        type: 'scale',
        scaleLabels: { min: 'No tengo idea', max: 'Muy claro y con plan' },
        weight: 0.2,
      },
      {
        id: 'ig-5',
        pillarId: 'intellectual-growth',
        coachIntro: 'Pensemos en grande.',
        text: '¿Qué habilidad o conocimiento, si lo dominaras, cambiaría significativamente tu vida?',
        type: 'text',
        placeholder: 'Esa habilidad que sabes que sería un game-changer...',
        weight: 0.15,
      },
    ],
  },

  // =========================================================================
  // 7. PROPÓSITO
  // =========================================================================
  {
    pillarId: 'purpose',
    coachGreeting:
      'Llegamos al pilar más profundo. El propósito no es algo que "encuentras" — es algo que construyes con cada decisión. Exploremos dónde estás.',
    questions: [
      {
        id: 'pp-1',
        pillarId: 'purpose',
        text: '¿Sientes que tu vida diaria está alineada con lo que realmente te importa?',
        type: 'scale',
        scaleLabels: {
          min: 'Completamente desalineado',
          max: 'Vivo según mis valores',
        },
        weight: 0.25,
      },
      {
        id: 'pp-2',
        pillarId: 'purpose',
        coachIntro:
          'El legado se construye todos los días, no solo al final.',
        text: '¿Tienes claridad sobre qué quieres que sea tu legado?',
        type: 'multiple-choice',
        options: [
          'No he pensado en eso',
          'Tengo una vaga idea pero nada concreto',
          'Lo pienso a veces pero no lo he articulado',
          'Tengo una visión clara que me guía',
          'Mi legado guía mis decisiones diarias',
        ],
        weight: 0.2,
      },
      {
        id: 'pp-3',
        pillarId: 'purpose',
        text: '¿Qué tanto de tu tiempo lo dedicas a cosas que te llenan vs. cosas que solo "tienes que hacer"?',
        type: 'scale',
        scaleLabels: {
          min: 'Todo es obligación',
          max: 'La mayoría me llena',
        },
        weight: 0.2,
      },
      {
        id: 'pp-4',
        pillarId: 'purpose',
        text: '¿Sientes que estás contribuyendo a algo más grande que tú mismo?',
        type: 'multiple-choice',
        options: [
          'No — mi vida gira solo en torno a mí',
          'Me gustaría pero no sé cómo',
          'Lo hago esporádicamente',
          'Tengo formas activas de contribuir',
          'La contribución es central en mi vida',
        ],
        weight: 0.2,
      },
      {
        id: 'pp-5',
        pillarId: 'purpose',
        coachIntro:
          'Última pregunta de todo el diagnóstico. Es la más importante.',
        text: 'Si pudieras dedicar tu vida a una sola causa o misión, ¿cuál sería?',
        type: 'text',
        placeholder: 'Esa cosa que, si la logras, habrá valido la pena todo...',
        weight: 0.15,
      },
    ],
  },
]
