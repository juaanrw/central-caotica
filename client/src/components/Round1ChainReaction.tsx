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
  const isExecutor = step.executorId === currentSocketId;
  const isBystander = !isSender && !isExecutor;

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

  // Valve hold logic (2.0 seconds = 2000ms)
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
    if (val % 25 === 0) {
      sound.playClick();
    }
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
      <div className="bg-[#1C1E24] border-3 border-black p-2.5 shadow-brutal flex items-center justify-between">
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

      {/* Main Role Context Box */}
      {isSender && (
        <div className="my-3 bg-[#FFD600] border-4 border-black p-4 text-black shadow-brutal flex flex-col items-center text-center animate-pulse-fast">
          <div className="flex items-center gap-1.5 bg-black text-[#FFD600] px-2 py-0.5 border border-black text-xs font-black uppercase mb-2">
            <Radio className="w-4 h-4 animate-bounce" />
            ¡ERES EL EMISOR! GRITA LA ORDEN POR VOZ:
          </div>
          <div className="text-sm font-bold uppercase text-gray-900 leading-tight">
            ORDENA A <span className="underline font-black text-black">{step.executorName.toUpperCase()}</span> QUE ACCIONE:
          </div>
          <div className="my-3 bg-black text-white border-2 border-black p-3 text-lg font-black tracking-wider uppercase shadow-brutal-sm w-full">
            {step.actionTitle}
          </div>
          <p className="text-xs font-bold text-gray-900">
            "{step.actionInstruction}"
          </p>
        </div>
      )}

      {isExecutor && (
        <div className="my-2 bg-[#1C1E24] border-4 border-[#00FF66] p-3 shadow-brutal text-center">
          <div className="inline-flex items-center gap-1.5 bg-[#00FF66] text-black px-2 py-0.5 font-black text-xs uppercase mb-1">
            <Volume2 className="w-4 h-4" />
            ¡ERES EL EJECUTOR! ESCUCHA LA ORDEN
          </div>
          <p className="text-xs text-gray-300">
            {step.senderName} te está ordenando qué control accionar. ¡No te equivoques!
          </p>
        </div>
      )}

      {isBystander && (
        <div className="my-4 bg-[#1C1E24] border-4 border-gray-700 p-4 text-center shadow-brutal">
          <Radio className="w-8 h-8 text-[#FFD600] mx-auto animate-pulse mb-2" />
          <h3 className="text-xs font-bold text-[#FFD600] uppercase tracking-wider">
            ESCUCHANDO FRECUENCIA INTERNA
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            <span className="text-white font-bold">{step.senderName}</span> está transmitiendo órdenes a{' '}
            <span className="text-white font-bold">{step.executorName}</span>. Prepárate para el siguiente eslabón.
          </p>
        </div>
      )}

      {/* Controls Area (Only interactive for Executor) */}
      <div className={`grid grid-cols-2 gap-3 my-2 ${!isExecutor ? 'opacity-40 pointer-events-none' : ''}`}>
        {/* Control 1: Red Button */}
        <div className="bg-[#1C1E24] border-3 border-black p-3 flex flex-col items-center justify-between shadow-brutal">
          <span className="text-[10px] font-bold uppercase text-gray-400">1. BOTÓN ROJO</span>
          <button
            onClick={handleButtonTap}
            className="w-16 h-16 rounded-full bg-[#FF2A2A] hover:bg-red-500 active:scale-95 active:translate-y-1 border-4 border-black shadow-brutal flex items-center justify-center my-2 transition-all cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full border-2 border-red-300 bg-red-600 flex items-center justify-center">
              <Flame className="w-5 h-5 text-white" />
            </div>
          </button>
          <span className="text-[9px] text-gray-400 uppercase font-mono">Pulsar 1 vez</span>
        </div>

        {/* Control 2: Valve Hold */}
        <div className="bg-[#1C1E24] border-3 border-black p-3 flex flex-col items-center justify-between shadow-brutal">
          <span className="text-[10px] font-bold uppercase text-gray-400">2. VÁLVULA (2s)</span>
          <button
            onMouseDown={handleValveStart}
            onMouseUp={handleValveEnd}
            onTouchStart={handleValveStart}
            onTouchEnd={handleValveEnd}
            className={`w-16 h-16 rounded-full border-4 border-black flex items-center justify-center my-2 shadow-brutal transition-all cursor-pointer ${
              valveHolding ? 'bg-[#00FF66] scale-105' : 'bg-[#FFD600] active:scale-95'
            }`}
          >
            <RotateCw className={`w-7 h-7 text-black ${valveHolding ? 'animate-spin' : ''}`} />
          </button>
          {/* Progress bar */}
          <div className="w-full bg-black h-2 border border-gray-700">
            <div
              className="bg-[#00FF66] h-full transition-all"
              style={{ width: `${valveProgress}%` }}
            />
          </div>
          <span className="text-[9px] text-gray-400 uppercase font-mono">Mantener 2s</span>
        </div>

        {/* Control 3: Slider */}
        <div className="bg-[#1C1E24] border-3 border-black p-3 flex flex-col items-center justify-between shadow-brutal">
          <span className="text-[10px] font-bold uppercase text-gray-400">3. PALANCA BARRAS</span>
          <div className="w-full flex items-center gap-2 my-2">
            <Sliders className="w-4 h-4 text-[#00F0FF] shrink-0" />
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={sliderValue}
              onChange={handleSliderChange}
              className="w-full accent-[#00F0FF] cursor-pointer h-3 bg-black border border-gray-600 rounded-none"
            />
          </div>
          <div className="text-[10px] font-mono text-[#00F0FF] font-bold">
            {sliderValue}% / 100%
          </div>
        </div>

        {/* Control 4: Pump Button */}
        <div className="bg-[#1C1E24] border-3 border-black p-3 flex flex-col items-center justify-between shadow-brutal">
          <span className="text-[10px] font-bold uppercase text-gray-400">4. BOMBA (5 TOQUES)</span>
          <button
            onClick={handlePumpTap}
            className="w-full py-2 bg-[#2A2D37] hover:bg-[#3F4452] active:scale-95 border-2 border-black text-xs font-black uppercase text-[#FFD600] shadow-brutal-sm my-1 flex items-center justify-center gap-1"
          >
            <RotateCw className="w-3.5 h-3.5" />
            ¡BOMBEAR! ({pumpCount}/5)
          </button>
          <div className="flex gap-1 w-full justify-center">
            {[1, 2, 3, 4, 5].map((p) => (
              <div
                key={p}
                className={`w-3 h-2 border border-black ${
                  pumpCount >= p ? 'bg-[#FFD600]' : 'bg-black'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Feedback banner */}
      {lastActionFeedback && (
        <div className="bg-[#00FF66] border-2 border-black p-2 text-black font-black text-xs text-center uppercase tracking-widest shadow-brutal">
          {lastActionFeedback}
        </div>
      )}
    </div>
  );
};
