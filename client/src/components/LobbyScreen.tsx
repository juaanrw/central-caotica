import React, { useState } from 'react';
import { 
  Users, 
  Bot, 
  Play, 
  Copy, 
  Check, 
  Trash2, 
  Radio, 
  AlertCircle,
  Smartphone,
  Swords,
  Shuffle
} from 'lucide-react';
import { RoomState, GameMode } from '../types';
import { sound } from '../soundEngine';

interface LobbyScreenProps {
  room: RoomState;
  currentSocketId: string;
  onAddBot: () => void;
  onRemoveBot: (botId: string) => void;
  onSetGameMode: (mode: GameMode) => void;
  onJoinTeam: (teamId: string) => void;
  onAutoBalanceTeams: () => void;
  onStartGame: () => void;
  onStartSpecificRound: (roundNumber: 1 | 2 | 3 | 4 | 5) => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  room,
  currentSocketId,
  onAddBot,
  onRemoveBot,
  onSetGameMode,
  onJoinTeam,
  onAutoBalanceTeams,
  onStartGame,
  onStartSpecificRound
}) => {
  const [copied, setCopied] = useState(false);
  const isHost = room.players.find(p => p.id === currentSocketId)?.isHost ?? false;
  const isCompetitive = room.gameMode === 'COMPETITIVE';

  const activeTeams = (room.teams || []).filter(t => t.playerIds.length > 0);
  const competitiveValid =
    room.players.length >= 4 &&
    activeTeams.length >= 2 &&
    activeTeams.every(t => t.playerIds.length >= 2 && t.playerIds.length <= 4);

  const canStart = isCompetitive ? competitiveValid : room.players.length >= 2 && room.players.length <= 4;
  const maxPlayers = isCompetitive ? 16 : 4;

  const copyCode = () => {
    sound.playClick();
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStart = () => {
    sound.playClick();
    sound.playGeiger(5);
    onStartGame();
  };

  const handleStartSingle = (roundNumber: 1 | 2 | 3 | 4 | 5) => {
    sound.playClick();
    sound.playGeiger(4);
    onStartSpecificRound(roundNumber);
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-3 sm:p-4 max-w-md mx-auto w-full overflow-y-auto gap-3">
      {/* Room Code Card */}
      <div className="bg-[#1C1E24] border-4 border-black p-3 shadow-brutal text-center relative shrink-0">
        <div className="hazard-stripes w-full h-2 border border-black mb-2" />
        <span className="text-xs uppercase font-black text-gray-300 tracking-widest block">
          CÓDIGO DE ACCESO A LA SALA DE CONTROL
        </span>
        <div className="flex items-center justify-center gap-3 my-1">
          <span className="text-4xl sm:text-5xl font-black tracking-widest text-[#FFD600] text-glow-yellow font-mono">
            {room.code}
          </span>
          <button
            onClick={copyCode}
            className="p-2 bg-[#2A2D37] border-2 border-black hover:bg-[#3F4452] active:translate-y-0.5 text-gray-200 transition-all shadow-brutal-sm"
            title="Copiar Código"
          >
            {copied ? <Check className="w-5 h-5 text-[#00FF66]" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
        <p className="text-xs text-gray-300 mt-0.5 flex items-center justify-center gap-1.5">
          <Smartphone className="w-4 h-4 text-[#00F0FF]" /> Abre en otros móviles para jugar en equipo
        </p>
      </div>

      {/* Mode Switcher: COOP vs COMPETITIVE */}
      <div className="bg-[#1C1E24] border-3 border-black p-2.5 shadow-brutal shrink-0">
        <div className="text-xs font-black uppercase text-gray-300 mb-1.5 flex items-center justify-between">
          <span>MODO DE PARTIDA:</span>
          <span className="text-[#FFD600]">
            {isCompetitive ? '⚔️ COMPETICIÓN POR EQUIPOS' : '🤝 COOPERATIVO (1 EQUIPO)'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={!isHost || room.players.length > 4}
            onClick={() => {
              sound.playClick();
              onSetGameMode('COOP');
            }}
            className={`py-2 px-2 border-2 border-black text-xs font-black uppercase transition-all flex items-center justify-center gap-1.5 ${
              !isCompetitive
                ? 'bg-[#00FF66] text-black shadow-brutal-sm'
                : 'bg-[#2A2D37] text-gray-300 disabled:opacity-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>COOPERATIVO (2-4)</span>
          </button>
          <button
            type="button"
            disabled={!isHost}
            onClick={() => {
              sound.playClick();
              onSetGameMode('COMPETITIVE');
            }}
            className={`py-2 px-2 border-2 border-black text-xs font-black uppercase transition-all flex items-center justify-center gap-1.5 ${
              isCompetitive
                ? 'bg-[#FFD600] text-black shadow-brutal-sm'
                : 'bg-[#2A2D37] text-gray-300 disabled:opacity-50'
            }`}
          >
            <Swords className="w-4 h-4" />
            <span>COMPETITIVO (4+)</span>
          </button>
        </div>
      </div>

      {/* Players / Teams Area */}
      <div className="flex-1 flex flex-col justify-around min-h-0 gap-2">
        <div className="flex items-center justify-between mb-0.5 shrink-0 flex-wrap gap-1.5">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-black uppercase text-gray-200">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#00FF66]" />
            <span>OPERARIOS ({room.players.length}/{maxPlayers})</span>
          </div>
          <div className="flex items-center gap-1.5">
            {isCompetitive && isHost && (
              <button
                onClick={() => {
                  sound.playClick();
                  onAutoBalanceTeams();
                }}
                className="bg-[#2A2D37] border-2 border-black text-xs font-black text-[#00F0FF] px-2.5 py-1.5 flex items-center gap-1 hover:bg-[#3F4452] active:translate-y-0.5 shadow-brutal-sm transition-all"
                title="Repartir jugadores equitativamente"
              >
                <Shuffle className="w-3.5 h-3.5" />
                Equilibrar
              </button>
            )}
            {room.players.length < maxPlayers && (
              <button
                onClick={() => {
                  sound.playClick();
                  onAddBot();
                }}
                className="bg-[#2A2D37] border-2 border-black text-xs font-black text-[#FFD600] px-2.5 py-1.5 flex items-center gap-1.5 hover:bg-[#3F4452] active:translate-y-0.5 shadow-brutal-sm transition-all"
              >
                <Bot className="w-4 h-4" />
                + Bot
              </button>
            )}
          </div>
        </div>

        {/* COOPERATIVE PLAYER LIST */}
        {!isCompetitive ? (
          <div className="flex flex-col gap-2 flex-1 justify-around">
            {room.players.map((player, idx) => {
              const isMe = player.id === currentSocketId;
              return (
                <div
                  key={player.id}
                  className={`border-3 border-black p-3 flex items-center justify-between shadow-brutal transition-all ${
                    isMe
                      ? 'bg-[#2A2D37] border-l-8 border-l-[#00FF66]'
                      : player.isBot
                      ? 'bg-[#1C1E24] border-l-8 border-l-[#00F0FF]'
                      : 'bg-[#1C1E24] border-l-8 border-l-[#FFD600]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-black border-2 border-gray-600 rounded flex items-center justify-center text-sm font-black text-[#FFD600] shrink-0 font-mono">
                      0{idx + 1}
                    </div>
                    <div>
                      <div className="text-sm sm:text-base font-black text-gray-100 flex items-center gap-2">
                        <span>{player.name}</span>
                        {isMe && (
                          <span className="text-[10px] bg-[#00FF66] text-black font-black px-1.5 py-0.5 rounded border border-black uppercase">
                            TÚ
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-300 mt-0.5 font-semibold">
                        {player.isHost ? 'Jefe de Turno (Anfitrión)' : player.isBot ? 'Autómata Soviético' : 'Operario de Reactor'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <div className="w-3 h-3 rounded-full bg-[#00FF66] animate-pulse" />
                    {isHost && player.isBot && (
                      <button
                        onClick={() => {
                          sound.playClick();
                          onRemoveBot(player.id);
                        }}
                        className="p-1.5 hover:bg-red-900/40 text-red-400 rounded transition-all"
                        title="Eliminar Bot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {Array.from({ length: Math.max(0, 4 - room.players.length) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="border-2 border-dashed border-gray-700 p-2.5 text-center text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center justify-center"
              >
                [ Puesto {room.players.length + i + 1} Vacante - Esperando Camarada ]
              </div>
            ))}
          </div>
        ) : (
          /* COMPETITIVE TEAMS GRID */
          <div className="flex flex-col gap-2.5">
            <div className="text-xs text-gray-300 font-bold bg-black/60 p-2 border border-gray-700">
              Pulsa en un equipo para unirte a él (cada equipo activo debe tener de 2 a 4 jugadores).
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {(room.teams || []).map(team => {
                const members = room.players.filter(p => p.teamId === team.id);
                const isMyTeam = members.some(m => m.id === currentSocketId);
                const isFull = members.length >= 4;
                const isInvalidCount = members.length === 1;

                return (
                  <div
                    key={team.id}
                    className={`bg-[#1C1E24] border-3 border-black p-2.5 shadow-brutal flex flex-col justify-between gap-2 ${
                      isMyTeam ? 'ring-2 ring-[#FFD600]' : ''
                    }`}
                  >
                    <div>
                      <div
                        className="px-2.5 py-1 border-2 border-black flex items-center justify-between text-xs font-black uppercase mb-2"
                        style={{
                          backgroundColor: team.color,
                          color: team.color === '#FF2A2A' ? '#FFFFFF' : '#000000'
                        }}
                      >
                        <span>{team.name}</span>
                        <span>{members.length}/4</span>
                      </div>

                      {members.length > 0 ? (
                        <div className="flex flex-col gap-1.5">
                          {members.map(m => {
                            const isMe = m.id === currentSocketId;
                            return (
                              <div
                                key={m.id}
                                className="bg-black/80 px-2.5 py-1.5 border border-gray-700 flex items-center justify-between text-xs"
                              >
                                <span className="font-bold text-white flex items-center gap-1.5">
                                  <span>{m.name}</span>
                                  {isMe && (
                                    <span className="text-[10px] bg-[#00FF66] text-black px-1 font-black">
                                      TÚ
                                    </span>
                                  )}
                                  {m.isHost && (
                                    <span className="text-[10px] text-[#FFD600] font-black">★</span>
                                  )}
                                </span>
                                {isHost && m.isBot && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      sound.playClick();
                                      onRemoveBot(m.id);
                                    }}
                                    className="text-red-400 hover:text-red-300 p-0.5"
                                    title="Eliminar Bot"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-xs text-gray-500 italic py-2 text-center">
                          Sin operarios asignados
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      {isInvalidCount ? (
                        <span className="text-[10px] text-[#FF2A2A] font-black uppercase">
                          ⚠️ Falta 1 compañero (mín. 2)
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-400 font-bold uppercase">
                          {members.length >= 2 ? '✅ Equipo listo' : 'Inactivo'}
                        </span>
                      )}

                      {!isMyTeam && !isFull && (
                        <button
                          type="button"
                          onClick={() => {
                            sound.playClick();
                            onJoinTeam(team.id);
                          }}
                          className="bg-[#2A2D37] hover:bg-[#3F4452] text-white border border-gray-500 px-2 py-1 text-[11px] font-black uppercase"
                        >
                          Unirme
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Start Button & Minigame Selector Area */}
      <div className="flex flex-col gap-2 pt-1 shrink-0">
        {!canStart && (
          <div className="bg-[#FF2A2A]/20 border-2 border-[#FF2A2A] p-2.5 flex items-center gap-2 text-xs text-[#FF2A2A] font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              {isCompetitive
                ? 'Modo Competitivo requiere al menos 4 jugadores repartidos en 2 o más equipos (de 2 a 4 jugadores por equipo). ¡Añade bots o espera a más amigos!'
                : 'Se requieren mínimo 2 operarios. Pulsa "+ Bot" para probar o invita a tus amigos.'}
            </span>
          </div>
        )}

        {isHost ? (
          <>
            <button
              onClick={handleStart}
              disabled={!canStart}
              className="w-full bg-[#FFD600] disabled:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-400 active:translate-y-1 text-black font-black uppercase py-3.5 px-4 border-4 border-black text-sm sm:text-base tracking-wider flex items-center justify-center gap-2 shadow-brutal transition-all"
            >
              <Play className="w-5 h-5 fill-black" />
              {isCompetitive
                ? 'INICIAR TORNEO COMPETITIVO (5 PRUEBAS)'
                : 'INICIAR PARTIDA COMPLETA (5 PRUEBAS)'}
            </button>

            {/* Individual Minigame Test Panel */}
            <div className="bg-[#1C1E24] border-3 border-black p-2.5 shadow-brutal-sm">
              <div className="text-xs font-black uppercase text-[#00F0FF] tracking-wider mb-2 text-center">
                🧪 JUGAR UN MINIJUEGO SUELTO:
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleStartSingle(1)}
                  disabled={!canStart}
                  className="bg-[#2A2D37] hover:bg-[#3F4452] disabled:opacity-40 active:translate-y-0.5 border-2 border-black py-2 px-2.5 text-xs font-black text-white uppercase text-left flex items-center justify-between"
                >
                  <span>1. CADENA</span>
                  <span className="text-[#FFD600]">▶</span>
                </button>
                <button
                  onClick={() => handleStartSingle(2)}
                  disabled={!canStart}
                  className="bg-[#2A2D37] hover:bg-[#3F4452] disabled:opacity-40 active:translate-y-0.5 border-2 border-black py-2 px-2.5 text-xs font-black text-white uppercase text-left flex items-center justify-between"
                >
                  <span>2. PANEL AZ-5</span>
                  <span className="text-[#FFD600]">▶</span>
                </button>
                <button
                  onClick={() => handleStartSingle(3)}
                  disabled={!canStart}
                  className="bg-[#2A2D37] hover:bg-[#3F4452] disabled:opacity-40 active:translate-y-0.5 border-2 border-black py-2 px-2.5 text-xs font-black text-white uppercase text-left flex items-center justify-between"
                >
                  <span>3. TRIVIA</span>
                  <span className="text-[#FFD600]">▶</span>
                </button>
                <button
                  onClick={() => handleStartSingle(4)}
                  disabled={!canStart}
                  className="bg-[#2A2D37] hover:bg-[#3F4452] disabled:opacity-40 active:translate-y-0.5 border-2 border-black py-2 px-2.5 text-xs font-black text-white uppercase text-left flex items-center justify-between"
                >
                  <span>4. CINTA</span>
                  <span className="text-[#FFD600]">▶</span>
                </button>
                <button
                  onClick={() => handleStartSingle(5)}
                  disabled={!canStart}
                  className="col-span-2 bg-[#2A2D37] hover:bg-[#3F4452] disabled:opacity-40 active:translate-y-0.5 border-2 border-[#00FF66] py-2 px-2.5 text-xs font-black text-[#00FF66] uppercase flex items-center justify-center gap-2"
                >
                  <span>5. LABERINTO A CIEGAS (SONDA RBMK)</span>
                  <span>▶</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-[#1C1E24] border-3 border-black p-4 text-center shadow-brutal flex flex-col items-center justify-center gap-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-black uppercase text-[#FFD600]">
              <Radio className="w-5 h-5 text-[#FFD600] animate-pulse" />
              <span>CONECTADO AL SISTEMA DE CONTROL</span>
            </div>
            <p className="text-xs text-gray-200 font-semibold">
              Esperando a que el Jefe de Turno (Anfitrión) inicie la partida...
            </p>
            <div className="w-full hazard-stripes h-2 border border-black mt-1" />
          </div>
        )}
      </div>
    </div>
  );
};
