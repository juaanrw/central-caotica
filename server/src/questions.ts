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
