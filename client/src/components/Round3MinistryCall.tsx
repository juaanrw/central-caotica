import React from 'react';
import { PhoneCall, Volume2 } from 'lucide-react';
import { RoomState } from '../types';
import { sound } from '../soundEngine';

interface Round3Props {
  room: RoomState;
  currentSocketId: string;
  onSubmitAnswer: (optionId: string) => void;
}

export const Round3MinistryCall: React.FC<Round3Props> = ({
  room,
  currentSocketId,
  onSubmitAnswer
}) => {
  const round3 = room.round3;
  if (!round3) return null;

  // Filter options assigned to this player
  const myOptions = round3.options.filter(o => o.assignedPlayerId === currentSocketId);

  const handleOptionClick = (optionId: string) => {
    sound.playClick();
    onSubmitAnswer(optionId);
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-3 max-w-md mx-auto w-full select-none overflow-y-auto">
      {/* Top Header */}
      <div className="bg-[#1C1E24] border-3 border-black p-2.5 shadow-brutal flex items-center justify-between">
        <div>
          <span className="text-[10px] text-[#FF2A2A] font-black uppercase tracking-wider block">
            PRUEBA 3: LLAMADA DE MOSCÚ
          </span>
          <span className="text-xs text-gray-300 font-bold">
            PREGUNTA {round3.questionNumber} DE 3
          </span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3].map((num) => (
            <div
              key={num}
              className={`w-5 h-5 border border-black flex items-center justify-center text-[10px] font-black ${
                num < round3.questionNumber
                  ? 'bg-[#00FF66] text-black'
                  : num === round3.questionNumber
                  ? 'bg-[#FF2A2A] text-white animate-pulse'
                  : 'bg-black text-gray-600'
              }`}
            >
              0{num}
            </div>
          ))}
        </div>
      </div>

      {/* Inspector Question Box */}
      <div className="my-2 bg-[#1C1E24] border-4 border-black p-3.5 shadow-brutal">
        <div className="flex items-center gap-2 text-[#FFD600] text-xs font-black uppercase mb-1.5 border-b border-gray-700 pb-1">
          <PhoneCall className="w-4 h-4 text-[#FF2A2A] animate-bounce" />
          <span>INSPECTOR DEL COMITÉ ESTATAL AL TELÉFONO:</span>
        </div>
        <p className="text-sm font-bold text-gray-100 font-mono leading-relaxed mt-2 bg-black/60 p-2.5 border border-gray-700 text-glow-yellow">
          "{round3.prompt}"
        </p>
      </div>

      {/* Distributed options directive */}
      <div className="bg-[#2A2D37] border-2 border-black p-2 text-center text-[11px] font-bold text-gray-300 uppercase shadow-brutal-sm flex items-center justify-center gap-1.5">
        <Volume2 className="w-4 h-4 text-[#00FF66] shrink-0" />
        <span>Las 4 respuestas están repartidas. ¡Grita tus opciones en voz alta!</span>
      </div>

      {/* Options assigned to this player */}
      <div className="my-2 flex-1 flex flex-col justify-center gap-2.5">
        {myOptions.length > 0 ? (
          myOptions.map((opt, idx) => (
            <button
              key={opt.id}
              onClick={() => handleOptionClick(opt.id)}
              className="w-full bg-[#1C1E24] hover:bg-[#2A2D37] active:scale-98 active:translate-y-1 border-3 border-black p-3 text-left shadow-brutal transition-all cursor-pointer flex items-start gap-2.5 group"
            >
              <div className="w-6 h-6 bg-[#FFD600] text-black border border-black font-black text-xs flex items-center justify-center shrink-0 group-hover:bg-[#00FF66]">
                {String.fromCharCode(65 + idx)}
              </div>
              <span className="text-xs font-bold text-gray-100 font-mono leading-tight">
                {opt.text}
              </span>
            </button>
          ))
        ) : (
          <div className="bg-black/60 border-2 border-dashed border-gray-700 p-4 text-center text-xs text-gray-400 font-bold uppercase">
            [ No tienes opciones en tu terminal para esta pregunta. Escucha a tus camaradas y diles cuál es la correcta ]
          </div>
        )}
      </div>

      <div className="text-[10px] text-gray-400 text-center font-bold uppercase">
        ⚠️ Cuidado: Pulsar una respuesta incorrecta resta -200 puntos y penaliza el cronómetro.
      </div>
    </div>
  );
};
