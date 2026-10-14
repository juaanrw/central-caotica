import { 
  RoomState, 
  Player, 
  ActionType, 
  Round1Step, 
  Round2State, 
  TriviaOption,
  AwardInfo
} from './types';
import { 
  GENERAL_CULTURE_TRIVIA, 
  AZ5_RULES, 
  MANUAL_PART_A_RULES, 
  MANUAL_PART_B_RULES, 
  MANUAL_FULL_RULES 
} from './questions';

const ACTIONS: { type: ActionType; title: string; instructionPhrase: string }[] = [
  {
    type: 'BUTTON',
    title: 'BOTÓN ROJO DE EMERGENCIA',
    instructionPhrase: 'pulsar el botón rojo de emergencia'
  },
  {
    type: 'VALVE',
    title: 'VÁLVULA DE REFRIGERACIÓN',
    instructionPhrase: 'mantener pulsada la válvula durante 2 segundos'
  },
  {
    type: 'SLIDER',
    title: 'PALANCA DE BARRAS',
    instructionPhrase: 'subir la palanca de control al 100%'
  },
  {
    type: 'PUMP',
    title: 'BOMBA MANUAL AUXILIAR',
    instructionPhrase: 'bombear rápido (5 toques seguidos)'
  },
  {
    type: 'SHOUT',
    title: 'SENSOR ACÚSTICO',
    instructionPhrase: 'gritar al micrófono'
  }
];

export type BroadcastCallback = (room: RoomState, event: string, data?: any) => void;

export class GameManager {
  private rooms: Map<string, RoomState> = new Map();
  private botTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private broadcaster?: BroadcastCallback;

  public setBroadcaster(cb: BroadcastCallback) {
    this.broadcaster = cb;
  }

  private emit(room: RoomState, event: string, data?: any) {
    if (this.broadcaster) {
      this.broadcaster(room, event, data);
    }
  }

  public createRoom(hostName: string, hostSocketId: string, hasMic: boolean = false): RoomState {
    const code = this.generateRoomCode();
    const host: Player = {
      id: hostSocketId,
      name: hostName.trim() || 'Operario Jefe',
      isHost: true,
      hasMic,
      stats: { reactionTimes: [], mistakes: 0, actionsCompleted: 0 }
    };

    const room: RoomState = {
      code,
      players: [host],
      phase: 'LOBBY',
      currentStability: 1000,
      round1Scores: 0,
      round2Scores: 0,
      round3Scores: 0,
      totalScore: 0,
      roundStartTime: Date.now()
    };

    this.rooms.set(code, room);
    return room;
  }

  public joinRoom(code: string, playerName: string, socketId: string, hasMic: boolean = false): { room?: RoomState; error?: string } {
    const upperCode = code.toUpperCase().trim();
    const room = this.rooms.get(upperCode);
    if (!room) {
      return { error: 'Sala no encontrada. Comprueba el código de 4 letras.' };
    }

    if (room.phase !== 'LOBBY') {
      return { error: 'La partida ya está en curso en esta central.' };
    }

    if (room.players.length >= 4) {
      return { error: 'La sala está completa (máximo 4 operarios).' };
    }

    const player: Player = {
      id: socketId,
      name: playerName.trim() || `Camarada-${room.players.length + 1}`,
      isHost: false,
      hasMic,
      stats: { reactionTimes: [], mistakes: 0, actionsCompleted: 0 }
    };

    room.players.push(player);
    return { room };
  }

  public setPlayerMic(socketId: string, hasMic: boolean): RoomState | null {
    const room = this.getRoomBySocketId(socketId);
    if (!room) return null;
    const player = room.players.find(p => p.id === socketId);
    if (player) {
      player.hasMic = hasMic;
      return room;
    }
    return null;
  }

