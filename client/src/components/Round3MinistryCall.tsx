import React, { useState } from 'react';
import { PhoneCall, CheckCircle2, HelpCircle, AlertTriangle } from 'lucide-react';
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

  const [wrongOptionId, setWrongOptionId] = useState<string | null>(null);

  // Questions assigned to this player's screen
  const myQuestions = round3.questions.filter(q => q.assignedPlayerId === currentSocketId);
  // Options (answers/distractors) assigned to this player's screen
  const myOptions = round3.options.filter(o => o.assignedPlayerId === currentSocketId);

  const handleOptionClick = (optionId: string, isCorrect: boolean, isSolved: boolean) => {
    if (isSolved) return;

    if (isCorrect) {
      sound.playSuccess();
    } else {
      sound.playGeiger();
      setWrongOptionId(optionId);
      setTimeout(() => setWrongOptionId(null), 600);
      if (navigator.vibrate) navigator.vibrate(120);
    }

    sound.playClick();
    onSubmitAnswer(optionId);
  };

  const solvedCount = round3.solvedCount;
  const totalQuestions = round3.totalQuestions;
  const progressPercent = Math.round((solvedCount / totalQuestions) * 100);

  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between p-3 max-w-md mx-auto w-full select-none overflow-y-auto">
      {/* 1. Top Header & Global Progress */}
      <div className="flex flex-col gap-1.5 shrink-0">
        <div className="bg-[#1C1E24] border-3 border-black p-2.5 shadow-brutal flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#FF2A2A] text-white p-1.5 border-2 border-black animate-pulse">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-[#FF2A2A] font-black uppercase tracking-wider block leading-none">
                PRUEBA 3: LLAMADA DE MOSCÚ
              </span>
              <span className="text-xs text-gray-200 font-bold">
                DISTRIBUCIÓN ASIMÉTRICA DE PREGUNTAS Y RESPUESTAS
              </span>
            </div>
          </div>

          <div className="bg-black/90 px-2 py-1 border border-gray-700 text-[10px] font-mono text-[#00FF66] font-bold">
            {solvedCount}/{totalQuestions} RESUELTAS
          </div>
        </div>

        {/* Global questions status indicator */}
        <div className="bg-black/80 border-2 border-black p-1.5 rounded flex items-center justify-between gap-1 shadow-brutal-sm">
          <div className="flex items-center gap-1">
            {round3.questions.map((q, idx) => (
              <div
                key={q.id}
                className={`w-6 h-6 border border-black flex items-center justify-center text-[10px] font-mono font-black ${
                  q.isSolved
                    ? 'bg-[#00FF66] text-black shadow-glow-green'
                    : 'bg-[#2A2D37] text-gray-400'
                }`}
                title={q.isSolved ? `Resuelta por ${q.solvedByPlayerName}` : 'Pendiente'}
              >
                0{idx + 1}
              </div>
            ))}
          </div>

          <div className="text-[9px] font-mono text-gray-300 uppercase font-bold text-right">
            Progreso: {progressPercent}%
          </div>
        </div>
      </div>

      {/* 2. Questions Assigned to My Terminal */}
      <div className="my-2 flex-1 flex flex-col gap-2 min-h-0">
        <div className="flex items-center justify-between text-[10px] uppercase font-mono text-gray-400 border-b border-gray-700 pb-0.5">
          <span className="flex items-center gap-1 font-bold text-[#FFD600]">
            <HelpCircle className="w-3.5 h-3.5" />
            PREGUNTAS ASIGNADAS A TU TERMINAL ({myQuestions.length}):
          </span>
          <span className="text-[9px] text-gray-400 font-mono">¡DÍCTALAS A TUS COMPAÑEROS!</span>
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto pr-0.5 max-h-[160px]">
          {myQuestions.length > 0 ? (
            myQuestions.map((q, qIndex) => (
              <div
                key={q.id}
                className={`p-2 border-2 transition-all ${
                  q.isSolved
                    ? 'bg-[#00FF66]/10 border-[#00FF66] opacity-80'
                    : 'bg-[#1C1E24] border-black shadow-brutal-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[8px] bg-black text-[#FFD600] font-mono px-1.5 py-0.2 border border-gray-700 uppercase font-bold">
                    EXPEDIENTE 0{qIndex + 1} // TIPO: {q.type}
                  </span>
                  {q.isSolved ? (
                    <span className="text-[9px] text-[#00FF66] font-mono font-bold flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> RESUELTA
                    </span>
                  ) : (
                    <span className="text-[8px] bg-[#FF2A2A] text-white px-1 font-bold uppercase animate-pulse">
                      PENDIENTE
                    </span>
                  )}
                </div>

                <p className={`text-xs font-bold leading-snug ${q.isSolved ? 'text-gray-400 line-through' : 'text-white'}`}>
                  "{q.prompt}"
                </p>

                {q.isSolved && q.solvedByPlayerName && (
                  <div className="text-[9px] text-[#00FF66] font-mono mt-1 pt-1 border-t border-gray-800">
                    Respuesta: <span className="font-bold">"{q.correctAnswerText}"</span> (Localizada por: {q.solvedByPlayerName})
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-2 text-center text-xs text-gray-400 italic bg-[#1C1E24] border border-gray-800">
              Todas las preguntas están en las pantallas de tus compañeros. ¡Tú tienes opciones de respuesta!
            </div>
          )}
        </div>
      </div>

      {/* 3. Answer Buttons Pool Assigned to My Terminal */}
      <div className="shrink-0 flex flex-col gap-1.5 pt-1 border-t-2 border-black">
        <div className="flex items-center justify-between text-[10px] uppercase font-mono text-gray-400">
          <span className="font-bold text-[#00F0FF]">
            MANDOS DE RESPUESTA EN TU PANTALLA ({myOptions.length}):
          </span>
          <span className="text-[8px] text-gray-500">OPCIONES MEZCLADAS</span>
        </div>

        <div className={`grid gap-2 ${
          myOptions.length <= 3 
            ? 'grid-cols-1' 
            : myOptions.length === 4 
            ? 'grid-cols-2' 
            : 'grid-cols-2'
        }`}>
          {myOptions.map((opt) => {
            const isWrong = wrongOptionId === opt.id;

            return (
              <button
                key={opt.id}
                type="button"
                disabled={opt.isSolved}
                onClick={() => handleOptionClick(opt.id, opt.isCorrect, opt.isSolved)}
                className={`p-2.5 border-3 border-black text-left flex items-center justify-between transition-all shadow-brutal-sm ${
                  opt.isSolved
                    ? 'bg-[#00FF66]/20 border-[#00FF66] text-[#00FF66] opacity-70 cursor-not-allowed'
                    : isWrong
                    ? 'bg-[#FF2A2A] text-white animate-shake'
                    : 'bg-[#2A2D37] hover:bg-[#383C4A] active:translate-y-1 text-white'
                }`}
              >
                <span className="text-xs font-black uppercase tracking-tight truncate mr-1">
                  {opt.text}
                </span>

                {opt.isSolved ? (
                  <CheckCircle2 className="w-4 h-4 text-[#00FF66] shrink-0" />
                ) : isWrong ? (
                  <AlertTriangle className="w-4 h-4 text-white shrink-0" />
                ) : (
                  <div className="w-2.5 h-2.5 border border-gray-500 bg-black shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
