import { useState, useEffect } from "react";
import { Storage, CustomGesture, CustomExpression, CustomCombo } from "@/lib/storage";
import { Trash2 } from "lucide-react";

export function SavedMappings({ refreshTrigger }: { refreshTrigger: number }) {
  const [gestures, setGestures] = useState<CustomGesture[]>([]);
  const [expressions, setExpressions] = useState<CustomExpression[]>([]);
  const [combos, setCombos] = useState<CustomCombo[]>([]);

  useEffect(() => {
    setGestures(Storage.getGestures());
    setExpressions(Storage.getExpressions());
    setCombos(Storage.getCombos());
  }, [refreshTrigger]);

  const deleteGesture = (id: string) => {
    const updated = gestures.filter(g => g.id !== id);
    Storage.saveGestures(updated);
    setGestures(updated);
  };

  const deleteExpression = (id: string) => {
    const updated = expressions.filter(e => e.id !== id);
    Storage.saveExpressions(updated);
    setExpressions(updated);
  };

  const deleteCombo = (id: string) => {
    const updated = combos.filter(c => c.id !== id);
    Storage.saveCombos(updated);
    setCombos(updated);
  };

  return (
    <div className="flex flex-col gap-4 p-5 glass rounded-2xl max-h-72 overflow-y-auto scrollbar-thin border border-white/5 shadow-xl">
      <h3 className="font-bold text-white mb-1">Saved Profiles</h3>
      
      {gestures.length === 0 && expressions.length === 0 && combos.length === 0 && (
        <div className="py-6 flex justify-center items-center bg-white/5 rounded-xl border border-white/5 border-dashed">
          <p className="text-zinc-500 text-sm font-medium">No custom profiles trained yet.</p>
        </div>
      )}

      {gestures.map(g => (
        <div key={g.id} className="flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors p-3 rounded-xl border border-white/5 group">
          <div className="flex items-center gap-4">
            <span className="text-3xl bg-white/10 w-12 h-12 flex items-center justify-center rounded-lg">{g.emoji}</span>
            <div>
              <p className="text-sm text-zinc-100 font-bold">{g.name}</p>
              <p className="text-xs text-primary-400 font-medium">Gesture Match</p>
            </div>
          </div>
          <button onClick={() => deleteGesture(g.id)} className="text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-400/20 p-2.5 rounded-lg transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      {expressions.map(e => (
        <div key={e.id} className="flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors p-3 rounded-xl border border-white/5 group">
          <div className="flex items-center gap-4">
            <span className="text-3xl bg-white/10 w-12 h-12 flex items-center justify-center rounded-lg">{e.emoji}</span>
            <div>
              <p className="text-sm text-zinc-100 font-bold">{e.name}</p>
              <p className="text-xs text-blue-400 font-medium">Expression Match</p>
            </div>
          </div>
          <button onClick={() => deleteExpression(e.id)} className="text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-400/20 p-2.5 rounded-lg transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      {combos.map(c => (
        <div key={c.id} className="flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors p-3 rounded-xl border border-white/5 group">
          <div className="flex items-center gap-4">
            <span className="text-3xl bg-white/10 w-12 h-12 flex items-center justify-center rounded-lg">{c.emoji}</span>
            <div>
              <p className="text-sm text-zinc-100 font-bold">{c.name}</p>
              <p className="text-xs text-amber-400 font-medium">Combo Match</p>
            </div>
          </div>
          <button onClick={() => deleteCombo(c.id)} className="text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-400/20 p-2.5 rounded-lg transition-all">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
