import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  RotateCw, 
  Flame, 
  Sliders, 
  Mic, 
  Smartphone,
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
  const [shakeEnergy, setShakeEnergy] = useState(0);
  const [micVolume, setMicVolume] = useState(0);
  const [micActive, setMicActive] = useState(false);
  const [lastActionFeedback, setLastActionFeedback] = useState<string | null>(null);

  const valveTimerRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Reset controls state on new step
  useEffect(() => {
    setValveHolding(false);
    setValveProgress(0);
    setSliderValue(0);
    setPumpCount(0);
    setShakeEnergy(0);
    sound.playGeiger(2);
  }, [step.stepNumber]);

  // --- SENSOR 1: ACELERÓMETRO (AGITAR EL MÓVIL) ---
  useEffect(() => {
    let lastX = 0, lastY = 0, lastZ = 0;
    let lastTime = 0;

    const handleMotion = (event: DeviceMotionEvent) => {
      const current = event.accelerationIncludingGravity;
      if (!current) return;

      const now = Date.now();
      if (now - lastTime > 80) {
        const diffTime = now - lastTime;
        lastTime = now;

        const x = current.x || 0;
        const y = current.y || 0;
        const z = current.z || 0;

        const speed = (Math.abs(x - lastX) + Math.abs(y - lastY) + Math.abs(z - lastZ)) / diffTime * 10000;

        if (speed > 450) {
          setShakeEnergy(prev => {
            const next = prev + 35;
            sound.playGeiger(1);
            if (next >= 100) {
              sound.playSuccess();
              triggerAction('SHAKE');
              return 0;
            }
            return next;
          });
        }

        lastX = x;
        lastY = y;
        lastZ = z;
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [step.stepNumber]);

  // Fallback tap for shake
  const handleManualShake = () => {
    sound.playClick();
    setShakeEnergy(prev => {
      const next = prev + 34;
      if (next >= 100) {
        sound.playSuccess();
        triggerAction('SHAKE');
        return 0;
      }
      return next;
    });
  };

  // --- SENSOR 2: MICRÓFONO (GRITAR / VOLUMEN) ---
  const startMicListener = async () => {
    try {
      sound.playClick();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      analyserRef.current = analyser;

      setMicActive(true);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const checkVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bufferLength;
        const volumePercent = Math.min(100, Math.round((avg / 128) * 100));
        setMicVolume(volumePercent);

        // If shout detected (volume > 45%)
        if (volumePercent >= 45) {
          sound.playSuccess();
          triggerAction('SHOUT');
        }

        animFrameRef.current = requestAnimationFrame(checkVolume);
      };

      animFrameRef.current = requestAnimationFrame(checkVolume);
    } catch (err) {
      console.warn('Microphone permission denied or not available:', err);
      setMicActive(false);
    }
  };

  // Cleanup mic on unmount
  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current) {
        try { audioContextRef.current.close(); } catch (e) {}
      }
    };
  }, []);

  const handleManualShout = () => {
    sound.playClick();
    setMicVolume(100);
    setTimeout(() => setMicVolume(0), 400);
    triggerAction('SHOUT');
  };

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
        <div className="my-2 bg-[#FFD600] border-4 border-black p-3 text-black shadow-brutal text-center animate-pulse-fast">
          <div className="inline-flex items-center gap-1.5 bg-black text-[#FFD600] px-2 py-0.5 border border-black text-xs font-black uppercase mb-1">
            <Radio className="w-3.5 h-3.5 animate-bounce" />
            ¡TIENES LA ORDEN! DÍCTALA EN VOZ ALTA:
          </div>
          <div className="text-sm font-black uppercase text-black leading-tight mt-1 bg-white/40 p-2 border-2 border-black">
            "{step.actionInstruction}"
          </div>
        </div>
      ) : (
        <div className="my-2 bg-[#1C1E24] border-3 border-gray-700 p-2.5 text-center shadow-brutal">
          <div className="flex items-center justify-center gap-1.5 text-[#00F0FF] text-xs font-black uppercase">
            <Volume2 className="w-4 h-4 animate-pulse" />
            ESCUCHA LA TRANSMISIÓN POR VOZ
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Mantén tus mandos listos. Si oyes tu nombre, ejecuta tu orden de inmediato.
          </p>
        </div>
      )}

      {/* ALL 6 PHYSICAL CONTROLS (Active for everyone! If wrong player clicks, penalty is triggered) */}
      <div className="grid grid-cols-2 gap-2 my-1">
        {/* 1. Botón Rojo */}
        <div className="bg-[#1C1E24] border-3 border-black p-2 flex flex-col items-center justify-between shadow-brutal">
          <span className="text-[9px] font-bold uppercase text-gray-300">1. BOTÓN ROJO</span>
          <button
            onClick={handleButtonTap}
            className="w-13 h-13 rounded-full bg-[#FF2A2A] hover:bg-red-500 active:scale-95 active:translate-y-1 border-3 border-black shadow-brutal flex items-center justify-center my-1.5 transition-all cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full border-2 border-red-300 bg-red-600 flex items-center justify-center">
              <Flame className="w-4 h-4 text-white" />
            </div>
          </button>
          <span className="text-[8px] text-gray-400 uppercase font-mono">Pulsar</span>
        </div>

        {/* 2. Válvula 2s */}
        <div className="bg-[#1C1E24] border-3 border-black p-2 flex flex-col items-center justify-between shadow-brutal">
          <span className="text-[9px] font-bold uppercase text-gray-300">2. VÁLVULA (2s)</span>
          <button
            onMouseDown={handleValveStart}
            onMouseUp={handleValveEnd}
            onTouchStart={handleValveStart}
            onTouchEnd={handleValveEnd}
            className={`w-13 h-13 rounded-full border-3 border-black flex items-center justify-center my-1.5 shadow-brutal transition-all cursor-pointer ${
              valveHolding ? 'bg-[#00FF66] scale-105' : 'bg-[#FFD600] active:scale-95'
            }`}
          >
            <RotateCw className={`w-5 h-5 text-black ${valveHolding ? 'animate-spin' : ''}`} />
          </button>
          <div className="w-full bg-black h-1.5 border border-gray-700">
            <div className="bg-[#00FF66] h-full transition-all" style={{ width: `${valveProgress}%` }} />
          </div>
        </div>

        {/* 3. Palanca Slider */}
        <div className="bg-[#1C1E24] border-3 border-black p-2 flex flex-col items-center justify-between shadow-brutal">
          <span className="text-[9px] font-bold uppercase text-gray-300">3. PALANCA 100%</span>
          <div className="w-full flex items-center gap-1.5 my-1">
            <Sliders className="w-3.5 h-3.5 text-[#00F0FF] shrink-0" />
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={sliderValue}
              onChange={handleSliderChange}
              className="w-full accent-[#00F0FF] cursor-pointer h-2.5 bg-black border border-gray-600 rounded-none"
            />
          </div>
          <span className="text-[8px] font-mono text-[#00F0FF] font-bold">{sliderValue}%</span>
        </div>

        {/* 4. Bomba Manual 5 toques */}
        <div className="bg-[#1C1E24] border-3 border-black p-2 flex flex-col items-center justify-between shadow-brutal">
          <span className="text-[9px] font-bold uppercase text-gray-300">4. BOMBA (5 TOQUES)</span>
          <button
            onClick={handlePumpTap}
            className="w-full py-1.5 bg-[#2A2D37] hover:bg-[#3F4452] active:scale-95 border-2 border-black text-[11px] font-black uppercase text-[#FFD600] shadow-brutal-sm my-1 flex items-center justify-center gap-1"
          >
            ¡BOMBEAR! ({pumpCount}/5)
          </button>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((p) => (
              <div key={p} className={`w-2.5 h-1.5 border border-black ${pumpCount >= p ? 'bg-[#FFD600]' : 'bg-black'}`} />
            ))}
          </div>
        </div>

        {/* 5. Sensor de Movimiento (Agitar) */}
        <div className="bg-[#1C1E24] border-3 border-black p-2 flex flex-col items-center justify-between shadow-brutal">
          <span className="text-[9px] font-bold uppercase text-gray-300">5. AGITAR MÓVIL</span>
          <button
            onClick={handleManualShake}
            className={`w-full py-1.5 border-2 border-black text-[10px] font-black uppercase text-black shadow-brutal-sm my-1 flex items-center justify-center gap-1 active:scale-95 transition-all ${
              shakeEnergy > 0 ? 'bg-[#00FF66] animate-pulse' : 'bg-[#FF9900]'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            ¡SACUDIR!
          </button>
          <div className="w-full bg-black h-1.5 border border-gray-700">
            <div className="bg-[#00FF66] h-full transition-all" style={{ width: `${shakeEnergy}%` }} />
          </div>
        </div>

        {/* 6. Sensor Acústico (Micrófono) */}
        <div className="bg-[#1C1E24] border-3 border-black p-2 flex flex-col items-center justify-between shadow-brutal">
          <span className="text-[9px] font-bold uppercase text-gray-300">6. GRITAR / MICRO</span>
          {!micActive ? (
            <button
              onClick={startMicListener}
              className="w-full py-1 bg-[#2A2D37] border-2 border-black text-[9px] font-black text-[#00F0FF] my-1 flex items-center justify-center gap-1 hover:bg-[#3F4452]"
            >
              <Mic className="w-3 h-3 text-[#00F0FF]" />
              Activar Micro
            </button>
          ) : (
            <div className="text-[9px] text-[#00FF66] font-mono font-bold flex items-center gap-1 my-1">
              <span className="w-2 h-2 rounded-full bg-[#00FF66] animate-ping" />
              Micro Online
            </div>
          )}
          <button
            onClick={handleManualShout}
            className="w-full py-0.5 bg-[#FF2A2A] text-white text-[9px] font-black uppercase border border-black shadow-brutal-sm active:scale-95"
          >
            ¡Gritar!
          </button>
          <div className="w-full bg-black h-1.5 border border-gray-700 mt-1">
            <div
              className={`h-full transition-all ${micVolume > 40 ? 'bg-[#FF2A2A]' : 'bg-[#00FF66]'}`}
              style={{ width: `${micVolume}%` }}
            />
          </div>
        </div>
      </div>

      {/* Real-time feedback alert */}
      {lastActionFeedback && (
        <div className="bg-[#00FF66] border-2 border-black p-1.5 text-black font-black text-xs text-center uppercase tracking-widest shadow-brutal">
          {lastActionFeedback}
        </div>
      )}
    </div>
  );
};
