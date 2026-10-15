import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Award, 
  RotateCcw 
} from 'lucide-react';
import { RoomState } from '../types';
import { sound } from '../soundEngine';

interface FinalReportProps {
  room: RoomState;
  currentSocketId?: string;
  onRestartGame: () => void;
}

export const FinalReportScreen: React.FC<FinalReportProps> = ({
  room,
  onRestartGame
}) => {
  const summary = room.summary;
  if (!summary) return null;

  useEffect(() => {
    sound.playSuccess();
    // Launch festive confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FFD600', '#FF2A2A', '#00FF66', '#00F0FF']
    });
  }, []);

  const handleRestart = () => {
    sound.playClick();
    onRestartGame();
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-3 max-w-md mx-auto w-full select-none flex flex-col gap-3 pb-10">
      {/* Top Title Banner */}
      <div className="text-center mt-1">
        <div className="hazard-stripes w-full h-2 border border-black mb-2" />
        <h2 className="text-xs uppercase font-extrabold text-gray-400 tracking-widest">
          EXPEDIENTE CLASIFICADO // COMITÉ CENTRAL
        </h2>
        <h1 className="text-xl font-black text-[#FFD600] uppercase tracking-wider text-glow-yellow">
          INFORME DE INVESTIGACIÓN
        </h1>
      </div>

      {/* Main Score & Rank Stamp */}
      <div className="my-2 bg-[#1C1E24] border-4 border-black p-3.5 shadow-brutal text-center relative overflow-hidden">
        <div className="flex justify-between items-center text-xs text-gray-400 font-bold mb-1 border-b border-gray-700 pb-1">
          <span>PUNTUACIÓN TOTAL DEL TURNO</span>
          <span className="text-[#00FF66] font-mono text-sm font-black">
            {summary.totalScore} / 4000 PTS
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1 text-[9px] font-mono text-gray-300 py-1 border-b border-gray-700/60 text-center">
          <div>P1: <span className="text-[#00FF66] font-bold">{room.round1Scores ?? 0}</span></div>
          <div>P2: <span className="text-[#00FF66] font-bold">{room.round2Scores ?? 0}</span></div>
          <div>P3: <span className="text-[#00FF66] font-bold">{room.round3Scores ?? 0}</span></div>
          <div>P4: <span className="text-[#00FF66] font-bold">{room.round4Scores ?? 0}</span></div>
        </div>

        {/* Big Rank Title */}
        <div className="my-2">
          <div className="text-2xl mb-1">{summary.rankBadge}</div>
          <div className="text-base font-black tracking-wider text-[#FFD600] uppercase text-glow-yellow">
            {summary.rankTitle}
          </div>
          <p className="text-xs text-gray-300 italic mt-1 leading-relaxed">
            "{summary.rankSubtitle}"
          </p>
        </div>
      </div>

      {/* Viral Sarcastic Awards Cards */}
      <div className="my-2">
        <div className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-1.5 flex items-center gap-1">
          <Award className="w-3.5 h-3.5 text-[#FFD600]" />
          <span>TÍTULOS Y MENCIONES DE HONOR:</span>
        </div>

        <div className="flex flex-col gap-2">
          {summary.awards.map((award, idx) => (
            <div
              key={idx}
              className="bg-[#2A2D37] border-3 border-black p-2.5 shadow-brutal-sm flex items-start gap-2.5"
            >
              <div className="text-2xl shrink-0 mt-0.5">{award.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-[#FFD600]">
                    {award.title}
                  </span>
                  <span className="text-[10px] bg-black px-1.5 py-0.2 text-[#00F0FF] font-mono font-bold border border-gray-700">
                    {award.metric}
                  </span>
                </div>
                <div className="text-xs font-bold text-white mt-0.5">
                  Camarada: {award.playerName}
                </div>
                <p className="text-[10px] text-gray-400 leading-tight mt-0.5">
                  {award.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Telemetry Breakdown Table */}
      <div className="my-2 bg-[#1C1E24] border-3 border-black p-2.5 shadow-brutal">
        <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block mb-1.5">
          REGISTRO DE TELEMETRÍA INDIVIDUAL:
        </span>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-[11px] font-mono">
            <thead>
              <tr className="border-b border-gray-700 text-gray-400">
                <th className="pb-1">OPERARIO</th>
                <th className="pb-1 text-right">T. MEDIO</th>
                <th className="pb-1 text-right">ACIERTOS</th>
                <th className="pb-1 text-right text-red-400">FALLOS</th>
              </tr>
            </thead>
            <tbody>
              {summary.playerStats.map((p) => (
                <tr key={p.id} className="border-b border-gray-800/60">
                  <td className="py-1 text-white font-bold truncate max-w-[100px]">
                    {p.name}
                  </td>
                  <td className="py-1 text-right text-[#00F0FF]">
                    {p.avgReactionMs ? `${p.avgReactionMs}ms` : '-'}
                  </td>
                  <td className="py-1 text-right text-[#00FF66]">
                    {p.actionsCompleted}
                  </td>
                  <td className="py-1 text-right text-red-400">
                    {p.mistakes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Play Again Button */}
      <div className="pt-1 pb-1">
        <button
          onClick={handleRestart}
          className="w-full bg-[#FFD600] hover:bg-yellow-400 active:translate-y-1 text-black font-black uppercase py-3.5 px-4 border-4 border-black text-sm tracking-wider flex items-center justify-center gap-2 shadow-brutal transition-all"
        >
          <RotateCcw className="w-5 h-5 fill-black" />
          JUGAR OTRA PARTIDA (MISMA SALA)
        </button>
      </div>
    </div>
  );
};
