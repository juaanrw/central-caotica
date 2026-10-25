import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Award, 
  RotateCcw,
  Trophy
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

  const hasTeams = summary.teamRankings && summary.teamRankings.length > 0;

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 max-w-md mx-auto w-full select-none flex flex-col gap-3 pb-10">
      {/* Top Title Banner */}
      <div className="text-center mt-1">
        <div className="hazard-stripes w-full h-2 border border-black mb-2" />
        <h2 className="text-xs uppercase font-extrabold text-gray-300 tracking-widest">
          EXPEDIENTE CLASIFICADO // COMITÉ CENTRAL
        </h2>
        <h1 className="text-xl sm:text-2xl font-black text-[#FFD600] uppercase tracking-wider text-glow-yellow">
          {hasTeams ? 'RESULTADOS DEL TORNEO' : 'INFORME DE INVESTIGACIÓN'}
        </h1>
      </div>

      {/* Main Score & Rank Stamp */}
      <div className="bg-[#1C1E24] border-4 border-black p-4 shadow-brutal text-center relative overflow-hidden">
        {!hasTeams && (
          <>
            <div className="flex justify-between items-center text-xs text-gray-300 font-bold mb-1.5 border-b border-gray-700 pb-1.5">
              <span>PUNTUACIÓN TOTAL DEL TURNO</span>
              <span className="text-[#00FF66] font-mono text-base font-black">
                {summary.totalScore} / {room.singleRoundMode ? 1000 : 5000} PTS
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1 text-xs font-mono text-gray-200 py-1.5 border-b border-gray-700/60 text-center">
              <div>P1: <span className="text-[#00FF66] font-black">{room.round1Scores ?? 0}</span></div>
              <div>P2: <span className="text-[#00FF66] font-black">{room.round2Scores ?? 0}</span></div>
              <div>P3: <span className="text-[#00FF66] font-black">{room.round3Scores ?? 0}</span></div>
              <div>P4: <span className="text-[#00FF66] font-black">{room.round4Scores ?? 0}</span></div>
              <div>P5: <span className="text-[#00FF66] font-black">{room.round5Scores ?? 0}</span></div>
            </div>
          </>
        )}

        {/* Big Rank / Winner Title */}
        <div className="my-2">
          <div className="text-3xl mb-1">{summary.rankBadge}</div>
          <div className="text-lg font-black tracking-wider text-[#FFD600] uppercase text-glow-yellow">
            {summary.rankTitle}
          </div>
          <p className="text-xs sm:text-sm text-gray-200 font-medium mt-1.5 leading-relaxed">
            "{summary.rankSubtitle}"
          </p>
        </div>
      </div>

      {/* COMPETITIVE MODE: TEAM RANKINGS LEADERBOARD */}
      {hasTeams && summary.teamRankings && (
        <div className="bg-[#1C1E24] border-4 border-black p-3.5 shadow-brutal flex flex-col gap-2.5">
          <div className="flex items-center gap-1.5 text-xs font-black uppercase text-[#FFD600] border-b border-gray-700 pb-1.5">
            <Trophy className="w-4 h-4" />
            <span>CLASIFICACIÓN FINAL POR EQUIPOS:</span>
          </div>

          {summary.teamRankings.map((tr, index) => {
            const isWinner = index === 0;
            return (
              <div
                key={tr.teamId}
                className={`border-3 border-black p-3 shadow-brutal-sm ${
                  isWinner ? 'bg-[#2A2D37] ring-2 ring-[#FFD600]' : 'bg-black/70'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="px-2 py-0.5 text-xs font-black border border-black"
                      style={{
                        backgroundColor: tr.teamColor,
                        color: tr.teamColor === '#FF2A2A' ? '#FFF' : '#000'
                      }}
                    >
                      #{tr.rankPosition} {tr.teamName}
                    </span>
                    {isWinner && <span className="text-sm">🏆</span>}
                  </div>
                  <span className="text-base font-black text-[#00FF66] font-mono">
                    {tr.totalScore} PTS
                  </span>
                </div>

                <div className="text-xs text-gray-300 font-semibold mb-2">
                  Operarios: {tr.playerNames.join(', ')}
                </div>

                <div className="grid grid-cols-5 gap-1 text-[11px] font-mono bg-black/80 p-1.5 border border-gray-700 text-center">
                  <div>P1: <span className="text-[#FFD600] font-bold">{tr.round1Scores}</span></div>
                  <div>P2: <span className="text-[#FFD600] font-bold">{tr.round2Scores}</span></div>
                  <div>P3: <span className="text-[#FFD600] font-bold">{tr.round3Scores}</span></div>
                  <div>P4: <span className="text-[#FFD600] font-bold">{tr.round4Scores}</span></div>
                  <div>P5: <span className="text-[#FFD600] font-bold">{tr.round5Scores}</span></div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Viral Sarcastic Awards Cards */}
      <div>
        <div className="text-xs font-black uppercase text-gray-300 tracking-wider mb-1.5 flex items-center gap-1.5">
          <Award className="w-4 h-4 text-[#FFD600]" />
          <span>TÍTULOS Y MENCIONES DE HONOR:</span>
        </div>

        <div className="flex flex-col gap-2">
          {summary.awards.map((award, idx) => (
            <div
              key={idx}
              className="bg-[#2A2D37] border-3 border-black p-3 shadow-brutal-sm flex items-start gap-2.5"
            >
              <div className="text-2xl shrink-0 mt-0.5">{award.icon}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs sm:text-sm font-black uppercase text-[#FFD600]">
                    {award.title}
                  </span>
                  <span className="text-xs bg-black px-2 py-0.5 text-[#00F0FF] font-mono font-bold border border-gray-700">
                    {award.metric}
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-white mt-0.5">
                  Camarada: {award.playerName}
                </div>
                <p className="text-xs text-gray-300 leading-snug mt-1">
                  {award.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Telemetry Breakdown Table */}
      <div className="bg-[#1C1E24] border-3 border-black p-3 shadow-brutal">
        <span className="text-xs font-black uppercase text-gray-300 tracking-wider block mb-2">
          REGISTRO DE TELEMETRÍA INDIVIDUAL:
        </span>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-700 text-gray-300">
                <th className="pb-1.5">OPERARIO</th>
                <th className="pb-1.5 text-right">T. MEDIO</th>
                <th className="pb-1.5 text-right">ACIERTOS</th>
                <th className="pb-1.5 text-right text-red-400">FALLOS</th>
              </tr>
            </thead>
            <tbody>
              {summary.playerStats.map((p) => (
                <tr key={p.id} className="border-b border-gray-800/60">
                  <td className="py-1.5 text-white font-bold">
                    <div className="flex items-center gap-1.5">
                      {hasTeams && p.teamColor && (
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-white shrink-0"
                          style={{ backgroundColor: p.teamColor }}
                          title={p.teamName}
                        />
                      )}
                      <span>{p.name}</span>
                    </div>
                  </td>
                  <td className="py-1.5 text-right text-[#00F0FF] font-mono font-bold">
                    {p.avgReactionMs ? `${p.avgReactionMs}ms` : '-'}
                  </td>
                  <td className="py-1.5 text-right text-[#00FF66] font-mono font-bold">
                    {p.actionsCompleted}
                  </td>
                  <td className="py-1.5 text-right text-red-400 font-mono font-bold">
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
          className="w-full bg-[#FFD600] hover:bg-yellow-400 active:translate-y-1 text-black font-black uppercase py-3.5 px-4 border-4 border-black text-sm sm:text-base tracking-wider flex items-center justify-center gap-2 shadow-brutal transition-all"
        >
          <RotateCcw className="w-5 h-5 fill-black" />
          JUGAR OTRA PARTIDA (MISMA SALA)
        </button>
      </div>
    </div>
  );
};
