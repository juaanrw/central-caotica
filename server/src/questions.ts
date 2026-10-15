import { AZ5Rule, QuestionAnswerType } from './types';

export interface CategorizedQuestionRaw {
  prompt: string;
  type: QuestionAnswerType;
  correctAnswer: string;
  distractors: string[];
}

export const CATEGORIZED_TRIVIA_DB: Record<QuestionAnswerType, CategorizedQuestionRaw[]> = {
  YEAR: [
    {
      prompt: "¡FECHA HISTÓRICA! ¿En qué año histórico pisó el ser humano la Luna por primera vez?",
      type: "YEAR",
      correctAnswer: "1969",
      distractors: ["1961", "1972"]
    },
    {
      prompt: "¡REGISTRO DIPLOMÁTICO! ¿En qué año se produjo la histórica caída del Muro de Berlín?",
      type: "YEAR",
      correctAnswer: "1989",
      distractors: ["1991", "1985"]
    },
    {
      prompt: "¿En qué año zarpó la expedición de Cristóbal Colón y llegó a América?",
      type: "YEAR",
      correctAnswer: "1492",
      distractors: ["1453", "1504"]
    },
    {
      prompt: "¿En qué año comenzó formalmente la Segunda Guerra Mundial?",
      type: "YEAR",
      correctAnswer: "1939",
      distractors: ["1936", "1941"]
    },
    {
      prompt: "¿En qué año ocurrió el trágico desastre nuclear de la central de Chernóbil?",
      type: "YEAR",
      correctAnswer: "1986",
      distractors: ["1979", "1990"]
    },
    {
      prompt: "¿En qué año naufragó el transatlántico RMS Titanic tras colisionar con un iceberg?",
      type: "YEAR",
      correctAnswer: "1912",
      distractors: ["1905", "1920"]
    }
  ],
  PERSON: [
    {
      prompt: "¿Quién formuló en 1915 la célebre Teoría de la Relatividad General?",
      type: "PERSON",
      correctAnswer: "Albert Einstein",
      distractors: ["Isaac Newton", "Nikola Tesla"]
    },
    {
      prompt: "¿Quién fue la primera persona en ganar dos Premios Nobel en disciplinas científicas diferentes?",
      type: "PERSON",
      correctAnswer: "Marie Curie",
      distractors: ["Rosalind Franklin", "Lise Meitner"]
    },
    {
      prompt: "¿Quién escribió la universal novela 'El ingenioso hidalgo Don Quijote de la Mancha'?",
      type: "PERSON",
      correctAnswer: "Miguel de Cervantes",
      distractors: ["Lope de Vega", "Francisco de Quevedo"]
    },
    {
      prompt: "¿Quién escribió la célebre tragedia teatral 'Romeo y Julieta'?",
      type: "PERSON",
      correctAnswer: "William Shakespeare",
      distractors: ["Molière", "Dante Alighieri"]
    },
    {
      prompt: "¿Quién fue el legendario líder que encabezó la Revolución Rusa de Octubre de 1917?",
      type: "PERSON",
      correctAnswer: "Vladimir Lenin",
      distractors: ["Iósif Stalin", "León Trotski"]
    },
    {
      prompt: "¿Quién fue el primer ser humano en viajar al espacio exterior a bordo de la Vostok 1?",
      type: "PERSON",
      correctAnswer: "Yuri Gagarin",
      distractors: ["Neil Armstrong", "John Glenn"]
    }
  ],
  WORK: [
    {
      prompt: "¿Qué célebre novela de García Márquez inicia con 'Muchos años después, frente al pelotón de fusilamiento...'?",
      type: "WORK",
      correctAnswer: "Cien años de soledad",
      distractors: ["El amor en los tiempos del cólera", "Guerra y Paz"]
    },
    {
      prompt: "¿Qué monumental óleo de Pablo Picasso denuncia los horrores de la guerra tras el bombardeo de 1937?",
      type: "WORK",
      correctAnswer: "El Guernica",
      distractors: ["Las señoritas de Avignon", "El sueño"]
    },
    {
      prompt: "¿Qué famosa pintura renacentista de Leonardo da Vinci retrata a una enigmática dama sonriente?",
      type: "WORK",
      correctAnswer: "La Gioconda",
      distractors: ["La última cena", "La dama del armiño"]
    },
    {
      prompt: "¿Qué célebre lienzo de Vincent van Gogh muestra un cielo nocturno azul con espirales luminosas?",
      type: "WORK",
      correctAnswer: "La noche estrellada",
      distractors: ["Los girasoles", "El dormitorio en Arlés"]
    },
    {
      prompt: "¿Qué obra cumbre de la literatura épica griega relata el accidentado regreso de Odiseo a su patria?",
      type: "WORK",
      correctAnswer: "La Odisea",
      distractors: ["La Ilíada", "La Eneida"]
    }
  ],
  CITY: [
    {
      prompt: "¡INSPECTOR AL TELÉFONO! ¿Cuál es la capital oficial de la Mancomunidad de Australia?",
      type: "CITY",
      correctAnswer: "Canberra",
      distractors: ["Sídney", "Melbourne"]
    },
    {
      prompt: "¡PREGUNTA GEOGRÁFICA! ¿Cuál es la capital oficial de Japón?",
      type: "CITY",
      correctAnswer: "Tokio",
      distractors: ["Kioto", "Osaka"]
    },
    {
      prompt: "¿En qué histórica ciudad europea se celebraron los primeros Juegos Olímpicos modernos en 1896?",
      type: "CITY",
      correctAnswer: "Atenas",
      distractors: ["Roma", "París"]
    },
    {
      prompt: "¿Cuál es la capital federal de Canadá?",
      type: "CITY",
      correctAnswer: "Ottawa",
      distractors: ["Toronto", "Montreal"]
    },
    {
      prompt: "¿Cuál es la capital de la República Argentina a orillas del Río de la Plata?",
      type: "CITY",
      correctAnswer: "Buenos Aires",
      distractors: ["Córdoba", "Rosario"]
    },
    {
      prompt: "¿En qué legendaria ciudad imperial se erige el anfiteatro Flavio conocido como Coliseo?",
      type: "CITY",
      correctAnswer: "Roma",
      distractors: ["Florencia", "Nápoles"]
    }
  ],
  COUNTRY: [
    {
      prompt: "¿Cuál es el país con mayor superficie territorial total del planeta Tierra?",
      type: "COUNTRY",
      correctAnswer: "Rusia",
      distractors: ["Canadá", "China"]
    },
    {
      prompt: "¿Qué país europeo tiene una silueta geográfica inconfundible en forma de bota?",
      type: "COUNTRY",
      correctAnswer: "Italia",
      distractors: ["Grecia", "Portugal"]
    },
    {
      prompt: "¿En qué país milenario del norte de África se ubican las imponentes Pirámides de Guiza?",
      type: "COUNTRY",
      correctAnswer: "Egipto",
      distractors: ["Marruecos", "Jordania"]
    },
    {
      prompt: "¿Cuál es el país con mayor territorio y población de toda Sudamérica?",
      type: "COUNTRY",
      correctAnswer: "Brasil",
      distractors: ["Argentina", "Colombia"]
    },
    {
      prompt: "¿Qué estado insular nórdico es conocido como la 'Tierra del Hielo y el Fuego' por sus volcanes?",
      type: "COUNTRY",
      correctAnswer: "Islandia",
      distractors: ["Noruega", "Groenlandia"]
    }
  ],
  SCIENCE: [
    {
      prompt: "¿Qué metal de transición es líquido en condiciones de temperatura ambiente estándar (20°C)?",
      type: "SCIENCE",
      correctAnswer: "Mercurio",
      distractors: ["Galio", "Plomo"]
    },
    {
      prompt: "¿Cuál es el elemento químico más ligero y abundante de todo el universo observable?",
      type: "SCIENCE",
      correctAnswer: "Hidrógeno",
      distractors: ["Helio", "Oxígeno"]
    },
    {
      prompt: "¿Qué gas absorben principalmente los organismos vegetales de la atmósfera durante la fotosíntesis?",
      type: "SCIENCE",
      correctAnswer: "Dióxido de carbono (CO₂)",
      distractors: ["Metano (CH₄)", "Nitrógeno (N₂)"]
    },
    {
      prompt: "¿A qué velocidad estimada en el vacío viajan las ondas electromagnéticas y la luz visible?",
      type: "SCIENCE",
      correctAnswer: "300.000 km/s",
      distractors: ["150.000 km/s", "1.000.000 km/s"]
    },
    {
      prompt: "¿Qué escala de temperatura termodinámica sitúa el Cero Absoluto exactamente en 0 grados?",
      type: "SCIENCE",
      correctAnswer: "Escala Kelvin",
      distractors: ["Escala Celsius", "Escala Fahrenheit"]
    }
  ],
  NUMBER: [
    {
      prompt: "¿Cuántos huesos articulados componen la estructura ósea de un cuerpo humano adulto sano?",
      type: "NUMBER",
      correctAnswer: "206 huesos",
      distractors: ["180 huesos", "250 huesos"]
    },
    {
      prompt: "¿Cuántos minutos exactos completan un período de rotación terrestre de 24 horas?",
      type: "NUMBER",
      correctAnswer: "1.440 minutos",
      distractors: ["1.200 minutos", "86.400 minutos"]
    },
    {
      prompt: "¿Cuántos lados rectos tiene exactamente la figura geométrica regular llamada heptágono?",
      type: "NUMBER",
      correctAnswer: "7 lados",
      distractors: ["8 lados", "9 lados"]
    },
    {
      prompt: "¿Cuántos planetas principales integran oficialmente el Sistema Solar según la UAI?",
      type: "NUMBER",
      correctAnswer: "8 planetas",
      distractors: ["9 planetas", "7 planetas"]
    },
    {
      prompt: "¿Cuántos dientes componen habitualmente la dentadura completa y definitiva de un adulto?",
      type: "NUMBER",
      correctAnswer: "32 dientes",
      distractors: ["28 dientes", "36 dientes"]
    }
  ],
  NATURE: [
    {
      prompt: "¿Cuál es el océano de mayor extensión y profundidad de todo nuestro planeta?",
      type: "NATURE",
      correctAnswer: "Océano Pacífico",
      distractors: ["Océano Atlántico", "Océano Índico"]
    },
    {
      prompt: "¿Cuál es el río más largo y caudaloso del mundo según las mediciones hidrológicas modernas?",
      type: "NATURE",
      correctAnswer: "Río Amazonas",
      distractors: ["Río Nilo", "Río Misisipi"]
    },
    {
      prompt: "¿Cuál es el animal más grande y pesado de la historia del planeta Tierra?",
      type: "NATURE",
      correctAnswer: "Ballena azul",
      distractors: ["Tiranosaurio Rex", "Megalodón"]
    },
    {
      prompt: "¿Cuál es la cima montañosa más elevada sobre el nivel del mar en la cordillera del Himalaya?",
      type: "NATURE",
      correctAnswer: "Monte Everest",
      distractors: ["K2", "Kangchenjunga"]
    },
    {
      prompt: "¿Cuál es el felino y mamífero terrestre capaz de alcanzar mayor velocidad en carrera corta?",
      type: "NATURE",
      correctAnswer: "Guepardo",
      distractors: ["Leopardo", "Gacela"]
    }
  ],
  COLOR: [
    {
      prompt: "¿Qué color secundario se obtiene de la mezcla sustractiva de los pigmentos azul y amarillo?",
      type: "COLOR",
      correctAnswer: "Verde",
      distractors: ["Naranja", "Púrpura"]
    },
    {
      prompt: "¿De qué llamativo color son en realidad las 'cajas negras' de los aviones comerciales?",
      type: "COLOR",
      correctAnswer: "Naranja de alta visibilidad",
      distractors: ["Negro mate", "Rojo escarlata"]
    },
    {
      prompt: "¿Qué color óptico absorbe toda la radiación del espectro visible sin reflejar ninguna longitud de onda?",
      type: "COLOR",
      correctAnswer: "Negro",
      distractors: ["Blanco", "Gris plomo"]
    },
    {
      prompt: "¿De qué color es la llama característica emitida por la combustión de sales de cobre?",
      type: "COLOR",
      correctAnswer: "Verde azulado",
      distractors: ["Rojo carmesí", "Amarillo brillante"]
    }
  ]
};

