import { AZ5Rule } from './types';

export interface TriviaQuestionRaw {
  prompt: string;
  correctAnswer: string;
  distractors: string[];
}

export const GENERAL_CULTURE_TRIVIA: TriviaQuestionRaw[] = [
  {
    prompt: "¡INSPECTOR GENERAL AL TELÉFONO! Camarada, ¿cuál es la capital oficial de Australia?",
    correctAnswer: "Canberra",
    distractors: ["Sídney", "Melbourne", "Brisbane"]
  },
  {
    prompt: "¡PREGUNTA DE MOSCÚ! ¿En qué año histórico pisó el ser humano la Luna por primera vez?",
    correctAnswer: "1969",
    distractors: ["1961", "1972", "1957"]
  },
  {
    prompt: "El Ministro de Ciencia exige saber: ¿Cuál es el elemento químico más abundante en el universo?",
    correctAnswer: "Hidrógeno",
    distractors: ["Helio", "Oxígeno", "Carbono"]
  },
  {
    prompt: "¡COMPROBACIÓN CULTURAL! ¿Quién pintó la famosa obra de arte 'La noche estrellada'?",
    correctAnswer: "Vincent van Gogh",
    distractors: ["Pablo Picasso", "Claude Monet", "Salvador Dalí"]
  },
  {
    prompt: "El Comité exige respuesta: ¿Cuántos huesos componen el esqueleto de un cuerpo humano adulto?",
    correctAnswer: "206 huesos",
    distractors: ["180 huesos", "250 huesos", "312 huesos"]
  },
  {
    prompt: "¿Cuál es el océano con mayor superficie y profundidad de todo el planeta Tierra?",
    correctAnswer: "Océano Pacífico",
    distractors: ["Océano Atlántico", "Océano Índico", "Océano Ártico"]
  },
  {
    prompt: "El Inspector pregunta: ¿Qué célebre novela comienza con 'Muchos años después, frente al pelotón de fusilamiento...'?",
    correctAnswer: "Cien años de soledad",
    distractors: ["Don Quijote de la Mancha", "Guerra y Paz", "El amor en los tiempos del cólera"]
  },
  {
    prompt: "¿A qué velocidad aproximada se propaga la luz en el vacío en kilómetros por segundo?",
    correctAnswer: "300.000 km/s",
    distractors: ["150.000 km/s", "1.000.000 km/s", "30.000 km/s"]
  },
  {
    prompt: "Pregunta urgente de geografía: ¿En qué continente se encuentra ubicado el desierto del Sahara?",
    correctAnswer: "África",
    distractors: ["Asia", "Oceanía", "América"]
  },
  {
    prompt: "¿Cuál es el planeta con mayor masa y volumen de todo nuestro sistema solar?",
    correctAnswer: "Júpiter",
    distractors: ["Saturno", "Neptuno", "Marte"]
  },
  {
    prompt: "¿Quién formuló en 1915 la Teoría de la Relatividad General?",
    correctAnswer: "Albert Einstein",
    distractors: ["Isaac Newton", "Nikola Tesla", "Niels Bohr"]
  },
  {
    prompt: "¿Cuántos lados tiene exactamente la figura geométrica conocida como heptágono?",
    correctAnswer: "7 lados",
    distractors: ["6 lados", "8 lados", "9 lados"]
  },
  {
    prompt: "¿Cuál es el río más caudaloso y largo del planeta Tierra según las mediciones modernas?",
    correctAnswer: "Río Amazonas",
    distractors: ["Río Nilo", "Río Misisipi", "Río Yangtsé"]
  },
  {
    prompt: "¿Cuál es el país con mayor superficie terrestre total del mundo?",
    correctAnswer: "Rusia",
    distractors: ["Canadá", "China", "Estados Unidos"]
  },
  {
    prompt: "¿Qué metal es líquido a temperatura ambiente estándar (20°C)?",
    correctAnswer: "Mercurio",
    distractors: ["Plomo", "Galio", "Estaño"]
  },
  {
    prompt: "¡PREGUNTA GEOGRÁFICA! ¿Cuál es la capital oficial de Japón?",
    correctAnswer: "Tokio",
    distractors: ["Kioto", "Osaka", "Seúl"]
  },
  {
    prompt: "¿Quién escribió la célebre tragedia teatral 'Romeo y Julieta'?",
    correctAnswer: "William Shakespeare",
    distractors: ["Miguel de Cervantes", "Dante Alighieri", "Molière"]
  },
  {
    prompt: "¿Qué órgano del cuerpo humano es el encargado principal de producir insulina?",
    correctAnswer: "Páncreas",
    distractors: ["Hígado", "Riñón", "Bazo"]
  },
  {
    prompt: "¡FECHA HISTÓRICA! ¿En qué año se produjo la histórica caída del Muro de Berlín?",
    correctAnswer: "1989",
    distractors: ["1991", "1985", "1975"]
  },
  {
    prompt: "En la mitología griega, ¿quién es el soberano dios de los mares y océanos?",
    correctAnswer: "Poseidón",
    distractors: ["Zeus", "Hades", "Ares"]
  },
  {
    prompt: "¿Cuál es la moneda de curso legal oficial del Reino Unido?",
    correctAnswer: "Libra esterlina",
    distractors: ["Euro", "Corona británica", "Franco"]
  },
  {
    prompt: "¿Qué gas absorben principalmente las plantas de la atmósfera durante la fotosíntesis?",
    correctAnswer: "Dióxido de carbono (CO₂)",
    distractors: ["Oxígeno (O₂)", "Nitrógeno (N₂)", "Metano (CH₄)"]
  },
  {
    prompt: "¿Cuántos minutos tiene exactamente un día completo de 24 horas?",
    correctAnswer: "1.440 minutos",
    distractors: ["1.200 minutos", "86.400 minutos", "720 minutos"]
  },
  {
    prompt: "¿En qué legendaria ciudad se celebraron los primeros Juegos Olímpicos de la era moderna en 1896?",
    correctAnswer: "Atenas",
    distractors: ["Roma", "París", "Londres"]
  },
  {
    prompt: "¿Quién es el autor de la célebre pintura del Renacimiento 'La Gioconda' (Mona Lisa)?",
    correctAnswer: "Leonardo da Vinci",
    distractors: ["Miguel Ángel", "Rafael Sanzio", "Sandro Botticelli"]
  }
];

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
  "• Si Núcleo es VERDE ➔ Activa el protocolo en 'FASE BORO'",
  "*(Indica por voz la FASE al Ingeniero B para que busque las válvulas)*"
];

