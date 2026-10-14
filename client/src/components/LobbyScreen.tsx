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
  Smartphone
} from 'lucide-react';
import { RoomState } from '../types';
import { sound } from '../soundEngine';

interface LobbyScreenProps {
  room: RoomState;
  currentSocketId: string;
  onAddBot: () => void;
  onRemoveBot: (botId: string) => void;
  onStartGame: () => void;
}

export const LobbyScreen: React.FC<LobbyScreenProps> = ({
  room,
  currentSocketId,
  onAddBot,
  onRemoveBot,
  onStartGame
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

  return (
    <div className="flex-1 flex flex-col justify-between p-4 max-w-md mx-auto w-full overflow-y-auto">
      {/* Room Code Card */}
      <div className="bg-[#1C1E24] border-4 border-black p-3 shadow-brutal text-center relative">
        <div className="hazard-stripes w-full h-2 border border-black mb-2" />
        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest block">
          CÓDIGO DE ACCESO A LA SALA DE CONTROL
        </span>
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="text-4xl font-black tracking-widest text-[#FFD600] text-glow-yellow font-mono">
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
        <p className="text-[10px] text-gray-400 mt-1 flex items-center justify-center gap-1">
          <Smartphone className="w-3 h-3 text-[#00F0FF]" /> Abre en otros móviles o pestañas para jugar
        </p>
      </div>

      {/* Operarios Grid */}
      <div className="my-3 flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-2">
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

        <div className="flex flex-col gap-2 flex-1 justify-center">
          {room.players.map((player, idx) => {
            const isMe = player.id === currentSocketId;
            return (
              <div
                key={player.id}
                className={`border-3 border-black p-2.5 flex items-center justify-between shadow-brutal-sm transition-all ${
                  isMe
                    ? 'bg-[#2A2D37] border-l-8 border-l-[#00FF66]'
                    : player.isBot
                    ? 'bg-[#1C1E24] border-l-8 border-l-[#00F0FF]'
                    : 'bg-[#1C1E24] border-l-8 border-l-[#FFD600]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-black border border-gray-600 rounded flex items-center justify-center text-xs font-black text-[#FFD600]">
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

                <div className="flex items-center gap-1.5">
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
              className="border-2 border-dashed border-gray-700 p-2 text-center text-xs text-gray-500 font-bold uppercase tracking-wider"
            >
              [ Puesto {room.players.length + i + 1} Vacante - Esperando Camarada ]
            </div>
          ))}
        </div>
      </div>

      {/* Start Button Area */}
      <div className="flex flex-col gap-2 pt-2">
        {!canStart && (
          <div className="bg-[#FF2A2A]/20 border-2 border-[#FF2A2A] p-2 flex items-center gap-2 text-xs text-[#FF2A2A] font-bold">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Se requieren mínimo 2 operarios. Pulsa "+ Bot Simulado" para probar en solitario o invita a un amigo.</span>
          </div>
        )}

        {isHost ? (
          <button
            onClick={handleStart}
            disabled={!canStart}
            className="w-full bg-[#FFD600] disabled:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-400 active:translate-y-1 text-black font-black uppercase py-3.5 px-4 border-4 border-black text-sm tracking-wider flex items-center justify-center gap-2 shadow-brutal transition-all"
          >
            <Play className="w-5 h-5 fill-black" />
            INICIAR TURNO DE EMERGENCIA
          </button>
        ) : (
          <div className="bg-[#1C1E24] border-2 border-gray-700 p-3 text-center text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center justify-center gap-2">
            <Radio className="w-4 h-4 text-[#FFD600] animate-pulse" />
            Esperando a que el Jefe de Turno inicie la prueba...
          </div>
        )}
      </div>
    </div>
  );
};
