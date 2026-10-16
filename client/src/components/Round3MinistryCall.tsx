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
    <div className="flex-1 min-h-0 flex flex-col justify-between p-3 max-w-md mx-auto w-full select-none overflow-y-auto gap-2.5">
      {/* 1. Top Header & Global Progress */}
      <div className="flex flex-col gap-1.5 shrink-0">
        <div className="bg-[#1C1E24] border-3 border-black p-2.5 shadow-brutal flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-[#FF2A2A] text-white p-2 border-2 border-black animate-pulse">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs text-[#FF2A2A] font-black uppercase tracking-wider block leading-none">
                PRUEBA 3: LLAMADA DE MOSCÚ
              </span>
              <span className="text-[11px] sm:text-xs text-gray-200 font-bold">
                DISTRIBUCIÓN ASIMÉTRICA DE PREGUNTAS Y RESPUESTAS
              </span>
            </div>
          </div>

          <div className="bg-black/90 px-2.5 py-1.5 border border-gray-700 text-xs font-mono text-[#00FF66] font-black shrink-0">
            {solvedCount}/{totalQuestions} HECHAS
          </div>
        </div>

        {/* Global questions status indicator */}
        <div className="bg-black/80 border-2 border-black p-1.5 rounded flex items-center justify-between gap-1 shadow-brutal-sm">
          <div className="flex items-center gap-1.5">
            {round3.questions.map((q, idx) => (
              <div
                key={q.id}
                className={`w-7 h-7 border-2 border-black flex items-center justify-center text-xs font-mono font-black ${
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

          <div className="text-[10px] font-mono text-gray-300 uppercase font-black text-right">
            Progreso: {progressPercent}%
          </div>
        </div>
      </div>

      {/* 2. Questions Assigned to My Terminal (Expands naturally) */}
      <div className="flex-1 flex flex-col min-h-0 gap-1.5">
        <div className="flex items-center justify-between text-xs uppercase font-mono text-gray-300 border-b-2 border-gray-700 pb-1 shrink-0">
          <span className="flex items-center gap-1.5 font-black text-[#FFD600]">
            <HelpCircle className="w-4 h-4" />
            PREGUNTAS EN TU PANTALLA ({myQuestions.length}):
          </span>
          <span className="text-[10px] text-gray-400 font-mono font-bold">¡DÍCTALAS A TUS COMPAÑEROS!</span>
        </div>

        <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto pr-0.5 justify-center">
          {myQuestions.length > 0 ? (
            myQuestions.map((q, qIndex) => (
              <div
                key={q.id}
                className={`p-3 sm:p-3.5 border-3 transition-all ${
                  q.isSolved
                    ? 'bg-[#00FF66]/10 border-[#00FF66] opacity-80'
                    : 'bg-[#1C1E24] border-black shadow-brutal'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] sm:text-[10px] bg-black text-[#FFD600] font-mono px-2 py-0.5 border border-gray-700 uppercase font-black">
                    EXPEDIENTE 0{qIndex + 1} // TIPO: {q.type}
                  </span>
                  {q.isSolved ? (
                    <span className="text-[10px] text-[#00FF66] font-mono font-black flex items-center gap-1 bg-black px-2 py-0.5 border border-[#00FF66]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> RESUELTA
                    </span>
                  ) : (
                    <span className="text-[9px] bg-[#FF2A2A] text-white px-2 py-0.5 font-black uppercase animate-pulse border border-black">
                      PENDIENTE
                    </span>
                  )}
                </div>

                <p className={`text-sm sm:text-base font-extrabold leading-snug ${q.isSolved ? 'text-gray-400 line-through' : 'text-white'}`}>
                  "{q.prompt}"
                </p>

                {q.isSolved && q.solvedByPlayerName && (
                  <div className="text-xs text-[#00FF66] font-mono mt-2 pt-1.5 border-t border-gray-700 font-bold">
                    Respuesta: <span className="font-black text-white">"{q.correctAnswerText}"</span> (Encontrada por: {q.solvedByPlayerName})
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-xs sm:text-sm text-gray-300 italic bg-[#1C1E24] border-2 border-gray-700 shadow-brutal-sm">
              📻 Todas las preguntas están en las pantallas de tus compañeros. ¡Tú tienes los mandos con las respuestas!
            </div>
          )}
        </div>
      </div>

      {/* 3. Answer Buttons Pool Assigned to My Terminal */}
      <div className="shrink-0 flex flex-col gap-1.5 pt-2 border-t-2 border-black">
        <div className="flex items-center justify-between text-xs uppercase font-mono text-gray-300">
          <span className="font-black text-[#00F0FF] flex items-center gap-1">
            MANDOS DE RESPUESTA EN TU PANTALLA ({myOptions.length}):
          </span>
          <span className="text-[9px] text-gray-500 font-bold">OPCIONES MEZCLADAS</span>
        </div>

        <div className={`grid gap-2 ${
          myOptions.length <= 3 
            ? 'grid-cols-1' 
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
                className={`py-3 px-3 sm:py-3.5 sm:px-3.5 border-3 border-black text-left flex items-center justify-between transition-all shadow-brutal-sm min-h-[48px] sm:min-h-[52px] ${
                  opt.isSolved
                    ? 'bg-[#00FF66]/20 border-[#00FF66] text-[#00FF66] opacity-70 cursor-not-allowed'
                    : isWrong
                    ? 'bg-[#FF2A2A] text-white animate-shake'
                    : 'bg-[#2A2D37] hover:bg-[#383C4A] active:translate-y-1 text-white'
                }`}
              >
                <span className="text-xs sm:text-sm font-black uppercase tracking-tight truncate mr-1.5">
                  {opt.text}
                </span>

                {opt.isSolved ? (
                  <CheckCircle2 className="w-4 h-4 text-[#00FF66] shrink-0" />
                ) : isWrong ? (
                  <AlertTriangle className="w-4 h-4 text-white shrink-0" />
                ) : (
                  <div className="w-3 h-3 border border-gray-500 bg-black shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
