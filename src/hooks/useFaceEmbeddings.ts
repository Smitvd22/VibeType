import { useState, useEffect, useMemo, useCallback } from "react";
import { Classifications } from "@mediapipe/tasks-vision";
import { calculateFacialSimilarity, extractFaceProfile } from "@/lib/facialSimilarity";
import { Storage, CustomExpression } from "@/lib/storage";
import { TemporalSmoother } from "@/lib/temporalSmoothing";

export interface FaceDetection {
  expression: CustomExpression | null;
  confidence: number;
}

export function useFaceEmbeddings(liveBlendshapes: Classifications[] | null) {
  const [savedExpressions, setSavedExpressions] = useState<CustomExpression[]>([]);
  const [detection, setDetection] = useState<FaceDetection>({ expression: null, confidence: 0 });
  const smoother = useMemo(() => new TemporalSmoother<string | null>(5), []);

  const refreshExpressions = useCallback(() => {
    setSavedExpressions(Storage.getExpressions());
  }, []);

  useEffect(() => {
    refreshExpressions();
  }, []);

  useEffect(() => {
    if (!liveBlendshapes || liveBlendshapes.length === 0 || savedExpressions.length === 0) {
      smoother.add(null);
      setDetection(prev => {
        if (prev.expression === null && prev.confidence === 0) return prev;
        return { expression: null, confidence: 0 };
      });
      return;
    }

    const liveProfile = extractFaceProfile(liveBlendshapes);

    let bestMatch: CustomExpression | null = null;
    let highestScore = 0;

    for (const se of savedExpressions) {
      const score = calculateFacialSimilarity(liveProfile, se.profile);
      if (score > highestScore) {
        highestScore = score;
        bestMatch = se;
      }
    }

    if (bestMatch && highestScore >= bestMatch.threshold) {
      smoother.add(bestMatch.id);
      if (smoother.getMode() === bestMatch.id) {
        setDetection(prev => {
          if (prev.expression?.id === bestMatch!.id && prev.confidence === highestScore) return prev;
          return { expression: bestMatch, confidence: highestScore };
        });
      }
    } else {
      smoother.add(null);
      if (smoother.getMode() === null) {
        setDetection(prev => {
          if (prev.expression === null && prev.confidence === 0) return prev;
          return { expression: null, confidence: 0 };
        });
      }
    }
  }, [liveBlendshapes, savedExpressions, smoother]);

  return { detection, refreshExpressions };
}
