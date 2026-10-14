# ☢️ CENTRAL CAÓTICA // PROTOCOLO DE EMERGENCIA AZ-5

**Central Caótica** es un *party game* cooperativo multijugador en tiempo real para móviles (de 2 a 4 jugadores por sala). Los jugadores toman el papel de operarios soviéticos en la sala de control de una central nuclear tipo RBMK al borde del colapso térmico.

---

## 🎨 1. Estética Neo-Brutalista Retro-Industrial Soviética
- **Paleta de Colores:** Fondo carbón grafito (`#121316`), acentos en amarillo radiactivo (`#FFD600`), rojo alarma (`#FF2A2A`), verde fósforo de terminal (`#00FF66`) y ámbar de advertencia (`#FF9900`).
- **Diseño Mobile-First:** Diseñado a pantalla completa vertical (`100dvh`), sin necesidad de scroll vertical en el móvil, con botones físicos de golpeo, hendiduras táctiles, temblor de pantalla en fallos y franjas de advertencia industrial.
- **Motor de Audio Sintetizado (Web Audio API):** Sin depender de ficheros MP3 externos que puedan fallar en la red. Genera en tiempo real mediante síntesis oscilatoria:
  - Clics mecánicos de interruptores físicos.
  - Tics de contador Geiger-Müller en pulsos aleatorios.
  - Sirena de alarma nuclear de doble tono disonante.
  - Fanfarria de éxito soviética en acordes triunfales.
  - Zumbador grave de error.
  - Escape de vapor a presión en válvulas.
  - Vibración háptica en móviles mediante `navigator.vibrate`.

---

## 🚀 2. Puesta en Marcha Rápida (Local)

### Requisitos
- Node.js (v18 o superior)
- npm

### Instalación de dependencias (un solo comando)
```bash
npm run install:all
```

### Ejecutar Servidor y Cliente simultáneamente
```bash
npm run dev
```

Esto levantará:
- **Backend (Socket.IO + Express):** `http://localhost:3001`
- **Frontend (Vite + React + Tailwind):** `http://localhost:5173`

> 📱 **¿Cómo jugar desde smartphones en la misma red Wi-Fi?**  
> Gracias a que Vite está configurado con `host: true`, abre en el navegador de tu móvil la dirección `http://<TU_IP_LOCAL>:5173` (ejemplo: `http://192.168.1.45:5173`). El cliente detecta dinámicamente la IP y se conectará automáticamente al servidor en el puerto 3001.

---

## 🤖 3. Pruebas Rápidas y Modo Bot Simulado
¿Quieres probar el juego tú solo sin necesidad de un segundo móvil?
1. Entra a `http://localhost:5173` y pulsa **"ABRIR SALA DE CONTROL"**.
2. En el Lobby, pulsa el botón **"+ Bot Simulado"** (se unirá un autómata como "Bot Ivan").
3. Pulsa **"INICIAR TURNO DE EMERGENCIA"**.
4. ¡El bot interactuará automáticamente respondiendo a órdenes en la Prueba 1, emitiendo consejos por radio en la Prueba 2 y respondiendo preguntas en la Prueba 3!
5. *(Opcional)* También puedes abrir 2 pestañas en incógnito e introducir el código de 4 letras.

Para ejecutar la suite de pruebas automatizadas E2E:
```bash
cd server
npm test
```

---

## 🕹️ 4. Estructura del Gameplay y Pruebas

### Regla de Oro: Time-Decay Scoring
- Cada prueba arranca con una bolsa de **1000 Puntos de Estabilidad**.
- Un cronómetro cuenta los milisegundos hacia arriba.
- Por cada segundo transcurrido, se pierden puntos de estabilidad (-40 pts/s).
- El servidor registra con precisión de milisegundos los **tiempos de reacción individuales** de cada jugador y sus errores.

### ⛓️ Prueba 1: "REACCIÓN EN CADENA" (6 Pasos)
- En cada eslabón, el servidor elige un **Emisor** y un **Ejecutor**.
- El Emisor ve la orden secreta que debe gritar por voz.
- El Ejecutor dispone de 4 mandos físicos en su pantalla táctil:
  1. **Botón Rojo:** Pulsar de golpe.
  2. **Válvula:** Mantener pulsada exactamente 2.0 segundos con indicador radial de llenado.
  3. **Palanca:** Deslizar la barra de control al 100%.
  4. **Bomba Manual:** Dar 5 toques rápidos seguidos.
