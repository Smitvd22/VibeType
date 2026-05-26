import { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { normalizeHandLandmarks } from "./landmarkNormalization";

// Calculate Euclidean distance between two vectors of normalized landmarks
export function calculateGestureSimilarity(
  liveLandmarks: NormalizedLandmark[],
  savedLandmarks: NormalizedLandmark[]
): number {
  if (liveLandmarks.length !== savedLandmarks.length || savedLandmarks.length === 0) return 0;

  const normLive = normalizeHandLandmarks(liveLandmarks);
  
  let totalDistance = 0;
  for (let i = 0; i < normLive.length; i++) {
    const l = normLive[i];
    const s = savedLandmarks[i]; // assuming saved is already normalized
    const dist = Math.sqrt(
      Math.pow(l.x - s.x, 2) + 
      Math.pow(l.y - s.y, 2) + 
      Math.pow(l.z - s.z, 2)
    );
    totalDistance += dist;
  }

  // Average distance per landmark
  const avgDistance = totalDistance / normLive.length;
  
  // Convert distance to a confidence score between 0 and 1
  // If avgDistance is 0, score is 1. If avgDistance is large (e.g. > 0.5), score approaches 0.
  const score = Math.max(0, 1 - (avgDistance * 2)); 
  return score;
}
