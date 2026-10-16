import React, { useState, useEffect } from 'react';
import { socket } from './socket';
import { RoomState, ActionType, MazeDirection } from './types';
import { sound } from './soundEngine';
import { Header } from './components/Header';
import { JoinCreateScreen } from './components/JoinCreateScreen';
import { LobbyScreen } from './components/LobbyScreen';
import { Round1ChainReaction } from './components/Round1ChainReaction';
import { Round2AZ5Panel } from './components/Round2AZ5Panel';
import { Round3MinistryCall } from './components/Round3MinistryCall';
import { Round4ConveyorBelt } from './components/Round4ConveyorBelt';
import { Round5BlindMaze } from './components/Round5BlindMaze';
import { FinalReportScreen } from './components/FinalReportScreen';

export const App: React.FC = () => {
  const [playerName, setPlayerName] = useState<string>('Operario Dyatlov');
  const [room, setRoom] = useState<RoomState | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [socketId, setSocketId] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(socket.connected);

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 450);
  };

  useEffect(() => {
    setSocketId(socket.id || '');
    setIsConnected(socket.connected);

    socket.on('connect', () => {
      setSocketId(socket.id || '');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('roomCreated', (newRoom: RoomState) => {
      setRoom(newRoom);
      setErrorMessage('');
      sound.playSuccess();
    });

    socket.on('roomJoined', (joinedRoom: RoomState) => {
      setRoom(joinedRoom);
      setErrorMessage('');
      sound.playSuccess();
    });

    socket.on('joinError', ({ message }: { message: string }) => {
      setErrorMessage(message);
      sound.playBuzzer();
      triggerShake();
    });

    socket.on('stateUpdate', (updatedRoom: RoomState) => {
      setRoom(updatedRoom);
    });

    socket.on('actionError', () => {
      sound.playBuzzer();
      triggerShake();
    });

    socket.on('stepSuccess', () => {
      sound.playSuccess();
    });

    socket.on('az5Error', () => {
      sound.playBuzzer();
      triggerShake();
    });

    socket.on('az5Success', () => {
      sound.playSuccess();
    });

    socket.on('triviaError', () => {
      sound.playBuzzer();
      triggerShake();
    });

    socket.on('triviaSuccess', () => {
      sound.playSuccess();
    });

    socket.on('mazeError', () => {
      sound.playBuzzer();
      triggerShake();
    });

    socket.on('mazeKeyCollected', () => {
      sound.playSuccess();
    });

    return () => {
      socket.off('connect');
      socket.off('roomCreated');
      socket.off('roomJoined');
      socket.off('joinError');
      socket.off('stateUpdate');
      socket.off('actionError');
      socket.off('stepSuccess');
      socket.off('az5Error');
      socket.off('az5Success');
      socket.off('triviaError');
      socket.off('triviaSuccess');
      socket.off('mazeError');
      socket.off('mazeKeyCollected');
    };
  }, []);

  // Handlers
  const handleCreateRoom = (hasMic: boolean) => {
    socket.emit('createRoom', { hostName: playerName, hasMic });
  };

  const handleJoinRoom = (code: string, hasMic: boolean) => {
    socket.emit('joinRoom', { code, playerName, hasMic });
  };

  const handleAddBot = () => {
    if (room) {
      socket.emit('addBot', { roomCode: room.code });
    }
  };

  const handleRemoveBot = (botId: string) => {
    if (room) {
      socket.emit('removeBot', { roomCode: room.code, botId });
    }
  };

  const handleStartGame = () => {
    if (room) {
      socket.emit('startGame', { roomCode: room.code });
    }
  };

  const handleRound1Action = (action: ActionType) => {
    if (room) {
      socket.emit('round1Action', { roomCode: room.code, action });
    }
  };

  const handleToggleSwitch = (switchName: 'alfa' | 'beta' | 'gamma' | 'delta') => {
    if (room) {
      socket.emit('toggleSwitch', { roomCode: room.code, switchName });
    }
  };

  const handleStabilizeAZ5 = () => {
    if (room) {
      socket.emit('stabilizeAZ5', { roomCode: room.code });
    }
  };

  const handleSubmitTrivia = (optionId: string) => {
    if (room) {
      socket.emit('submitTrivia', { roomCode: room.code, optionId });
    }
  };

  const handleConveyorAction = (action: 'PASS_LEFT' | 'PASS_RIGHT' | 'CLAIM') => {
    if (room) {
      socket.emit('conveyorAction', { roomCode: room.code, action });
    }
  };

  const handleMazeMove = (direction: MazeDirection) => {
    if (room) {
      socket.emit('mazeMove', { roomCode: room.code, direction });
    }
  };

  const handleRestartGame = () => {
    if (room) {
      socket.emit('restartGame', { roomCode: room.code });
    }
  };

  return (
    <div className={`h-full w-full flex flex-col bg-[#121316] relative overflow-hidden ${isShaking ? 'animate-shake' : ''}`}>
      {/* CRT Scanline overlay effect */}
      <div className="absolute inset-0 crt-scanlines z-20 pointer-events-none" />

      {/* Main Header */}
      <Header room={room} playerName={playerName} />

      {/* Body screens */}
      <main className="flex-1 min-h-0 flex flex-col overflow-hidden relative z-10">
        {!room && (
          <JoinCreateScreen
            playerName={playerName}
            setPlayerName={setPlayerName}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            errorMessage={errorMessage}
            isConnected={isConnected}
          />
        )}

        {room && room.phase === 'LOBBY' && (
          <LobbyScreen
            room={room}
            currentSocketId={socketId}
            onAddBot={handleAddBot}
            onRemoveBot={handleRemoveBot}
            onStartGame={handleStartGame}
          />
        )}

        {room && room.phase === 'ROUND_1' && (
          <Round1ChainReaction
            room={room}
            currentSocketId={socketId}
            onExecuteAction={handleRound1Action}
          />
        )}

        {room && room.phase === 'ROUND_2' && (
          <Round2AZ5Panel
            room={room}
            currentSocketId={socketId}
            onToggleSwitch={handleToggleSwitch}
            onStabilizeAZ5={handleStabilizeAZ5}
          />
        )}

        {room && room.phase === 'ROUND_3' && (
          <Round3MinistryCall
            room={room}
            currentSocketId={socketId}
            onSubmitAnswer={handleSubmitTrivia}
          />
        )}

        {room && room.phase === 'ROUND_4' && (
          <Round4ConveyorBelt
            room={room}
            currentSocketId={socketId}
            onConveyorAction={handleConveyorAction}
          />
        )}

        {room && room.phase === 'ROUND_5' && (
          <Round5BlindMaze
            room={room}
            currentSocketId={socketId}
            onMazeMove={handleMazeMove}
          />
        )}

        {room && room.phase === 'SUMMARY' && (
          <FinalReportScreen
            room={room}
            currentSocketId={socketId}
            onRestartGame={handleRestartGame}
          />
        )}
      </main>
    </div>
  );
};