- Al acertar, se salta inmediatamente al siguiente eslabón con nuevos roles.

### 🎛️ Prueba 2: "PANEL AZ-5" (Asimetría Técnico / Ingeniero)
- **Técnico de Mandos:** Ve el manómetro de presión (ej. 68 bar), el color del núcleo (Rojo, Ámbar o Verde), 4 interruptores físicos (Alfa, Beta, Gamma, Delta) y el pulsador de disparo "AZ-5".
- **Ingeniero de Manual:** Tiene la tabla clasificada de combinaciones de emergencia y debe dictarle al Técnico qué válvulas abrir según las lecturas que este le comunique por voz.
- Si pulsa AZ-5 con la combinación errónea: -200 puntos, alarma y temblor de pantalla.

### ☎️ Prueba 3: "LLAMADA DEL MINISTERIO" (Trivia bajo presión)
- 3 preguntas rápidas formuladas por el Inspector General desde Moscú.
- La pregunta aparece arriba en todas las terminales.
- **Las 4 opciones de respuesta se distribuyen entre las pantallas de los jugadores conectados**. Deben cantar sus respuestas en voz alta y quien tenga la opción correcta debe pulsarla.

---

## 📊 5. Informe del Comité de Investigación (Estadísticas Virales)
Al finalizar las 3 pruebas, el Comité de Prípiat emite el informe con:
- **Puntuación y Rango:**
  - 🎖️ *Héroes de la Unión Soviética* (≥ 2200 pts)
  - ⚠️ *Operarios Aceptables - 3.6 Roentgen* (1600 - 2199 pts)
  - 📉 *Operarios Mediocres* (900 - 1599 pts)
  - ☢️ *Causantes de un Invierno Nuclear* (< 900 pts)
- **Premios Sarcásticos Reales:**
  - 🐢 **"El Cuello de Botella":** Operario con mayor lentitud media de reacción en ms.
  - ⚡ **"Reflejos de Uranio":** Operario más veloz en ejecutar las órdenes.
  - 🤡 **"Dedo Nervioso":** Operario con mayor número de errores o toques falsos.
  - 🎯 **"Precisión Impecable":** Sangre fría sin ningún fallo cometido.
- Tabla desglosada de telemetría por operario.
- Botón **"JUGAR OTRA PARTIDA"** para reiniciar la partida de inmediato sin salir de la sala.

---

## 📁 Arquitectura del Repositorio
```
central-caotica/
├── package.json              # Orquestador con scripts concurrentes
├── README.md
├── server/
│   ├── package.json          # Node.js + Express + Socket.IO + TSX
│   ├── tsconfig.json
│   ├── test-e2e.js           # Test de integración automatizado completo
│   └── src/
│       ├── server.ts         # Servidor WebSockets y endpoints
│       ├── types.ts          # Interfaces de sala, jugadores y telemetría
│       ├── gameManager.ts    # Lógica de juego, time-decay y simulación de bots
│       └── questions.ts      # Banco de preguntas y reglas AZ-5
└── client/
    ├── package.json          # React + Vite + Tailwind CSS + Lucide
    ├── vite.config.ts        # Configurado con host: true para acceso por red LAN
    ├── tailwind.config.js    # Paleta y sombras neo-brutalistas
    ├── index.html
    └── src/
        ├── App.tsx           # Enrutador de pantallas y shake manager
        ├── socket.ts         # Conexión dinámica a Socket.IO
        ├── soundEngine.ts    # Sintetizador Web Audio API nativo y vibración
        ├── types.ts
        ├── index.css         # Scanlines CRT y franjas de advertencia
        └── components/
            ├── Header.tsx             # Estado de núcleo y mute
            ├── JoinCreateScreen.tsx   # Creación y unión a sala
            ├── LobbyScreen.tsx        # Lista de operarios y selector de bots
            ├── Round1ChainReaction.tsx# 4 mandos físicos y cadena de 6 pasos
            ├── Round2AZ5Panel.tsx     # Asimetría técnico / ingeniero
            ├── Round3MinistryCall.tsx # Trivia con respuestas repartidas
            └── FinalReportScreen.tsx  # Premios virales y estadísticas
```