  public addBot(roomCode: string): RoomState | null {
    const room = this.rooms.get(roomCode);
    if (!room || room.players.length >= 4) return null;

    const botNames = ['Bot Ivan', 'Bot Natasha', 'Bot Boris', 'Bot Svetlana'];
    const usedNames = new Set(room.players.map(p => p.name));
    const availableName = botNames.find(n => !usedNames.has(n)) || `Bot-${Math.floor(Math.random() * 900 + 100)}`;

    const botPlayer: Player = {
      id: `bot-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: availableName,
      isHost: false,
      isBot: true,
      hasMic: true,
      stats: { reactionTimes: [], mistakes: 0, actionsCompleted: 0 }
    };

    room.players.push(botPlayer);
    return room;
  }

  public removeBot(roomCode: string, botId: string): RoomState | null {
    const room = this.rooms.get(roomCode);
    if (!room) return null;
    room.players = room.players.filter(p => p.id !== botId);
    return room;
  }

  public removePlayer(socketId: string): { room?: RoomState; roomDeleted?: boolean } {
    for (const [code, room] of this.rooms.entries()) {
      const idx = room.players.findIndex(p => p.id === socketId);
      if (idx !== -1) {
        const removed = room.players.splice(idx, 1)[0];
        if (room.players.length === 0 || room.players.every(p => p.isBot)) {
          this.clearBotTimeouts(code);
          this.rooms.delete(code);
          return { roomDeleted: true };
        }
        if (removed.isHost && room.players.length > 0) {
          const newHost = room.players.find(p => !p.isBot) || room.players[0];
          newHost.isHost = true;
        }
        return { room };
      }
    }
    return {};
  }

  public getRoom(code: string): RoomState | undefined {
    return this.rooms.get(code.toUpperCase());
  }

  public getRoomBySocketId(socketId: string): RoomState | undefined {
    for (const room of this.rooms.values()) {
      if (room.players.some(p => p.id === socketId)) {
        return room;
      }
    }
    return undefined;
  }

  // --- GAME START & ROUND 1: REACCIÓN EN CADENA ---

  public startGame(roomCode: string): RoomState | null {
    const room = this.rooms.get(roomCode);
    if (!room || room.players.length < 2) return null;

    room.phase = 'ROUND_1';
    room.currentStability = 1000;
    room.round1Scores = 0;
    room.round2Scores = 0;
    room.round3Scores = 0;
    room.totalScore = 0;
    room.roundStartTime = Date.now();
    room.botRadioMessage = undefined;

    // Reset player stats
    for (const p of room.players) {
      p.stats = { reactionTimes: [], mistakes: 0, actionsCompleted: 0 };
    }

    this.initRound1Step(room, 1);
    return room;
  }

  private initRound1Step(room: RoomState, stepNumber: number) {
    this.clearBotTimeouts(room.code);

    const players = room.players;
    const senderIdx = Math.floor(Math.random() * players.length);
    // Executor can be ANY player, including the sender themself!
    const executorIdx = Math.floor(Math.random() * players.length);

    const sender = players[senderIdx];
    const executor = players[executorIdx];

    // Filter available actions based on executor's microphone permission
    const availableActions = ACTIONS.filter(a => {
      if (a.type === 'SHOUT') {
        return !!executor.hasMic;
      }
      return true;
    });

    const action = availableActions[Math.floor(Math.random() * availableActions.length)];
    const instructionText = `¡${executor.name.toUpperCase()} TIENE QUE ${action.instructionPhrase.toUpperCase()}!`;

    const step: Round1Step = {
      stepNumber,
      senderId: sender.id,
      senderName: sender.name,
      executorId: executor.id,
      executorName: executor.name,
      targetAction: action.type,
      actionTitle: action.title,
      actionInstruction: instructionText,
      startTime: Date.now()
    };

    room.round1 = step;

    // If executor is a bot, schedule bot action
    if (executor.isBot) {
      const delay = Math.floor(Math.random() * 800 + 1200);
      const timeout = setTimeout(() => {
        this.completeRound1Action(room.code, executor.id, action.type);
      }, delay);
      this.botTimeouts.set(`${room.code}_r1`, timeout);
    }
  }

  public completeRound1Action(roomCode: string, playerId: string, action: ActionType): boolean {
    const room = this.rooms.get(roomCode);
    if (!room || room.phase !== 'ROUND_1' || !room.round1) return false;

    const step = room.round1;
    const player = room.players.find(p => p.id === playerId);
    if (!player) return false;

    // If not executor: penalty for false touch!
    if (step.executorId !== playerId) {
      player.stats.mistakes++;
      room.currentStability = Math.max(50, room.currentStability - 40);
      this.emit(room, 'actionError', { 
        playerId, 
        message: `¡${player.name} accionó mandos cuando la orden era para ${step.executorName}!` 
      });
      this.emit(room, 'stateUpdate', room);
      return false;
    }

    if (action !== step.targetAction) {
      // Wrong action!
      player.stats.mistakes++;
      room.currentStability = Math.max(50, room.currentStability - 50);
      this.emit(room, 'actionError', { 
        playerId, 
        message: `¡${player.name} accionó el control equivocado!` 
      });
      this.emit(room, 'stateUpdate', room);
      return false;
    }

    // Success!
    const elapsed = Date.now() - step.startTime;
    player.stats.reactionTimes.push(elapsed);
    player.stats.actionsCompleted++;

    // Stability decay: -40 pts per second of total round time
    const roundElapsed = Date.now() - room.roundStartTime;
    room.currentStability = Math.max(50, 1000 - Math.floor((roundElapsed / 1000) * 40));

    this.emit(room, 'stepSuccess', {
      stepNumber: step.stepNumber,
      executorName: player.name,
      elapsedMs: elapsed
    });

    if (step.stepNumber < 6) {
      this.initRound1Step(room, step.stepNumber + 1);
      this.emit(room, 'stateUpdate', room);
    } else {
      // Finish Round 1!
      room.round1Scores = room.currentStability;
      this.initRound2(room);
      this.emit(room, 'roundCompleted', { round: 1, score: room.round1Scores });
      this.emit(room, 'stateUpdate', room);
    }

    return true;
  }

  // --- ROUND 2: PANEL AZ-5 CON REGLAS Y ROLES PARTICIONADOS ---

  private initRound2(room: RoomState) {
    this.clearBotTimeouts(room.code);
    room.phase = 'ROUND_2';
    room.currentStability = 1000;
    room.roundStartTime = Date.now();
    room.botRadioMessage = undefined;

    const count = room.players.length;
    const shuffled = [...room.players].sort(() => Math.random() - 0.5);

    // Dynamic role assignment based on player count:
    // 2 players: 1 TECNICO_TOTAL, 1 INGENIERO_TOTAL
    // 3 players: 1 TECNICO_TOTAL, 1 INGENIERO_A, 1 INGENIERO_B
    // 4 players: 1 TECNICO_ALFA_BETA, 1 TECNICO_GAMMA_DELTA, 1 INGENIERO_A, 1 INGENIERO_B
    if (count === 2) {
      shuffled[0].role = 'TECNICO_TOTAL';
      shuffled[1].role = 'INGENIERO_TOTAL';
    } else if (count === 3) {
      shuffled[0].role = 'TECNICO_TOTAL';
      shuffled[1].role = 'INGENIERO_A';
      shuffled[2].role = 'INGENIERO_B';
    } else {
      // 4 or more players
      shuffled[0].role = 'TECNICO_ALFA_BETA';
      shuffled[1].role = 'TECNICO_GAMMA_DELTA';
      shuffled[2].role = 'INGENIERO_A';
      shuffled[3].role = 'INGENIERO_B';
    }

    // Select random rule from AZ5_RULES
    const chosenRule = AZ5_RULES[Math.floor(Math.random() * AZ5_RULES.length)];
    
    // Choose pressure based on rule condition
    let pressure = 50;
    if (chosenRule.pressureCondition === 'ALTA') {
      pressure = Math.floor(Math.random() * 25 + (chosenRule.pressureThreshold + 4));
    } else {
      pressure = Math.floor(Math.random() * 20 + (chosenRule.pressureThreshold - 22));
    }

    const round2State: Round2State = {
      coreColor: chosenRule.coreColor,
      pressure,
      currentSwitches: { alfa: false, beta: false, gamma: false, delta: false },
      manualFull: MANUAL_FULL_RULES,
      manualPartA: MANUAL_PART_A_RULES,
      manualPartB: MANUAL_PART_B_RULES,
      requiredSwitches: { ...chosenRule.requiredSwitches },
      startTime: Date.now()
    };

    room.round2 = round2State;

    // Bot support:
    // If bot is Engineer A or B or Engineer Total:
    const botEngA = room.players.find(p => p.isBot && p.role === 'INGENIERO_A');
    const botEngB = room.players.find(p => p.isBot && p.role === 'INGENIERO_B');
    const botEngTotal = room.players.find(p => p.isBot && p.role === 'INGENIERO_TOTAL');

    if (botEngA) {
      setTimeout(() => {
        room.botRadioMessage = `📻 RADIO (${botEngA.name}): "¡Núcleo ${chosenRule.coreColor} detectado! Eso activa la ${chosenRule.phaseCode}."`;
        this.emit(room, 'stateUpdate', room);
      }, 1200);
    }
    if (botEngB) {
      setTimeout(() => {
        room.botRadioMessage = `📻 RADIO (${botEngB.name}): "En ${chosenRule.phaseCode} con ${pressure} bar, ¡las válvulas requeridas son: ${chosenRule.valvesText}!"`;
        this.emit(room, 'stateUpdate', room);
      }, 2500);
    }
    if (botEngTotal) {
      setTimeout(() => {
        room.botRadioMessage = `📻 RADIO (${botEngTotal.name}): "¡El manual dice que con Núcleo ${chosenRule.coreColor} y ${pressure} bar conectéis: ${chosenRule.valvesText}!"`;
        this.emit(room, 'stateUpdate', room);
      }, 1500);
    }

    // If technicians are only bots, auto-stabilize after delay
    const humanTecnico = room.players.some(p => !p.isBot && (p.role === 'TECNICO_TOTAL' || p.role === 'TECNICO_ALFA_BETA' || p.role === 'TECNICO_GAMMA_DELTA'));
    if (!humanTecnico) {
      const timeout = setTimeout(() => {
        if (room.round2) {
          room.round2.currentSwitches = { ...chosenRule.requiredSwitches };
          const botTec = room.players.find(p => p.isBot && (p.role === 'TECNICO_TOTAL' || p.role === 'TECNICO_GAMMA_DELTA'));
          if (botTec) {
            this.stabilizeAZ5(room.code, botTec.id);
          }
        }
      }, 3500);
      this.botTimeouts.set(`${room.code}_r2`, timeout);
    }
  }

  public toggleSwitchAZ5(roomCode: string, playerId: string, switchName: 'alfa' | 'beta' | 'gamma' | 'delta'): RoomState | null {
    const room = this.rooms.get(roomCode);
    if (!room || room.phase !== 'ROUND_2' || !room.round2) return null;

    const player = room.players.find(p => p.id === playerId);
    if (!player || !player.role) return null;

    // Check switch permissions
    if (player.role === 'TECNICO_TOTAL') {
      // Allowed for all 4
    } else if (player.role === 'TECNICO_ALFA_BETA') {
      if (switchName !== 'alfa' && switchName !== 'beta') return null;
    } else if (player.role === 'TECNICO_GAMMA_DELTA') {
      if (switchName !== 'gamma' && switchName !== 'delta') return null;
    } else {
      // Engineers cannot flip switches
      return null;
    }

    room.round2.currentSwitches[switchName] = !room.round2.currentSwitches[switchName];
    return room;
  }

  public stabilizeAZ5(roomCode: string, playerId: string): boolean {
    const room = this.rooms.get(roomCode);
    if (!room || room.phase !== 'ROUND_2' || !room.round2) return false;

    const player = room.players.find(p => p.id === playerId);
    if (!player || !player.role) return false;

    // Check who is allowed to stabilize
    if (player.role !== 'TECNICO_TOTAL' && player.role !== 'TECNICO_GAMMA_DELTA' && player.role !== 'TECNICO_ALFA_BETA') {
      return false;
    }

    const cur = room.round2.currentSwitches;
    const req = room.round2.requiredSwitches;

    const isMatch = cur.alfa === req.alfa &&
                    cur.beta === req.beta &&
                    cur.gamma === req.gamma &&
                    cur.delta === req.delta;

    if (!isMatch) {
      player.stats.mistakes++;
      room.currentStability = Math.max(50, room.currentStability - 200);
      this.emit(room, 'az5Error', {
        message: '¡DISPARO AZ-5 FALLIDO! La configuración de válvulas no coincide con el manual.'
      });
      this.emit(room, 'stateUpdate', room);
      return false;
    }

    // Success!
    const elapsed = Date.now() - room.round2.startTime;
    player.stats.reactionTimes.push(elapsed);
    player.stats.actionsCompleted++;

    // Stability decay: -35 pts per second
    room.round2Scores = Math.max(100, 1000 - Math.floor((elapsed / 1000) * 35));

    this.emit(room, 'az5Success', {
      score: room.round2Scores,
      elapsedMs: elapsed
    });

    this.initRound3(room);
    this.emit(room, 'roundCompleted', { round: 2, score: room.round2Scores });
    this.emit(room, 'stateUpdate', room);
    return true;
  }

  // --- ROUND 3: LLAMADA DEL MINISTERIO (CULTURA GENERAL) ---

  private initRound3(room: RoomState) {
    this.clearBotTimeouts(room.code);
    room.phase = 'ROUND_3';
    room.currentStability = 1000;
    room.roundStartTime = Date.now();
    room.botRadioMessage = undefined;

    this.initTriviaQuestion(room, 1);
  }

  private initTriviaQuestion(room: RoomState, questionNumber: number) {
    this.clearBotTimeouts(room.code);

    const qRaw = GENERAL_CULTURE_TRIVIA[Math.floor(Math.random() * GENERAL_CULTURE_TRIVIA.length)];
    const optionsRaw = [
      { text: qRaw.correctAnswer, isCorrect: true },
      ...qRaw.distractors.map(d => ({ text: d, isCorrect: false }))
    ].sort(() => Math.random() - 0.5);

    const players = room.players;
    const triviaOptions: TriviaOption[] = optionsRaw.map((opt, idx) => {
      const assignedPlayer = players[idx % players.length];
      return {
        id: `opt_${questionNumber}_${idx}`,
        text: opt.text,
        isCorrect: opt.isCorrect,
        assignedPlayerId: assignedPlayer.id
      };
    });

    room.round3 = {
      questionNumber,
      prompt: qRaw.prompt,
      options: triviaOptions,
      startTime: Date.now()
    };

    // If correct option is assigned to a bot, schedule bot clicking
    const correctOption = triviaOptions.find(o => o.isCorrect);
    if (correctOption) {
      const bot = players.find(p => p.id === correctOption.assignedPlayerId && p.isBot);
      if (bot) {
        const delay = Math.floor(Math.random() * 800 + 2000);
        const timeout = setTimeout(() => {
          this.submitTriviaAnswer(room.code, bot.id, correctOption.id);
        }, delay);
        this.botTimeouts.set(`${room.code}_r3`, timeout);
      }
    }
  }

  public submitTriviaAnswer(roomCode: string, playerId: string, optionId: string): boolean {
    const room = this.rooms.get(roomCode);
    if (!room || room.phase !== 'ROUND_3' || !room.round3) return false;

    const question = room.round3;
    const option = question.options.find(o => o.id === optionId);
    if (!option || option.assignedPlayerId !== playerId) return false;

    const player = room.players.find(p => p.id === playerId);
    if (!player) return false;

    if (!option.isCorrect) {
      player.stats.mistakes++;
      room.currentStability = Math.max(50, room.currentStability - 200);
      this.emit(room, 'triviaError', {
        message: `¡RESPUESTA RECHAZADA POR EL MINISTERIO! -200 Puntos.`,
        playerName: player.name
      });
      this.emit(room, 'stateUpdate', room);
      return false;
    }

    // Correct!
    const elapsed = Date.now() - question.startTime;
    player.stats.reactionTimes.push(elapsed);
    player.stats.actionsCompleted++;

    this.emit(room, 'triviaSuccess', {
      questionNumber: question.questionNumber,
      playerName: player.name,
      elapsedMs: elapsed
    });

    if (question.questionNumber < 3) {
      this.initTriviaQuestion(room, question.questionNumber + 1);
      this.emit(room, 'stateUpdate', room);
    } else {
      // Calculate final score
      const round3Elapsed = Date.now() - room.roundStartTime;
      room.round3Scores = Math.max(50, room.currentStability - Math.floor((round3Elapsed / 1000) * 30));
      room.totalScore = room.round1Scores + room.round2Scores + room.round3Scores;

      this.generateSummary(room);
      this.emit(room, 'gameCompleted', room.summary);
      this.emit(room, 'stateUpdate', room);
    }

    return true;
  }

  // --- SUMMARY & SARCASTIC VIRAL AWARDS ---

  private generateSummary(room: RoomState) {
    this.clearBotTimeouts(room.code);
    room.phase = 'SUMMARY';

    const total = room.totalScore;
    let rankTitle = '';
    let rankSubtitle = '';
    let rankBadge = '🎖️';

    if (total >= 2200) {
      rankBadge = '🎖️';
      rankTitle = 'HÉROES DE LA UNIÓN SOVIÉTICA';
      rankSubtitle = '¡El reactor no estalló! Lenin en persona os concedería la Orden de la Bandera Roja. Recibiréis ración doble de té.';
    } else if (total >= 1600) {
      rankBadge = '⚠️';
      rankTitle = 'OPERARIOS ACEPTABLES (3.6 ROENTGEN)';
      rankSubtitle = 'Ni genial, ni terrible. El núcleo tiene una pequeña fisura humeante, pero el informe oficial dirá que fue un éxito.';
    } else if (total >= 900) {
      rankBadge = '📉';
      rankTitle = 'OPERARIOS MEDIOCRES';
      rankSubtitle = 'La sala de turbinas se inundó con agua hirviendo. Mañana a primera hora todos los turnos serán reasignados a Siberia.';
    } else {
      rankBadge = '☢️';
      rankTitle = 'CAUSANTES DE UN INVIERNO NUCLEAR';
      rankSubtitle = '¡FUSIÓN TOTAL! La tapa de 1000 toneladas salió volando. Prípiat será una reserva radiactiva durante 20.000 años.';
    }

    const playerTelemetry = room.players.map(p => {
      const validTimes = p.stats.reactionTimes;
      const avg = validTimes.length > 0 
        ? Math.round(validTimes.reduce((a, b) => a + b, 0) / validTimes.length)
        : 0;
      return {
        id: p.id,
        name: p.name,
        avgReactionMs: avg,
        actionsCompleted: p.stats.actionsCompleted,
        mistakes: p.stats.mistakes
      };
    });

    const awards: AwardInfo[] = [];

    const withTimes = playerTelemetry.filter(p => p.avgReactionMs > 0);
    if (withTimes.length > 0) {
      const slowest = [...withTimes].sort((a, b) => b.avgReactionMs - a.avgReactionMs)[0];
      awards.push({
        type: 'BOTTLENECK',
        title: 'El Cuello de Botella',
        icon: '🐢',
        playerName: slowest.name,
        metric: `${slowest.avgReactionMs} ms`,
        description: 'Tardó tanto en reaccionar que casi presenciamos tres fusiones de núcleo consecutivas.'
      });

      const fastest = [...withTimes].sort((a, b) => a.avgReactionMs - b.avgReactionMs)[0];
      awards.push({
        type: 'FASTEST',
        title: 'Reflejos de Uranio',
        icon: '⚡',
        playerName: fastest.name,
        metric: `${fastest.avgReactionMs} ms`,
        description: 'Pulsó los controles antes incluso de que la onda expansiva llegara a su estación.'
      });
    }

    const mostMistakes = [...playerTelemetry].sort((a, b) => b.mistakes - a.mistakes)[0];
    if (mostMistakes && mostMistakes.mistakes > 0) {
      awards.push({
        type: 'NERVOUS',
        title: 'Dedo Nervioso',
        icon: '🤡',
        playerName: mostMistakes.name,
        metric: `${mostMistakes.mistakes} errores`,
        description: 'Apretó interruptores a ciegas con el pánico en los ojos como si fuera un teclado de mecanografía.'
      });
    } else {
      awards.push({
        type: 'HERO',
        title: 'Precisión Impecable',
        icon: '🎯',
        playerName: playerTelemetry[0]?.name || 'Operario',
        metric: '0 errores',
        description: 'Ningún fallo cometido. Sangre fría y disciplina soviética inquebrantable.'
      });
    }

    room.summary = {
      totalScore: total,
      rankTitle,
      rankSubtitle,
      rankBadge,
      awards,
      playerStats: playerTelemetry
    };
  }

  public restartGame(roomCode: string): RoomState | null {
    const room = this.rooms.get(roomCode);
    if (!room) return null;

    this.clearBotTimeouts(roomCode);
    room.phase = 'LOBBY';
    room.currentStability = 1000;
    room.round1Scores = 0;
    room.round2Scores = 0;
    room.round3Scores = 0;
    room.totalScore = 0;
    room.round1 = undefined;
    room.round2 = undefined;
    room.round3 = undefined;
    room.summary = undefined;
    room.botRadioMessage = undefined;

    for (const p of room.players) {
      p.role = undefined;
      p.stats = { reactionTimes: [], mistakes: 0, actionsCompleted: 0 };
    }

    return room;
  }

  private clearBotTimeouts(roomCode: string) {
    for (const [key, timeout] of this.botTimeouts.entries()) {
      if (key.startsWith(roomCode)) {
        clearTimeout(timeout);
        this.botTimeouts.delete(key);
      }
    }
  }

  private generateRoomCode(): string {
    const sovietWords = ['AZ5X', 'CHER', 'ATOM', 'LENN', 'KRST', 'PLUT', 'RBMK', 'VODK', 'SVR1', 'URAN', 'ROEN', 'BALT'];
    const word = sovietWords[Math.floor(Math.random() * sovietWords.length)];
    if (!this.rooms.has(word)) return word;

    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
