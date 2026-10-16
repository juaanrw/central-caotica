import React, { useState } from 'react';
import { Radiation, Play, Users, Shuffle, ShieldCheck } from 'lucide-react';
import { sound } from '../soundEngine';

interface JoinCreateScreenProps {
  playerName: string;
  setPlayerName: (name: string) => void;
  onCreateRoom: () => void;
  onJoinRoom: (code: string) => void;
  errorMessage?: string;
  isConnected?: boolean;
}

const SOVIET_NAMES = [
  'Dyatlov',
  'Akimov',
  'Toptunov',
  'Khodemchuk',
  'Legasov',
  'Scherbina',
  'Bryukhanov',
  'Fomin',
  'Yuvchenko',
  'Stolyarchuk',
  'Perevozchenko'
];

export const JoinCreateScreen: React.FC<JoinCreateScreenProps> = ({
  playerName,
  setPlayerName,
  onCreateRoom,
  onJoinRoom,
  errorMessage,
  isConnected = true
}) => {
  const [roomCodeInput, setRoomCodeInput] = useState('');
  const [activeTab, setActiveTab] = useState<'JOIN' | 'CREATE'>('CREATE');

  const randomizeName = () => {
    sound.playClick();
    const random = SOVIET_NAMES[Math.floor(Math.random() * SOVIET_NAMES.length)];
    setPlayerName(`Operario ${random}`);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    const validName = playerName.trim() || 'Operario Dyatlov';
    if (!playerName.trim()) {
      setPlayerName(validName);
    }
    onCreateRoom();
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();
    const validName = playerName.trim() || 'Operario Dyatlov';
    if (!playerName.trim()) {
      setPlayerName(validName);
    }
    if (roomCodeInput.trim().length >= 4) {
      onJoinRoom(roomCodeInput.trim().toUpperCase());
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-4 max-w-md mx-auto w-full overflow-y-auto">
      {/* Top Banner */}
      <div className="flex flex-col items-center text-center mt-1">
        <div className="hazard-stripes w-full h-3 border-2 border-black mb-3 shadow-brutal-sm" />
        
        <div className="relative inline-block mb-2">
          <div className="w-16 h-16 bg-[#FFD600] border-4 border-black rounded-full flex items-center justify-center shadow-brutal mx-auto">
            <Radiation className="w-10 h-10 text-black animate-spin" style={{ animationDuration: '10s' }} />
          </div>
          <span className="absolute -top-1 -right-2 bg-[#FF2A2A] text-white text-[9px] font-bold px-1.5 py-0.5 border-2 border-black uppercase shadow-brutal-sm">
            URGENTE
          </span>
        </div>

        <h1 className="text-2xl font-black tracking-wider uppercase text-[#FFD600] text-glow-yellow">
          CENTRAL CAÓTICA
        </h1>
        <p className="text-xs text-gray-400 uppercase tracking-widest mt-0.5">
          Simulador de Crisis Nuclear RBMK-1000
        </p>

        {!isConnected && (
          <div className="bg-[#FF9900]/20 border-2 border-[#FF9900] p-2 mt-2 text-xs text-[#FF9900] font-bold w-full animate-pulse text-center">
            ⚠️ Conectando al servidor WebSocket (puerto 3001)...
          </div>
        )}
      </div>

      {/* Form Card */}
      <div className="bg-[#1C1E24] border-4 border-black p-4 my-2 shadow-brutal flex flex-col gap-3">
        {/* Operator Name */}
        <div>
          <label className="block text-xs font-bold text-gray-300 uppercase mb-1.5">
            Nombre de Operario:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Ej. Operario Dyatlov"
              maxLength={16}
              className="flex-1 bg-black border-2 border-gray-600 px-3 py-2 text-sm text-[#00FF66] font-mono focus:outline-none focus:border-[#FFD600]"
            />
            <button
              type="button"
              onClick={randomizeName}
              className="bg-[#2A2D37] border-2 border-black px-2.5 py-2 hover:bg-[#3F4452] active:translate-y-0.5 text-[#FFD600] transition-all shadow-brutal-sm"
              title="Generar nombre aleatorio soviético"
            >
              <Shuffle className="w-4 h-4" />
            </button>
          </div>
        </div>


        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 border-t-2 border-gray-700 pt-2.5">
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('CREATE');
            }}
            className={`py-2 text-xs font-black uppercase tracking-wider border-2 border-black transition-all shadow-brutal-sm ${
              activeTab === 'CREATE'
                ? 'bg-[#FFD600] text-black -translate-y-0.5'
                : 'bg-[#2A2D37] text-gray-400'
            }`}
          >
            Crear Sala
          </button>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              setActiveTab('JOIN');
            }}
            className={`py-2 text-xs font-black uppercase tracking-wider border-2 border-black transition-all shadow-brutal-sm ${
              activeTab === 'JOIN'
                ? 'bg-[#00F0FF] text-black -translate-y-0.5'
                : 'bg-[#2A2D37] text-gray-400'
            }`}
          >
            Unirse a Sala
          </button>
        </div>

        {/* Create Mode */}
        {activeTab === 'CREATE' ? (
          <form onSubmit={handleCreate} className="flex flex-col gap-2.5">
            <button
              type="submit"
              className="w-full bg-[#FFD600] hover:bg-yellow-400 active:translate-y-1 text-black font-black uppercase py-3 px-4 border-4 border-black text-sm tracking-wider flex items-center justify-center gap-2 shadow-brutal transition-all"
            >
              <Play className="w-5 h-5 fill-black" />
              ABRIR SALA DE CONTROL
            </button>
          </form>
        ) : (
          /* Join Mode */
          <form onSubmit={handleJoin} className="flex flex-col gap-2.5">
            <div>
              <label className="block text-[11px] font-bold text-gray-300 uppercase mb-1">
                Código de 4 Letras:
              </label>
              <input
                type="text"
                value={roomCodeInput}
                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                placeholder="EJ: AZ5X"
                maxLength={4}
                className="w-full bg-black border-2 border-gray-600 px-3 py-1.5 text-center text-lg font-black tracking-widest text-[#00F0FF] font-mono uppercase focus:outline-none focus:border-[#00F0FF]"
              />
            </div>
            <button
              type="submit"
              disabled={roomCodeInput.trim().length < 4}
              className="w-full bg-[#00F0FF] hover:bg-cyan-300 disabled:opacity-40 disabled:cursor-not-allowed active:translate-y-1 text-black font-black uppercase py-3 px-4 border-4 border-black text-sm tracking-wider flex items-center justify-center gap-2 shadow-brutal transition-all"
            >
              <Users className="w-5 h-5" />
              CONECTAR AL TURNO
            </button>
          </form>
        )}

        {errorMessage && (
          <div className="bg-[#FF2A2A]/20 border-2 border-[#FF2A2A] p-2 text-xs text-[#FF2A2A] font-bold text-center">
            {errorMessage}
          </div>
        )}
      </div>

      {/* Bottom Footer Notice */}
      <div className="text-center text-[10px] text-gray-500 uppercase tracking-widest pb-1">
        <div className="flex items-center justify-center gap-1">
          <ShieldCheck className="w-3 h-3 text-[#00FF66]" /> PROTOCOLO DE TIEMPO REAL ACTIVO // PUERTO 3001
        </div>
      </div>
    </div>
  );
};
