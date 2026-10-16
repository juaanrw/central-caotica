import React from 'react';
import {
  Compass,
  Radiation,
  ShieldAlert,
  KeyRound,
  Crosshair,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Radio,
  Lock,
  Unlock,
  BrickWall
} from 'lucide-react';
import { RoomState, MazeDirection, MazeRole } from '../types';
import { sound } from '../soundEngine';

interface Round5Props {
  room: RoomState;
  currentSocketId: string;
  onMazeMove: (direction: MazeDirection) => void;
}

export const Round5BlindMaze: React.FC<Round5Props> = ({
  room,
  currentSocketId,
  onMazeMove
}) => {
  const r5 = room.round5;
  if (!r5) return null;

  const myRole: MazeRole = r5.playerRoles[currentSocketId] || 'PILOTO_TOTAL';

  const isCartografoTotal = myRole === 'CARTOGRAFO_TOTAL';
  const isCartografoMuros = myRole === 'CARTOGRAFO_MUROS';
  const isEscanerRadiacion = myRole === 'ESCANER_RADIACION';
  const isAnyRadar = isCartografoTotal || isCartografoMuros || isEscanerRadiacion;

  const isPilotoTotal = myRole === 'PILOTO_TOTAL';
  const isPilotoVertical = myRole === 'PILOTO_VERTICAL';
  const isPilotoHorizontal = myRole === 'PILOTO_HORIZONTAL';
  const isAnyPiloto = isPilotoTotal || isPilotoVertical || isPilotoHorizontal;

  // Visibility permissions on the 6x6 grid
  const canSeeWalls = isCartografoTotal || isCartografoMuros;
  const canSeeKey = isCartografoTotal || isCartografoMuros;
  const canSeeTraps = isCartografoTotal || isEscanerRadiacion;
  const canSeeGoal = isCartografoTotal || isEscanerRadiacion;

  const getRoleTitle = (): string => {
    switch (myRole) {
      case 'CARTOGRAFO_TOTAL':
        return 'CARTÓGRAFO DE PLANOS';
      case 'CARTOGRAFO_MUROS':
        return 'ESCÁNER ESTRUCTURAL (MUROS)';
      case 'ESCANER_RADIACION':
        return 'DETECTOR GEIGER (RADIACIÓN)';
      case 'PILOTO_TOTAL':
        return 'PILOTO DE SONDA (MANDOS)';
      case 'PILOTO_VERTICAL':
        return 'PROPULSOR VERTICAL (N/S)';
      case 'PILOTO_HORIZONTAL':
        return 'PROPULSOR HORIZONTAL (E/O)';
    }
  };

  const handleMoveClick = (dir: MazeDirection) => {
    sound.playClick();
    onMazeMove(dir);
  };

  const gridRows = Array.from({ length: r5.gridSize }, (_, i) => i);
  const gridCols = Array.from({ length: r5.gridSize }, (_, i) => i);

  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between p-3 max-w-md mx-auto w-full select-none overflow-y-auto gap-2">
      {/* 1. Top Header & Role Badge */}
      <div className="bg-[#1C1E24] border-3 border-black p-2.5 shadow-brutal flex items-center justify-between shrink-0">
        <div>
          <span className="text-[10px] text-[#00F0FF] font-black uppercase tracking-wider block leading-none">
            PRUEBA 5: LABERINTO A CIEGAS
          </span>
          <span className="text-xs text-gray-200 font-bold mt-0.5 block">
            SONDA LIQUIDADORA RBMK
          </span>
        </div>
        <div className="px-2 py-1 border-2 border-black font-black text-[9px] uppercase shadow-brutal-sm bg-[#FFD600] text-black max-w-[170px] leading-tight break-words text-right">
          {getRoleTitle()}
        </div>
      </div>

      {/* 2. Mission Phase & Live Coordinates Bar */}
      <div className="grid grid-cols-2 gap-1.5 shrink-0">
        <div className={`p-1.5 border-2 border-black flex items-center gap-1.5 shadow-brutal-sm ${
          r5.hasKey ? 'bg-[#00FF66]/20 border-[#00FF66] text-[#00FF66]' : 'bg-[#1C1E24] text-[#FFD600]'
        }`}>
          {r5.hasKey ? <Unlock className="w-4 h-4 shrink-0" /> : <Lock className="w-4 h-4 shrink-0" />}
          <div className="min-w-0">
            <div className="text-[8px] font-mono uppercase text-gray-400 leading-none">ESTADO COMPUERTA</div>
            <div className="text-[10px] font-black uppercase truncate">
              {r5.hasKey ? 'PASO 2: IR AL NÚCLEO' : 'PASO 1: BUSCAR LLAVE'}
            </div>
          </div>
        </div>

        <div className="p-1.5 bg-[#1C1E24] border-2 border-black flex items-center justify-between shadow-brutal-sm">
          <div>
            <div className="text-[8px] font-mono uppercase text-gray-400 leading-none">POSICIÓN SONDA</div>
            <div className="text-xs font-mono font-black text-[#00F0FF]">
              FILA {r5.probePos.row + 1} · COL {r5.probePos.col + 1}
            </div>
          </div>
          <Compass className="w-4 h-4 text-[#00F0FF] animate-spin" style={{ animationDuration: '6s' }} />
        </div>
      </div>

      {/* 3. Telemetry Event Feed */}
      {r5.lastEventMessage && (
        <div className={`px-2.5 py-1.5 border-2 border-black text-[10px] font-mono font-bold shadow-brutal-sm shrink-0 ${
          r5.lastEventStatus === 'ERROR'
            ? 'bg-[#FF2A2A] text-white animate-pulse'
            : r5.lastEventStatus === 'SUCCESS'
            ? 'bg-[#00FF66] text-black'
            : 'bg-black/90 text-gray-300 border-gray-700'
        }`}>
          {r5.lastEventMessage}
        </div>
      )}

      {/* 4. Tactical 6x6 Grid (Full/Partial for Radar, Blind Breadcrumb for Pilot) */}
      <div className="bg-[#1C1E24] border-4 border-black p-2.5 shadow-brutal flex flex-col items-center justify-center shrink-0">
        <div className="w-full flex items-center justify-between text-[9px] font-mono text-gray-400 mb-1.5 pb-1 border-b border-gray-800">
          <span className="font-bold text-[#FFD600]">
            {isAnyRadar ? 'MONITOR DE SENSORES DEL SECTOR' : 'SONAR DE POSICIÓN (SIN VISIÓN DE OBSTÁCULOS)'}
          </span>
          <span>6x6 SECTORES</span>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-7 gap-1 w-full max-w-[290px] mb-1">
          <div className="text-[9px] font-mono text-gray-500 flex items-center justify-center font-bold">F/C</div>
          {gridCols.map(c => (
            <div key={c} className="text-[10px] font-mono font-black text-center text-gray-400 bg-black/50 py-0.5 border border-gray-800">
              C{c + 1}
            </div>
          ))}
        </div>

        {/* Grid rows */}
        <div className="flex flex-col gap-1 w-full max-w-[290px]">
          {gridRows.map(r => (
            <div key={r} className="grid grid-cols-7 gap-1 items-center">
              {/* Row label */}
              <div className="text-[10px] font-mono font-black text-center text-gray-400 bg-black/50 py-2 border border-gray-800">
                F{r + 1}
              </div>

              {/* Cells */}
              {gridCols.map(c => {
                const isProbe = r5.probePos.row === r && r5.probePos.col === c;
                const isStart = r5.startPos.row === r && r5.startPos.col === c;
                const isWall = canSeeWalls && r5.walls.some(w => w.row === r && w.col === c);
                const isTrap = canSeeTraps && r5.traps.some(t => t.row === r && t.col === c);
                const isKey = canSeeKey && !r5.hasKey && r5.keyPos.row === r && r5.keyPos.col === c;
                const isGoal = canSeeGoal && r5.goalPos.row === r && r5.goalPos.col === c;
                const isVisited = r5.visitedCells.some(v => v.row === r && v.col === c);

                let cellStyle = 'bg-[#121316] border-gray-800 text-gray-600';
                let content: React.ReactNode = <span className="text-[8px] opacity-30">·</span>;

                if (isWall) {
                  cellStyle = 'bg-gray-700 border-black text-gray-200';
                  content = <BrickWall className="w-4 h-4 text-gray-300" />;
                } else if (isTrap) {
                  cellStyle = 'bg-[#FF2A2A]/25 border-[#FF2A2A] text-[#FF2A2A]';
                  content = <Radiation className="w-4 h-4 text-[#FF2A2A] animate-pulse" />;
                } else if (isKey) {
                  cellStyle = 'bg-[#FFD600]/25 border-[#FFD600] text-[#FFD600]';
                  content = <KeyRound className="w-4 h-4 text-[#FFD600] animate-bounce" />;
                } else if (isGoal) {
                  cellStyle = r5.hasKey
                    ? 'bg-[#00FF66]/30 border-[#00FF66] text-[#00FF66]'
                    : 'bg-orange-500/20 border-orange-500 text-orange-400';
                  content = <Crosshair className="w-4 h-4" />;
                } else if (isVisited) {
                  cellStyle = 'bg-[#00F0FF]/10 border-[#00F0FF]/40 text-[#00F0FF]';
                  content = <span className="text-[9px] font-bold">●</span>;
                } else if (isStart) {
                  content = <span className="text-[8px] font-mono text-gray-400">INI</span>;
                }

                if (isProbe) {
                  cellStyle = 'bg-[#00F0FF] border-2 border-white text-black shadow-glow';
                  content = <span className="text-[10px] font-black">🤖</span>;
                }

                return (
                  <div
                    key={c}
                    className={`aspect-square border flex items-center justify-center transition-all ${cellStyle}`}
                  >
                    {content}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sensor Legend */}
        <div className="w-full mt-2 pt-1.5 border-t border-gray-800 flex flex-wrap items-center justify-center gap-2 text-[9px] font-mono text-gray-300">
          <span className="flex items-center gap-1">
            <span className="inline-block w-2.5 h-2.5 bg-[#00F0FF] border border-white" /> SONDA
          </span>
          {canSeeWalls && (
            <span className="flex items-center gap-1 text-gray-300">
              <BrickWall className="w-3 h-3" /> MURO
            </span>
          )}
          {canSeeKey && (
            <span className="flex items-center gap-1 text-[#FFD600]">
              <KeyRound className="w-3 h-3" /> LLAVE CADMIO
            </span>
          )}
          {canSeeTraps && (
            <span className="flex items-center gap-1 text-[#FF2A2A]">
              <Radiation className="w-3 h-3" /> FUGA RADIACTIVA
            </span>
          )}
          {canSeeGoal && (
            <span className="flex items-center gap-1 text-[#00FF66]">
              <Crosshair className="w-3 h-3" /> META (NÚCLEO)
            </span>
          )}
        </div>
      </div>

      {/* 5. Bottom Controls for Pilots OR Sensor Notice for Radar Operators */}
      {isAnyPiloto ? (
        <div className="bg-[#1C1E24] border-4 border-black p-2.5 shadow-brutal shrink-0">
          {isPilotoTotal && (
            <div className="grid grid-cols-3 gap-1.5 max-w-[260px] mx-auto">
              <div />
              <button
                type="button"
                onClick={() => handleMoveClick('UP')}
                className="p-3 bg-[#FFD600] hover:bg-yellow-400 active:translate-y-1 text-black border-3 border-black shadow-brutal-sm flex flex-col items-center justify-center font-black"
              >
                <ArrowUp className="w-5 h-5 stroke-[3]" />
                <span className="text-[9px] mt-0.5">NORTE</span>
              </button>
              <div />

              <button
                type="button"
                onClick={() => handleMoveClick('LEFT')}
                className="p-3 bg-[#2A2D37] hover:bg-[#383C4A] active:translate-y-1 text-white border-3 border-black shadow-brutal-sm flex flex-col items-center justify-center font-black"
              >
                <ArrowLeft className="w-5 h-5 stroke-[3] text-[#00F0FF]" />
                <span className="text-[9px] mt-0.5">OESTE</span>
              </button>

              <button
                type="button"
                onClick={() => handleMoveClick('DOWN')}
                className="p-3 bg-[#FFD600] hover:bg-yellow-400 active:translate-y-1 text-black border-3 border-black shadow-brutal-sm flex flex-col items-center justify-center font-black"
              >
                <ArrowDown className="w-5 h-5 stroke-[3]" />
                <span className="text-[9px] mt-0.5">SUR</span>
              </button>

              <button
                type="button"
                onClick={() => handleMoveClick('RIGHT')}
                className="p-3 bg-[#2A2D37] hover:bg-[#383C4A] active:translate-y-1 text-white border-3 border-black shadow-brutal-sm flex flex-col items-center justify-center font-black"
              >
                <ArrowRight className="w-5 h-5 stroke-[3] text-[#00F0FF]" />
                <span className="text-[9px] mt-0.5">ESTE</span>
              </button>
            </div>
          )}

          {isPilotoVertical && (
            <div className="flex flex-col gap-2">
              <div className="text-[9px] font-mono text-center text-[#FFD600] uppercase font-bold">
                MANDOS DE PROPULSIÓN VERTICAL (FILAS)
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleMoveClick('UP')}
                  className="p-3 bg-[#FFD600] hover:bg-yellow-400 active:translate-y-1 text-black border-3 border-black shadow-brutal-sm flex items-center justify-center gap-2 font-black text-xs uppercase"
                >
                  <ArrowUp className="w-5 h-5 stroke-[3]" />
                  <span>SUBIR (NORTE)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveClick('DOWN')}
                  className="p-3 bg-[#FFD600] hover:bg-yellow-400 active:translate-y-1 text-black border-3 border-black shadow-brutal-sm flex items-center justify-center gap-2 font-black text-xs uppercase"
                >
                  <ArrowDown className="w-5 h-5 stroke-[3]" />
                  <span>BAJAR (SUR)</span>
                </button>
              </div>
            </div>
          )}

          {isPilotoHorizontal && (
            <div className="flex flex-col gap-2">
              <div className="text-[9px] font-mono text-center text-[#00F0FF] uppercase font-bold">
                MANDOS DE PROPULSIÓN HORIZONTAL (COLUMNAS)
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleMoveClick('LEFT')}
                  className="p-3 bg-[#00F0FF] hover:bg-cyan-300 active:translate-y-1 text-black border-3 border-black shadow-brutal-sm flex items-center justify-center gap-2 font-black text-xs uppercase"
                >
                  <ArrowLeft className="w-5 h-5 stroke-[3]" />
                  <span>IZQUIERDA (OESTE)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveClick('RIGHT')}
                  className="p-3 bg-[#00F0FF] hover:bg-cyan-300 active:translate-y-1 text-black border-3 border-black shadow-brutal-sm flex items-center justify-center gap-2 font-black text-xs uppercase"
                >
                  <span>DERECHA (ESTE)</span>
                  <ArrowRight className="w-5 h-5 stroke-[3]" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-[#121316] border-2 border-gray-700 p-2.5 text-center shrink-0">
          <div className="flex items-center justify-center gap-1.5 text-[10px] font-black uppercase text-[#FFD600]">
            <ShieldAlert className="w-4 h-4" />
            {isCartografoTotal && 'TERMINAL DE CARTOGRAFÍA COMPLETA (SIN MANDOS DE PROPULSIÓN)'}
            {isCartografoMuros && 'SENSOR PARCIAL: SOLO MUROS Y LLAVE (SIN LECTURA DE RADIACIÓN)'}
            {isEscanerRadiacion && 'SENSOR PARCIAL: SOLO FUGAS RADIACTIVAS Y META (SIN LECTURA DE MUROS)'}
          </div>
        </div>
      )}

      {/* Bot Intercom Banner */}
      {room.botRadioMessage && (
        <div className="bg-black/90 border border-[#00F0FF] px-2.5 py-1.5 text-[10px] text-[#00F0FF] font-mono flex items-center gap-1.5 shrink-0">
          <Radio className="w-3.5 h-3.5 shrink-0 animate-pulse" />
          <span className="truncate">{room.botRadioMessage}</span>
        </div>
      )}
    </div>
  );
};