export const AZ5_RULES: AZ5Rule[] = [
  {
    id: 'R1',
    phaseCode: 'FASE TITANIO',
    coreColor: 'ROJO',
    pressureCondition: 'ALTA',
    pressureThreshold: 50,
    pressureDesc: '> 50 bar',
    requiredSwitches: { alfa: true, beta: false, gamma: false, delta: true },
    valvesText: 'ALFA y DELTA'
  },
  {
    id: 'R2',
    phaseCode: 'FASE TITANIO',
    coreColor: 'ROJO',
    pressureCondition: 'BAJA',
    pressureThreshold: 50,
    pressureDesc: '≤ 50 bar',
    requiredSwitches: { alfa: false, beta: true, gamma: false, delta: true },
    valvesText: 'BETA y DELTA'
  },
  {
    id: 'R3',
    phaseCode: 'FASE URANIO',
    coreColor: 'AMBAR',
    pressureCondition: 'ALTA',
    pressureThreshold: 60,
    pressureDesc: '> 60 bar',
    requiredSwitches: { alfa: true, beta: true, gamma: true, delta: false },
    valvesText: 'ALFA, BETA y GAMMA'
  },
  {
    id: 'R4',
    phaseCode: 'FASE URANIO',
    coreColor: 'AMBAR',
    pressureCondition: 'BAJA',
    pressureThreshold: 60,
    pressureDesc: '≤ 60 bar',
    requiredSwitches: { alfa: false, beta: true, gamma: true, delta: false },
    valvesText: 'BETA y GAMMA'
  },
  {
    id: 'R5',
    phaseCode: 'FASE BORO',
    coreColor: 'VERDE',
    pressureCondition: 'ALTA',
    pressureThreshold: 45,
    pressureDesc: '> 45 bar',
    requiredSwitches: { alfa: false, beta: false, gamma: true, delta: true },
    valvesText: 'GAMMA y DELTA'
  },
  {
    id: 'R6',
    phaseCode: 'FASE BORO',
    coreColor: 'VERDE',
    pressureCondition: 'BAJA',
    pressureThreshold: 45,
    pressureDesc: '≤ 45 bar',
    requiredSwitches: { alfa: true, beta: false, gamma: false, delta: false },
    valvesText: 'solo ALFA'
  }
];

