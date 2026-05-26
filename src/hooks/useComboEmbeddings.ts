import { useState, useEffect, useMemo, useCallback } from "react";
import { NormalizedLandmark, Classifications } from "@mediapipe/tasks-vision";
import { calculateGestureSimilarity } from "@/lib/gestureSimilarity";
import { calculateFacialSimilarity } from "@/lib/facialSimilarity";
import { extractFaceProfile } from "@/lib/facialSimilarity";
import { Storage, CustomCombo } from "@/lib/storage";
import { TemporalSmoother } from "@/lib/temporalSmoothing";

export interface ComboDetection {
  combo: CustomCombo | null;
  confidence: number;
}

export function useComboEmbeddings(
  liveLandmarks: NormalizedLandmark[] | null,
  liveBlendshapes: Classifications[] | null
) {
  const [savedCombos, setSavedCombos] = useState<CustomCombo[]>([]);
  const [detection, setDetection] = useState<ComboDetection>({ combo: null, confidence: 0 });
  const smoother = useMemo(() => new TemporalSmoother<string | null>(5), []);

  const refreshCombos = useCallback(() => {
    setSavedCombos(Storage.getCombos());
  }, []);

  useEffect(() => {
    refreshCombos();
  }, [refreshCombos]);

  useEffect(() => {
    if (
      !liveLandmarks || liveLandmarks.length === 0 || 
      !liveBlendshapes || liveBlendshapes.length === 0 || 
      savedCombos.length === 0
    ) {
      smoother.add(null);
      setDetection(prev => {
        if (prev.combo === null && prev.confidence === 0) return prev;
        return { combo: null, confidence: 0 };
      });
      return;
    }

    const liveFaceProfile = extractFaceProfile(liveBlendshapes);

    let bestMatch: CustomCombo | null = null;
    let highestScore = 0;

    for (const sc of savedCombos) {
      const gestureScore = calculateGestureSimilarity(liveLandmarks, sc.landmarks);
      const faceScore = calculateFacialSimilarity(liveFaceProfile, sc.profile);
      
      // For combo, BOTH must exceed their thresholds
      if (gestureScore >= sc.thresholds.gesture && faceScore >= sc.thresholds.expression) {
        // We use the average of the two scores for the confidence
        const comboScore = (gestureScore + faceScore) / 2;
        if (comboScore > highestScore) {
          highestScore = comboScore;
          bestMatch = sc;
        }
      }
    }

    if (bestMatch) {
      smoother.add(bestMatch.id);
      if (smoother.getMode() === bestMatch.id) {
        setDetection(prev => {
          if (prev.combo?.id === bestMatch!.id && prev.confidence === highestScore) return prev;
          return { combo: bestMatch, confidence: highestScore };
        });
      }
    } else {
      smoother.add(null);
      if (smoother.getMode() === null) {
        setDetection(prev => {
          if (prev.combo === null && prev.confidence === 0) return prev;
          return { combo: null, confidence: 0 };
        });
      }
    }
  }, [liveLandmarks, liveBlendshapes, savedCombos, smoother]);

  return { detection, refreshCombos };
}
