import { 
  RoomState, 
  Player, 
  ActionType, 
  Round1Step, 
  Round2State, 
  AZ5Console,
  Round4State,
  Round5State,
  MazeRole,
  MazeDirection,
  MazeCoord,
  ConveyorItem,
  ConveyorStation,
  ConveyorCategory,
  ConveyorDestinationId,
  DistributedQuestion,
  DistributedOption,
  Round3State,
  QuestionAnswerType,
  AwardInfo
} from './types';
import { 
  CATEGORIZED_TRIVIA_DB, 
  CategorizedQuestionRaw,
  AZ5_RULES, 
  MANUAL_PART_A_RULES, 
  MANUAL_PART_B_RULES, 
  MANUAL_FULL_RULES,
  CONVEYOR_CATEGORIES_POOL,
  CONVEYOR_ITEMS_POOL,
  MAZE_BLUEPRINTS
} from './questions';

const ACTIONS: { type: ActionType; title: string; instructionPhrase: string }[] = [
  {
    type: 'BUTTON',
    title: 'EMERGENCIA',
    instructionPhrase: 'pulsar emergencia'
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

  public createRoom(hostName: string, hostSocketId: string): RoomState {
    const code = this.generateRoomCode();
    const host: Player = {
      id: hostSocketId,
      name: hostName.trim() || 'Operario Jefe',
      isHost: true,
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
      round4Scores: 0,
      round5Scores: 0,
      totalScore: 0,
      roundStartTime: Date.now()
    };

    this.rooms.set(code, room);
    return room;
  }

  public joinRoom(code: string, playerName: string, socketId: string): { room?: RoomState; error?: string } {
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
      stats: { reactionTimes: [], mistakes: 0, actionsCompleted: 0 }
    };

    room.players.push(player);
    return { room };
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
    return this.startSpecificRound(roomCode, 1, false);
  }

  public startSpecificRound(roomCode: string, roundNumber: 1 | 2 | 3 | 4 | 5, singleRound: boolean = true): RoomState | null {
    const room = this.rooms.get(roomCode);
    if (!room || room.players.length < 2) return null;

    this.clearBotTimeouts(roomCode);
    room.singleRoundMode = singleRound;
    room.currentStability = 1000;
    room.round1Scores = 0;
    room.round2Scores = 0;
    room.round3Scores = 0;
    room.round4Scores = 0;
    room.round5Scores = 0;
    room.totalScore = 0;
    room.roundStartTime = Date.now();
    room.botRadioMessage = undefined;
    room.round1 = undefined;
    room.round2 = undefined;
    room.round3 = undefined;
    room.round4 = undefined;
    room.round5 = undefined;
    room.summary = undefined;

    // Reset player stats
    for (const p of room.players) {
      p.role = undefined;
      p.stats = { reactionTimes: [], mistakes: 0, actionsCompleted: 0 };
    }

    if (roundNumber === 1) {
      room.phase = 'ROUND_1';
      this.initRound1Step(room, 1);
    } else if (roundNumber === 2) {
      this.initRound2(room);
    } else if (roundNumber === 3) {
      this.initRound3(room);
    } else if (roundNumber === 4) {
      this.initRound4(room);
    } else if (roundNumber === 5) {
      this.initRound5(room);
    }

    return room;
  }

  private finishSingleOrNext(room: RoomState, nextRoundInit: () => void) {
    if (room.singleRoundMode) {
      room.totalScore = room.round1Scores + room.round2Scores + room.round3Scores + room.round4Scores + room.round5Scores;
      this.generateSummary(room);
      this.emit(room, 'gameCompleted', room.summary);
    } else {
      nextRoundInit();
    }
  }

  private initRound1Step(room: RoomState, stepNumber: number) {
    this.clearBotTimeouts(room.code);

    const players = room.players;
    const senderIdx = Math.floor(Math.random() * players.length);
    // Executor can be ANY player, including the sender themself!
    const executorIdx = Math.floor(Math.random() * players.length);

    const sender = players[senderIdx];
    const executor = players[executorIdx];

    const action = ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
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
      this.emit(room, 'roundCompleted', { round: 1, score: room.round1Scores });
      this.finishSingleOrNext(room, () => this.initRound2(room));
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
    // 4 players: 1 TECNICO_CONSOLA_1, 1 TECNICO_CONSOLA_2, 1 INGENIERO_A, 1 INGENIERO_B
    if (count === 2) {
      shuffled[0].role = 'TECNICO_TOTAL';
      shuffled[1].role = 'INGENIERO_TOTAL';
    } else if (count === 3) {
      shuffled[0].role = 'TECNICO_TOTAL';
      shuffled[1].role = 'INGENIERO_A';
      shuffled[2].role = 'INGENIERO_B';
    } else {
      // 4 or more players: Two independent technicians and two manual engineers
      shuffled[0].role = 'TECNICO_CONSOLA_1';
      shuffled[1].role = 'TECNICO_CONSOLA_2';
      shuffled[2].role = 'INGENIERO_A';
      shuffled[3].role = 'INGENIERO_B';
    }

    // Select primary rule
    const rule1 = AZ5_RULES[Math.floor(Math.random() * AZ5_RULES.length)];
    let pressure1 = 50;
    if (rule1.pressureCondition === 'ALTA') {
      pressure1 = Math.floor(Math.random() * 25 + (rule1.pressureThreshold + 4));
    } else {
      pressure1 = Math.floor(Math.random() * 20 + (rule1.pressureThreshold - 22));
    }

    let dualConsolesData: { console1: AZ5Console; console2: AZ5Console } | undefined = undefined;

    if (count >= 4) {
      // Pick a distinct rule for console 2
      const otherRules = AZ5_RULES.filter(r => r.id !== rule1.id);
      const rule2 = otherRules[Math.floor(Math.random() * otherRules.length)] || AZ5_RULES[0];
      let pressure2 = 50;
      if (rule2.pressureCondition === 'ALTA') {
        pressure2 = Math.floor(Math.random() * 25 + (rule2.pressureThreshold + 4));
      } else {
        pressure2 = Math.floor(Math.random() * 20 + (rule2.pressureThreshold - 22));
      }

      dualConsolesData = {
        console1: {
          id: 1,
          title: 'CONSOLA 1: REACTOR PRIMARIO',
          coreColor: rule1.coreColor,
          pressure: pressure1,
          currentSwitches: { alfa: false, beta: false, gamma: false, delta: false },
          requiredSwitches: { ...rule1.requiredSwitches },
          isStabilized: false
        },
        console2: {
          id: 2,
          title: 'CONSOLA 2: GENERADOR SECUNDARIO',
          coreColor: rule2.coreColor,
          pressure: pressure2,
          currentSwitches: { alfa: false, beta: false, gamma: false, delta: false },
          requiredSwitches: { ...rule2.requiredSwitches },
          isStabilized: false
        }
      };
    }

    const round2State: Round2State = {
      coreColor: rule1.coreColor,
      pressure: pressure1,
      currentSwitches: { alfa: false, beta: false, gamma: false, delta: false },
      manualFull: MANUAL_FULL_RULES,
      manualPartA: MANUAL_PART_A_RULES,
      manualPartB: MANUAL_PART_B_RULES,
      requiredSwitches: { ...rule1.requiredSwitches },
      startTime: Date.now(),
      dualConsoles: dualConsolesData
    };

    room.round2 = round2State;

    // Bot support:
    const botEngA = room.players.find(p => p.isBot && p.role === 'INGENIERO_A');
    const botEngB = room.players.find(p => p.isBot && p.role === 'INGENIERO_B');
    const botEngTotal = room.players.find(p => p.isBot && p.role === 'INGENIERO_TOTAL');

    if (count < 4) {
      if (botEngA) {
        setTimeout(() => {
          room.botRadioMessage = `📻 RADIO (${botEngA.name}): "¡Núcleo ${rule1.coreColor} detectado! Eso activa la ${rule1.phaseCode}."`;
          this.emit(room, 'stateUpdate', room);
        }, 1200);
      }
      if (botEngB) {
        setTimeout(() => {
          room.botRadioMessage = `📻 RADIO (${botEngB.name}): "En ${rule1.phaseCode} con ${pressure1} bar, ¡las válvulas requeridas son: ${rule1.valvesText}!"`;
          this.emit(room, 'stateUpdate', room);
        }, 2500);
      }
      if (botEngTotal) {
        setTimeout(() => {
          room.botRadioMessage = `📻 RADIO (${botEngTotal.name}): "¡El manual dice que con Núcleo ${rule1.coreColor} y ${pressure1} bar conectéis: ${rule1.valvesText}!"`;
          this.emit(room, 'stateUpdate', room);
        }, 1500);
      }

      // If bot is single technician:
      const botTecTotal = room.players.find(p => p.isBot && p.role === 'TECNICO_TOTAL');
      if (botTecTotal) {
        const timeout = setTimeout(() => {
          if (room.round2) {
            room.round2.currentSwitches = { ...rule1.requiredSwitches };
            this.stabilizeAZ5(room.code, botTecTotal.id);
          }
        }, 3500);
        this.botTimeouts.set(`${room.code}_r2`, timeout);
      }
    } else if (dualConsolesData) {
      // 4-player bot automation
      const botTec1 = room.players.find(p => p.isBot && p.role === 'TECNICO_CONSOLA_1');
      if (botTec1) {
        const timeout = setTimeout(() => {
          if (room.round2 && room.round2.dualConsoles) {
            room.round2.dualConsoles.console1.currentSwitches = { ...room.round2.dualConsoles.console1.requiredSwitches };
            this.stabilizeAZ5(room.code, botTec1.id);
          }
        }, 2800);
        this.botTimeouts.set(`${room.code}_r2_c1`, timeout);
      }

      const botTec2 = room.players.find(p => p.isBot && p.role === 'TECNICO_CONSOLA_2');
      if (botTec2) {
        const timeout = setTimeout(() => {
          if (room.round2 && room.round2.dualConsoles) {
            room.round2.dualConsoles.console2.currentSwitches = { ...room.round2.dualConsoles.console2.requiredSwitches };
            this.stabilizeAZ5(room.code, botTec2.id);
          }
        }, 3800);
        this.botTimeouts.set(`${room.code}_r2_c2`, timeout);
      }
    }
  }

  public toggleSwitchAZ5(roomCode: string, playerId: string, switchName: 'alfa' | 'beta' | 'gamma' | 'delta'): RoomState | null {
    const room = this.rooms.get(roomCode);
    if (!room || room.phase !== 'ROUND_2' || !room.round2) return null;

    const player = room.players.find(p => p.id === playerId);
    if (!player || !player.role) return null;

    if (player.role === 'TECNICO_TOTAL') {
      room.round2.currentSwitches[switchName] = !room.round2.currentSwitches[switchName];
    } else if (player.role === 'TECNICO_CONSOLA_1') {
      if (room.round2.dualConsoles && !room.round2.dualConsoles.console1.isStabilized) {
        room.round2.dualConsoles.console1.currentSwitches[switchName] = !room.round2.dualConsoles.console1.currentSwitches[switchName];
      }
    } else if (player.role === 'TECNICO_CONSOLA_2') {
      if (room.round2.dualConsoles && !room.round2.dualConsoles.console2.isStabilized) {
        room.round2.dualConsoles.console2.currentSwitches[switchName] = !room.round2.dualConsoles.console2.currentSwitches[switchName];
      }
    } else {
      // Engineers cannot flip switches
      return null;
    }

    return room;
  }

  public stabilizeAZ5(roomCode: string, playerId: string): boolean {
    const room = this.rooms.get(roomCode);
    if (!room || room.phase !== 'ROUND_2' || !room.round2) return false;

    const player = room.players.find(p => p.id === playerId);
    if (!player || !player.role) return false;

    // Check single panel (2 or 3 players)
    if (player.role === 'TECNICO_TOTAL') {
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

      room.round2Scores = Math.max(100, 1000 - Math.floor((elapsed / 1000) * 35));

      this.emit(room, 'az5Success', {
        score: room.round2Scores,
        elapsedMs: elapsed
      });

      this.emit(room, 'roundCompleted', { round: 2, score: room.round2Scores });
      this.finishSingleOrNext(room, () => this.initRound3(room));
      this.emit(room, 'stateUpdate', room);
      return true;
    }

    // Check dual independent consoles (4 or more players)
    if (player.role === 'TECNICO_CONSOLA_1' || player.role === 'TECNICO_CONSOLA_2') {
      if (!room.round2.dualConsoles) return false;

      const isConsola1 = player.role === 'TECNICO_CONSOLA_1';
      const myConsole = isConsola1 
        ? room.round2.dualConsoles.console1 
        : room.round2.dualConsoles.console2;
      const otherConsole = isConsola1 
        ? room.round2.dualConsoles.console2 
        : room.round2.dualConsoles.console1;

      if (myConsole.isStabilized) return true; // Already stabilized

      const cur = myConsole.currentSwitches;
      const req = myConsole.requiredSwitches;

      const isMatch = cur.alfa === req.alfa &&
                      cur.beta === req.beta &&
                      cur.gamma === req.gamma &&
                      cur.delta === req.delta;

      if (!isMatch) {
        player.stats.mistakes++;
        room.currentStability = Math.max(50, room.currentStability - 150);
        this.emit(room, 'az5Error', {
          message: `¡ERROR EN ${myConsole.title}! Las válvulas no coinciden con el manual.`
        });
        this.emit(room, 'stateUpdate', room);
        return false;
      }

      // Success on this console!
      myConsole.isStabilized = true;
      player.stats.actionsCompleted++;
      const elapsed = Date.now() - room.round2.startTime;
      player.stats.reactionTimes.push(elapsed);

      if (otherConsole.isStabilized) {
        // BOTH CONSOLES ARE STABILIZED! Advance to Round 3!
        room.round2Scores = Math.max(100, 1000 - Math.floor((elapsed / 1000) * 35));
        this.emit(room, 'az5Success', {
          score: room.round2Scores,
          elapsedMs: elapsed
        });
        this.emit(room, 'roundCompleted', { round: 2, score: room.round2Scores });
        this.finishSingleOrNext(room, () => this.initRound3(room));
        this.emit(room, 'stateUpdate', room);
        return true;
      } else {
        // One console stabilized, waiting for the other
        this.emit(room, 'az5ConsoleStabilized', {
          consoleId: myConsole.id,
          title: myConsole.title,
          operatorName: player.name
        });
        this.emit(room, 'stateUpdate', room);
        return true;
      }
    }

    return false;
  }

  // --- ROUND 3: LLAMADA DEL MINISTERIO (CULTURA GENERAL DISTRIBUIDA) ---

  private initRound3(room: RoomState) {
    this.clearBotTimeouts(room.code);
    room.phase = 'ROUND_3';
    room.currentStability = 1000;
    room.roundStartTime = Date.now();
    room.botRadioMessage = undefined;

    const playerCount = room.players.length;
    let questionsPerPlayer = 1;
    let totalQuestionsCount = 4;
    if (playerCount === 2) {
      questionsPerPlayer = 3;
      totalQuestionsCount = 6;
    } else if (playerCount === 3) {
      questionsPerPlayer = 2;
      totalQuestionsCount = 6;
    } else {
      questionsPerPlayer = 1;
      totalQuestionsCount = 4;
    }

    // Pick unique question categories (NO TWO QUESTIONS SHARE THE SAME TYPE)
    const availableCategories: QuestionAnswerType[] = [
      'YEAR', 'PERSON', 'WORK', 'CITY', 'COUNTRY', 'SCIENCE', 'NUMBER', 'NATURE', 'COLOR'
    ];
    const shuffledCategories = [...availableCategories].sort(() => Math.random() - 0.5);
    const chosenCategories = shuffledCategories.slice(0, totalQuestionsCount);

    // Pick 1 question from each unique category
    const selectedQuestionsRaw: CategorizedQuestionRaw[] = chosenCategories.map(cat => {
      const list = CATEGORIZED_TRIVIA_DB[cat];
      return list[Math.floor(Math.random() * list.length)];
    });

    // Assign questions to players evenly
    const distributedQuestions: DistributedQuestion[] = selectedQuestionsRaw.map((q, idx) => {
      const playerIdx = Math.floor(idx / questionsPerPlayer) % playerCount;
      const assignedPlayer = room.players[playerIdx];
      return {
        id: `q_${idx}`,
        type: q.type,
        prompt: q.prompt,
        correctAnswerText: q.correctAnswer,
        assignedPlayerId: assignedPlayer.id,
        isSolved: false
      };
    });

    // Options: Exactly 3 options per question (1 correct + 2 distractors)
    const rawOptions: { text: string; isCorrect: boolean; targetQuestionId?: string }[] = [];
    selectedQuestionsRaw.forEach((q, idx) => {
      const qId = `q_${idx}`;
      rawOptions.push({
        text: q.correctAnswer,
        isCorrect: true,
        targetQuestionId: qId
      });
      const shuffledDistractors = [...q.distractors].sort(() => Math.random() - 0.5);
      for (let d = 0; d < 2 && d < shuffledDistractors.length; d++) {
        rawOptions.push({
          text: shuffledDistractors[d],
          isCorrect: false
        });
      }
    });

    // Thoroughly shuffle options so answers and distractors cannot be guessed by position
    const shuffledOptions = rawOptions.sort(() => Math.random() - 0.5);

    // Distribute 12 options evenly among players
    const optionsPerPlayer = Math.floor(shuffledOptions.length / playerCount);
    const distributedOptions: DistributedOption[] = shuffledOptions.map((opt, idx) => {
      const assignedPlayer = room.players[Math.min(playerCount - 1, Math.floor(idx / optionsPerPlayer))];
      return {
        id: `opt_${idx}`,
        text: opt.text,
        isCorrect: opt.isCorrect,
        targetQuestionId: opt.targetQuestionId,
        assignedPlayerId: assignedPlayer.id,
        isSolved: false
      };
    });

    room.round3 = {
      startTime: Date.now(),
      totalQuestions: totalQuestionsCount,
      solvedCount: 0,
      questions: distributedQuestions,
      options: distributedOptions
    };

    // Schedule bot answers if bots hold correct option buttons
    this.scheduleBotTriviaRound3(room.code);
  }

  private scheduleBotTriviaRound3(roomCode: string) {
    const room = this.rooms.get(roomCode);
    if (!room || room.phase !== 'ROUND_3' || !room.round3) return;

    const r3 = room.round3;
    const botOptions = r3.options.filter(opt => {
      if (opt.isSolved || !opt.isCorrect || !opt.targetQuestionId) return false;
      const targetQ = r3.questions.find(q => q.id === opt.targetQuestionId);
      if (!targetQ || targetQ.isSolved) return false;
      const p = room.players.find(pl => pl.id === opt.assignedPlayerId);
      return p && p.isBot;
    });

    if (botOptions.length === 0) return;

    const chosenOpt = botOptions[Math.floor(Math.random() * botOptions.length)];
    const delay = Math.floor(Math.random() * 2000 + 3500);

    const timeout = setTimeout(() => {
      this.submitTriviaAnswer(roomCode, chosenOpt.assignedPlayerId, chosenOpt.id);
    }, delay);
    this.botTimeouts.set(`${roomCode}_r3_bot`, timeout);
  }

  public submitTriviaAnswer(roomCode: string, playerId: string, optionId: string): boolean {
    const room = this.rooms.get(roomCode);
    if (!room || room.phase !== 'ROUND_3' || !room.round3) return false;

    const r3 = room.round3;
    const option = r3.options.find(o => o.id === optionId);
    if (!option || option.assignedPlayerId !== playerId) return false;

    if (option.isSolved) return true; // Already verified and solved

    const player = room.players.find(p => p.id === playerId);
    if (!player) return false;

    if (!option.isCorrect) {
      player.stats.mistakes++;
      room.currentStability = Math.max(50, room.currentStability - 150);
      this.emit(room, 'triviaError', {
        message: `¡RESPUESTA RECHAZADA! "${option.text}" es errónea.`,
        playerName: player.name,
        optionId
      });
      this.emit(room, 'stateUpdate', room);
      return false;
    }

    // Option is correct! Find corresponding unsolved question
    const targetQ = r3.questions.find(q => q.id === option.targetQuestionId);
    if (!targetQ || targetQ.isSolved) return false;

    targetQ.isSolved = true;
    targetQ.solvedByPlayerName = player.name;
    option.isSolved = true;
    r3.solvedCount++;

    const elapsed = Date.now() - r3.startTime;
    player.stats.reactionTimes.push(elapsed);
    player.stats.actionsCompleted++;
    room.currentStability = Math.min(1000, room.currentStability + 25);

    this.emit(room, 'triviaSuccess', {
      questionId: targetQ.id,
      prompt: targetQ.prompt,
      correctText: option.text,
      solvedBy: player.name,
      solvedCount: r3.solvedCount,
      totalQuestions: r3.totalQuestions
    });

    if (r3.solvedCount < r3.totalQuestions) {
      this.emit(room, 'stateUpdate', room);
      this.scheduleBotTriviaRound3(room.code);
    } else {
      // ALL QUESTIONS SOLVED! Advance to Round 4!
      this.clearBotTimeouts(room.code);
      const round3Elapsed = Date.now() - room.roundStartTime;
      room.round3Scores = Math.max(100, room.currentStability - Math.floor((round3Elapsed / 1000) * 15));
      this.emit(room, 'roundCompleted', { round: 3, score: room.round3Scores });
      this.finishSingleOrNext(room, () => this.initRound4(room));
      this.emit(room, 'stateUpdate', room);
    }

    return true;
  }

  // --- ROUND 4: CINTA CLASIFICADORA (CONVEYOR BELT CHAOS - 30 SEGUNDOS) ---

  private generateRandomConveyorItem(destinations: ConveyorStation[]): ConveyorItem {
    const targetStation = destinations[Math.floor(Math.random() * destinations.length)];
    const cat = targetStation.category;
    const matchingPool = CONVEYOR_ITEMS_POOL.filter(i => i.categoryId === cat.id);
    const template = matchingPool[Math.floor(Math.random() * matchingPool.length)] || {
      name: `Material ${cat.shortName}`,
      categoryId: cat.id
    };

    return {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: template.name,
      categoryId: cat.id,
      categoryName: cat.name,
      color: cat.color,
      iconName: cat.iconName,
      targetDestinationId: targetStation.id
    };
  }

  private initRound4(room: RoomState) {
    this.clearBotTimeouts(room.code);
    room.phase = 'ROUND_4';
    room.currentStability = 1000;
    room.roundStartTime = Date.now();
    room.botRadioMessage = undefined;

    const count = room.players.length;
    const stations: ConveyorStation[] = [];

    // Left Bin: Always RESIDUOS
    const catResiduos = CONVEYOR_CATEGORIES_POOL.find(c => c.id === 'RESIDUOS')!;
    stations.push({
      id: 'LEFT_BIN',
      title: 'CONTENEDOR IZQ // RESIDUOS',
      category: { ...catResiduos },
      isBin: true
    });

    // Player 0: URANIO
    const catUranio = CONVEYOR_CATEGORIES_POOL.find(c => c.id === 'URANIO')!;
    stations.push({
      id: 'PLAYER_0',
      title: `PUESTO 1: ${room.players[0].name}`,
      playerId: room.players[0].id,
      playerName: room.players[0].name,
      category: { ...catUranio },
      isBin: false
    });

    // Player 1: AGUA
    const catAgua = CONVEYOR_CATEGORIES_POOL.find(c => c.id === 'AGUA')!;
    stations.push({
      id: 'PLAYER_1',
      title: `PUESTO 2: ${room.players[1].name}`,
      playerId: room.players[1].id,
      playerName: room.players[1].name,
      category: { ...catAgua },
      isBin: false
    });

    if (count === 2) {
      // Right Bin: BLINDAJE
      const catBlindaje = CONVEYOR_CATEGORIES_POOL.find(c => c.id === 'BLINDAJE')!;
      stations.push({
        id: 'RIGHT_BIN',
        title: 'CONTENEDOR DCH // BLINDAJE',
        category: { ...catBlindaje },
        isBin: true
      });
    } else if (count === 3) {
      // Player 2: BLINDAJE
      const catBlindaje = CONVEYOR_CATEGORIES_POOL.find(c => c.id === 'BLINDAJE')!;
      stations.push({
        id: 'PLAYER_2',
        title: `PUESTO 3: ${room.players[2].name}`,
        playerId: room.players[2].id,
        playerName: room.players[2].name,
        category: { ...catBlindaje },
        isBin: false
      });
      // Right Bin: GASES
      const catGases = CONVEYOR_CATEGORIES_POOL.find(c => c.id === 'GASES')!;
      stations.push({
        id: 'RIGHT_BIN',
        title: 'CONTENEDOR DCH // VAPOR Y GASES',
        category: { ...catGases },
        isBin: true
      });
    } else {
      // 4 players
      const catBlindaje = CONVEYOR_CATEGORIES_POOL.find(c => c.id === 'BLINDAJE')!;
      stations.push({
        id: 'PLAYER_2',
        title: `PUESTO 3: ${room.players[2].name}`,
        playerId: room.players[2].id,
        playerName: room.players[2].name,
        category: { ...catBlindaje },
        isBin: false
      });
      const catBoro = CONVEYOR_CATEGORIES_POOL.find(c => c.id === 'BORO')!;
      stations.push({
        id: 'PLAYER_3',
        title: `PUESTO 4: ${room.players[3].name}`,
        playerId: room.players[3].id,
        playerName: room.players[3].name,
        category: { ...catBoro },
        isBin: false
      });
      const catGases = CONVEYOR_CATEGORIES_POOL.find(c => c.id === 'GASES')!;
      stations.push({
        id: 'RIGHT_BIN',
        title: 'CONTENEDOR DCH // VAPOR Y GASES',
        category: { ...catGases },
        isBin: true
      });
    }

    const playerQueues: Record<string, ConveyorItem[]> = {};
    for (const player of room.players) {
      playerQueues[player.id] = [
        this.generateRandomConveyorItem(stations),
        this.generateRandomConveyorItem(stations),
        this.generateRandomConveyorItem(stations)
      ];
    }

    room.round4 = {
      startTime: Date.now(),
      durationSeconds: 30,
      timeLeftSeconds: 30,
      totalClassified: 0,
      totalMistakes: 0,
      playerQueues,
      stations
    };

    // 1-second countdown ticker
    const countdownInterval = setInterval(() => {
      const current = this.rooms.get(room.code);
      if (!current || current.phase !== 'ROUND_4' || !current.round4) {
        clearInterval(countdownInterval);
        return;
      }

      current.round4.timeLeftSeconds--;
      if (current.round4.timeLeftSeconds <= 0) {
        clearInterval(countdownInterval);
        this.finishRound4(current);
      } else {
        this.emit(current, 'conveyorTick', { timeLeft: current.round4.timeLeftSeconds });
      }
    }, 1000);
    this.botTimeouts.set(`${room.code}_r4_countdown`, countdownInterval as any);

    // Spawning interval: every 3 seconds, push 1 new item to EVERY player in the room
    const spawnInterval = setInterval(() => {
      const current = this.rooms.get(room.code);
      if (!current || current.phase !== 'ROUND_4' || !current.round4) {
        clearInterval(spawnInterval);
        return;
      }

      for (const p of current.players) {
        const q = current.round4.playerQueues[p.id];
        if (q) {
          q.push(this.generateRandomConveyorItem(current.round4.stations));
        }
      }
      this.emit(current, 'stateUpdate', current);
    }, 3000);
    this.botTimeouts.set(`${room.code}_r4_spawner`, spawnInterval as any);

    // Bot automation interval: every 1.4 seconds, bots inspect their front item and act
    const botInterval = setInterval(() => {
      const current = this.rooms.get(room.code);
      if (!current || current.phase !== 'ROUND_4' || !current.round4) {
        clearInterval(botInterval);
        return;
      }

      for (let i = 0; i < current.players.length; i++) {
        const p = current.players[i];
        if (p.isBot) {
          const q = current.round4.playerQueues[p.id];
          if (q && q.length > 0) {
            const item = q[0];
            const myStationId = `PLAYER_${i}`;
            let chosenAction: 'PASS_LEFT' | 'PASS_RIGHT' | 'CLAIM' = 'CLAIM';

            if (item.targetDestinationId === myStationId) {
              chosenAction = 'CLAIM';
            } else if (item.targetDestinationId === 'LEFT_BIN') {
              chosenAction = 'PASS_LEFT';
            } else if (item.targetDestinationId === 'RIGHT_BIN') {
              chosenAction = 'PASS_RIGHT';
            } else if (item.targetDestinationId.startsWith('PLAYER_')) {
              const targetIdx = parseInt(item.targetDestinationId.split('_')[1], 10);
              if (targetIdx < i) {
                chosenAction = 'PASS_LEFT';
              } else if (targetIdx > i) {
                chosenAction = 'PASS_RIGHT';
              } else {
                chosenAction = 'CLAIM';
              }
            }

            if (Math.random() < 0.12) {
              const acts: ('PASS_LEFT' | 'PASS_RIGHT' | 'CLAIM')[] = ['PASS_LEFT', 'PASS_RIGHT', 'CLAIM'];
              const wrongActs = acts.filter(a => a !== chosenAction);
              chosenAction = wrongActs[Math.floor(Math.random() * wrongActs.length)];
            }

            this.handleConveyorAction(current.code, p.id, chosenAction);
          }
        }
      }
    }, 1400);
    this.botTimeouts.set(`${room.code}_r4_bots`, botInterval as any);
  }

  public handleConveyorAction(roomCode: string, playerId: string, action: 'PASS_LEFT' | 'PASS_RIGHT' | 'CLAIM'): boolean {
    const room = this.rooms.get(roomCode);
    if (!room || room.phase !== 'ROUND_4' || !room.round4) return false;

    const r4 = room.round4;
    const player = room.players.find(p => p.id === playerId);
    if (!player) return false;

    const playerIndex = room.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return false;

    const queue = r4.playerQueues[playerId];
    if (!queue || queue.length === 0) return false;

    const item = queue.shift()!;
    const myStationId = `PLAYER_${playerIndex}` as ConveyorDestinationId;

    if (action === 'CLAIM') {
      if (item.targetDestinationId === myStationId) {
        r4.totalClassified++;
        player.stats.actionsCompleted++;
        room.currentStability = Math.min(1000, room.currentStability + 40);
        this.emit(room, 'conveyorSuccess', {
          playerId,
          playerName: player.name,
          itemName: item.name,
          action: 'CLAIM'
        });
      } else {
        r4.totalMistakes++;
        player.stats.mistakes++;
        room.currentStability = Math.max(50, room.currentStability - 30);
        this.emit(room, 'conveyorError', {
          playerId,
          playerName: player.name,
          itemName: item.name,
          message: `¡${player.name} almacenó ${item.name} por error!`
        });
      }
    } else if (action === 'PASS_LEFT') {
      if (playerIndex === 0) {
        // Exits to LEFT_BIN
        if (item.targetDestinationId === 'LEFT_BIN') {
          r4.totalClassified++;
          player.stats.actionsCompleted++;
          room.currentStability = Math.min(1000, room.currentStability + 40);
          this.emit(room, 'conveyorSuccess', {
            playerId,
            playerName: player.name,
            itemName: item.name,
            action: 'LEFT_BIN'
          });
        } else {
          r4.totalMistakes++;
          player.stats.mistakes++;
          room.currentStability = Math.max(50, room.currentStability - 30);
          this.emit(room, 'conveyorError', {
            playerId,
            playerName: player.name,
            itemName: item.name,
            message: `¡${item.name} arrojado al Contenedor Izquierdo por error!`
          });
        }
      } else {
        const leftPlayer = room.players[playerIndex - 1];
        if (!r4.playerQueues[leftPlayer.id]) r4.playerQueues[leftPlayer.id] = [];
        r4.playerQueues[leftPlayer.id].push(item);
        this.emit(room, 'conveyorTransfer', {
          fromPlayerId: playerId,
          toPlayerId: leftPlayer.id,
          itemName: item.name,
          direction: 'LEFT'
        });
      }
    } else if (action === 'PASS_RIGHT') {
      if (playerIndex === room.players.length - 1) {
        // Exits to RIGHT_BIN
        if (item.targetDestinationId === 'RIGHT_BIN') {
          r4.totalClassified++;
          player.stats.actionsCompleted++;
          room.currentStability = Math.min(1000, room.currentStability + 40);
          this.emit(room, 'conveyorSuccess', {
            playerId,
            playerName: player.name,
            itemName: item.name,
            action: 'RIGHT_BIN'
          });
        } else {
          r4.totalMistakes++;
          player.stats.mistakes++;
          room.currentStability = Math.max(50, room.currentStability - 30);
          this.emit(room, 'conveyorError', {
            playerId,
            playerName: player.name,
            itemName: item.name,
            message: `¡${item.name} arrojado al Contenedor Derecho por error!`
          });
        }
      } else {
        const rightPlayer = room.players[playerIndex + 1];
        if (!r4.playerQueues[rightPlayer.id]) r4.playerQueues[rightPlayer.id] = [];
        r4.playerQueues[rightPlayer.id].push(item);
        this.emit(room, 'conveyorTransfer', {
          fromPlayerId: playerId,
          toPlayerId: rightPlayer.id,
          itemName: item.name,
          direction: 'RIGHT'
        });
      }
    }

    this.emit(room, 'stateUpdate', room);
    return true;
  }

  private finishRound4(room: RoomState) {
    this.clearBotTimeouts(room.code);
    if (!room.round4) return;

    const r4 = room.round4;
    const rawScore = 300 + (r4.totalClassified * 40) - (r4.totalMistakes * 25);
    room.round4Scores = Math.max(100, Math.min(1000, rawScore));

    this.emit(room, 'roundCompleted', { round: 4, score: room.round4Scores });
    this.finishSingleOrNext(room, () => this.initRound5(room));
    this.emit(room, 'stateUpdate', room);
  }

  // --- ROUND 5: SONDA LIQUIDADORA // LABERINTO A CIEGAS (2 A 4 JUGADORES) ---

  private getNextOptimalMazeMove(r5: Round5State): { dir: MazeDirection; nextPos: MazeCoord } | null {
    const target = r5.hasKey ? r5.goalPos : r5.keyPos;
    const isBlocked = (r: number, c: number) => {
      if (r < 0 || r >= r5.gridSize || c < 0 || c >= r5.gridSize) return true;
      if (r5.walls.some(w => w.row === r && w.col === c)) return true;
      if (r5.traps.some(t => t.row === r && t.col === c)) return true;
      return false;
    };

    const queue: { pos: MazeCoord; firstMove?: { dir: MazeDirection; nextPos: MazeCoord } }[] = [
      { pos: r5.probePos }
    ];
    const visited = new Set<string>([`${r5.probePos.row},${r5.probePos.col}`]);

    const dirs: { dir: MazeDirection; dr: number; dc: number }[] = [
      { dir: 'UP', dr: -1, dc: 0 },
      { dir: 'DOWN', dr: 1, dc: 0 },
      { dir: 'LEFT', dr: 0, dc: -1 },
      { dir: 'RIGHT', dr: 0, dc: 1 }
    ];

    while (queue.length > 0) {
      const curr = queue.shift()!;
      if (curr.pos.row === target.row && curr.pos.col === target.col) {
        return curr.firstMove || null;
      }

      for (const d of dirs) {
        const nr = curr.pos.row + d.dr;
        const nc = curr.pos.col + d.dc;
        const key = `${nr},${nc}`;
        if (!visited.has(key) && !isBlocked(nr, nc)) {
          visited.add(key);
          queue.push({
            pos: { row: nr, col: nc },
            firstMove: curr.firstMove || { dir: d.dir, nextPos: { row: nr, col: nc } }
          });
        }
      }
    }
    return null;
  }

  private initRound5(room: RoomState) {
    this.clearBotTimeouts(room.code);
    room.phase = 'ROUND_5';
    room.currentStability = 1000;
    room.roundStartTime = Date.now();
    room.botRadioMessage = undefined;

    const bp = MAZE_BLUEPRINTS[Math.floor(Math.random() * MAZE_BLUEPRINTS.length)];
    const shuffledPlayers = [...room.players].sort(() => Math.random() - 0.5);
    const count = shuffledPlayers.length;

    const playerRoles: Record<string, MazeRole> = {};
    if (count === 2) {
      playerRoles[shuffledPlayers[0].id] = 'CARTOGRAFO_TOTAL';
      playerRoles[shuffledPlayers[1].id] = 'PILOTO_TOTAL';
    } else if (count === 3) {
      playerRoles[shuffledPlayers[0].id] = 'CARTOGRAFO_MUROS';
      playerRoles[shuffledPlayers[1].id] = 'ESCANER_RADIACION';
      playerRoles[shuffledPlayers[2].id] = 'PILOTO_TOTAL';
    } else {
      playerRoles[shuffledPlayers[0].id] = 'CARTOGRAFO_MUROS';
      playerRoles[shuffledPlayers[1].id] = 'ESCANER_RADIACION';
      playerRoles[shuffledPlayers[2].id] = 'PILOTO_VERTICAL';
      playerRoles[shuffledPlayers[3].id] = 'PILOTO_HORIZONTAL';
    }

    room.round5 = {
      startTime: Date.now(),
      gridSize: bp.gridSize,
      probePos: { ...bp.startPos },
      startPos: { ...bp.startPos },
      keyPos: { ...bp.keyPos },
      goalPos: { ...bp.goalPos },
      hasKey: false,
      walls: bp.walls.map(w => ({ ...w })),
      traps: bp.traps.map(t => ({ ...t })),
      visitedCells: [{ ...bp.startPos }],
      playerRoles,
      lastEventMessage: `Sonda desplegada en F${bp.startPos.row + 1}-C${bp.startPos.col + 1}. Paso 1: Recoger Barra de Cadmio (Llave).`,
      lastEventStatus: 'INFO'
    };

    // Bot automation interval for Round 5
    const botInterval = setInterval(() => {
      const current = this.rooms.get(room.code);
      if (!current || current.phase !== 'ROUND_5' || !current.round5) {
        clearInterval(botInterval);
        return;
      }

      const r5 = current.round5;
      const optimal = this.getNextOptimalMazeMove(r5);
      if (!optimal) return;

      const dirNames: Record<MazeDirection, string> = {
        UP: 'ARRIBA (NORTE)',
        DOWN: 'ABAJO (SUR)',
        LEFT: 'IZQUIERDA (OESTE)',
        RIGHT: 'DERECHA (ESTE)'
      };

      // If any bot is a Cartographer/Scanner, broadcast radio hint
      const radarBot = current.players.find(p => {
        if (!p.isBot) return false;
        const role = r5.playerRoles[p.id];
        return role === 'CARTOGRAFO_TOTAL' || role === 'CARTOGRAFO_MUROS' || role === 'ESCANER_RADIACION';
      });

      if (radarBot) {
        current.botRadioMessage = `[${radarBot.name}]: "¡Vía segura hacia ${dirNames[optimal.dir]} (F${optimal.nextPos.row + 1}-C${optimal.nextPos.col + 1})!"`;
        this.emit(current, 'stateUpdate', current);
      }

      // If the pilot responsible for optimal.dir is a bot, execute move
      const isVertical = optimal.dir === 'UP' || optimal.dir === 'DOWN';
      const pilotBot = current.players.find(p => {
        if (!p.isBot) return false;
        const role = r5.playerRoles[p.id];
        if (role === 'PILOTO_TOTAL') return true;
        if (role === 'PILOTO_VERTICAL' && isVertical) return true;
        if (role === 'PILOTO_HORIZONTAL' && !isVertical) return true;
        return false;
      });

      if (pilotBot) {
        this.handleMazeMove(current.code, pilotBot.id, optimal.dir);
      }
    }, 950);
    this.botTimeouts.set(`${room.code}_r5_bots`, botInterval as any);
  }

  public handleMazeMove(roomCode: string, playerId: string, direction: MazeDirection): boolean {
    const room = this.rooms.get(roomCode);
    if (!room || room.phase !== 'ROUND_5' || !room.round5) return false;

    const r5 = room.round5;
    const player = room.players.find(p => p.id === playerId);
    if (!player) return false;

    const role = r5.playerRoles[playerId];
    if (!role) return false;

    // Verify permission based on role
    if (role === 'PILOTO_VERTICAL' && direction !== 'UP' && direction !== 'DOWN') return false;
    if (role === 'PILOTO_HORIZONTAL' && direction !== 'LEFT' && direction !== 'RIGHT') return false;
    if (role !== 'PILOTO_TOTAL' && role !== 'PILOTO_VERTICAL' && role !== 'PILOTO_HORIZONTAL') return false;

    const dr = direction === 'UP' ? -1 : direction === 'DOWN' ? 1 : 0;
    const dc = direction === 'LEFT' ? -1 : direction === 'RIGHT' ? 1 : 0;
    const nextRow = r5.probePos.row + dr;
    const nextCol = r5.probePos.col + dc;

    // 1. Out of bounds check
    if (nextRow < 0 || nextRow >= r5.gridSize || nextCol < 0 || nextCol >= r5.gridSize) {
      player.stats.mistakes++;
      room.currentStability = Math.max(50, room.currentStability - 50);
      r5.lastEventMessage = `¡IMPACTO CONTRA EL BLINDAJE EXTERIOR! (-50 PTS)`;
      r5.lastEventStatus = 'ERROR';
      this.emit(room, 'mazeError', { message: r5.lastEventMessage, playerId });
      this.emit(room, 'stateUpdate', room);
      return false;
    }

    // 2. Wall collision check
    const hitWall = r5.walls.some(w => w.row === nextRow && w.col === nextCol);
    if (hitWall) {
      player.stats.mistakes++;
      room.currentStability = Math.max(50, room.currentStability - 50);
      r5.lastEventMessage = `🧱 ¡COLISIÓN CONTRA MURO EN F${nextRow + 1}-C${nextCol + 1}! La sonda rebota (-50 PTS)`;
      r5.lastEventStatus = 'ERROR';
      this.emit(room, 'mazeError', { message: r5.lastEventMessage, playerId });
      this.emit(room, 'stateUpdate', room);
      return false;
    }

    // 3. Radiation trap check
    const hitTrap = r5.traps.some(t => t.row === nextRow && t.col === nextCol);
    if (hitTrap) {
      player.stats.mistakes++;
      room.currentStability = Math.max(50, room.currentStability - 100);
      const respawnPos = r5.hasKey ? { ...r5.keyPos } : { ...r5.startPos };
      r5.probePos = respawnPos;
      r5.lastEventMessage = `☢️ ¡FUGA RADIACTIVA EN F${nextRow + 1}-C${nextCol + 1}! Sonda reiniciada a F${respawnPos.row + 1}-C${respawnPos.col + 1} (-100 PTS)`;
      r5.lastEventStatus = 'ERROR';
      this.emit(room, 'mazeError', { message: r5.lastEventMessage, playerId });
      this.emit(room, 'stateUpdate', room);
      return false;
    }

    // 4. Valid move!
    r5.probePos = { row: nextRow, col: nextCol };
    if (!r5.visitedCells.some(v => v.row === nextRow && v.col === nextCol)) {
      r5.visitedCells.push({ row: nextRow, col: nextCol });
    }

    player.stats.actionsCompleted++;
    player.stats.reactionTimes.push(Math.min(3500, Date.now() - r5.startTime));

    // Check if stepped on Key
    if (!r5.hasKey && nextRow === r5.keyPos.row && nextCol === r5.keyPos.col) {
      r5.hasKey = true;
      room.currentStability = Math.min(1000, room.currentStability + 60);
      r5.lastEventMessage = `🔓 ¡BARRA DE CADMIO RECOGIDA EN F${nextRow + 1}-C${nextCol + 1}! Compuerta del Núcleo abierta.`;
      r5.lastEventStatus = 'SUCCESS';
      this.emit(room, 'mazeKeyCollected', { playerId, pos: r5.probePos });
      this.emit(room, 'stateUpdate', room);
      return true;
    }

    // Check if stepped on Goal
    if (nextRow === r5.goalPos.row && nextCol === r5.goalPos.col) {
      if (!r5.hasKey) {
        r5.lastEventMessage = `🔒 ¡COMPUERTA CERRADA EN F${nextRow + 1}-C${nextCol + 1}! Recoge primero la Barra de Cadmio (Llave).`;
        r5.lastEventStatus = 'ERROR';
        this.emit(room, 'stateUpdate', room);
        return true;
      }

      // Goal reached with Key! Complete Round 5 & Game!
      this.clearBotTimeouts(room.code);
      const elapsedSeconds = (Date.now() - r5.startTime) / 1000;
      room.round5Scores = Math.max(100, Math.min(1000, room.currentStability - Math.floor(elapsedSeconds * 15)));
      room.totalScore = room.round1Scores + room.round2Scores + room.round3Scores + room.round4Scores + room.round5Scores;

      // Credit radar operators for their guidance
      for (const p of room.players) {
        const pRole = r5.playerRoles[p.id];
        if (pRole === 'CARTOGRAFO_TOTAL' || pRole === 'CARTOGRAFO_MUROS' || pRole === 'ESCANER_RADIACION') {
          p.stats.actionsCompleted += 2;
        }
      }

      this.emit(room, 'roundCompleted', { round: 5, score: room.round5Scores });
      this.generateSummary(room);
      this.emit(room, 'gameCompleted', room.summary);
      this.emit(room, 'stateUpdate', room);
      return true;
    }

    r5.lastEventMessage = `Sonda en posición F${nextRow + 1}-C${nextCol + 1}.`;
    r5.lastEventStatus = 'INFO';
    this.emit(room, 'stateUpdate', room);
    return true;
  }

  // --- SUMMARY & SARCASTIC VIRAL AWARDS ---

  private generateSummary(room: RoomState) {
    this.clearBotTimeouts(room.code);
    room.phase = 'SUMMARY';

    const total = room.totalScore;
    const isSingle = !!room.singleRoundMode;
    const tHero = isSingle ? 750 : 3750;
    const tOk = isSingle ? 550 : 2750;
    const tMed = isSingle ? 350 : 1750;
    let rankTitle = '';
    let rankSubtitle = '';
    let rankBadge = '🎖️';

    if (total >= tHero) {
      rankBadge = '🎖️';
      rankTitle = 'HÉROES DE LA UNIÓN SOVIÉTICA';
      rankSubtitle = '¡El reactor no estalló! Lenin en persona os concedería la Orden de la Bandera Roja. Recibiréis ración doble de té.';
    } else if (total >= tOk) {
      rankBadge = '⚠️';
      rankTitle = 'OPERARIOS ACEPTABLES (3.6 ROENTGEN)';
      rankSubtitle = 'Ni genial, ni terrible. El núcleo tiene una pequeña fisura humeante, pero el informe oficial dirá que fue un éxito.';
    } else if (total >= tMed) {
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
    room.round4Scores = 0;
    room.round5Scores = 0;
    room.totalScore = 0;
    room.round1 = undefined;
    room.round2 = undefined;
    room.round3 = undefined;
    room.round4 = undefined;
    room.round5 = undefined;
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
