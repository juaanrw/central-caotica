import React from 'react';
import { CheckCircle2, Clock, Trophy, Users } from 'lucide-react';
import { RoomState } from '../types';

interface TeamWaitingOverlayProps {
  room: RoomState;
  currentSocketId: string;
}

export const TeamWaitingOverlay: React.FC<TeamWaitingOverlayProps> = ({
  room,
  currentSocketId
}) => {
  const activeTeams = (room.teams || []).filter(t => t.playerIds.length > 0);
  const myTeam = activeTeams.find(t => t.playerIds.includes(currentSocketId));

  const getRoundNum = (): 1 | 2 | 3 | 4 | 5 => {
    if (room.phase === 'ROUND_2') return 2;
    if (room.phase === 'ROUND_3') return 3;
    if (room.phase === 'ROUND_4') return 4;
    if (room.phase === 'ROUND_5') return 5;
    return 1;
  };

  const rNum = getRoundNum();
  const getTeamRoundScore = (team: typeof activeTeams[0]) => {
    if (rNum === 1) return team.round1Scores;
    if (rNum === 2) return team.round2Scores;
    if (rNum === 3) return team.round3Scores;
    if (rNum === 4) return team.round4Scores;
    return team.round5Scores;
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-4 max-w-md mx-auto w-full flex flex-col justify-center gap-4 select-none">
      <div className="bg-[#1C1E24] border-4 border-[#00FF66] p-5 shadow-brutal text-center">
        <div className="w-16 h-16 bg-[#00FF66] text-black border-3 border-black rounded-full flex items-center justify-center mx-auto mb-3 shadow-brutal-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <span className="text-xs font-black uppercase tracking-widest text-[#00FF66] block">
          ¡PRUEBA {rNum} SUPERADA POR TU EQUIPO!
        </span>

        <h2 className="text-2xl font-black uppercase text-white mt-1">
          {myTeam?.name || 'TU EQUIPO'}
        </h2>

        {myTeam && (
          <div className="my-3 inline-block bg-black border-2 border-[#FFD600] px-4 py-2">
            <span className="text-xs text-gray-300 uppercase block font-bold">
              PUNTUACIÓN EN ESTA PRUEBA
            </span>
            <span className="text-2xl font-black text-[#FFD600]">
              +{getTeamRoundScore(myTeam)} PTS
            </span>
          </div>
        )}

        <p className="text-xs sm:text-sm text-gray-300 font-medium mt-1">
          Esperando a que terminen los demás equipos para pasar todos juntos al siguiente minijuego...
        </p>
      </div>

      {/* Live Status of All Teams */}
      <div className="bg-[#1C1E24] border-4 border-black p-4 shadow-brutal flex flex-col gap-2.5">
        <div className="flex items-center justify-between text-xs font-black uppercase text-[#FFD600] border-b border-gray-700 pb-2">
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4" /> ESTADO DE LOS EQUIPOS EN VIVO
          </span>
          <Trophy className="w-4 h-4" />
        </div>

        {activeTeams.map(team => {
          const isDone = team.currentRoundCompleted;
          return (
            <div
              key={team.id}
              className={`p-3 border-2 border-black flex items-center justify-between ${
                isDone ? 'bg-[#00FF66]/15 border-[#00FF66]' : 'bg-[#242832]'
              }`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full border border-white shrink-0"
                    style={{ backgroundColor: team.color }}
                  />
                  <span className="text-sm font-black text-white uppercase">
                    {team.name}
                  </span>
                </div>
                <div className="text-xs text-gray-300 mt-0.5">
                  {team.playerNames.join(', ')}
                </div>
              </div>

              {isDone ? (
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 bg-[#00FF66] text-black px-2 py-0.5 text-xs font-black uppercase border border-black">
                    <CheckCircle2 className="w-3.5 h-3.5" /> TERMINADO
                  </span>
                  <div className="text-xs font-black text-[#FFD600] mt-1">
                    +{getTeamRoundScore(team)} PTS (Total: {team.totalScore})
                  </div>
                </div>
              ) : (
                <div className="text-right">
                  <span className="inline-flex items-center gap-1 bg-[#FFD600] text-black px-2 py-0.5 text-xs font-black uppercase border border-black animate-pulse">
                    <Clock className="w-3.5 h-3.5" /> JUGANDO...
                  </span>
                  <div className="text-xs text-gray-300 mt-1 font-bold">
                    Estabilidad: {team.currentStability} PTS
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