export const MANUAL_PART_A_RULES = [
  "SECCIÓN A // CLASIFICACIÓN DE FASE POR COLOR DE NÚCLEO:",
  "• Si Núcleo es ROJO ➔ Activa el protocolo en 'FASE TITANIO'",
  "• Si Núcleo es ÁMBAR ➔ Activa el protocolo en 'FASE URANIO'",
  "• Si Núcleo es VERDE ➔ Activa el protocolo en 'FASE BORO'"
];

export const MANUAL_PART_B_RULES = [
  "SECCIÓN B // ASIGNACIÓN DE VÁLVULAS POR PRESIÓN Y FASE:",
  "• FASE TITANIO con Presión > 50 bar ➔ Conectar ALFA y DELTA",
  "• FASE TITANIO con Presión ≤ 50 bar ➔ Conectar BETA y DELTA",
  "• FASE URANIO con Presión > 60 bar ➔ Conectar ALFA, BETA y GAMMA",
  "• FASE URANIO con Presión ≤ 60 bar ➔ Conectar BETA y GAMMA",
  "• FASE BORO con Presión > 45 bar ➔ Conectar GAMMA y DELTA",
  "• FASE BORO con Presión ≤ 45 bar ➔ Conectar únicamente ALFA"
];

export const MANUAL_FULL_RULES = [
  "MANUAL GENERAL DE ESTABILIZACIÓN AZ-5:",
  "1. Si Núcleo es ROJO y Presión > 50 bar ➔ Conectar ALFA y DELTA",
  "2. Si Núcleo es ROJO y Presión ≤ 50 bar ➔ Conectar BETA y DELTA",
  "3. Si Núcleo es ÁMBAR y Presión > 60 bar ➔ Conectar ALFA, BETA y GAMMA",
  "4. Si Núcleo es ÁMBAR y Presión ≤ 60 bar ➔ Conectar BETA y GAMMA",
  "5. Si Núcleo es VERDE y Presión > 45 bar ➔ Conectar GAMMA y DELTA",
  "6. Si Núcleo es VERDE y Presión ≤ 45 bar ➔ Conectar únicamente ALFA"
];

