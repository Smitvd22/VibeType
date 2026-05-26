import { useState } from "react";
import { useComboTraining } from "@/hooks/useComboTraining";
import { NormalizedLandmark, Classifications } from "@mediapipe/tasks-vision";
import { Loader2, Camera } from "lucide-react";

interface ComboTrainerProps {
  currentLandmarks: NormalizedLandmark[] | null;
  currentBlendshapes: Classifications[] | null;
  onDone: () => void;
}

export function ComboTrainer({ currentLandmarks, currentBlendshapes, onDone }: ComboTrainerProps) {
  const { phase, countdown, captureCombo } = useComboTraining(currentLandmarks, currentBlendshapes);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleCapture = () => {
    if (!name || !emoji) {
      setError("Please provide a name and an emoji.");
      return;
    }
    setError(null);
    captureCombo(name, emoji, onDone, setError);
  };

  return (
    <div className="flex flex-col gap-4 p-5 glass rounded-2xl border border-white/5 shadow-xl">
      <h3 className="font-bold text-white text-lg">Train Combo (Gesture + Face)</h3>
      
      <div className="flex gap-3">
        <input 
          type="text" 
          placeholder="Combo Name (e.g. Happy Peace)" 
          value={name} 
          onChange={e => setName(e.target.value)}
          className="flex-1 bg-white/10 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-zinc-500"
        />
        <input 
          type="text" 
          placeholder="Emoji 🎉" 
          value={emoji} 
          onChange={e => setEmoji(e.target.value)}
          className="w-20 text-center bg-white/10 rounded-xl p-3 text-white outline-none focus:ring-2 focus:ring-primary-500 text-2xl placeholder:text-zinc-500"
        />
      </div>

      {error && <p className="text-red-400 text-sm p-2 bg-red-400/10 rounded-lg">{error}</p>}

      <button 
        onClick={handleCapture}
        disabled={phase !== "idle"}
        className={`flex items-center justify-center gap-2 text-white p-4 rounded-xl transition-all shadow-lg font-semibold disabled:opacity-50 mt-2 ${
          phase === "recording" 
            ? "bg-red-500 animate-pulse" 
            : phase === "preparing" 
              ? "bg-amber-500" 
              : "bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400"
        }`}
      >
        {phase === "preparing" ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Get Ready in {countdown}...
          </>
        ) : phase === "recording" ? (
          <>
            <Camera className="w-5 h-5 animate-pulse" />
            Holding... {countdown}
          </>
        ) : (
          <>
            <Camera className="w-5 h-5" />
            Capture Combo
          </>
        )}
      </button>
      
      <p className="text-xs text-zinc-400 text-center mt-1">
        Get into position, click Capture, and hold steady!
      </p>
    </div>
  );
}
