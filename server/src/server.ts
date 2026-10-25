import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { GameManager } from './gameManager';
import { ActionType, MazeDirection, GameMode, RoomState } from './types';

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const gameManager = new GameManager();

const broadcastRoomState = (room: RoomState, eventName: string = 'stateUpdate') => {
  const parentCode = room.code.includes('__') ? room.code.split('__')[0] : room.code;
  const mainRoom = gameManager.getRoom(parentCode);
  if (!mainRoom) return;

  for (const player of mainRoom.players) {
    if (!player.isBot) {
      const view = gameManager.getPlayerRoomView(parentCode, player.id) || mainRoom;
      io.to(player.id).emit(eventName, view);
    }
  }
};

// Hook up centralized broadcaster so bot actions & server logic emit to all room sockets
gameManager.setBroadcaster((targetRoom, event, data) => {
  if (event === 'stateUpdate') {
    broadcastRoomState(targetRoom, 'stateUpdate');
    return;
  }

  // If emitted from a competitive team subRoom, only emit feedback events to that team's players
  if (targetRoom.code.includes('__')) {
    for (const p of targetRoom.players) {
      if (!p.isBot) {
        io.to(p.id).emit(event, data);
      }
    }
    return;
  }

  io.to(targetRoom.code).emit(event, data);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'active', message: 'Central Caótica Nuclear Core Online' });
});

