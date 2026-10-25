import React, { useState, useEffect } from 'react';
import { socket } from './socket';
import { RoomState, ActionType, MazeDirection, GameMode } from './types';
import { sound } from './soundEngine';
import { Header } from './components/Header';
import { JoinCreateScreen } from './components/JoinCreateScreen';
import { LobbyScreen } from './components/LobbyScreen';
import { RoundIntroScreen } from './components/RoundIntroScreen';
import { TeamWaitingOverlay } from './components/TeamWaitingOverlay';
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
  const handleCreateRoom = () => {
    socket.emit('createRoom', { hostName: playerName });
  };

  const handleJoinRoom = (code: string) => {
    socket.emit('joinRoom', { code, playerName });
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

  const handleSetGameMode = (mode: GameMode) => {
    if (room) {
      socket.emit('setGameMode', { roomCode: room.code, mode });
    }
  };

  const handleJoinTeam = (teamId: string) => {
    if (room) {
      socket.emit('joinTeam', { roomCode: room.code, teamId });
    }
  };

  const handleAutoBalanceTeams = () => {
    if (room) {
      socket.emit('autoBalanceTeams', { roomCode: room.code });
    }
  };

  const handleStartGame = () => {
    if (room) {
      socket.emit('startGame', { roomCode: room.code });
    }
  };

  const handleStartSpecificRound = (roundNumber: 1 | 2 | 3 | 4 | 5) => {
    if (room) {
      socket.emit('startSpecificRound', { roomCode: room.code, roundNumber, singleRound: true });
    }
  };

  const handleConfirmRoundStart = () => {
    if (room) {
      socket.emit('confirmRoundStart', { roomCode: room.code });
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

  const myTeam =
    room?.gameMode === 'COMPETITIVE'
      ? room.teams?.find(t => t.playerIds.includes(socketId))
      : undefined;

  const isWaitingForOtherTeams =
    !!(
      room &&
      room.gameMode === 'COMPETITIVE' &&
      myTeam?.currentRoundCompleted &&
      (room.phase === 'ROUND_1' ||
        room.phase === 'ROUND_2' ||
        room.phase === 'ROUND_3' ||
        room.phase === 'ROUND_4' ||
        room.phase === 'ROUND_5')
    );

  return (
    <div className={`h-full w-full flex flex-col bg-[#121316] relative overflow-hidden ${isShaking ? 'animate-shake' : ''}`}>
      {/* Subtle CRT Scanline overlay effect */}
      <div className="absolute inset-0 crt-scanlines z-20 pointer-events-none" />

      {/* Main Header */}
      <Header
        room={room}
        playerName={playerName}
        currentSocketId={socketId}
        onStartSpecificRound={handleStartSpecificRound}
        onReturnToLobby={handleRestartGame}
      />

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
            onSetGameMode={handleSetGameMode}
            onJoinTeam={handleJoinTeam}
            onAutoBalanceTeams={handleAutoBalanceTeams}
            onStartGame={handleStartGame}
            onStartSpecificRound={handleStartSpecificRound}
          />
        )}

        {room && room.phase === 'ROUND_INTRO' && (
          <RoundIntroScreen
            room={room}
            currentSocketId={socketId}
            onConfirmStart={handleConfirmRoundStart}
          />
        )}

        {room && isWaitingForOtherTeams && (
          <TeamWaitingOverlay
            room={room}
            currentSocketId={socketId}
          />
        )}

        {room && !isWaitingForOtherTeams && room.phase === 'ROUND_1' && (
          <Round1ChainReaction
            room={room}
            currentSocketId={socketId}
            onExecuteAction={handleRound1Action}
          />
        )}

        {room && !isWaitingForOtherTeams && room.phase === 'ROUND_2' && (
          <Round2AZ5Panel
            room={room}
            currentSocketId={socketId}
            onToggleSwitch={handleToggleSwitch}
            onStabilizeAZ5={handleStabilizeAZ5}
          />
        )}

        {room && !isWaitingForOtherTeams && room.phase === 'ROUND_3' && (
          <Round3MinistryCall
            room={room}
            currentSocketId={socketId}
            onSubmitAnswer={handleSubmitTrivia}
          />
        )}

        {room && !isWaitingForOtherTeams && room.phase === 'ROUND_4' && (
          <Round4ConveyorBelt
            room={room}
            currentSocketId={socketId}
            onConveyorAction={handleConveyorAction}
          />
        )}

        {room && !isWaitingForOtherTeams && room.phase === 'ROUND_5' && (
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
