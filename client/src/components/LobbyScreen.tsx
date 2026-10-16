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
  Mic,
  MicOff
} from 'lucide-react';
import { RoomState } from '../types';
import { sound } from '../soundEngine';

interface LobbyScreenProps {
  room: RoomState;
  currentSocketId: string;
  onAddBot: () => void;
  onRemoveBot: (botId: string) => void;
  onStartGame: () => void;
  onStartSpecificRound: (roundNumber: 1 | 2 | 3 | 4 | 5) => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  room,
  currentSocketId,
  onAddBot,
  onRemoveBot,
  onStartGame,
  onStartSpecificRound
}) => {
  const [copied, setCopied] = useState(false);
  const isHost = room.players.find(p => p.id === currentSocketId)?.isHost ?? false;
  const canStart = room.players.length >= 2;

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
    <div className="flex-1 flex flex-col justify-between p-3 max-w-md mx-auto w-full overflow-y-auto gap-2">
      {/* Room Code Card */}
      <div className="bg-[#1C1E24] border-4 border-black p-2.5 shadow-brutal text-center relative shrink-0">
        <div className="hazard-stripes w-full h-2 border border-black mb-1.5" />
        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest block">
          CÓDIGO DE ACCESO A LA SALA DE CONTROL
        </span>
        <div className="flex items-center justify-center gap-2 mt-0.5">
          <span className="text-3xl font-black tracking-widest text-[#FFD600] text-glow-yellow font-mono">
            {room.code}
          </span>
          <button
            onClick={copyCode}
            className="p-1.5 bg-[#2A2D37] border-2 border-black hover:bg-[#3F4452] active:translate-y-0.5 text-gray-200 transition-all shadow-brutal-sm"
            title="Copiar Código"
          >
            {copied ? <Check className="w-4 h-4 text-[#00FF66]" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
        <p className="text-[10px] text-gray-400 mt-0.5 flex items-center justify-center gap-1">
          <Smartphone className="w-3 h-3 text-[#00F0FF]" /> Abre en otros móviles o pestañas para jugar
        </p>
      </div>

      {/* Operarios Grid */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-gray-300">
            <Users className="w-4 h-4 text-[#00FF66]" />
            <span>OPERARIOS PRESENTES ({room.players.length}/4)</span>
          </div>
          {room.players.length < 4 && (
            <button
              onClick={() => {
                sound.playClick();
                onAddBot();
              }}
              className="bg-[#2A2D37] border-2 border-black text-[11px] font-bold text-[#FFD600] px-2 py-1 flex items-center gap-1 hover:bg-[#3F4452] active:translate-y-0.5 shadow-brutal-sm transition-all"
            >
              <Bot className="w-3.5 h-3.5" />
              + Bot Simulado
            </button>
          )}
        </div>

        <div className="flex flex-col gap-1.5 flex-1 justify-center">
          {room.players.map((player, idx) => {
            const isMe = player.id === currentSocketId;
            return (
              <div
                key={player.id}
                className={`border-3 border-black p-2 flex items-center justify-between shadow-brutal-sm transition-all ${
                  isMe
                    ? 'bg-[#2A2D37] border-l-8 border-l-[#00FF66]'
                    : player.isBot
                    ? 'bg-[#1C1E24] border-l-8 border-l-[#00F0FF]'
                    : 'bg-[#1C1E24] border-l-8 border-l-[#FFD600]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-black border border-gray-600 rounded flex items-center justify-center text-xs font-black text-[#FFD600]">
                    0{idx + 1}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-100 flex items-center gap-1.5">
                      <span>{player.name}</span>
                      {isMe && (
                        <span className="text-[9px] bg-[#00FF66] text-black font-extrabold px-1 py-0.2 rounded">
                          TÚ
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-400">
                      {player.isHost ? 'Jefe de Turno (Anfitrión)' : player.isBot ? 'Autómata Soviético' : 'Operario de Reactor'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {player.hasMic ? (
                    <div className="flex items-center gap-1 text-[10px] text-[#00FF66]" title="Micrófono Conectado">
                      <Mic className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-[10px] text-gray-500" title="Sin Micrófono (Exento de gritar)">
                      <MicOff className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00FF66] animate-pulse" />
                  {isHost && player.isBot && (
                    <button
                      onClick={() => {
                        sound.playClick();
                        onRemoveBot(player.id);
                      }}
                      className="p-1 hover:bg-red-900/40 text-red-400 rounded"
                      title="Eliminar Bot"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* Empty slot indicators if < 4 */}
          {Array.from({ length: 4 - room.players.length }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="border-2 border-dashed border-gray-700 p-1.5 text-center text-[11px] text-gray-500 font-bold uppercase tracking-wider"
            >
              [ Puesto {room.players.length + i + 1} Vacante - Esperando Camarada ]
            </div>
          ))}
        </div>
      </div>

      {/* Start Button & Minigame Selector Area */}
      <div className="flex flex-col gap-2 pt-1 shrink-0">
        {!canStart && (
          <div className="bg-[#FF2A2A]/20 border-2 border-[#FF2A2A] p-2 flex items-center gap-2 text-xs text-[#FF2A2A] font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Se requieren mínimo 2 operarios. Pulsa "+ Bot Simulado" para probar en solitario o invita a un amigo.</span>
          </div>
        )}

        {isHost ? (
          <>
            <button
              onClick={handleStart}
              disabled={!canStart}
              className="w-full bg-[#FFD600] disabled:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-400 active:translate-y-1 text-black font-black uppercase py-3 px-4 border-4 border-black text-sm tracking-wider flex items-center justify-center gap-2 shadow-brutal transition-all"
            >
              <Play className="w-5 h-5 fill-black" />
              INICIAR PARTIDA COMPLETA (5 PRUEBAS)
            </button>

            {/* Individual Minigame Test Panel */}
            <div className="bg-[#1C1E24] border-3 border-black p-2 shadow-brutal-sm">
              <div className="text-[10px] font-black uppercase text-[#00F0FF] tracking-wider mb-1.5 text-center">
                🧪 PROBAR MINIJUEGO POR SEPARADO:
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  onClick={() => handleStartSingle(1)}
                  disabled={!canStart}
                  className="bg-[#2A2D37] hover:bg-[#3F4452] disabled:opacity-40 active:translate-y-0.5 border-2 border-black py-1.5 px-2 text-[10px] font-black text-white uppercase text-left flex items-center justify-between"
                >
                  <span>1. CADENA</span>
                  <span className="text-[#FFD600]">▶</span>
                </button>
                <button
                  onClick={() => handleStartSingle(2)}
                  disabled={!canStart}
                  className="bg-[#2A2D37] hover:bg-[#3F4452] disabled:opacity-40 active:translate-y-0.5 border-2 border-black py-1.5 px-2 text-[10px] font-black text-white uppercase text-left flex items-center justify-between"
                >
                  <span>2. PANEL AZ-5</span>
                  <span className="text-[#FFD600]">▶</span>
                </button>
                <button
                  onClick={() => handleStartSingle(3)}
                  disabled={!canStart}
                  className="bg-[#2A2D37] hover:bg-[#3F4452] disabled:opacity-40 active:translate-y-0.5 border-2 border-black py-1.5 px-2 text-[10px] font-black text-white uppercase text-left flex items-center justify-between"
                >
                  <span>3. TRIVIA</span>
                  <span className="text-[#FFD600]">▶</span>
                </button>
                <button
                  onClick={() => handleStartSingle(4)}
                  disabled={!canStart}
                  className="bg-[#2A2D37] hover:bg-[#3F4452] disabled:opacity-40 active:translate-y-0.5 border-2 border-black py-1.5 px-2 text-[10px] font-black text-white uppercase text-left flex items-center justify-between"
                >
                  <span>4. CINTA</span>
                  <span className="text-[#FFD600]">▶</span>
                </button>
                <button
                  onClick={() => handleStartSingle(5)}
                  disabled={!canStart}
                  className="col-span-2 bg-[#2A2D37] hover:bg-[#3F4452] disabled:opacity-40 active:translate-y-0.5 border-2 border-[#00FF66] py-1.5 px-2 text-[10px] font-black text-[#00FF66] uppercase flex items-center justify-center gap-2"
                >
                  <span>5. LABERINTO A CIEGAS (SONDA RBMK)</span>
                  <span>▶</span>
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-[#1C1E24] border-2 border-gray-700 p-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center justify-center gap-2">
            <Radio className="w-4 h-4 text-[#FFD600] animate-pulse" />
            Esperando a que el Jefe de Turno elija prueba...
          </div>
        )}
      </div>
    </div>
  );
};