export interface RawConveyorItem {
  name: string;
  categoryId: string;
}

export interface RawConveyorCategory {
  id: string;
  name: string;
  shortName: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  iconName: string;
}

export const CONVEYOR_CATEGORIES_POOL: RawConveyorCategory[] = [
  {
    id: 'RESIDUOS',
    name: 'Residuos Radiactivos',
    shortName: 'RESIDUOS',
    color: '#FF2A2A',
    badgeBg: 'bg-red-500/20 border-red-500 text-red-400',
    badgeText: 'RESIDUOS',
    iconName: 'Flame'
  },
  {
    id: 'URANIO',
    name: 'Combustible de Uranio',
    shortName: 'URANIO',
    color: '#FFD600',
    badgeBg: 'bg-yellow-500/20 border-yellow-500 text-yellow-300',
    badgeText: 'URANIO',
    iconName: 'Atom'
  },
  {
    id: 'AGUA',
    name: 'Refrigerante y Agua Pesada',
    shortName: 'AGUA D2O',
    color: '#00F0FF',
    badgeBg: 'bg-cyan-500/20 border-cyan-500 text-cyan-300',
    badgeText: 'AGUA D2O',
    iconName: 'Droplets'
  },
  {
    id: 'BLINDAJE',
    name: 'Blindaje y Protección',
    shortName: 'BLINDAJE',
    color: '#00FF66',
    badgeBg: 'bg-green-500/20 border-green-500 text-green-300',
    badgeText: 'BLINDAJE',
    iconName: 'Shield'
  },
  {
    id: 'BORO',
    name: 'Barras Moderadoras de Boro',
    shortName: 'BORO',
    color: '#FF9900',
    badgeBg: 'bg-orange-500/20 border-orange-500 text-orange-300',
    badgeText: 'BORO',
    iconName: 'Zap'
  },
  {
    id: 'GASES',
    name: 'Vapor y Gases Nobles',
    shortName: 'GASES',
    color: '#D946EF',
    badgeBg: 'bg-fuchsia-500/20 border-fuchsia-500 text-fuchsia-300',
    badgeText: 'GASES',
    iconName: 'Wind'
  }
];

