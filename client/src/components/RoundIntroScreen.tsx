import React from 'react';
import { 
  Play, 
  Radio, 
  Zap, 
  BookOpen, 
  PhoneCall, 
  Layers, 
  Compass, 
  Trophy, 
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import { RoomState } from '../types';
import { sound } from '../soundEngine';

interface RoundIntroScreenProps {
  room: RoomState;
  currentSocketId: string;
  onConfirmStart: () => void;
}

interface MinigameBriefing {
  number: 1 | 2 | 3 | 4 | 5;
  title: string;
  subtitle: string;
  accentColor: string;
  summary: string;
  rules: { emoji: string; label: string; text: string }[];
}

const BRIEFINGS: Record<1 | 2 | 3 | 4 | 5, MinigameBriefing> = {
  1: {
    number: 1,
    title: 'REACCIÓN EN CADENA',
    subtitle: '6 ÓRDENES DE EMERGENCIA CONTRARRELOJ',
    accentColor: '#FFD600',
    summary: 'Coordinación rápida por voz. Todos tenéis los 4 mandos en pantalla, pero solo uno recibe el aviso de quién debe actuar.',
    rules: [
      {
        emoji: '🗣️',
        label: 'Díctalo en voz alta',
        text: 'En cada paso, a un único jugador le saldrá una orden amarilla indicando qué compañero debe accionar qué mando.'
      },
      {
        emoji: '🎛️',
        label: 'Ejecuta tu mando',
        text: 'Si escuchas tu nombre, acciona rápido el control pedido (Emergencia, Válvula 2s, Palanca al 100% o Bomba 5 toques).'
      },
      {
        emoji: '⚠️',
        label: 'No toques sin turno',
        text: 'Si pulsa otra persona o se acciona el mando equivocado, el reactor pierde estabilidad.'
      }
    ]
  },
  2: {
    number: 2,
    title: 'PROTOCOLO AZ-5',
    subtitle: 'MANUAL TÉCNICO Y VÁLVULAS DE PRESIÓN',
    accentColor: '#FF2A2A',
    summary: 'Información dividida entre Técnicos de Consola e Ingenieros de Manual.',
    rules: [
      {
        emoji: '🎛️',
        label: 'Técnicos de Consola',
        text: 'Ven el Color del Núcleo, la Presión (BAR) y los 4 interruptores (Alfa, Beta, Gamma, Delta), pero no saben cuáles encender.'
      },
      {
        emoji: '📖',
        label: 'Ingenieros de Manual',
        text: 'Tienen las reglas del manual. Preguntad al Técnico el color y la presión para indicarle qué válvulas conectar.'
      },
      {
        emoji: '⚡',
        label: 'Estabilizar el Núcleo',
        text: 'Cuando las válvulas correctas estén conectadas, el Técnico debe pulsar el botón rojo AZ-5.'
      }
    ]
  },
  3: {
    number: 3,
    title: 'LLAMADA DE MOSCÚ',
    subtitle: 'TRIVIA CON PREGUNTAS Y RESPUESTAS REPARTIDAS',
    accentColor: '#00F0FF',
    summary: 'Auditoría del Ministerio: las preguntas están en unos móviles y sus respuestas mezcladas en otros.',
    rules: [
      {
        emoji: '❓',
        label: 'Lee tus preguntas',
        text: 'Arriba verás las preguntas asignadas a tu pantalla. Léelas en voz alta para que todo tu equipo las escuche.'
      },
      {
        emoji: '🔘',
        label: 'Busca quién tiene la respuesta',
        text: 'Abajo cada jugador tiene botones con respuestas mezcladas (hay 3 opciones por pregunta: 1 correcta y 2 trampas).'
      },
      {
        emoji: '✅',
        label: 'Sin categorías repetidas',
        text: 'Cada pregunta es de un tipo distinto (año, país, persona, obra...). Pulsad todas las respuestas correctas para avanzar.'
      }
    ]
  },
  4: {
    number: 4,
    title: 'CINTA CLASIFICADORA',
    subtitle: 'CAOS EN CADENA DURANTE 30 SEGUNDOS',
    accentColor: '#00FF66',
    summary: 'Clasificad tantos materiales nucleares como podáis en 30 segundos pasándolos de móvil a móvil.',
    rules: [
      {
        emoji: '📦',
        label: 'Mira tu puesto asignado',
        text: 'Cada operario recoge un tipo de material, y a los extremos izquierdo y derecho de la fila hay contenedores especiales.'
      },
      {
        emoji: '⇄',
        label: 'Pasa o quédatelo',
        text: 'Si el objeto en tu cinta es de tu categoría, pulsa QUEDÁRSELO (o desliza abajo). Si es de otro puesto o contenedor, pásalo a IZQUIERDA o DERECHA.'
      },
      {
        emoji: '⏱️',
        label: 'Suministro continuo',
        text: 'Cada 3 segundos llegan nuevos objetos a todos. ¡No dejéis que se acumule la pila!'
      }
    ]
  },
  5: {
    number: 5,
    title: 'LABERINTO A CIEGAS',
    subtitle: 'SONDA ROBÓTICA EN SECTOR RADIACTIVO 6x6',
    accentColor: '#FFD600',
    summary: 'Uno o dos jugadores ven los sensores del mapa, mientras otros manejan los propulsores a ciegas.',
    rules: [
      {
        emoji: '📡',
        label: 'Operadores de Sensores',
        text: 'Ven en la cuadrícula 6x6 dónde están los Muros, las Fugas Radiactivas, la Llave de Cadmio y el Núcleo, pero no pueden mover la sonda.'
      },
      {
        emoji: '🕹️',
        label: 'Pilotos de Sonda',
        text: 'Tienen los botones de dirección (Norte, Sur, Este, Oeste), pero en su pantalla no ven los obstáculos.'
      },
      {
        emoji: '🔑',
        label: 'Misión en 2 pasos',
        text: 'Guiad al piloto primero hasta la Llave de Cadmio y después hasta la Meta (Núcleo) sin chocar con muros ni radiación.'
      }
    ]
  }
};

export const RoundIntroScreen: React.FC<RoundIntroScreenProps> = ({
  room,
  currentSocketId,
  onConfirmStart
}) => {
  const roundNum = room.upcomingRound || 1;
  const briefing = BRIEFINGS[roundNum];
  const allPlayersList = room.allPlayers || room.players;
  const isHost = allPlayersList.find(p => p.id === currentSocketId)?.isHost ?? false;

  const isCompetitive = room.gameMode === 'COMPETITIVE';
  const activeTeams = (room.teams || []).filter(t => t.playerIds.length > 0);
  const myTeam = activeTeams.find(t => t.playerIds.includes(currentSocketId));

  const getRoundIcon = (num: number) => {
    switch (num) {
      case 1: return <Zap className="w-7 h-7 text-black" />;
      case 2: return <BookOpen className="w-7 h-7 text-white" />;
      case 3: return <PhoneCall className="w-7 h-7 text-black" />;
      case 4: return <Layers className="w-7 h-7 text-black" />;
      case 5: return <Compass className="w-7 h-7 text-black" />;
      default: return <ShieldAlert className="w-7 h-7 text-black" />;
    }
  };

  const getPreviousRoundScore = (r: number) => {
    if (r === 1) return room.round1Scores;
    if (r === 2) return room.round2Scores;
    if (r === 3) return room.round3Scores;
    if (r === 4) return room.round4Scores;
    return room.round5Scores;
  };

  const getTeamRoundScore = (team: typeof activeTeams[0], r: number) => {
    if (r === 1) return team.round1Scores;
    if (r === 2) return team.round2Scores;
    if (r === 3) return team.round3Scores;
    if (r === 4) return team.round4Scores;
    return team.round5Scores;
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto p-3 sm:p-4 max-w-md mx-auto w-full flex flex-col justify-between gap-3 select-none">
      {/* Previous Round Score / Competitive Standings Banner (if coming from a finished round) */}
      {room.lastCompletedRound && (
        <div className="bg-[#1C1E24] border-3 border-[#00FF66] p-3 shadow-brutal shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-black uppercase text-[#00FF66] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              ¡PRUEBA {room.lastCompletedRound} COMPLETADA!
            </span>
            {!isCompetitive && (
              <span className="text-xs font-black bg-black px-2 py-0.5 border border-[#00FF66] text-white">
                +{getPreviousRoundScore(room.lastCompletedRound)} PTS (TOTAL: {room.totalScore})
              </span>
            )}
          </div>

          {isCompetitive && activeTeams.length > 0 && (
            <div className="flex flex-col gap-1.5 mt-1 pt-1.5 border-t border-gray-700">
              <div className="text-[11px] font-black uppercase text-gray-300 flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-[#FFD600]" />
                <span>CLASIFICACIÓN PROVISIONAL DE EQUIPOS:</span>
              </div>
              {[...activeTeams]
                .sort((a, b) => b.totalScore - a.totalScore)
                .map((team, idx) => (
                  <div
                    key={team.id}
                    className="flex items-center justify-between bg-black/80 px-2.5 py-1.5 border border-gray-700 text-xs"
                  >
                    <div className="flex items-center gap-2 font-black">
                      <span className="text-gray-400">#{idx + 1}</span>
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white shrink-0"
                        style={{ backgroundColor: team.color }}
                      />
                      <span className="text-white">{team.name}</span>
                    </div>
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-gray-400 text-[11px]">
                        (+{getTeamRoundScore(team, room.lastCompletedRound!)})
                      </span>
                      <span className="text-[#FFD600] font-black">{team.totalScore} PTS</span>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Main Minigame Briefing Card */}
      <div className="bg-[#1C1E24] border-4 border-black p-4 shadow-brutal flex-1 flex flex-col justify-between gap-3">
        <div>
          <div className="hazard-stripes w-full h-2.5 border border-black mb-3" />

          {/* Team badge in competitive mode */}
          {isCompetitive && myTeam && (
            <div
              className="mb-2.5 px-3 py-1.5 border-2 border-black flex items-center justify-between shadow-brutal-sm text-xs font-black uppercase"
              style={{ backgroundColor: myTeam.color, color: myTeam.color === '#FF2A2A' ? '#FFF' : '#000' }}
            >
              <span>⚔️ MODO COMPETITIVO // {myTeam.name}</span>
              <span>{myTeam.playerNames.join(', ')}</span>
            </div>
          )}

          {/* Header with Icon and Title */}
          <div className="flex items-center gap-3 mb-2">
            <div
              className="w-14 h-14 shrink-0 border-3 border-black flex items-center justify-center shadow-brutal-sm"
              style={{ backgroundColor: briefing.accentColor }}
            >
              {getRoundIcon(briefing.number)}
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider px-2 py-0.5 bg-black text-[#FFD600] border border-gray-700 inline-block mb-1">
                {room.singleRoundMode ? `MINIJUEGO #${briefing.number}` : `PRUEBA ${briefing.number} DE 5`}
              </span>
              <h1 className="text-xl sm:text-2xl font-black uppercase text-white leading-tight">
                {briefing.title}
              </h1>
              <p className="text-xs font-bold text-gray-300 uppercase">
                {briefing.subtitle}
              </p>
            </div>
          </div>

          <p className="text-sm text-gray-200 font-semibold leading-snug bg-black/60 p-2.5 border-l-4 border-[#FFD600] my-2">
            {briefing.summary}
          </p>

          {/* 3 Clear Rules */}
          <div className="mt-3 flex flex-col gap-2.5">
            <div className="text-xs font-black uppercase text-[#FFD600] tracking-wider">
              📋 NORMAS DEL MINIJUEGO:
            </div>
            {briefing.rules.map((rule, idx) => (
              <div
                key={idx}
                className="bg-[#242832] border-2 border-black p-3 shadow-brutal-sm flex items-start gap-3"
              >
                <span className="text-xl leading-none shrink-0 mt-0.5">{rule.emoji}</span>
                <div className="text-xs sm:text-sm leading-snug">
                  <span className="font-black text-white uppercase block mb-0.5">
                    {idx + 1}. {rule.label}
                  </span>
                  <span className="text-gray-200 font-medium">{rule.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Competitive note if applicable */}
        {isCompetitive && (
          <div className="bg-black/80 border border-gray-700 p-2 text-center text-xs text-[#00F0FF] font-bold">
            ⚔️ Todos los equipos jugaréis esta prueba a la vez. No se avanzará a la siguiente hasta que todos los equipos terminen.
          </div>
        )}
      </div>

      {/* Host Action Button / Waiting Box */}
      <div className="shrink-0">
        {isHost ? (
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              sound.playGeiger(4);
              onConfirmStart();
            }}
            className="w-full bg-[#FFD600] hover:bg-yellow-400 active:translate-y-1 text-black font-black uppercase py-4 px-4 border-4 border-black text-base tracking-wider flex items-center justify-center gap-2.5 shadow-brutal transition-all cursor-pointer"
          >
            <Play className="w-6 h-6 fill-black" />
            COMENZAR PRUEBA {briefing.number}
          </button>
        ) : (
          <div className="bg-[#1C1E24] border-3 border-black p-3.5 text-center shadow-brutal flex items-center justify-center gap-2.5">
            <Radio className="w-5 h-5 text-[#FFD600] animate-pulse shrink-0" />
            <span className="text-xs sm:text-sm font-black uppercase text-gray-200">
              Esperando a que el creador de la sala pulse COMENZAR...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
