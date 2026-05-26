import { useState, useCallback, useEffect, useRef } from "react";
import { Classifications } from "@mediapipe/tasks-vision";
import { Storage, CustomExpression } from "@/lib/storage";
import { TrainingPhase } from "./useGestureTraining";

export function useExpressionTraining(currentBlendshapes: Classifications[] | null) {
  const [phase, setPhase] = useState<TrainingPhase>("idle");
  const [countdown, setCountdown] = useState<number | null>(null);
  
  const framesRef = useRef<Classifications[][]>([]);
  
  useEffect(() => {
    if (phase === "recording" && currentBlendshapes && currentBlendshapes.length > 0) {
      framesRef.current.push(currentBlendshapes);
    }
  }, [currentBlendshapes, phase]);

  const captureExpression = useCallback((
    name: string,
    emoji: string,
    onSuccess: () => void,
    onError: (msg: string) => void
  ) => {
    if (phase !== "idle") return;
    
    framesRef.current = [];
    setPhase("preparing");
    setCountdown(2);

    let prepCount = 2;
    const prepInterval = setInterval(() => {
      prepCount--;
      if (prepCount > 0) {
        setCountdown(prepCount);
      } else {
        clearInterval(prepInterval);
        
        setPhase("recording");
        setCountdown(3);
        
        let recCount = 3;
        const recInterval = setInterval(() => {
          recCount--;
          if (recCount > 0) {
            setCountdown(recCount);
          } else {
            clearInterval(recInterval);
            setPhase("idle");
            setCountdown(null);
            
            if (framesRef.current.length === 0) {
              onError("No face detected during recording. Please keep your face in frame.");
              return;
            }
            
            // Calculate average profile
            const avgProfile: Record<string, number> = {};
            const numFrames = framesRef.current.length;
            
            for (const frame of framesRef.current) {
              // frame[0].categories contains the blendshapes
              const categories = frame[0]?.categories || [];
              for (const cat of categories) {
                if (!avgProfile[cat.categoryName]) {
                  avgProfile[cat.categoryName] = 0;
                }
                avgProfile[cat.categoryName] += cat.score;
              }
            }
            
            // Divide by numFrames
            for (const key in avgProfile) {
              avgProfile[key] /= numFrames;
            }

            const newExpression: CustomExpression = {
              id: Date.now().toString(),
              name,
              emoji,
              profile: { blendshapes: avgProfile },
              threshold: 0.85
            };

            const existingExpressions = Storage.getExpressions();
            Storage.saveExpressions([...existingExpressions, newExpression]);
            
            onSuccess();
          }
        }, 1000);
      }
    }, 1000);
  }, [phase]);

  return { phase, countdown, captureExpression };
}
