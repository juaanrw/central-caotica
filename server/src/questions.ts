import { AZ5Rule } from './types';

export interface TriviaQuestionRaw {
  prompt: string;
  correctAnswer: string;
  distractors: string[];
}

export const TRIVIA_BANK: TriviaQuestionRaw[] = [
  {
    prompt: "¡INSPECTOR GENERAL AL TELÉFONO! Camarada, ¿cuál es la lectura máxima del dosímetro oficial en turno?",
    correctAnswer: "3.6 Roentgen (No es genial, pero no es terrible)",
    distractors: [
      "15.000 Roentgen (¡Corran por sus vidas!)",
      "0.0 Roentgen (El aire está más puro que en Crimea)",
      "Exactamente 42 micro-sieverts por suspiro"
    ]
  },
  {
    prompt: "¿Qué sustancia es de consumo obligatorio según el manual para tolerar la radiación en turbinas?",
    correctAnswer: "Vodka de contrabando con gotas de yodo medicinal",
    distractors: [
      "Té negro hervido con agua del condensador",
      "Leche condensada rancia de reserva militar",
      "Agua destilada bendecida por el Comisario"
    ]
  },
  {
    prompt: "¿Por qué las barras de control del reactor RBMK tienen la punta recubierta de grafito?",
    correctAnswer: "Para ahorrar 40 rublos por barra en aleación de boro",
    distractors: [
      "Para que brillen en la oscuridad si se va la luz",
      "Diseño aerodinámico inspirado en cohetes Soyuz",
      "Orden directa del Comité Central de Planificación"
    ]
  },
  {
    prompt: "¿Cuál es el protocolo oficial si se observa un haz de luz azul ionizada saliendo del techo?",
    correctAnswer: "Fingir calma absoluta y culpar al turno nocturno",
    distractors: [
      "Lanzar baldes de arena y rezar a Lenin",
      "Sacar fotos turísticas para el diario Pravda",
      "Declarar una prueba exitosa de iluminación festiva"
    ]
  },
  {
    prompt: "¡La presión del reactor supera los 90 bares! ¿Cuál es la única acción permitida por el Partido?",
    correctAnswer: "Pulsar el botón AZ-5 y encomendarse al destino",
    distractors: [
      "Abrir las ventanas de la sala de control para ventilar",
      "Patear el manómetro hasta que marque 40 bares",
      "Esperar la aprobación por carta del Ministro en Moscú"
    ]
  },
  {
    prompt: "¿Cómo se apodó a los heroicos soldados que limpiaron el techo del reactor en turnos de 90 segundos?",
    correctAnswer: "Biorrobots (Liquidadores voluntarios de la Unión)",
    distractors: [
      "Cosmonautas terrestres de titanio",
      "Operarios veloces del primer regimiento",
      "Comando de palas de plomo blindadas"
    ]
  },
  {
    prompt: "¿Por qué el teléfono rojo directo con el Kremlin suena pero nadie contesta?",
    correctAnswer: "El cable de cobre fue requisado para reparar una tubería",
    distractors: [
      "El Secretario General está en su dacha de verano",
      "Los teléfonos son una distracción burguesa",
      "El operario de guardia olvidó pagar la factura estatal"
    ]
  },
  {
    prompt: "¿Qué dice el manual de emergencia si el agua de refrigeración empieza a hervir en el sótano?",
    correctAnswer: "No hay agua en el sótano: estás teniendo delirios",
    distractors: [
      "Excelente para preparar sopa de remolacha comunal",
      "Apagar el reactor y evacuar en orden alfabético",
      "Ignorar el vapor mientras no huela a grafito"
    ]
  },
  {
    prompt: "¿Quién es el culpable definitivo ante cualquier anomalía o fallo en la frecuencia de 50 Hz?",
    correctAnswer: "Saboteadores y agentes infiltrados de Occidente",
    distractors: [
      "La fatiga de materiales y el diseño deficiente",
      "El ingeniero en jefe que falsificó su diploma",
      "Una sobrecarga en la red eléctrica de Kiev"
    ]
  },
  {
    prompt: "¿Qué ración energética se suministra a los operarios durante el protocolo de alerta máxima?",
    correctAnswer: "Arenque enlatado de 1978 y pan negro endurecido",
    distractors: [
      "Píldoras de cafeína pura de laboratorio militar",
      "Guiso de patatas calientes del comedor central",
      "Cigarrillos Pobeda sin filtro y agua con gas"
    ]
  }
];

export const AZ5_RULES: AZ5Rule[] = [
  {
    id: 'R1',
    text: "SI NÚCLEO ES ROJO Y PRESIÓN > 50 BAR ➔ ACTIVAR ÚNICAMENTE ALFA Y DELTA",
    coreColor: 'ROJO',
    pressureCondition: 'ALTA',
    conditionText: "Núcleo ROJO y Presión > 50 bar",
    requiredSwitches: { alfa: true, beta: false, gamma: false, delta: true }
  },
  {
    id: 'R2',
    text: "SI NÚCLEO ES ROJO Y PRESIÓN ≤ 50 BAR ➔ ACTIVAR ÚNICAMENTE BETA Y DELTA",
    coreColor: 'ROJO',
    pressureCondition: 'BAJA',
    conditionText: "Núcleo ROJO y Presión ≤ 50 bar",
    requiredSwitches: { alfa: false, beta: true, gamma: false, delta: true }
  },
  {
    id: 'R3',
    text: "SI NÚCLEO ES ÁMBAR Y PRESIÓN > 60 BAR ➔ ACTIVAR ALFA, BETA Y GAMMA",
    coreColor: 'AMBAR',
    pressureCondition: 'ALTA',
    conditionText: "Núcleo ÁMBAR y Presión > 60 bar",
    requiredSwitches: { alfa: true, beta: true, gamma: true, delta: false }
  },
  {
    id: 'R4',
    text: "SI NÚCLEO ES ÁMBAR Y PRESIÓN ≤ 60 BAR ➔ ACTIVAR ÚNICAMENTE BETA Y GAMMA",
    coreColor: 'AMBAR',
    pressureCondition: 'BAJA',
    conditionText: "Núcleo ÁMBAR y Presión ≤ 60 bar",
    requiredSwitches: { alfa: false, beta: true, gamma: true, delta: false }
  },
  {
    id: 'R5',
    text: "SI NÚCLEO ES VERDE Y PRESIÓN > 45 BAR ➔ ACTIVAR ÚNICAMENTE GAMMA Y DELTA",
    coreColor: 'VERDE',
    pressureCondition: 'ALTA',
    conditionText: "Núcleo VERDE y Presión > 45 bar",
    requiredSwitches: { alfa: false, beta: false, gamma: true, delta: true }
  },
  {
    id: 'R6',
    text: "SI NÚCLEO ES VERDE Y PRESIÓN ≤ 45 BAR ➔ ACTIVAR ÚNICAMENTE ALFA",
    coreColor: 'VERDE',
    pressureCondition: 'BAJA',
    conditionText: "Núcleo VERDE y Presión ≤ 45 bar",
    requiredSwitches: { alfa: true, beta: false, gamma: false, delta: false }
  }
];
