import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  RotateCw, 
  Flame, 
  Sliders, 
  Volume2
} from 'lucide-react';
import { RoomState, ActionType } from '../types';
import { sound } from '../soundEngine';

interface Round1Props {
  room: RoomState;
  currentSocketId: string;
  onExecuteAction: (action: ActionType) => void;
}

export const Round1ChainReaction: React.FC<Round1Props> = ({
  room,
  currentSocketId,
  onExecuteAction
}) => {
  const step = room.round1;
  if (!step) return null;

  const isSender = step.senderId === currentSocketId;

  // Local interaction states for controls
  const [valveHolding, setValveHolding] = useState(false);
  const [valveProgress, setValveProgress] = useState(0);
  const [sliderValue, setSliderValue] = useState(0);
  const [pumpCount, setPumpCount] = useState(0);
  const [lastActionFeedback, setLastActionFeedback] = useState<string | null>(null);

  const valveTimerRef = useRef<any>(null);

  // Reset controls state on new step
  useEffect(() => {
    setValveHolding(false);
    setValveProgress(0);
    setSliderValue(0);
    setPumpCount(0);
    sound.playGeiger(2);
  }, [step.stepNumber]);

  // --- CONTROLES CLÁSICOS ---

  // Valve hold logic (2.0s)
  useEffect(() => {
    if (valveHolding) {
      sound.playGeiger(1);
      const startTime = Date.now();
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(100, Math.round((elapsed / 2000) * 100));
        setValveProgress(progress);

        if (progress >= 100) {
          clearInterval(interval);
          setValveHolding(false);
          sound.playSteam();
          triggerAction('VALVE');
        }
      }, 50);

      valveTimerRef.current = interval;
      return () => clearInterval(interval);
    } else {
      if (valveTimerRef.current) {
        clearInterval(valveTimerRef.current);
      }
      setValveProgress(0);
    }
  }, [valveHolding]);

  const handleValveStart = () => {
    sound.playClick();
    setValveHolding(true);
  };

  const handleValveEnd = () => {
    if (valveProgress < 100) {
      setValveHolding(false);
      setValveProgress(0);
    }
  };

  // Slider change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setSliderValue(val);
    if (val % 25 === 0) sound.playClick();
    if (val >= 100) {
      sound.playSuccess();
      triggerAction('SLIDER');
    }
  };

  // Pump tap
  const handlePumpTap = () => {
    sound.playClick();
    const next = pumpCount + 1;
    setPumpCount(next);
    if (next >= 5) {
      sound.playSteam();
      triggerAction('PUMP');
    }
  };

  // Button tap
  const handleButtonTap = () => {
    sound.playClick();
    triggerAction('BUTTON');
  };

  const triggerAction = (action: ActionType) => {
    setLastActionFeedback(`¡EJECUTADO: ${action}!`);
    setTimeout(() => setLastActionFeedback(null), 1000);
    onExecuteAction(action);
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-3 max-w-md mx-auto w-full select-none overflow-y-auto">
      {/* Top Phase Header */}
      <div className="bg-[#1C1E24] border-3 border-black p-2 shadow-brutal flex items-center justify-between">
        <div>
          <span className="text-[10px] text-[#FFD600] font-black uppercase tracking-wider block">
            PRUEBA 1: REACCIÓN EN CADENA
          </span>
          <span className="text-xs text-gray-300 font-bold">
            ESLABÓN {step.stepNumber} DE 6
          </span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <div
              key={num}
              className={`w-4 h-4 border border-black flex items-center justify-center text-[9px] font-black ${
                num < step.stepNumber
                  ? 'bg-[#00FF66] text-black'
                  : num === step.stepNumber
                  ? 'bg-[#FFD600] text-black animate-pulse'
                  : 'bg-black text-gray-600'
              }`}
            >
              {num}
            </div>
          ))}
        </div>
      </div>

      {/* SENDER BANNER: Only shown to the Sender! (No one else knows who has to do what except by listening) */}
      {isSender ? (
        <div className="my-2 bg-[#FFD600] border-4 border-black p-3.5 text-black shadow-brutal text-center animate-pulse-fast shrink-0">
          <div className="inline-flex items-center gap-2 bg-black text-[#FFD600] px-2.5 py-1 border border-black text-xs sm:text-sm font-black uppercase mb-1.5">
            <Radio className="w-4 h-4 animate-bounce" />
            ¡TIENES LA ORDEN! DÍCTALA EN VOZ ALTA:
          </div>
          <div className="text-base sm:text-lg font-black uppercase text-black leading-snug mt-1 bg-white/50 p-2.5 border-2 border-black tracking-tight">
            "{step.actionInstruction}"
          </div>
        </div>
      ) : (
        <div className="my-2 bg-[#1C1E24] border-3 border-gray-700 p-3 text-center shadow-brutal shrink-0">
          <div className="flex items-center justify-center gap-2 text-[#00F0FF] text-xs sm:text-sm font-black uppercase">
            <Volume2 className="w-5 h-5 animate-pulse" />
            ESCUCHA LA TRANSMISIÓN POR VOZ
          </div>
          <p className="text-xs text-gray-300 mt-1 font-mono">
            Mantén tus mandos listos. Si oyes tu nombre, ejecuta tu orden de inmediato.
          </p>
        </div>
      )}

      {/* PHYSICAL CONTROLS (Active for everyone! If wrong player clicks, penalty is triggered) */}
      <div className="flex-1 flex flex-col justify-around gap-3 my-1 min-h-0">
        <div className="grid grid-cols-2 gap-3 flex-1">
          {/* 1. Emergencia */}
          <div className="bg-[#1C1E24] border-4 border-black p-3 sm:p-4 flex flex-col items-center justify-between shadow-brutal">
            <span className="text-xs sm:text-sm font-black uppercase text-gray-200 tracking-wider">1. EMERGENCIA</span>
            <button
              onClick={handleButtonTap}
              className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-[#FF2A2A] hover:bg-red-500 active:scale-95 active:translate-y-1 border-4 border-black shadow-brutal flex items-center justify-center my-2 transition-all cursor-pointer"
            >
              <div className="w-11 h-11 rounded-full border-2 border-red-300 bg-red-600 flex items-center justify-center shadow-inner">
                <Flame className="w-6 h-6 text-white" />
              </div>
            </button>
            <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider font-bold">SETA AZ-5</span>
          </div>

          {/* 2. Válvula */}
          <div className="bg-[#1C1E24] border-4 border-black p-3 sm:p-4 flex flex-col items-center justify-between shadow-brutal">
            <span className="text-xs sm:text-sm font-black uppercase text-gray-200 tracking-wider">2. VÁLVULA</span>
            <button
              onMouseDown={handleValveStart}
              onMouseUp={handleValveEnd}
              onTouchStart={handleValveStart}
              onTouchEnd={handleValveEnd}
              className={`w-18 h-18 sm:w-20 sm:h-20 rounded-full border-4 border-black flex items-center justify-center my-2 shadow-brutal transition-all cursor-pointer ${
                valveHolding ? 'bg-[#00FF66] scale-105' : 'bg-[#FFD600] active:scale-95'
              }`}
            >
              <RotateCw className={`w-8 h-8 text-black ${valveHolding ? 'animate-spin' : ''}`} />
            </button>
            <div className="w-full bg-black h-2.5 border-2 border-gray-700 overflow-hidden">
              <div className="bg-[#00FF66] h-full transition-all duration-75" style={{ width: `${valveProgress}%` }} />
            </div>
          </div>

          {/* 3. Palanca */}
          <div className="bg-[#1C1E24] border-4 border-black p-3 sm:p-4 flex flex-col items-center justify-between shadow-brutal">
            <span className="text-xs sm:text-sm font-black uppercase text-gray-200 tracking-wider">3. PALANCA</span>
            <div className="w-full flex items-center gap-2 my-auto">
              <Sliders className="w-5 h-5 text-[#00F0FF] shrink-0" />
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={sliderValue}
                onChange={handleSliderChange}
                className="w-full accent-[#00F0FF] cursor-pointer h-3.5 bg-black border-2 border-gray-600 rounded-none"
              />
            </div>
            <div className="flex items-center justify-between w-full text-[10px] font-mono text-gray-400 font-bold uppercase">
              <span>0%</span>
              <span className="text-[#00F0FF] font-black">{sliderValue}%</span>
              <span>100%</span>
            </div>
          </div>

          {/* 4. Bomba */}
          <div className="bg-[#1C1E24] border-4 border-black p-3 sm:p-4 flex flex-col items-center justify-between shadow-brutal">
            <span className="text-xs sm:text-sm font-black uppercase text-gray-200 tracking-wider">4. BOMBA</span>
            <button
              onClick={handlePumpTap}
              className="w-full py-2.5 sm:py-3 bg-[#2A2D37] hover:bg-[#3F4452] active:scale-95 border-3 border-black text-xs sm:text-sm font-black uppercase text-[#FFD600] shadow-brutal-sm my-auto flex items-center justify-center gap-1.5"
            >
              ¡BOMBEAR!
            </button>
            <div className="flex gap-1.5 justify-center w-full">
              {[1, 2, 3, 4, 5].map((p) => (
                <div key={p} className={`flex-1 h-3 border-2 border-black transition-all ${pumpCount >= p ? 'bg-[#FFD600]' : 'bg-black'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Real-time feedback alert */}
      {lastActionFeedback && (
        <div className="bg-[#00FF66] border-3 border-black p-2 text-black font-black text-sm text-center uppercase tracking-widest shadow-brutal shrink-0">
          {lastActionFeedback}
        </div>
      )}
    </div>
  );
};