export const MANUAL_PART_B_RULES = [
  "SECCIÓN B // ASIGNACIÓN DE VÁLVULAS POR PRESIÓN Y FASE:",
  "• FASE TITANIO con Presión > 50 bar ➔ Conectar ALFA y DELTA",
  "• FASE TITANIO con Presión ≤ 50 bar ➔ Conectar BETA y DELTA",
  "• FASE URANIO con Presión > 60 bar ➔ Conectar ALFA, BETA y GAMMA",
  "• FASE URANIO con Presión ≤ 60 bar ➔ Conectar BETA y GAMMA",
  "• FASE BORO con Presión > 45 bar ➔ Conectar GAMMA y DELTA",
  "• FASE BORO con Presión ≤ 45 bar ➔ Conectar únicamente ALFA",
  "*(Pregunta al Ingeniero A la FASE y al Técnico la Presión actual)*"
];

export const MANUAL_FULL_RULES = [
  "MANUAL GENERAL DE ESTABILIZACIÓN AZ-5:",
  "1. Si Núcleo es ROJO y Presión > 50 bar ➔ Conectar ALFA y DELTA",
  "2. Si Núcleo es ROJO y Presión ≤ 50 bar ➔ Conectar BETA y DELTA",
  "3. Si Núcleo es ÁMBAR y Presión > 60 bar ➔ Conectar ALFA, BETA y GAMMA",
  "4. Si Núcleo es ÁMBAR y Presión ≤ 60 bar ➔ Conectar BETA y GAMMA",
  "5. Si Núcleo es VERDE y Presión > 45 bar ➔ Conectar GAMMA y DELTA",
  "6. Si Núcleo es VERDE y Presión ≤ 45 bar ➔ Conectar únicamente ALFA",
  "*(Dicta al Técnico de Mandos qué interruptores activar y cuándo disparar AZ-5)*"
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
