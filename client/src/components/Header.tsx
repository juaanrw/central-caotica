import React, { useEffect, useState } from 'react';
import { Radiation, Volume2, VolumeX, ShieldAlert, Timer } from 'lucide-react';
import { RoomState } from '../types';
import { sound } from '../soundEngine';

interface HeaderProps {
  room: RoomState | null;
  playerName: string;
  currentSocketId?: string;
  onStartSpecificRound?: (roundNumber: 1 | 2 | 3 | 4 | 5) => void;
  onReturnToLobby?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  room,
  playerName,
  currentSocketId,
  onStartSpecificRound,
  onReturnToLobby
}) => {
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [elapsed, setElapsed] = useState(0);

  const toggleSound = () => {
    const next = !isMuted;
    sound.setMuted(next);
    setIsMuted(next);
    if (!next) {
      sound.playClick();
    }
  };

  const isActiveRound =
    room &&
    (room.phase === 'ROUND_1' ||
      room.phase === 'ROUND_2' ||
      room.phase === 'ROUND_3' ||
      room.phase === 'ROUND_4' ||
      room.phase === 'ROUND_5');

  const myTeam =
    room?.gameMode === 'COMPETITIVE' && currentSocketId
      ? room.teams?.find(t => t.playerIds.includes(currentSocketId))
      : undefined;

  const isMyTeamWaiting = !!(myTeam && myTeam.currentRoundCompleted);

  // Timer loop for active game rounds
  useEffect(() => {
    if (!room || !isActiveRound || isMyTeamWaiting) {
      setElapsed(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsed(Date.now() - room.roundStartTime);
    }, 100);

    return () => clearInterval(interval);
  }, [room?.phase, room?.roundStartTime, isActiveRound, isMyTeamWaiting]);

  const stability = room?.currentStability ?? 1000;
  const stabilityPercent = Math.max(0, Math.min(100, Math.round((stability / 1000) * 100)));

  const stabilityColor =
    stability > 600 ? 'bg-[#00FF66]' : stability > 300 ? 'bg-[#FFD600]' : 'bg-[#FF2A2A]';

  const allPlayersList = room?.allPlayers || room?.players || [];
  const isHost = currentSocketId
    ? allPlayersList.find(p => p.id === currentSocketId)?.isHost ?? false
    : true;

  return (
    <header className="w-full bg-[#1C1E24] border-b-4 border-black px-3 py-1.5 flex flex-col gap-1 shrink-0 z-30 shadow-brutal select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-[#FFD600] text-black p-1 rounded-sm border-2 border-black flex items-center justify-center animate-pulse-fast">
            <Radiation className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xs tracking-wider uppercase font-extrabold text-[#FFD600]">
              CENTRAL CAÓTICA
            </h1>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-300 flex-wrap">
              {room && (
                <span className="bg-black/60 px-1.5 py-0.5 border border-gray-600 rounded text-[#00FF66] font-bold">
                  SALA: {room.code}
                </span>
              )}
              {myTeam && (
                <span
                  className="px-1.5 py-0.5 rounded font-black border border-black"
                  style={{
                    backgroundColor: myTeam.color,
                    color: myTeam.color === '#FF2A2A' ? '#FFF' : '#000'
                  }}
                >
                  {myTeam.name}
                </span>
              )}
              <span className="truncate max-w-[100px] text-gray-200 font-semibold">
                {playerName || 'Anónimo'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isActiveRound && !isMyTeamWaiting && (
            <div className="flex items-center gap-1 bg-black px-2 py-1 border border-gray-700 rounded text-xs text-[#00F0FF] font-mono font-bold">
              <Timer className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
              <span>{(elapsed / 1000).toFixed(1)}s</span>
            </div>
          )}

          <button
            onClick={toggleSound}
            className="p-1.5 bg-[#2A2D37] border-2 border-black hover:bg-[#3F4452] active:translate-y-0.5 text-gray-200 transition-all"
            title={isMuted ? 'Activar Sonido' : 'Silenciar'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-[#00FF66]" />}
          </button>
        </div>
      </div>

      {/* Quick Minigame Switcher Bar during active game or summary (for Host) */}
      {room && room.phase !== 'LOBBY' && isHost && onStartSpecificRound && onReturnToLobby && (
        <div className="flex items-center justify-between gap-1 bg-black/70 border border-gray-700 px-1.5 py-1 rounded">
          <button
            onClick={() => {
              sound.playClick();
              onReturnToLobby();
            }}
            className="text-[10px] font-black uppercase px-2 py-0.5 bg-[#2A2D37] hover:bg-[#3F4452] text-gray-200 border border-gray-600 rounded"
            title="Volver a la Sala de Control"
          >
            ⬅ SALA
          </button>
          <div className="flex items-center gap-1">
            {([1, 2, 3, 4, 5] as const).map((rNum) => {
              const isCurrent =
                room.phase === `ROUND_${rNum}` ||
                (room.phase === 'ROUND_INTRO' && room.upcomingRound === rNum);
              return (
                <button
                  key={rNum}
                  onClick={() => {
                    sound.playClick();
                    onStartSpecificRound(rNum);
                  }}
                  className={`text-[10px] font-black uppercase px-2 py-0.5 border rounded transition-all ${
                    isCurrent
                      ? 'bg-[#FFD600] text-black border-black'
                      : 'bg-[#1C1E24] text-gray-300 border-gray-700 hover:border-[#00F0FF]'
                  }`}
                  title={`Saltar directamente a la Prueba ${rNum}`}
                >
                  P{rNum}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stability Bar during active game round */}
      {isActiveRound && !isMyTeamWaiting && (
        <div className="w-full bg-black/80 border-2 border-black p-1 rounded">
          <div className="flex justify-between text-[10px] uppercase font-bold text-gray-200 mb-0.5">
            <span className="flex items-center gap-1">
              <ShieldAlert className="w-3 h-3 text-[#FFD600]" /> Estabilidad del Núcleo
            </span>
            <span className={stability < 300 ? 'text-[#FF2A2A] animate-pulse' : 'text-[#00FF66]'}>
              {stability} PTS ({stabilityPercent}%)
            </span>
          </div>
          <div className="w-full h-2 bg-gray-900 border border-gray-700 overflow-hidden relative">
            <div
              className={`h-full transition-all duration-300 ${stabilityColor}`}
              style={{ width: `${stabilityPercent}%` }}
            />
          </div>
        </div>
      )}
    </header>
  );
};
