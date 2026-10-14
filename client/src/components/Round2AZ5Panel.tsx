import React from 'react';
import { 
  Gauge, 
  BookOpen, 
  Radio, 
  Zap 
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
  const myRole = me?.role || 'TECNICO';
  const isTecnico = myRole === 'TECNICO';
  const isIngeniero = myRole === 'INGENIERO';

  const handleSwitchToggle = (sw: 'alfa' | 'beta' | 'gamma' | 'delta') => {
    sound.playClick();
    onToggleSwitch(sw);
  };

  const handleStabilize = () => {
    sound.playClick();
    sound.playGeiger(4);
    onStabilizeAZ5();
  };

  const coreColorClass =
    round2.coreColor === 'ROJO'
      ? 'bg-[#FF2A2A] text-white shadow-glow-red border-[#FF2A2A]'
      : round2.coreColor === 'AMBAR'
      ? 'bg-[#FF9900] text-black shadow-glow-yellow border-[#FF9900]'
      : 'bg-[#00FF66] text-black shadow-glow-green border-[#00FF66]';

  return (
    <div className="flex-1 flex flex-col justify-between p-3 max-w-md mx-auto w-full select-none overflow-y-auto">
      {/* Top Header */}
      <div className="bg-[#1C1E24] border-3 border-black p-2.5 shadow-brutal flex items-center justify-between">
        <div>
          <span className="text-[10px] text-[#FFD600] font-black uppercase tracking-wider block">
            PRUEBA 2: PROTOCOLO AZ-5
          </span>
          <span className="text-xs text-gray-300 font-bold">
            COORDINACIÓN ASIMÉTRICA
          </span>
        </div>
        <div className="px-2 py-0.5 border-2 border-black font-black text-xs uppercase shadow-brutal-sm bg-[#FFD600] text-black">
          {isTecnico ? 'TÉCNICO DE MANDOS' : 'INGENIERO DE MANUAL'}
        </div>
      </div>

      {/* Bot Radio Advice Banner if present */}
      {room.botRadioMessage && (
        <div className="my-2 bg-[#2A2D37] border-2 border-[#00F0FF] p-2 text-xs text-[#00F0FF] shadow-brutal-sm flex items-start gap-1.5 animate-pulse">
          <Radio className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-tight font-bold">{room.botRadioMessage}</span>
        </div>
      )}

      {/* TÉCNICO VIEW */}
      {isTecnico && (
        <div className="my-2 flex-1 flex flex-col justify-between gap-3">
          {/* Reactor telemetry readouts */}
          <div className="grid grid-cols-2 gap-2">
            {/* Core Color */}
            <div className="bg-[#1C1E24] border-3 border-black p-2.5 text-center shadow-brutal">
              <span className="text-[9px] uppercase font-bold text-gray-400 block mb-1">
                ESTADO DEL NÚCLEO
              </span>
              <div
                className={`py-1.5 px-2 border-2 text-xs font-black uppercase tracking-widest ${coreColorClass}`}
              >
                {round2.coreColor}
              </div>
            </div>

            {/* Pressure Manometer */}
            <div className="bg-[#1C1E24] border-3 border-black p-2.5 text-center shadow-brutal">
              <span className="text-[9px] uppercase font-bold text-gray-400 block mb-1">
                PRESIÓN PRIMARIA
              </span>
              <div className="flex items-center justify-center gap-1 text-[#00F0FF] font-black text-base font-mono">
                <Gauge className="w-4 h-4" />
                {round2.pressure} BAR
              </div>
            </div>
          </div>

          {/* 4 Physical Switches */}
          <div className="bg-[#1C1E24] border-4 border-black p-3 shadow-brutal">
            <div className="text-[10px] font-black uppercase text-gray-300 mb-2 flex items-center justify-between">
              <span>INTERRUPTORES DE VÁLVULAS</span>
              <span className="text-[#FFD600] text-[9px]">Consulta al Ingeniero</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {(['alfa', 'beta', 'gamma', 'delta'] as const).map((sw) => {
                const isOn = round2.currentSwitches[sw];
                return (
                  <button
                    key={sw}
                    type="button"
                    onClick={() => handleSwitchToggle(sw)}
                    className={`p-3 border-3 border-black font-black uppercase flex flex-col items-center justify-between shadow-brutal-sm transition-all active:translate-y-1 ${
                      isOn
                        ? 'bg-[#00FF66] text-black shadow-glow-green'
                        : 'bg-[#2A2D37] text-gray-400'
                    }`}
                  >
                    <div className="text-xs font-black tracking-widest">
                      VÁLVULA {sw.toUpperCase()}
                    </div>
                    <div
                      className={`w-full mt-2 py-1 text-center text-[10px] font-black border border-black ${
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
          <div>
            <div className="hazard-stripes-red w-full h-2 border border-black mb-1" />
            <button
              onClick={handleStabilize}
              className="w-full bg-[#FF2A2A] hover:bg-red-600 active:scale-98 active:translate-y-1 text-white font-black uppercase py-4 px-3 border-4 border-black text-sm tracking-wider flex items-center justify-center gap-2 shadow-brutal transition-all"
            >
              <Zap className="w-5 h-5 fill-white animate-pulse" />
              DISPARAR PROTOCOLO AZ-5 (ESTABILIZAR)
            </button>
          </div>
        </div>
      )}

      {/* INGENIERO VIEW */}
      {isIngeniero && (
        <div className="my-2 flex-1 flex flex-col justify-between gap-3">
          <div className="bg-[#FFD600] text-black border-4 border-black p-3 shadow-brutal text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs font-black uppercase">
              <BookOpen className="w-4 h-4" />
              MANUAL CONFIDENCIAL DE PROCEDIMIENTOS
            </div>
            <p className="text-[11px] font-bold text-gray-900 mt-1">
              ¡Tú tienes las reglas secretas! Pregunta al Técnico qué Presión y Color de Núcleo ve en sus instrumentos y ordénale qué válvulas conectar.
            </p>
          </div>

          {/* Rules Table */}
          <div className="bg-[#1C1E24] border-4 border-black p-3 shadow-brutal flex-1 overflow-y-auto">
            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-2">
              TABLA DE CONDICIONES OBLIGATORIAS:
            </span>
            <div className="flex flex-col gap-2">
              {round2.manualRules.map((ruleText, idx) => (
                <div
                  key={idx}
                  className="bg-black/70 border-2 border-gray-700 p-2 text-[11px] font-mono leading-tight shadow-brutal-sm"
                >
                  <span className="text-[#00F0FF] font-black mr-1">R-0{idx + 1}:</span>
                  <span className="text-gray-200">{ruleText}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#2A2D37] border-2 border-gray-600 p-2 text-center text-xs text-gray-300 font-bold uppercase">
            🗣️ Habla por el micrófono o en voz alta para coordinar el disparo del AZ-5.
          </div>
        </div>
      )}
    </div>
  );
};
