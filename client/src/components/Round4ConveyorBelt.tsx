import React, { useState, useRef } from 'react';
import { 
  Radiation, 
  Trash2, 
  Droplets, 
  Shield, 
  Flame, 
  Zap, 
  ArrowLeft, 
  ArrowRight, 
  Inbox, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Layers
} from 'lucide-react';
import { RoomState, ConveyorItem } from '../types';
import { sound } from '../soundEngine';

interface Round4Props {
  room: RoomState;
  currentSocketId: string;
  onConveyorAction: (action: 'PASS_LEFT' | 'PASS_RIGHT' | 'CLAIM') => void;
}

export const Round4ConveyorBelt: React.FC<Round4Props> = ({
  room,
  currentSocketId,
  onConveyorAction
}) => {
  const round4 = room.round4;
  if (!round4) return null;

  const [animClass, setAnimClass] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<{ text: string; isCorrect: boolean } | null>(null);

  // Touch gesture coordinates
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  // My station & stations topology
  const stations = round4.stations;
  const myIndex = stations.findIndex(s => s.playerId === currentSocketId);
  const myStation = stations[myIndex];

  const leftNeighbor = myIndex > 0 ? stations[myIndex - 1] : null;
  const rightNeighbor = myIndex >= 0 && myIndex < stations.length - 1 ? stations[myIndex + 1] : null;

  // Player's personal item queue
  const myQueue: ConveyorItem[] = round4.playerQueues?.[currentSocketId] || [];
  const currentItem = myQueue[0];

  // Helper icon renderer
  const renderIcon = (name: string, className = "w-5 h-5") => {
    switch (name) {
      case 'Radiation':
        return <Radiation className={className} />;
      case 'Trash2':
        return <Trash2 className={className} />;
      case 'Droplets':
        return <Droplets className={className} />;
      case 'Shield':
        return <Shield className={className} />;
      case 'Flame':
        return <Flame className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      default:
        return <Layers className={className} />;
    }
  };

  const handleAction = (action: 'PASS_LEFT' | 'PASS_RIGHT' | 'CLAIM') => {
    if (!currentItem || !myStation) return;

    // Check correctness for immediate visual feedback
    let isCorrect = false;

    if (action === 'CLAIM') {
      isCorrect = currentItem.targetDestinationId === myStation.id;
      setAnimClass('scale-95 opacity-50');
    } else if (action === 'PASS_LEFT') {
      const targetIndex = stations.findIndex(s => s.id === currentItem.targetDestinationId);
      isCorrect = targetIndex < myIndex;
      setAnimClass('-translate-x-24 opacity-20 transition-all duration-150');
    } else if (action === 'PASS_RIGHT') {
      const targetIndex = stations.findIndex(s => s.id === currentItem.targetDestinationId);
      isCorrect = targetIndex > myIndex;
      setAnimClass('translate-x-24 opacity-20 transition-all duration-150');
    }

    if (isCorrect) {
      sound.playClick();
      setFeedbackMsg({ text: action === 'CLAIM' ? '¡CLASIFICADO!' : '¡ENRUTADO!', isCorrect: true });
    } else {
      sound.playGeiger();
      setFeedbackMsg({ text: '¡DESTINO INCORRECTO!', isCorrect: false });
      if (navigator.vibrate) navigator.vibrate(120);
    }

    onConveyorAction(action);

    setTimeout(() => {
      setAnimClass('');
    }, 160);

    setTimeout(() => {
      setFeedbackMsg(null);
    }, 700);
  };

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;

    // Horizontal swipe takes precedence
    if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY)) {
      if (diffX < 0) {
        handleAction('PASS_LEFT');
      } else {
        handleAction('PASS_RIGHT');
      }
    } else if (diffY > 50 && Math.abs(diffX) < 40) {
      // Swiping down claims the item
      handleAction('CLAIM');
    }
  };

  const timeLeft = round4.timeLeftSeconds;
  const isTimeCritical = timeLeft <= 7;

  return (
    <div className="flex-1 flex flex-col justify-between p-3 max-w-md mx-auto w-full select-none overflow-y-auto min-h-0">
      {/* 1. Header & Live Stats Bar */}
      <div className="flex flex-col gap-1.5 shrink-0">
        <div className="bg-[#1C1E24] border-3 border-black p-2 shadow-brutal flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 border-2 border-black flex items-center justify-center font-black text-xs ${
              isTimeCritical ? 'bg-[#FF2A2A] text-white animate-pulse' : 'bg-[#00F0FF] text-black'
            }`}>
              <Clock className="w-4 h-4 mr-1 animate-spin" style={{ animationDuration: '4s' }} />
              <span>{timeLeft}s</span>
            </div>
            <div>
              <span className="text-[10px] text-[#FFD600] font-black uppercase tracking-wider block leading-none">
                PRUEBA 4: CINTA CLASIFICADORA
              </span>
              <span className="text-[11px] text-gray-300 font-bold">
                ¡PASA O CLASIFICA EL MATERIAL!
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[10px] font-mono">
            <div className="bg-black/80 px-2 py-1 border border-gray-700 rounded flex items-center gap-1 text-[#00FF66] font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{round4.totalClassified}</span>
            </div>
            {round4.totalMistakes > 0 && (
              <div className="bg-black/80 px-1.5 py-1 border border-red-700 rounded flex items-center gap-1 text-[#FF2A2A] font-bold">
                <AlertTriangle className="w-3 h-3" />
                <span>{round4.totalMistakes}</span>
              </div>
            )}
          </div>
        </div>

        {/* 2. Linear Factory Chain Diagram (Contenedor Izq <-> P1 <-> P2 <-> Contenedor Dch) */}
        <div className="bg-[#121316] border-2 border-black p-1.5 rounded shadow-brutal-sm">
          <div className="flex items-center justify-between text-[9px] font-mono text-gray-400 mb-1">
            <span>CADENA DE DISTRIBUCIÓN</span>
            <span>DESLIZA O USA LOS BOTONES</span>
          </div>

          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-0.5">
            {stations.map((st, idx) => {
              const isMe = st.playerId === currentSocketId;
              const isTargetOfCurrent = currentItem && currentItem.targetDestinationId === st.id;

              return (
                <React.Fragment key={st.id}>
                  {idx > 0 && (
                    <span className="text-gray-600 text-[10px] font-bold shrink-0">⇄</span>
                  )}
                  <div
                    className={`flex-1 min-w-[52px] p-1 border text-center transition-all ${
                      isMe
                        ? 'border-2 border-[#FFD600] bg-[#FFD600]/15 shadow-glow'
                        : isTargetOfCurrent
                        ? 'border border-[#00FF66] bg-[#00FF66]/10'
                        : 'border-gray-800 bg-[#1C1E24]/80'
                    }`}
                  >
                    <div className="text-[8px] font-bold truncate text-gray-300">
                      {isMe ? '👉 TÚ' : st.playerName || st.title}
                    </div>
                    <div 
                      className="text-[9px] font-extrabold truncate uppercase mt-0.5"
                      style={{ color: st.category.color }}
                    >
                      {st.category.shortName}
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* 3. My Assigned Category Reminder Box */}
        {myStation && (
          <div 
            className="p-1.5 border-2 border-black flex items-center justify-between shadow-brutal-sm"
            style={{ backgroundColor: myStation.category.badgeBg }}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-black">{renderIcon(myStation.category.iconName, "w-4 h-4")}</span>
              <span className="text-[11px] font-black uppercase tracking-wide text-black">
                TU PUESTO: {myStation.category.name}
              </span>
            </div>
            <span className="text-[9px] bg-black text-[#FFD600] font-mono px-1.5 py-0.5 border border-black uppercase font-bold">
              QUÉDATELO SI COINCIDE
            </span>
          </div>
        )}
      </div>

      {/* 4. Active Item Conveyor Tray (Interactive Card with Touch/Swipe) */}
      <div className="my-auto py-2 flex flex-col items-center justify-center">
        {feedbackMsg && (
          <div className={`mb-2 px-3 py-1 font-black text-xs uppercase tracking-wider border-2 border-black animate-bounce ${
            feedbackMsg.isCorrect ? 'bg-[#00FF66] text-black' : 'bg-[#FF2A2A] text-white'
          }`}>
            {feedbackMsg.text}
          </div>
        )}

        {currentItem ? (
          <div
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className={`w-full max-w-[320px] bg-[#1C1E24] border-4 border-black p-4 shadow-brutal transition-transform select-none cursor-grab active:cursor-grabbing ${animClass}`}
            style={{ borderTopColor: currentItem.color }}
          >
            {/* Top Tag & Queue Count */}
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-gray-700">
              <span className="text-[10px] font-mono text-gray-400">
                ELEMENTO EN CINTA
              </span>
              <span className="text-[10px] bg-black px-2 py-0.5 border border-gray-700 text-[#00F0FF] font-mono font-bold">
                {myQueue.length > 1 ? `+${myQueue.length - 1} en espera` : 'Último en cinta'}
              </span>
            </div>

            {/* Item Icon & Title */}
            <div className="flex items-center gap-3 my-2">
              <div 
                className="w-14 h-14 shrink-0 border-3 border-black flex items-center justify-center text-black font-black"
                style={{ backgroundColor: currentItem.color }}
              >
                {renderIcon(currentItem.iconName, "w-8 h-8")}
              </div>
              <div className="flex-1 min-w-0">
                <span 
                  className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 border border-black inline-block mb-1 text-black"
                  style={{ backgroundColor: currentItem.color }}
                >
                  {currentItem.categoryName}
                </span>
                <h3 className="text-base font-black text-white leading-tight uppercase tracking-tight truncate">
                  {currentItem.name}
                </h3>
              </div>
            </div>

            {/* Gesture Hint */}
            <div className="mt-3 pt-2 border-t border-dashed border-gray-700 flex items-center justify-between text-[10px] text-gray-400 font-mono">
              <span>◀ Desliza Izq</span>
              <span className="text-[#00FF66] font-bold">↓ Desliza Abajo</span>
              <span>Desliza Dch ▶</span>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-[#1C1E24] border-3 border-black text-center text-gray-400">
            <div className="animate-spin mb-2 flex justify-center text-[#FFD600]">
              <Layers className="w-8 h-8" />
            </div>
            <p className="text-xs uppercase font-bold text-gray-300">
              Esperando material en la cinta transportadora...
            </p>
          </div>
        )}
      </div>

      {/* 5. Three Big Brutalist Control Buttons */}
      <div className="shrink-0 flex flex-col gap-2 pt-2">
        <div className="grid grid-cols-3 gap-2">
          {/* PASS LEFT BUTTON */}
          <button
            onClick={() => handleAction('PASS_LEFT')}
            disabled={!currentItem}
            className="flex flex-col items-center justify-center p-2.5 bg-[#2A2D37] hover:bg-[#383C4A] active:translate-y-1 text-white border-3 border-black shadow-brutal-sm transition-all disabled:opacity-40"
          >
            <div className="flex items-center gap-1 font-black text-xs uppercase text-[#00F0FF]">
              <ArrowLeft className="w-4 h-4" />
              <span>PASAR IZQ</span>
            </div>
            <span className="text-[9px] text-gray-400 truncate max-w-full font-mono mt-0.5">
              {leftNeighbor ? (leftNeighbor.isBin ? 'Contenedor Izq' : leftNeighbor.playerName) : 'Fin'}
            </span>
          </button>

          {/* CLAIM / KEEP BUTTON */}
          <button
            onClick={() => handleAction('CLAIM')}
            disabled={!currentItem}
            className="flex flex-col items-center justify-center p-2.5 bg-[#FFD600] hover:bg-yellow-400 active:translate-y-1 text-black border-3 border-black shadow-brutal transition-all font-black disabled:opacity-40"
          >
            <div className="flex items-center gap-1 font-black text-xs uppercase text-black">
              <Inbox className="w-4 h-4 fill-black" />
              <span>QUEDÁRSELO</span>
            </div>
            <span className="text-[9px] text-black/80 font-bold truncate max-w-full font-mono mt-0.5">
              {myStation ? myStation.category.shortName : 'Mi puesto'}
            </span>
          </button>

          {/* PASS RIGHT BUTTON */}
          <button
            onClick={() => handleAction('PASS_RIGHT')}
            disabled={!currentItem}
            className="flex flex-col items-center justify-center p-2.5 bg-[#2A2D37] hover:bg-[#383C4A] active:translate-y-1 text-white border-3 border-black shadow-brutal-sm transition-all disabled:opacity-40"
          >
            <div className="flex items-center gap-1 font-black text-xs uppercase text-[#00F0FF]">
              <span>PASAR DCH</span>
              <ArrowRight className="w-4 h-4" />
            </div>
            <span className="text-[9px] text-gray-400 truncate max-w-full font-mono mt-0.5">
              {rightNeighbor ? (rightNeighbor.isBin ? 'Contenedor Dch' : rightNeighbor.playerName) : 'Fin'}
            </span>
          </button>
        </div>

        {/* Live Bot Intercom Banner (if bots are in the room) */}
        {room.botRadioMessage && (
          <div className="bg-black/90 border border-gray-700 px-2 py-1 text-[10px] text-[#00FF66] font-mono flex items-center justify-between">
            <span className="truncate">📻 {room.botRadioMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
};
