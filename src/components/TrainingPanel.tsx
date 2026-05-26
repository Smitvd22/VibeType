import { useState } from "react";
import { NormalizedLandmark, Classifications } from "@mediapipe/tasks-vision";
import { GestureTrainer } from "./GestureTrainer";
import { ExpressionTrainer } from "./ExpressionTrainer";
import { ComboTrainer } from "./ComboTrainer";
import { SavedMappings } from "./SavedMappings";
import { Hand, Smile, Zap } from "lucide-react";

interface TrainingPanelProps {
  currentLandmarks: NormalizedLandmark[] | null;
  currentBlendshapes: Classifications[] | null;
  onProfileAdded: () => void;
}

export function TrainingPanel({ currentLandmarks, currentBlendshapes, onProfileAdded }: TrainingPanelProps) {
  const [tab, setTab] = useState<"gesture" | "expression" | "combo">("gesture");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDone = () => {
    setRefreshTrigger(prev => prev + 1);
    onProfileAdded();
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex gap-2 glass p-1.5 rounded-2xl shadow-lg border border-white/10">
        <button 
          onClick={() => setTab("gesture")}
          className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-bold transition-all ${tab === "gesture" ? "bg-white/20 text-white shadow-sm" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}
        >
          <Hand className="w-4 h-4" /> Gesture
        </button>
        <button 
          onClick={() => setTab("expression")}
          className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-bold transition-all ${tab === "expression" ? "bg-white/20 text-white shadow-sm" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}
        >
          <Smile className="w-4 h-4" /> Expression
        </button>
        <button 
          onClick={() => setTab("combo")}
          className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-bold transition-all ${tab === "combo" ? "bg-white/20 text-white shadow-sm" : "text-zinc-400 hover:text-white hover:bg-white/5"}`}
        >
          <Zap className="w-4 h-4" /> Combo
        </button>
      </div>

      {tab === "gesture" && (
        <GestureTrainer currentLandmarks={currentLandmarks} onDone={handleDone} />
      )}

      {tab === "expression" && (
        <ExpressionTrainer currentBlendshapes={currentBlendshapes} onDone={handleDone} />
      )}

      {tab === "combo" && (
        <ComboTrainer currentLandmarks={currentLandmarks} currentBlendshapes={currentBlendshapes} onDone={handleDone} />
      )}

      <SavedMappings refreshTrigger={refreshTrigger} />
    </div>
  );
}
