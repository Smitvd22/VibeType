import { useState, useCallback, useEffect, useRef } from "react";
import { NormalizedLandmark, Classifications } from "@mediapipe/tasks-vision";
import { normalizeHandLandmarks } from "@/lib/landmarkNormalization";
import { Storage, CustomCombo } from "@/lib/storage";
import { TrainingPhase } from "./useGestureTraining";

export function useComboTraining(
  currentLandmarks: NormalizedLandmark[] | null,
  currentBlendshapes: Classifications[] | null
) {
  const [phase, setPhase] = useState<TrainingPhase>("idle");
  const [countdown, setCountdown] = useState<number | null>(null);
  
  const handFramesRef = useRef<NormalizedLandmark[][]>([]);
  const faceFramesRef = useRef<Classifications[][]>([]);
  
  useEffect(() => {
    if (phase === "recording") {
      if (currentLandmarks && currentLandmarks.length > 0) {
        handFramesRef.current.push(currentLandmarks);
      }
      if (currentBlendshapes && currentBlendshapes.length > 0) {
        faceFramesRef.current.push(currentBlendshapes);
      }
    }
  }, [currentLandmarks, currentBlendshapes, phase]);

  const captureCombo = useCallback((
    name: string,
    emoji: string,
    onSuccess: () => void,
    onError: (msg: string) => void
  ) => {
    if (phase !== "idle") return;
    
    handFramesRef.current = [];
    faceFramesRef.current = [];
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
            
            if (handFramesRef.current.length === 0) {
              onError("No hand detected during recording. Please keep your hand in frame.");
              return;
            }
            if (faceFramesRef.current.length === 0) {
              onError("No face detected during recording. Please keep your face in frame.");
              return;
            }
            
            // Average Hands
            const numHandFrames = handFramesRef.current.length;
            const avgLandmarks: NormalizedLandmark[] = [];
            for (let i = 0; i < 21; i++) {
              let sumX = 0, sumY = 0, sumZ = 0;
              for (const frame of handFramesRef.current) {
                if (frame[i]) {
                  sumX += frame[i].x; sumY += frame[i].y; sumZ += frame[i].z;
                }
              }
              avgLandmarks.push({
                x: sumX / numHandFrames, y: sumY / numHandFrames, z: sumZ / numHandFrames, visibility: 1
              });
            }
            const normalizedHands = normalizeHandLandmarks(avgLandmarks);
            
            // Average Face
            const numFaceFrames = faceFramesRef.current.length;
            const avgProfile: Record<string, number> = {};
            for (const frame of faceFramesRef.current) {
              const categories = frame[0]?.categories || [];
              for (const cat of categories) {
                if (!avgProfile[cat.categoryName]) avgProfile[cat.categoryName] = 0;
                avgProfile[cat.categoryName] += cat.score;
              }
            }
            for (const key in avgProfile) {
              avgProfile[key] /= numFaceFrames;
            }

            const newCombo: CustomCombo = {
              id: Date.now().toString(),
              name,
              emoji,
              landmarks: normalizedHands,
              profile: { blendshapes: avgProfile },
              thresholds: {
                gesture: 0.75,
                expression: 0.85
              }
            };

            const existingCombos = Storage.getCombos();
            Storage.saveCombos([...existingCombos, newCombo]);
            
            onSuccess();
          }
        }, 1000);
      }
    }, 1000);
  }, [phase]);

  return { phase, countdown, captureCombo };
}