export const CONVEYOR_ITEMS_POOL: RawConveyorItem[] = [
  // RESIDUOS
  { name: 'Fragmento de Grafito RBMK', categoryId: 'RESIDUOS' },
  { name: 'Lodo Contaminado del Núcleo', categoryId: 'RESIDUOS' },
  { name: 'Filtro Radiactivo Calcinado', categoryId: 'RESIDUOS' },
  { name: 'Escoria de Fisión Nuclear', categoryId: 'RESIDUOS' },
  { name: 'Vaina de Combustible Fundida', categoryId: 'RESIDUOS' },
  
  // URANIO
  { name: 'Pastilla de Uranio-235', categoryId: 'URANIO' },
  { name: 'Vial de Uranio Enriquecido', categoryId: 'URANIO' },
  { name: 'Barra de Dióxido de Uranio', categoryId: 'URANIO' },
  { name: 'Pastilla Cerámica UO2', categoryId: 'URANIO' },
  { name: 'Conjunto de Combustible RBMK', categoryId: 'URANIO' },

  // AGUA
  { name: 'Contenedor de Agua Pesada D2O', categoryId: 'AGUA' },
  { name: 'Agua Desionizada de Refrigeración', categoryId: 'AGUA' },
  { name: 'Bomba de Bucle Primario', categoryId: 'AGUA' },
  { name: 'Tanque Criogénico de Nitrógeno', categoryId: 'AGUA' },
  { name: 'Refrigerante Secundario D2O', categoryId: 'AGUA' },

  // BLINDAJE
  { name: 'Placa de Plomo Densificado', categoryId: 'BLINDAJE' },
  { name: 'Traje de Protección NRBQ', categoryId: 'BLINDAJE' },
  { name: 'Dosímetro Militar de Bolsillo', categoryId: 'BLINDAJE' },
  { name: 'Bloque de Hormigón Baritado', categoryId: 'BLINDAJE' },
  { name: 'Guantes de Plomo Laminado', categoryId: 'BLINDAJE' },

  // BORO
  { name: 'Barra de Carburo de Boro', categoryId: 'BORO' },
  { name: 'Moderador Neutrónico de Boro', categoryId: 'BORO' },
  { name: 'Barra de Inserción AZ-5', categoryId: 'BORO' },
  { name: 'Absorbedor de Flujo Térmico', categoryId: 'BORO' },
  { name: 'Solución de Ácido Bórico Concentrado', categoryId: 'BORO' },

  // GASES
  { name: 'Cilindro de Gas Xenón-135', categoryId: 'GASES' },
  { name: 'Filtro de Vapor Yodo-131', categoryId: 'GASES' },
  { name: 'Depósito Presurizado de Helio', categoryId: 'GASES' },
  { name: 'Válvula de Escape de Vapor', categoryId: 'GASES' },
  { name: 'Condensador de Vapor Radiactivo', categoryId: 'GASES' }
];
