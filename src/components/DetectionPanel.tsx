import { FaceDetection } from "@/hooks/useFaceEmbeddings";
import { GestureDetection } from "@/hooks/useGestureEmbeddings";
import { ConfidenceMeter } from "./ConfidenceMeter";

interface DetectionPanelProps {
  faceDetection: FaceDetection;
  gestureDetection: GestureDetection;
}

export function DetectionPanel({ faceDetection, gestureDetection }: DetectionPanelProps) {
  const hasFace = !!faceDetection.expression;
  const hasGesture = !!gestureDetection.gesture;

  return (
    <section className="glass rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-center gap-8 text-center border border-white/10 shadow-xl w-full">
      <div className="flex-1 w-full max-w-[280px] flex flex-col items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/5">
        <div className="text-6xl drop-shadow-lg transition-transform hover:scale-110">
          {hasFace ? faceDetection.expression?.emoji : "😐"}
        </div>
        <div className="w-full">
          <div className="text-lg text-zinc-200 font-bold mb-2">
            {hasFace ? faceDetection.expression?.name : "No Expression"}
          </div>
          <div className="w-full">
            <ConfidenceMeter 
              label="Match Score" 
              confidence={faceDetection.confidence} 
              threshold={faceDetection.expression?.threshold || 0.85} 
            />
          </div>
        </div>
      </div>

      <div className="flex-1 w-full max-w-[280px] flex flex-col items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/5">
        <div className="text-6xl drop-shadow-lg transition-transform hover:scale-110">
          {hasGesture ? gestureDetection.gesture?.emoji : "🤚"}
        </div>
        <div className="w-full">
          <div className="text-lg text-zinc-200 font-bold mb-2">
            {hasGesture ? gestureDetection.gesture?.name : "No Gesture"}
          </div>
          <div className="w-full">
            <ConfidenceMeter 
              label="Match Score" 
              confidence={gestureDetection.confidence} 
              threshold={gestureDetection.gesture?.threshold || 0.75} 
            />
          </div>
        </div>
      </div>
    </section>
  );
}
