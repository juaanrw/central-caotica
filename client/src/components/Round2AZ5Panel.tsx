import React from 'react';
import { 
  Gauge, 
  BookOpen, 
  Radio, 
  Zap,
  CheckCircle2
} from 'lucide-react';
import { RoomState } from '../types';
import { sound } from '../soundEngine';

interface Round2Props {
  room: RoomState;
  currentSocketId: string;
  onToggleSwitch: (switchName: 'alfa' | 'beta' | 'gamma' | 'delta') => void;
  onStabilizeAZ5: () => void;
}

export const Round2AZ5Panel: React.FC<Round2Props> = ({
  room,
  currentSocketId,
  onToggleSwitch,
  onStabilizeAZ5
}) => {
  const round2 = room.round2;
  if (!round2) return null;

  const me = room.players.find(p => p.id === currentSocketId);
  const myRole = me?.role || 'TECNICO_TOTAL';

  const isTecnicoTotal = myRole === 'TECNICO_TOTAL';
  const isTecnico1 = myRole === 'TECNICO_CONSOLA_1';
  const isTecnico2 = myRole === 'TECNICO_CONSOLA_2';
  const isIngenieroTotal = myRole === 'INGENIERO_TOTAL';
  const isIngenieroA = myRole === 'INGENIERO_A';
  const isIngenieroB = myRole === 'INGENIERO_B';

  const isDual = !!round2.dualConsoles;
  const isAnyTecnico = isTecnicoTotal || isTecnico1 || isTecnico2;
  const isAnyIngeniero = isIngenieroTotal || isIngenieroA || isIngenieroB;

  // Active console for dual mode
  const activeConsole = isDual && round2.dualConsoles
    ? (isTecnico1 ? round2.dualConsoles.console1 : isTecnico2 ? round2.dualConsoles.console2 : null)
    : null;

  const handleSwitchToggle = (sw: 'alfa' | 'beta' | 'gamma' | 'delta') => {
    sound.playClick();
    onToggleSwitch(sw);
  };

  const handleStabilize = () => {
    sound.playClick();
    sound.playGeiger(4);
    onStabilizeAZ5();
  };

  const getCoreColorClass = (color: 'ROJO' | 'AMBAR' | 'VERDE') => {
    return color === 'ROJO'
      ? 'bg-[#FF2A2A] text-white shadow-glow-red border-[#FF2A2A]'
      : color === 'AMBAR'
      ? 'bg-[#FF9900] text-black shadow-glow-yellow border-[#FF9900]'
      : 'bg-[#00FF66] text-black shadow-glow-green border-[#00FF66]';
  };

  // Role title helper
  const getRoleTitle = () => {
    switch (myRole) {
      case 'TECNICO_TOTAL': return 'TÉCNICO DE CONTROL PRINCIPAL';
      case 'TECNICO_CONSOLA_1': return 'TÉCNICO CONSOLA 1 (PRIMARIO)';
      case 'TECNICO_CONSOLA_2': return 'TÉCNICO CONSOLA 2 (SECUNDARIO)';
      case 'INGENIERO_TOTAL': return 'INGENIERO DE MANUAL GENERAL';
      case 'INGENIERO_A': return 'INGENIERO MANUAL (PARTE A: FASES)';
      case 'INGENIERO_B': return 'INGENIERO MANUAL (PARTE B: VÁLVULAS)';
      default: return 'OPERARIO DE TURNO';
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between p-3 max-w-md mx-auto w-full select-none overflow-y-auto">
      {/* Top Header */}
      <div className="bg-[#1C1E24] border-3 border-black p-2.5 shadow-brutal flex items-center justify-between">
        <div>
          <span className="text-[10px] text-[#FFD600] font-black uppercase tracking-wider block">
            PRUEBA 2: PROTOCOLO AZ-5
          </span>
          <span className="text-xs text-gray-300 font-bold">
            COORDINACIÓN ASIMÉTRICA ({room.players.length} OPERARIOS)
          </span>
        </div>
        <div className="px-2 py-0.5 border-2 border-black font-black text-[10px] uppercase shadow-brutal-sm bg-[#FFD600] text-black max-w-[155px] truncate">
          {getRoleTitle()}
        </div>
      </div>

      {/* Dual Consoles Global Status Indicator for 4 players */}
      {isDual && round2.dualConsoles && (
        <div className="my-1.5 grid grid-cols-2 gap-2 text-[10px] font-black uppercase">
          <div className={`p-1.5 border-2 border-black flex items-center justify-between ${
            round2.dualConsoles.console1.isStabilized ? 'bg-[#00FF66] text-black' : 'bg-[#1C1E24] text-gray-300'
          }`}>
            <span>CONSOLA 1:</span>
            <span>{round2.dualConsoles.console1.isStabilized ? '✅ ESTABILIZADA' : '🟡 PENDIENTE'}</span>
          </div>
          <div className={`p-1.5 border-2 border-black flex items-center justify-between ${
            round2.dualConsoles.console2.isStabilized ? 'bg-[#00FF66] text-black' : 'bg-[#1C1E24] text-gray-300'
          }`}>
            <span>CONSOLA 2:</span>
            <span>{round2.dualConsoles.console2.isStabilized ? '✅ ESTABILIZADA' : '🟡 PENDIENTE'}</span>
          </div>
        </div>
      )}

      {/* Bot Radio Advice Banner if present */}
      {room.botRadioMessage && (
        <div className="my-1 bg-[#2A2D37] border-2 border-[#00F0FF] p-2 text-xs text-[#00F0FF] shadow-brutal-sm flex items-start gap-1.5 animate-pulse">
          <Radio className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-tight font-bold">{room.botRadioMessage}</span>
        </div>
      )}

      {/* --- VISTAS DE TÉCNICOS (DUAL CONSOLES O CONSOLA ÚNICA) --- */}
      {isAnyTecnico && (
        <div className="my-1 flex-1 flex flex-col justify-between gap-2.5">
          {/* Telemetría: Si es dual, usa activeConsole; si no, usa round2 */}
          {(() => {
            const displayColor = activeConsole ? activeConsole.coreColor : round2.coreColor;
            const displayPressure = activeConsole ? activeConsole.pressure : round2.pressure;
            const displaySwitches = activeConsole ? activeConsole.currentSwitches : round2.currentSwitches;
            const isThisConsoleStabilized = activeConsole ? activeConsole.isStabilized : false;

            return (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {/* Core Color */}
                  <div className="bg-[#1C1E24] border-3 border-black p-2 text-center shadow-brutal">
                    <span className="text-[9px] uppercase font-bold text-gray-400 block mb-1">
                      ESTADO DEL NÚCLEO
                    </span>
                    <div className={`py-1 px-2 border-2 text-xs font-black uppercase tracking-widest ${getCoreColorClass(displayColor)}`}>
                      {displayColor}
                    </div>
                    <span className="text-[8px] text-gray-400 block mt-1">Dicta esto al Ingeniero A</span>
                  </div>

                  {/* Pressure Manometer */}
                  <div className="bg-[#1C1E24] border-3 border-black p-2 text-center shadow-brutal">
                    <span className="text-[9px] uppercase font-bold text-gray-400 block mb-1">
                      PRESIÓN EN BAR
                    </span>
                    <div className="flex items-center justify-center gap-1 text-[#00F0FF] font-black text-base font-mono">
                      <Gauge className="w-4 h-4" />
                      {displayPressure} BAR
                    </div>
                    <span className="text-[8px] text-gray-400 block mt-1">Dicta esto al Ingeniero B</span>
                  </div>
                </div>

                {/* Physical Switches */}
                <div className="bg-[#1C1E24] border-4 border-black p-3 shadow-brutal">
                  <div className="text-[10px] font-black uppercase text-gray-300 mb-2 flex items-center justify-between">
                    <span>
                      {isDual ? `TUS MANDOS: ${activeConsole?.title || 'TU CONSOLA'}` : 'TODAS LAS VÁLVULAS (ALFA / BETA / GAMMA / DELTA)'}
                    </span>
                    <span className="text-[#FFD600] text-[9px]">Sigue el manual</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {(['alfa', 'beta', 'gamma', 'delta'] as const).map((sw) => {
                      const isOn = displaySwitches[sw];

                      return (
                        <button
                          key={sw}
                          type="button"
                          disabled={isThisConsoleStabilized}
                          onClick={() => handleSwitchToggle(sw)}
                          className={`p-2.5 border-3 border-black font-black uppercase flex flex-col items-center justify-between shadow-brutal-sm transition-all ${
                            isThisConsoleStabilized
                              ? 'opacity-60 cursor-not-allowed bg-black/60 text-gray-500'
                              : isOn
                              ? 'bg-[#00FF66] text-black shadow-glow-green active:translate-y-1'
                              : 'bg-[#2A2D37] text-gray-400 active:translate-y-1'
                          }`}
                        >
                          <div className="text-xs font-black tracking-wider">
                            VÁLVULA {sw.toUpperCase()}
                          </div>
                          <div
                            className={`w-full mt-1.5 py-0.5 text-center text-[9px] font-black border border-black ${
                              isOn ? 'bg-black text-[#00FF66]' : 'bg-black/60 text-gray-500'
                            }`}
                          >
                            {isOn ? '● CONECTADA' : '○ DESCONECTADA'}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Big AZ-5 Stabilize Button */}
                {isThisConsoleStabilized ? (
                  <div className="bg-[#00FF66] border-4 border-black p-3 text-center text-black font-black text-sm uppercase shadow-brutal flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-5 h-5" />
                    ¡CONSOLA ESTABILIZADA! ESPERANDO A TU COMPAÑERO...
                  </div>
                ) : (
                  <div>
                    <div className="hazard-stripes-red w-full h-2 border border-black mb-1" />
                    <button
                      onClick={handleStabilize}
                      className="w-full bg-[#FF2A2A] hover:bg-red-600 active:scale-98 active:translate-y-1 text-white font-black uppercase py-3.5 px-3 border-4 border-black text-sm tracking-wider flex items-center justify-center gap-2 shadow-brutal transition-all"
                    >
                      <Zap className="w-5 h-5 fill-white animate-pulse" />
                      {isDual ? 'ESTABILIZAR MI CONSOLA' : 'DISPARAR PROTOCOLO AZ-5 (ESTABILIZAR)'}
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}

      {/* --- VISTAS DE INGENIEROS DE MANUAL --- */}
      {isAnyIngeniero && (
        <div className="my-1 flex-1 flex flex-col justify-between gap-2.5">
          {/* Banner depending on which engineer */}
          <div className="bg-[#FFD600] text-black border-4 border-black p-2.5 shadow-brutal text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase">
              <BookOpen className="w-4 h-4" />
              {isIngenieroTotal && 'MANUAL GENERAL DE ESTABILIZACIÓN'}
              {isIngenieroA && 'MANUAL PARTE A: MATRIZ DE FASES POR COLOR'}
              {isIngenieroB && 'MANUAL PARTE B: COMBINACIÓN DE VÁLVULAS'}
            </div>
            <p className="text-[11px] font-bold text-gray-900 mt-1 leading-tight">
              {isDual
                ? (isIngenieroA
                  ? '¡Hay 2 consolas independientes! Pregunta a Técnico 1 y Técnico 2 sus colores y diles qué fase corresponde a cada uno.'
                  : '¡Hay 2 consolas independientes! Con la Fase y Presión de cada consola, diles qué válvulas abrir a cada técnico.')
                : (isIngenieroTotal
                  ? 'Pregunta al Técnico su Presión y Color de Núcleo y ordénale las válvulas a conectar.'
                  : (isIngenieroA
                    ? '¡El Técnico tiene el Color de Núcleo! Pregúntaselo y grita la FASE al Ingeniero B.'
                    : '¡Pregunta al Ingeniero A la FASE y al Técnico la Presión, y di qué válvulas deben abrir!'))
              }
            </p>
          </div>

          {/* Rules Document Box */}
          <div className="bg-[#1C1E24] border-4 border-black p-3 shadow-brutal flex-1 overflow-y-auto">
            <div className="flex items-center justify-between text-[10px] uppercase font-bold text-gray-400 mb-2 border-b border-gray-700 pb-1">
              <span>DOCUMENTO TÉCNICO OFICIAL:</span>
              <span className="text-[#00FF66] font-mono">SECRETO DE ESTADO</span>
            </div>

            <div className="flex flex-col gap-2">
              {/* If Ingeniero Total (2 players) */}
              {isIngenieroTotal && round2.manualFull.map((ruleText, idx) => (
                <div key={idx} className="bg-black/70 border border-gray-700 p-2 text-[11px] font-mono leading-tight shadow-brutal-sm text-gray-200">
                  {ruleText}
                </div>
              ))}

              {/* If Ingeniero A (3-4 players) */}
              {isIngenieroA && round2.manualPartA.map((ruleText, idx) => (
                <div key={idx} className="bg-black/70 border border-gray-700 p-2 text-[11px] font-mono leading-tight shadow-brutal-sm text-[#FFD600]">
                  {ruleText}
                </div>
              ))}

              {/* If Ingeniero B (3-4 players) */}
              {isIngenieroB && round2.manualPartB.map((ruleText, idx) => (
                <div key={idx} className="bg-black/70 border border-gray-700 p-2 text-[11px] font-mono leading-tight shadow-brutal-sm text-[#00F0FF]">
                  {ruleText}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#2A2D37] border-2 border-gray-600 p-2 text-center text-xs text-gray-300 font-bold uppercase">
            🗣️ ¡Hablad en voz alta para triangular la información y estabilizar ambas consolas!
          </div>
        </div>
      )}
    </div>
  );
};