io.on('connection', (socket: Socket) => {
  console.log(`[CONEXIÓN] Operario conectado: ${socket.id}`);

  // 1. Create Room
  socket.on('createRoom', ({ hostName }: { hostName: string }) => {
    const room = gameManager.createRoom(hostName, socket.id);
    socket.join(room.code);
    const view = gameManager.getPlayerRoomView(room.code, socket.id) || room;
    socket.emit('roomCreated', view);
    console.log(`[SALA CREADA] Código: ${room.code} por ${hostName}`);
  });

  // 2. Join Room
  socket.on('joinRoom', ({ code, playerName }: { code: string; playerName: string }) => {
    const result = gameManager.joinRoom(code, playerName, socket.id);
    if (result.error || !result.room) {
      socket.emit('joinError', { message: result.error });
      return;
    }

    const room = result.room;
    socket.join(room.code);
    const view = gameManager.getPlayerRoomView(room.code, socket.id) || room;
    socket.emit('roomJoined', view);
    broadcastRoomState(room, 'stateUpdate');
    console.log(`[OPERARIO UNIDO] ${playerName} a sala ${room.code}`);
  });

  // 3. Add simulated bot
  socket.on('addBot', ({ roomCode }: { roomCode: string }) => {
    const room = gameManager.addBot(roomCode);
    if (room) {
      broadcastRoomState(room, 'stateUpdate');
    }
  });

  // 4. Remove simulated bot
  socket.on('removeBot', ({ roomCode, botId }: { roomCode: string; botId: string }) => {
    const room = gameManager.removeBot(roomCode, botId);
    if (room) {
      broadcastRoomState(room, 'stateUpdate');
    }
  });

  // 4b. Set Game Mode (COOP vs COMPETITIVE)
  socket.on('setGameMode', ({ roomCode, mode }: { roomCode: string; mode: GameMode }) => {
    const room = gameManager.setGameMode(roomCode, mode);
    if (room) {
      broadcastRoomState(room, 'stateUpdate');
    }
  });

  // 4c. Join Specific Team in Competitive Lobby
  socket.on('joinTeam', ({ roomCode, teamId }: { roomCode: string; teamId: string }) => {
    const room = gameManager.joinTeam(roomCode, socket.id, teamId);
    if (room) {
      broadcastRoomState(room, 'stateUpdate');
    }
  });

  // 4d. Auto-balance teams
  socket.on('autoBalanceTeams', ({ roomCode }: { roomCode: string }) => {
    const room = gameManager.autoBalanceTeams(roomCode);
    if (room) {
      broadcastRoomState(room, 'stateUpdate');
    }
  });

  // 5. Start Game (Enters ROUND_INTRO for Round 1)
  socket.on('startGame', ({ roomCode }: { roomCode: string }) => {
    const room = gameManager.startGame(roomCode);
    if (room) {
      broadcastRoomState(room, 'gameStarted');
      broadcastRoomState(room, 'stateUpdate');
    }
  });

  // 5b. Start Specific Round (Enters ROUND_INTRO for that Round)
  socket.on('startSpecificRound', ({ roomCode, roundNumber, singleRound }: { roomCode: string; roundNumber: 1 | 2 | 3 | 4 | 5; singleRound?: boolean }) => {
    const room = gameManager.startSpecificRound(roomCode, roundNumber, singleRound ?? true);
    if (room) {
      broadcastRoomState(room, 'gameStarted');
      broadcastRoomState(room, 'stateUpdate');
    }
  });

  // 5c. Confirm Round Start from ROUND_INTRO screen (Creator of room)
  socket.on('confirmRoundStart', ({ roomCode }: { roomCode: string }) => {
    const room = gameManager.confirmRoundStart(roomCode);
    if (room) {
      broadcastRoomState(room, 'stateUpdate');
    }
  });

  // 6. Round 1 Action
  socket.on('round1Action', ({ roomCode, action }: { roomCode: string; action: ActionType }) => {
    const targetCode = gameManager.resolveTargetRoomCode(roomCode, socket.id);
    gameManager.completeRound1Action(targetCode, socket.id, action);
  });

  // 7. Round 2: Toggle Switch AZ-5
  socket.on('toggleSwitch', ({ roomCode, switchName }: { roomCode: string; switchName: 'alfa' | 'beta' | 'gamma' | 'delta' }) => {
    const targetCode = gameManager.resolveTargetRoomCode(roomCode, socket.id);
    const room = gameManager.toggleSwitchAZ5(targetCode, socket.id, switchName);
    if (room) {
      broadcastRoomState(room, 'stateUpdate');
    }
  });

  // 8. Round 2: Stabilize AZ-5
  socket.on('stabilizeAZ5', ({ roomCode }: { roomCode: string }) => {
    const targetCode = gameManager.resolveTargetRoomCode(roomCode, socket.id);
    gameManager.stabilizeAZ5(targetCode, socket.id);
  });

  // 9. Round 3: Submit Trivia
  socket.on('submitTrivia', ({ roomCode, optionId }: { roomCode: string; optionId: string }) => {
    const targetCode = gameManager.resolveTargetRoomCode(roomCode, socket.id);
    gameManager.submitTriviaAnswer(targetCode, socket.id, optionId);
  });

  // 10. Round 4: Conveyor Belt Action
  socket.on('conveyorAction', ({ roomCode, action }: { roomCode: string; action: 'PASS_LEFT' | 'PASS_RIGHT' | 'CLAIM' }) => {
    const targetCode = gameManager.resolveTargetRoomCode(roomCode, socket.id);
    gameManager.handleConveyorAction(targetCode, socket.id, action);
  });

  // 11. Round 5: Blind Maze Move
  socket.on('mazeMove', ({ roomCode, direction }: { roomCode: string; direction: MazeDirection }) => {
    const targetCode = gameManager.resolveTargetRoomCode(roomCode, socket.id);
    gameManager.handleMazeMove(targetCode, socket.id, direction);
  });

  // 12. Restart Game
  socket.on('restartGame', ({ roomCode }: { roomCode: string }) => {
    const room = gameManager.restartGame(roomCode);
    if (room) {
      broadcastRoomState(room, 'gameRestarted');
      broadcastRoomState(room, 'stateUpdate');
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`[DESCONEXIÓN] Operario: ${socket.id}`);
    const result = gameManager.removePlayer(socket.id);
    if (result.room) {
      broadcastRoomState(result.room, 'stateUpdate');
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`☢️ CENTRAL CAÓTICA // SERVIDOR DE NÚCLEO RBMK`);
  console.log(`📻 Socket.IO escuchando en el puerto ${PORT}`);
  console.log(`===============================================`);
});
