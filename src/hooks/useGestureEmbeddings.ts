import { useState, useEffect, useMemo, useCallback } from "react";
import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { calculateGestureSimilarity } from "@/lib/gestureSimilarity";
import { Storage, CustomGesture } from "@/lib/storage";
import { TemporalSmoother } from "@/lib/temporalSmoothing";

export interface GestureDetection {
  gesture: CustomGesture | null;
  confidence: number;
}

export function useGestureEmbeddings(liveLandmarks: NormalizedLandmark[] | null) {
  const [savedGestures, setSavedGestures] = useState<CustomGesture[]>([]);
  const [detection, setDetection] = useState<GestureDetection>({ gesture: null, confidence: 0 });
  const smoother = useMemo(() => new TemporalSmoother<string | null>(5), []);

  const refreshGestures = useCallback(() => {
    setSavedGestures(Storage.getGestures());
  }, []);

  useEffect(() => {
    refreshGestures();
  }, []);

  useEffect(() => {
    if (!liveLandmarks || liveLandmarks.length === 0 || savedGestures.length === 0) {
      smoother.add(null);
      setDetection(prev => {
        if (prev.gesture === null && prev.confidence === 0) return prev;
        return { gesture: null, confidence: 0 };
      });
      return;
    }

    let bestMatch: CustomGesture | null = null;
    let highestScore = 0;

    for (const sg of savedGestures) {
      const score = calculateGestureSimilarity(liveLandmarks, sg.landmarks);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = sg;
      }
    }

    if (bestMatch && highestScore >= bestMatch.threshold) {
      smoother.add(bestMatch.id);
      if (smoother.getMode() === bestMatch.id) {
        setDetection(prev => {
          if (prev.gesture?.id === bestMatch!.id && prev.confidence === highestScore) return prev;
          return { gesture: bestMatch, confidence: highestScore };
        });
      }
    } else {
      smoother.add(null);
      if (smoother.getMode() === null) {
        setDetection(prev => {
          if (prev.gesture === null && prev.confidence === 0) return prev;
          return { gesture: null, confidence: 0 };
        });
      }
    }
  }, [liveLandmarks, savedGestures, smoother]);

  return { detection, refreshGestures };
}
