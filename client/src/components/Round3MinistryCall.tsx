import React, { useState } from 'react';
import { PhoneCall, CheckCircle2, HelpCircle, AlertTriangle } from 'lucide-react';
import { RoomState, QuestionAnswerType } from '../types';
import { sound } from '../soundEngine';

interface Round3Props {
  room: RoomState;
  currentSocketId: string;
  onSubmitAnswer: (optionId: string) => void;
}

const CATEGORY_LABELS: Record<QuestionAnswerType, string> = {
  YEAR: '📅 AÑO HISTÓRICO',
  PERSON: '👤 PERSONAJE',
  WORK: '🎨 OBRA / LIBRO / ARTE',
  CITY: '🏙️ CIUDAD / CAPITAL',
  COUNTRY: '🌍 PAÍS',
  SCIENCE: '🔬 CIENCIA',
  NUMBER: '🔢 CANTIDAD / NÚMERO',
  NATURE: '🌿 NATURALEZA',
  COLOR: '🎨 COLOR'
};

export const Round3MinistryCall: React.FC<Round3Props> = ({
  room,
  currentSocketId,
  onSubmitAnswer
}) => {
  const round3 = room.round3;
  if (!round3) return null;

  const [wrongOptionId, setWrongOptionId] = useState<string | null>(null);

  const botIds = new Set(room.players.filter(p => p.isBot).map(p => p.id));

  // Questions assigned to this player's screen (plus any questions held by bots so humans can read them)
  const myQuestions = round3.questions.filter(
    q => q.assignedPlayerId === currentSocketId || botIds.has(q.assignedPlayerId)
  );
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
    <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 max-w-md mx-auto w-full select-none flex flex-col justify-between gap-3">
      {/* 1. Top Header & Global Progress */}
      <div className="flex flex-col gap-2 shrink-0">
        <div className="bg-[#1C1E24] border-3 border-black p-2.5 shadow-brutal flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-[#FF2A2A] text-white p-2 border-2 border-black animate-pulse shrink-0">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs text-[#FFD600] font-black uppercase tracking-wider block leading-none">
                PRUEBA 3: LLAMADA DE MOSCÚ
              </span>
              <span className="text-xs text-gray-200 font-bold mt-0.5 block">
                PREGUNTAS Y RESPUESTAS REPARTIDAS
              </span>
            </div>
          </div>

          <div className="bg-black px-2.5 py-1.5 border-2 border-[#00FF66] text-xs font-black text-[#00FF66] shrink-0">
            {solvedCount}/{totalQuestions} HECHAS
          </div>
        </div>

        {/* Global questions status indicator */}
        <div className="bg-black/90 border-2 border-black p-2 flex items-center justify-between gap-2 shadow-brutal-sm">
          <div className="flex items-center gap-1.5">
            {round3.questions.map((q, idx) => (
              <div
                key={q.id}
                className={`w-7 h-7 border-2 border-black flex items-center justify-center text-xs font-black ${
                  q.isSolved
                    ? 'bg-[#00FF66] text-black shadow-glow-green'
                    : 'bg-[#2A2D37] text-gray-300'
                }`}
                title={q.isSolved ? `Resuelta por ${q.solvedByPlayerName}` : 'Pendiente'}
              >
                {idx + 1}
              </div>
            ))}
          </div>

          <div className="text-xs text-gray-200 uppercase font-black text-right">
            Progreso: <span className="text-[#00FF66]">{progressPercent}%</span>
          </div>
        </div>
      </div>

      {/* 2. Questions Assigned to My Terminal */}
      <div className="flex flex-col gap-2 shrink-0">
        <div className="flex items-center justify-between text-xs uppercase border-b-2 border-gray-700 pb-1.5">
          <span className="flex items-center gap-1.5 font-black text-[#FFD600]">
            <HelpCircle className="w-4 h-4 shrink-0" />
            PREGUNTAS EN TU PANTALLA ({myQuestions.length}):
          </span>
          <span className="text-[11px] text-white bg-[#FF2A2A] px-2 py-0.5 border border-black font-black">
            ¡LÉELAS EN VOZ ALTA!
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {myQuestions.length > 0 ? (
            myQuestions.map((q, qIndex) => {
              const isFromBot = q.assignedPlayerId !== currentSocketId;
              const botOwner = isFromBot
                ? room.players.find(p => p.id === q.assignedPlayerId)?.name
                : null;

              return (
                <div
                  key={q.id}
                  className={`p-3.5 border-3 transition-all ${
                    q.isSolved
                      ? 'bg-[#00FF66]/15 border-[#00FF66]'
                      : 'bg-[#222631] border-black border-l-8 border-l-[#FFD600] shadow-brutal'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                    <span className="text-xs bg-black text-[#FFD600] px-2.5 py-0.5 border border-gray-600 uppercase font-black">
                      {CATEGORY_LABELS[q.type] || `PREGUNTA ${qIndex + 1}`}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isFromBot && (
                        <span className="text-[10px] bg-[#00F0FF] text-black px-2 py-0.5 font-black uppercase border border-black">
                          🤖 {botOwner || 'BOT'}
                        </span>
                      )}
                      {q.isSolved ? (
                        <span className="text-xs text-black bg-[#00FF66] font-black flex items-center gap-1 px-2 py-0.5 border border-black">
                          <CheckCircle2 className="w-3.5 h-3.5" /> RESUELTA
                        </span>
                      ) : (
                        <span className="text-[11px] bg-[#FF2A2A] text-white px-2 py-0.5 font-black uppercase border border-black">
                          PENDIENTE
                        </span>
                      )}
                    </div>
                  </div>

                  <p
                    className={`text-base sm:text-lg font-extrabold leading-snug break-words ${
                      q.isSolved ? 'text-gray-300 line-through' : 'text-white'
                    }`}
                  >
                    {q.prompt}
                  </p>

                  {q.isSolved && q.solvedByPlayerName && (
                    <div className="text-xs sm:text-sm text-[#00FF66] mt-2 pt-2 border-t border-gray-600 font-bold">
                      ✅ Respuesta: <span className="font-black text-white">{q.correctAnswerText}</span> ({q.solvedByPlayerName})
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="p-4 text-center text-sm text-gray-200 font-bold bg-[#222631] border-2 border-gray-600 shadow-brutal-sm">
              📻 Tus compañeros tienen las preguntas en sus pantallas. ¡Escúchales y busca las respuestas en tus botones!
            </div>
          )}
        </div>
      </div>

      {/* 3. Answer Buttons Pool Assigned to My Terminal */}
      <div className="shrink-0 flex flex-col gap-2 pt-2 border-t-2 border-black">
        <div className="flex items-center justify-between text-xs uppercase">
          <span className="font-black text-[#00F0FF]">
            BOTONES DE RESPUESTA EN TU MÓVIL ({myOptions.length}):
          </span>
          <span className="text-[11px] text-gray-300 font-bold">PULSA LA CORRECTA</span>
        </div>

        <div
          className={`grid gap-2 ${
            myOptions.length <= 3 ? 'grid-cols-1' : 'grid-cols-2'
          }`}
        >
          {myOptions.map((opt) => {
            const isWrong = wrongOptionId === opt.id;

            return (
              <button
                key={opt.id}
                type="button"
                disabled={opt.isSolved}
                onClick={() => handleOptionClick(opt.id, opt.isCorrect, opt.isSolved)}
                className={`py-3 px-3 border-3 border-black text-left flex items-center justify-between gap-2 transition-all shadow-brutal-sm min-h-[54px] cursor-pointer ${
                  opt.isSolved
                    ? 'bg-[#00FF66]/20 border-[#00FF66] text-[#00FF66] opacity-80 cursor-not-allowed'
                    : isWrong
                    ? 'bg-[#FF2A2A] text-white animate-shake'
                    : 'bg-[#2A2D37] hover:bg-[#383C4A] active:translate-y-1 text-white'
                }`}
              >
                <span className="text-sm sm:text-base font-extrabold leading-tight break-words flex-1">
                  {opt.text}
                </span>

                {opt.isSolved ? (
                  <CheckCircle2 className="w-4 h-4 text-[#00FF66] shrink-0" />
                ) : isWrong ? (
                  <AlertTriangle className="w-4 h-4 text-white shrink-0" />
                ) : (
                  <div className="w-3.5 h-3.5 border-2 border-gray-400 bg-black shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
