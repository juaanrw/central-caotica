import express from 'express';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';
import { GameManager } from './gameManager';
import { ActionType, MazeDirection } from './types';

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

// Hook up centralized broadcaster so bot actions & server logic emit to all room sockets
gameManager.setBroadcaster((targetRoom, event, data) => {
  io.to(targetRoom.code).emit(event, data);
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'active', message: 'Central Caótica Nuclear Core Online' });
});

io.on('connection', (socket: Socket) => {
  console.log(`[CONEXIÓN] Operario conectado: ${socket.id}`);

  // 1. Create Room
  socket.on('createRoom', ({ hostName, hasMic }: { hostName: string; hasMic?: boolean }) => {
    const room = gameManager.createRoom(hostName, socket.id, !!hasMic);
    socket.join(room.code);
    socket.emit('roomCreated', room);
    console.log(`[SALA CREADA] Código: ${room.code} por ${hostName} (Mic: ${!!hasMic})`);
  });

  // 2. Join Room
  socket.on('joinRoom', ({ code, playerName, hasMic }: { code: string; playerName: string; hasMic?: boolean }) => {
    const result = gameManager.joinRoom(code, playerName, socket.id, !!hasMic);
    if (result.error || !result.room) {
      socket.emit('joinError', { message: result.error });
      return;
    }

    const room = result.room;
    socket.join(room.code);
    socket.emit('roomJoined', room);
    io.to(room.code).emit('stateUpdate', room);
    console.log(`[OPERARIO UNIDO] ${playerName} a sala ${room.code} (Mic: ${!!hasMic})`);
  });

  // Update Mic Status
  socket.on('setMicStatus', ({ hasMic }: { hasMic: boolean }) => {
    const room = gameManager.setPlayerMic(socket.id, hasMic);
    if (room) {
      io.to(room.code).emit('stateUpdate', room);
    }
  });

  // 3. Add simulated bot
  socket.on('addBot', ({ roomCode }: { roomCode: string }) => {
    const room = gameManager.addBot(roomCode);
    if (room) {
      io.to(room.code).emit('stateUpdate', room);
    }
  });

  // 4. Remove simulated bot
  socket.on('removeBot', ({ roomCode, botId }: { roomCode: string; botId: string }) => {
    const room = gameManager.removeBot(roomCode, botId);
    if (room) {
      io.to(room.code).emit('stateUpdate', room);
    }
  });

  // 5. Start Game
  socket.on('startGame', ({ roomCode }: { roomCode: string }) => {
    const room = gameManager.startGame(roomCode);
    if (room) {
      io.to(room.code).emit('gameStarted', room);
      io.to(room.code).emit('stateUpdate', room);
    }
  });

  // 5b. Start Specific Round (Testing / Single Minigame Mode)
  socket.on('startSpecificRound', ({ roomCode, roundNumber, singleRound }: { roomCode: string; roundNumber: 1 | 2 | 3 | 4 | 5; singleRound?: boolean }) => {
    const room = gameManager.startSpecificRound(roomCode, roundNumber, singleRound ?? true);
    if (room) {
      io.to(room.code).emit('gameStarted', room);
      io.to(room.code).emit('stateUpdate', room);
    }
  });

  // 6. Round 1 Action
  socket.on('round1Action', ({ roomCode, action }: { roomCode: string; action: ActionType }) => {
    gameManager.completeRound1Action(roomCode, socket.id, action);
  });

  // 7. Round 2: Toggle Switch AZ-5
  socket.on('toggleSwitch', ({ roomCode, switchName }: { roomCode: string; switchName: 'alfa' | 'beta' | 'gamma' | 'delta' }) => {
    const room = gameManager.toggleSwitchAZ5(roomCode, socket.id, switchName);
    if (room) {
      io.to(room.code).emit('stateUpdate', room);
    }
  });

  // 8. Round 2: Stabilize AZ-5
  socket.on('stabilizeAZ5', ({ roomCode }: { roomCode: string }) => {
    gameManager.stabilizeAZ5(roomCode, socket.id);
  });

  // 9. Round 3: Submit Trivia
  socket.on('submitTrivia', ({ roomCode, optionId }: { roomCode: string; optionId: string }) => {
    gameManager.submitTriviaAnswer(roomCode, socket.id, optionId);
  });

  // 10. Round 4: Conveyor Belt Action
  socket.on('conveyorAction', ({ roomCode, action }: { roomCode: string; action: 'PASS_LEFT' | 'PASS_RIGHT' | 'CLAIM' }) => {
    gameManager.handleConveyorAction(roomCode, socket.id, action);
  });

  // 11. Round 5: Blind Maze Move
  socket.on('mazeMove', ({ roomCode, direction }: { roomCode: string; direction: MazeDirection }) => {
    gameManager.handleMazeMove(roomCode, socket.id, direction);
  });

  // 12. Restart Game
  socket.on('restartGame', ({ roomCode }: { roomCode: string }) => {
    const room = gameManager.restartGame(roomCode);
    if (room) {
      io.to(room.code).emit('gameRestarted', room);
      io.to(room.code).emit('stateUpdate', room);
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`[DESCONEXIÓN] Operario: ${socket.id}`);
    const result = gameManager.removePlayer(socket.id);
    if (result.room) {
      io.to(result.room.code).emit('stateUpdate', result.room);
    }
  });
});

const PORT = 3001;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`===============================================`);
  console.log(`☢️ CENTRAL CAÓTICA // SERVIDOR DE NÚCLEO RBMK`);
  console.log(`📻 Socket.IO escuchando en el puerto ${PORT}`);
  console.log(`===============================================`);
});
