import { useState, useCallback, useEffect, useRef } from "react";
import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { normalizeHandLandmarks } from "@/lib/landmarkNormalization";
import { Storage, CustomGesture } from "@/lib/storage";

export type TrainingPhase = "idle" | "preparing" | "recording";

export function useGestureTraining(currentLandmarks: NormalizedLandmark[][] | null) {
  const [phase, setPhase] = useState<TrainingPhase>("idle");
  const [countdown, setCountdown] = useState<number | null>(null);
  
  const framesRef = useRef<NormalizedLandmark[][][]>([]);
  
  // Collect frames during recording phase
  useEffect(() => {
    if (phase === "recording" && currentLandmarks && currentLandmarks.length > 0) {
      framesRef.current.push(currentLandmarks);
    }
  }, [currentLandmarks, phase]);

  const captureGesture = useCallback((
    name: string,
    emoji: string,
    onSuccess: () => void,
    onError: (msg: string) => void
  ) => {
    if (phase !== "idle") return;
    
    framesRef.current = []; // Reset frames
    setPhase("preparing");
    setCountdown(2);

    let prepCount = 2;
    const prepInterval = setInterval(() => {
      prepCount--;
      if (prepCount > 0) {
        setCountdown(prepCount);
      } else {
        clearInterval(prepInterval);
        
        // Switch to recording phase
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
            
            // Process collected frames
            if (framesRef.current.length === 0) {
              onError("No hand detected during recording. Please keep your hand in frame.");
              return;
            }
            
            // Calculate average landmarks per hand
            const numFrames = framesRef.current.length;
            let maxHands = 0;
            for (const frame of framesRef.current) {
               if (frame.length > maxHands) maxHands = frame.length;
            }

            const avgHands: NormalizedLandmark[][] = [];
            
            for (let h = 0; h < maxHands; h++) {
               const avgLandmarks: NormalizedLandmark[] = [];
               let framesWithHand = 0;
               for (let i = 0; i < 21; i++) {
                 let sumX = 0, sumY = 0, sumZ = 0;
                 framesWithHand = 0;
                 for (const frame of framesRef.current) {
                   if (frame[h] && frame[h][i]) {
                     sumX += frame[h][i].x;
                     sumY += frame[h][i].y;
                     sumZ += frame[h][i].z;
                     framesWithHand++;
                   }
                 }
                 if (framesWithHand > 0) {
                   avgLandmarks.push({
                     x: sumX / framesWithHand,
                     y: sumY / framesWithHand,
                     z: sumZ / framesWithHand,
                     visibility: 1
                   });
                 }
               }
               if (avgLandmarks.length === 21) {
                 avgHands.push(normalizeHandLandmarks(avgLandmarks));
               }
            }

            const newGesture: CustomGesture = {
              id: Date.now().toString(),
              name,
              emoji,
              landmarks: avgHands,
              threshold: 0.70
            };

            const existingGestures = Storage.getGestures();
            Storage.saveGestures([...existingGestures, newGesture]);
            
            onSuccess();
          }
        }, 1000);
      }
    }, 1000);
  }, [phase]);

  return { phase, countdown, captureGesture };
}
